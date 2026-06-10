/**
 * Effectiveness Metrics Engine — Unit Tests
 * CMEP-1.0: Case Management Excellence
 */

import { describe, it, expect } from 'vitest';
import { computeEffectivenessMetrics, DEFAULT_EFFECTIVENESS_TARGETS } from '../../packages/rules/effectiveness-metrics';
import type { CaseResolutionRecord } from '../../packages/rules/effectiveness-metrics';

describe('Effectiveness Metrics Engine', () => {
  describe('MTTR computation', () => {
    it('computes mean time to resolve', () => {
      const records: CaseResolutionRecord[] = [
        { case_id: 'c1', priority: 'P1', resolutionHours: 10, slaBreached: false, reopened: false, isNoise: false, dwellTimeHours: 2, routingCorrect: true },
        { case_id: 'c2', priority: 'P1', resolutionHours: 20, slaBreached: false, reopened: false, isNoise: false, dwellTimeHours: 4, routingCorrect: true },
        { case_id: 'c3', priority: 'P2', resolutionHours: 30, slaBreached: false, reopened: false, isNoise: false, dwellTimeHours: 6, routingCorrect: true },
      ];

      const result = computeEffectivenessMetrics(records);
      expect(result.metrics.mttrHours).toBe(20); // (10+20+30)/3
      expect(result.metrics.mttrByPriority['P1']).toBe(15); // (10+20)/2
      expect(result.metrics.mttrByPriority['P2']).toBe(30);
    });

    it('returns zero for empty records', () => {
      const result = computeEffectivenessMetrics([]);
      expect(result.metrics.mttrHours).toBe(0);
      expect(result.metrics.totalCases).toBe(0);
    });
  });

  describe('threshold breach detection', () => {
    it('detects SLA adherence breach', () => {
      const records: CaseResolutionRecord[] = Array.from({ length: 10 }, (_, i) => ({
        case_id: `c${i}`,
        priority: 'P1',
        resolutionHours: 20,
        slaBreached: i < 3, // 30% breached → 70% adherence
        reopened: false,
        isNoise: false,
        dwellTimeHours: 5,
        routingCorrect: true,
      }));

      const result = computeEffectivenessMetrics(records);
      expect(result.metrics.slaAdherenceRate).toBe(70);
      const slaBreach = result.breaches.find((b) => b.metric === 'slaAdherenceRate');
      expect(slaBreach).toBeDefined();
      expect(slaBreach!.currentValue).toBe(70);
      expect(slaBreach!.targetValue).toBe(95);
    });

    it('detects reopen rate breach', () => {
      const records: CaseResolutionRecord[] = Array.from({ length: 10 }, (_, i) => ({
        case_id: `c${i}`,
        priority: 'P2',
        resolutionHours: 48,
        slaBreached: false,
        reopened: i < 3, // 30% reopen rate
        isNoise: false,
        dwellTimeHours: 5,
        routingCorrect: true,
      }));

      const result = computeEffectivenessMetrics(records);
      expect(result.metrics.reopenRate).toBe(30);
      const reopenBreach = result.breaches.find((b) => b.metric === 'reopenRate');
      expect(reopenBreach).toBeDefined();
    });

    it('triggers OODA degradation when overall score below threshold', () => {
      const records: CaseResolutionRecord[] = Array.from({ length: 10 }, (_, i) => ({
        case_id: `c${i}`,
        priority: 'P1',
        resolutionHours: 200,
        slaBreached: true,
        reopened: true,
        isNoise: i < 5,
        dwellTimeHours: 100,
        routingCorrect: false,
      }));

      const result = computeEffectivenessMetrics(records);
      expect(result.oodaDegradationTrigger).toBe(true);
      expect(result.overallScore).toBeLessThan(DEFAULT_EFFECTIVENESS_TARGETS.oodaDegradationThreshold);
    });

    it('no breaches when all metrics within target', () => {
      const records: CaseResolutionRecord[] = Array.from({ length: 20 }, (_, i) => ({
        case_id: `c${i}`,
        priority: 'P2',
        resolutionHours: 24,
        slaBreached: false,
        reopened: false,
        isNoise: false,
        dwellTimeHours: 10,
        routingCorrect: true,
      }));

      const result = computeEffectivenessMetrics(records);
      expect(result.breaches).toHaveLength(0);
      expect(result.oodaDegradationTrigger).toBe(false);
      expect(result.overallScore).toBeGreaterThanOrEqual(DEFAULT_EFFECTIVENESS_TARGETS.oodaDegradationThreshold);
    });
  });
});
