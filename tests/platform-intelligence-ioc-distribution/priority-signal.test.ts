/**
 * Unit Tests — KEV/EPSS Priority Signal Engine
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 4.2, 18.4
 *
 * Tests the computeIntelligencePrioritySignal pure function.
 * CRITICAL: Verifies the signal NEVER creates tenant risk alone.
 */

import { describe, it, expect } from 'vitest';
import { computeIntelligencePrioritySignal } from '../../packages/rules/priority-signal';
import type { VulnerabilitySignalInput } from '../../packages/rules/priority-signal';

const NOW = new Date('2026-01-15T12:00:00.000Z');

describe('computeIntelligencePrioritySignal', () => {
  describe('KEV status', () => {
    it('adds significant boost when KEV is true', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: true,
        kevDueDate: '2026-02-01T00:00:00.000Z',
        epssScore: null,
        epssPercentile: null,
        cvssScore: 7.5,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.priorityBoost).toBeGreaterThanOrEqual(35);
      expect(result.factors.some(f => f.includes('KEV'))).toBe(true);
    });

    it('adds no KEV boost when cisaKevStatus is false', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: false,
        kevDueDate: null,
        epssScore: null,
        epssPercentile: null,
        cvssScore: 5.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      // Only CVSS informational context
      expect(result.priorityBoost).toBeLessThan(35);
    });
  });

  describe('KEV due date pressure', () => {
    it('returns overdue pressure when due date has passed', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: true,
        kevDueDate: '2026-01-10T00:00:00.000Z', // 5 days ago
        epssScore: null,
        epssPercentile: null,
        cvssScore: 9.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.kevDueDatePressure).not.toBeNull();
      expect(result.kevDueDatePressure!).toBeLessThanOrEqual(0);
      expect(result.urgencyLevel).toBe('critical');
      expect(result.factors.some(f => f.includes('OVERDUE'))).toBe(true);
    });

    it('returns imminent urgency when due within 7 days', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: true,
        kevDueDate: '2026-01-20T00:00:00.000Z', // 5 days from now
        epssScore: null,
        epssPercentile: null,
        cvssScore: 8.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.kevDueDatePressure).toBeGreaterThan(0);
      expect(result.kevDueDatePressure!).toBeLessThanOrEqual(7);
      expect(result.urgencyLevel).toBe('critical');
    });

    it('returns approaching boost when due within 14 days but beyond 7', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: true,
        kevDueDate: '2026-01-25T00:00:00.000Z', // 10 days from now
        epssScore: null,
        epssPercentile: null,
        cvssScore: 6.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.kevDueDatePressure).toBeGreaterThan(7);
      expect(result.kevDueDatePressure!).toBeLessThanOrEqual(14);
      expect(result.factors.some(f => f.includes('approaching'))).toBe(true);
    });

    it('returns null pressure when not KEV', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: false,
        kevDueDate: null,
        epssScore: 0.5,
        epssPercentile: 60,
        cvssScore: 7.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.kevDueDatePressure).toBeNull();
    });
  });

  describe('EPSS percentile', () => {
    it('adds moderate boost when EPSS percentile > 90', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: false,
        kevDueDate: null,
        epssScore: 0.92,
        epssPercentile: 95,
        cvssScore: 6.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.priorityBoost).toBeGreaterThanOrEqual(20);
      expect(result.factors.some(f => f.includes('EPSS percentile 95'))).toBe(true);
    });

    it('adds smaller boost when EPSS percentile > 70 but <= 90', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: false,
        kevDueDate: null,
        epssScore: 0.5,
        epssPercentile: 78,
        cvssScore: 5.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.priorityBoost).toBeGreaterThanOrEqual(10);
      expect(result.priorityBoost).toBeLessThan(20);
    });

    it('adds no boost when EPSS percentile <= 70', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: false,
        kevDueDate: null,
        epssScore: 0.2,
        epssPercentile: 45,
        cvssScore: 4.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      // Only informational CVSS context
      expect(result.priorityBoost).toBe(0);
    });

    it('handles null EPSS gracefully', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: false,
        kevDueDate: null,
        epssScore: null,
        epssPercentile: null,
        cvssScore: 5.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.priorityBoost).toBe(0);
    });
  });

  describe('CVSS score (informational context)', () => {
    it('adds small informational boost for CVSS >= 9.0', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: false,
        kevDueDate: null,
        epssScore: null,
        epssPercentile: null,
        cvssScore: 9.8,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.priorityBoost).toBe(5);
      expect(result.factors.some(f => f.includes('CVSS 9.8'))).toBe(true);
    });

    it('adds no boost for CVSS < 9.0 (informational only)', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: false,
        kevDueDate: null,
        epssScore: null,
        epssPercentile: null,
        cvssScore: 7.5,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.priorityBoost).toBe(0);
    });
  });

  describe('output clamping and shape', () => {
    it('clamps priorityBoost to 0–100', () => {
      // Maximum possible: KEV(35) + overdue(20) + EPSS>90(20) + CVSS>=9(5) = 80
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: true,
        kevDueDate: '2026-01-01T00:00:00.000Z',
        epssScore: 0.99,
        epssPercentile: 99,
        cvssScore: 10.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.priorityBoost).toBeGreaterThanOrEqual(0);
      expect(result.priorityBoost).toBeLessThanOrEqual(100);
    });

    it('returns correct shape', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: true,
        kevDueDate: '2026-02-01T00:00:00.000Z',
        epssScore: 0.8,
        epssPercentile: 92,
        cvssScore: 9.1,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result).toHaveProperty('priorityBoost');
      expect(result).toHaveProperty('urgencyLevel');
      expect(result).toHaveProperty('factors');
      expect(result).toHaveProperty('kevDueDatePressure');
      expect(typeof result.priorityBoost).toBe('number');
      expect(['critical', 'high', 'medium', 'low', 'informational']).toContain(result.urgencyLevel);
      expect(Array.isArray(result.factors)).toBe(true);
    });
  });

  describe('urgency level derivation', () => {
    it('returns informational for zero signals', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: false,
        kevDueDate: null,
        epssScore: null,
        epssPercentile: null,
        cvssScore: 3.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.urgencyLevel).toBe('informational');
    });

    it('returns critical for KEV with imminent due date', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: true,
        kevDueDate: '2026-01-18T00:00:00.000Z', // 3 days
        epssScore: null,
        epssPercentile: null,
        cvssScore: 9.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.urgencyLevel).toBe('critical');
    });

    it('returns high for KEV + high EPSS combination', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: true,
        kevDueDate: '2026-03-01T00:00:00.000Z', // far future
        epssScore: 0.9,
        epssPercentile: 95,
        cvssScore: 8.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result.urgencyLevel).toBe('high');
    });
  });

  describe('NEVER creates tenant risk alone (Req 4.2, 18.4)', () => {
    it('signal output is advisory — no risk creation side effect', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: true,
        kevDueDate: '2026-01-16T00:00:00.000Z',
        epssScore: 0.99,
        epssPercentile: 99,
        cvssScore: 10.0,
      };
      const result = computeIntelligencePrioritySignal(input, undefined, NOW);
      // The function returns only a signal object — no side effects, no risk creation
      expect(result).not.toHaveProperty('riskCreated');
      expect(result).not.toHaveProperty('tenantRisk');
      expect(result).not.toHaveProperty('caseCreated');
      // Only signal fields
      expect(Object.keys(result).sort()).toEqual(['factors', 'kevDueDatePressure', 'priorityBoost', 'urgencyLevel']);
    });
  });

  describe('determinism', () => {
    it('produces identical output for identical inputs', () => {
      const input: VulnerabilitySignalInput = {
        cisaKevStatus: true,
        kevDueDate: '2026-01-20T00:00:00.000Z',
        epssScore: 0.85,
        epssPercentile: 93,
        cvssScore: 9.5,
      };
      const result1 = computeIntelligencePrioritySignal(input, undefined, NOW);
      const result2 = computeIntelligencePrioritySignal(input, undefined, NOW);
      expect(result1).toEqual(result2);
    });
  });
});
