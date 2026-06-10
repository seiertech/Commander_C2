/**
 * Multi-Factor Routing Engine — Unit Tests
 * CMEP-1.0: Case Management Excellence
 */

import { describe, it, expect } from 'vitest';
import { computeRoutingDecision, DEFAULT_ROUTING_WEIGHTS } from '../../packages/rules/multi-factor-routing';
import type { RoutingCandidate } from '../../packages/rules/multi-factor-routing';

describe('Multi-Factor Routing Engine', () => {
  const baseCandidate: RoutingCandidate = {
    analystId: 'analyst-001',
    specialismScore: 80,
    workloadAvailabilityScore: 70,
    assetOwnershipScore: 50,
    rankWeightingScore: 60,
  };

  describe('scoring', () => {
    it('computes composite score from weighted factors', () => {
      const result = computeRoutingDecision([baseCandidate]);

      expect(result.scoredCandidates).toHaveLength(1);
      const scored = result.scoredCandidates[0];

      // 80*0.4 + 70*0.25 + 50*0.2 + 60*0.15 = 32 + 17.5 + 10 + 9 = 68.5
      expect(scored.compositeScore).toBeCloseTo(68.5, 1);
      expect(scored.breakdown.specialism).toBeCloseTo(32, 1);
      expect(scored.breakdown.workloadAvailability).toBeCloseTo(17.5, 1);
      expect(scored.breakdown.assetOwnership).toBeCloseTo(10, 1);
      expect(scored.breakdown.rankWeighting).toBeCloseTo(9, 1);
    });

    it('selects highest-scoring analyst', () => {
      const candidates: RoutingCandidate[] = [
        { ...baseCandidate, analystId: 'low', specialismScore: 20 },
        { ...baseCandidate, analystId: 'high', specialismScore: 100 },
        { ...baseCandidate, analystId: 'mid', specialismScore: 60 },
      ];

      const result = computeRoutingDecision(candidates);
      expect(result.selectedAnalystId).toBe('high');
      expect(result.scoredCandidates[0].analystId).toBe('high');
    });

    it('respects custom weights', () => {
      const weights = { specialism: 1.0, workloadAvailability: 0, assetOwnership: 0, rankWeighting: 0 };
      const candidate: RoutingCandidate = {
        analystId: 'specialist',
        specialismScore: 90,
        workloadAvailabilityScore: 10,
        assetOwnershipScore: 10,
        rankWeightingScore: 10,
      };

      const result = computeRoutingDecision([candidate], weights);
      expect(result.scoredCandidates[0].compositeScore).toBeCloseTo(90, 1);
    });
  });

  describe('escalation threshold', () => {
    it('triggers escalation when top score below threshold', () => {
      const lowCandidate: RoutingCandidate = {
        analystId: 'low-scorer',
        specialismScore: 10,
        workloadAvailabilityScore: 10,
        assetOwnershipScore: 10,
        rankWeightingScore: 10,
      };

      const result = computeRoutingDecision([lowCandidate], DEFAULT_ROUTING_WEIGHTS, 50);
      expect(result.escalationTriggered).toBe(true);
      expect(result.selectedAnalystId).toBeNull();
      expect(result.escalationReason).toContain('below threshold');
    });

    it('does not escalate when score meets threshold', () => {
      const result = computeRoutingDecision([baseCandidate], DEFAULT_ROUTING_WEIGHTS, 50);
      expect(result.escalationTriggered).toBe(false);
      expect(result.selectedAnalystId).toBe('analyst-001');
    });

    it('triggers escalation when no candidates available', () => {
      const result = computeRoutingDecision([]);
      expect(result.escalationTriggered).toBe(true);
      expect(result.escalationReason).toContain('No candidates');
    });
  });
});
