/**
 * Vulnerability Signal Resolver — Unit Tests
 * CMEP-1.0: Case Management Excellence
 */

import { describe, it, expect } from 'vitest';
import { resolveVulnSignals, DEFAULT_VULN_WEIGHTS } from '../../packages/contracts/src/profiles/vulnerability/vuln-signal-resolver';
import { computeIntelligencePrioritySignal } from '../../packages/rules/priority-signal';
import type { VulnSignalContext } from '../../packages/contracts/src/profiles/vulnerability/vuln-signal-resolver';
import type { PrioritySignal } from '../../packages/rules/priority-signal';

describe('Vulnerability Signal Resolver', () => {
  const baseIntelSignal: PrioritySignal = {
    priorityBoost: 55,
    urgencyLevel: 'high',
    factors: ['CISA KEV listed (+35 boost)', 'EPSS percentile 92 > 90th (+20 boost)'],
    kevDueDatePressure: 5,
  };

  const baseContext: VulnSignalContext = {
    cvss_score: 9.5,
    intelligenceSignal: baseIntelSignal,
    affected_entity_count: 5,
    maxAssetCriticality: 80,
    businessValueScore: 70,
    controlCoveragePercent: 40,
    activeThreatCampaign: true,
    attackTechniqueCount: 3,
    identityExposureScore: 60,
  };

  describe('weighted composite', () => {
    it('produces a composite score between 0 and 100', () => {
      const result = resolveVulnSignals(baseContext);
      expect(result.compositeScore).toBeGreaterThanOrEqual(0);
      expect(result.compositeScore).toBeLessThanOrEqual(100);
    });

    it('returns 8 signals', () => {
      const result = resolveVulnSignals(baseContext);
      expect(result.signals).toHaveLength(8);
      const signalNames = result.signals.map((s) => s.name);
      expect(signalNames).toContain('severity');
      expect(signalNames).toContain('exploitability');
      expect(signalNames).toContain('blast_radius');
      expect(signalNames).toContain('businessContext');
      expect(signalNames).toContain('coverageScore');
      expect(signalNames).toContain('threatRelevance');
      expect(signalNames).toContain('attackContext');
      expect(signalNames).toContain('identityExposure');
    });

    it('respects custom weights', () => {
      const weights = { severity: 1.0, exploitability: 0, blast_radius: 0, businessContext: 0, coverageScore: 0, threatRelevance: 0, attackContext: 0, identityExposure: 0 };
      const result = resolveVulnSignals(baseContext, weights);
      // CVSS 9.5 → normalised 95
      expect(result.compositeScore).toBe(95);
    });

    it('higher CVSS increases severity signal', () => {
      const lowCvss = { ...baseContext, cvss_score: 3.0 };
      const highCvss = { ...baseContext, cvss_score: 9.8 };

      const lowResult = resolveVulnSignals(lowCvss);
      const highResult = resolveVulnSignals(highCvss);

      const lowSeverity = lowResult.signals.find((s) => s.name === 'severity')!.score;
      const highSeverity = highResult.signals.find((s) => s.name === 'severity')!.score;
      expect(highSeverity).toBeGreaterThan(lowSeverity);
    });
  });

  describe('integration with existing priority-signal.ts', () => {
    it('uses computeIntelligencePrioritySignal output as exploitability signal', () => {
      // Compute real intelligence signal
      const intelSignal = computeIntelligencePrioritySignal(
        { cisaKevStatus: true, kevDueDate: '2026-01-20T00:00:00Z', epss_score: 0.85, epssPercentile: 92, cvss_score: 9.5 },
        undefined,
        new Date('2026-01-15T00:00:00Z'),
      );

      const context: VulnSignalContext = {
        ...baseContext,
        intelligenceSignal: intelSignal,
      };

      const result = resolveVulnSignals(context);
      const exploitSignal = result.signals.find((s) => s.name === 'exploitability')!;
      expect(exploitSignal.score).toBe(intelSignal.priorityBoost);
      expect(exploitSignal.rationale).toContain(intelSignal.urgencyLevel);
    });
  });
});
