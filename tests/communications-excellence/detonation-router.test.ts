// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Unit Tests — Detonation Verdict Router
 *
 * Feature: communications-excellence
 * Tests: clean/suspicious/malicious routing, risk-object-type correctness
 */

import { describe, it, expect } from 'vitest';
import { routeDetonationVerdict } from '../../packages/rules/detonation-router';
import { seedDetonationVerdicts } from '../../packages/contracts/src/fixtures/seed-detonation-verdicts';

describe('Detonation Router — Routing Logic', () => {
  it('routes clean verdict to proceed_normal', () => {
    const cleanVerdict = seedDetonationVerdicts[0]; // overallVerdict: 'clean'
    const result = routeDetonationVerdict(cleanVerdict);
    expect(result.route).toBe('proceed_normal');
    expect(result.riskObjectType).toBeUndefined();
    expect(result.case_type).toBeUndefined();
  });

  it('routes suspicious verdict to analyst_review', () => {
    const suspiciousVerdict = seedDetonationVerdicts[1]; // overallVerdict: 'suspicious'
    const result = routeDetonationVerdict(suspiciousVerdict);
    expect(result.route).toBe('analyst_review');
    expect(result.riskObjectType).toBeUndefined();
    expect(result.case_type).toBeUndefined();
  });

  it('routes malicious verdict to create_risk_object', () => {
    const maliciousVerdict = seedDetonationVerdicts[2]; // overallVerdict: 'malicious'
    const result = routeDetonationVerdict(maliciousVerdict);
    expect(result.route).toBe('create_risk_object');
    expect(result.riskObjectType).toBe('detection');
    expect(result.case_type).toBe('threat-intelligence-estate-match');
  });

  it('always provides a reason string', () => {
    for (const verdict of seedDetonationVerdicts) {
      const result = routeDetonationVerdict(verdict);
      expect(result.reason).toBeTruthy();
      expect(result.reason.length).toBeGreaterThan(0);
    }
  });

  it('malicious routing includes check summary', () => {
    const maliciousVerdict = seedDetonationVerdicts[2];
    const result = routeDetonationVerdict(maliciousVerdict);
    expect(result.reason).toContain('url_detonation');
  });
});
