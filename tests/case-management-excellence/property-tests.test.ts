/**
 * Property-Based Tests — Case Management Excellence
 * CMEP-1.0
 *
 * Property tests using fast-check:
 * 1. Routing score monotonicity — adding specialism match never decreases score
 * 2. SLA modifier composition is bounded — never < cap, never negative
 * 3. SSVC outcomes are total — every valid input produces exactly one outcome
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeRoutingDecision, DEFAULT_ROUTING_WEIGHTS } from '../../packages/rules/multi-factor-routing';
import { computeAdaptiveSla } from '../../packages/rules/adaptive-sla';
import { evaluateSSVC } from '../../packages/contracts/src/profiles/vulnerability/vuln-ssvc-evaluator';
import type { RoutingCandidate } from '../../packages/rules/multi-factor-routing';
import type { SSVCInput, SSVCOutcome } from '../../packages/contracts/src/profiles/vulnerability/vuln-ssvc-evaluator';

describe('Property-Based Tests — CMEP-1.0', () => {
  describe('Routing score monotonicity', () => {
    /**
     * **Validates: Requirements A — Multi-Factor Routing**
     *
     * Property: Increasing the specialism score of a candidate never decreases
     * that candidate's composite routing score (all else being equal).
     */
    it('adding specialism match never decreases score', () => {
      const candidateArb = fc.record({
        analyst_id: fc.string({ minLength: 1, maxLength: 10 }),
        specialismScore: fc.integer({ min: 0, max: 100 }),
        workloadAvailabilityScore: fc.integer({ min: 0, max: 100 }),
        assetOwnershipScore: fc.integer({ min: 0, max: 100 }),
        rankWeightingScore: fc.integer({ min: 0, max: 100 }),
      });

      fc.assert(
        fc.property(
          candidateArb,
          fc.integer({ min: 0, max: 100 }),
          (candidate, higherSpecialism) => {
            const adjustedSpecialism = Math.min(100, candidate.specialismScore + higherSpecialism);
            const original: RoutingCandidate = candidate;
            const improved: RoutingCandidate = { ...candidate, specialismScore: adjustedSpecialism };

            const originalResult = computeRoutingDecision([original], DEFAULT_ROUTING_WEIGHTS, 0);
            const improvedResult = computeRoutingDecision([improved], DEFAULT_ROUTING_WEIGHTS, 0);

            return improvedResult.scoredCandidates[0].compositeScore >= originalResult.scoredCandidates[0].compositeScore;
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  describe('SLA modifier composition is bounded', () => {
    /**
     * **Validates: Requirements A — Adaptive SLA**
     *
     * Property: The computed SLA hours are always >= minimumSlaHours (floor)
     * and the effective multiplier never exceeds maxMultiplier. Result is never negative.
     */
    it('never < cap, never negative', () => {
      const modifierArb = fc.record({
        name: fc.string({ minLength: 1, maxLength: 10 }),
        multiplier: fc.double({ min: 0.01, max: 5.0, noNaN: true }),
        active: fc.boolean(),
      });

      const inputArb = fc.record({
        baseSlaHours: fc.double({ min: 0.1, max: 1000, noNaN: true }),
        surfaceModifier: fc.double({ min: 0.01, max: 5.0, noNaN: true }),
        domainModifiers: fc.array(modifierArb, { minLength: 0, maxLength: 5 }),
      });

      const configArb = fc.record({
        minimumSlaHours: fc.double({ min: 0.1, max: 10, noNaN: true }),
        maxMultiplier: fc.double({ min: 1.0, max: 10.0, noNaN: true }),
      });

      fc.assert(
        fc.property(inputArb, configArb, (input, config) => {
          const result = computeAdaptiveSla(input, config);
          // SLA hours are never negative
          if (result.computedSlaHours < 0) return false;
          // SLA hours are never below the configured floor
          if (result.computedSlaHours < config.minimumSlaHours - 0.001) return false;
          // Effective multiplier never exceeds max (when cap applied)
          if (result.effectiveMultiplier > config.maxMultiplier + 0.001) return false;
          return true;
        }),
        { numRuns: 500 },
      );
    });
  });

  describe('SSVC outcomes are total', () => {
    /**
     * **Validates: Requirements B — SSVC Decision Tree**
     *
     * Property: Every valid combination of the 4 SSVC decision points produces
     * exactly one outcome from {track, track*, attend, act}.
     */
    it('every valid input produces exactly one outcome', () => {
      const exploitationArb = fc.constantFrom<'none' | 'poc' | 'active'>('none', 'poc', 'active');
      const automatableArb = fc.constantFrom<'no' | 'yes'>('no', 'yes');
      const technicalImpactArb = fc.constantFrom<'partial' | 'total'>('partial', 'total');
      const missionImpactArb = fc.constantFrom<'low' | 'medium' | 'high'>('low', 'medium', 'high');

      const validOutcomes: SSVCOutcome[] = ['track', 'track*', 'attend', 'act'];

      fc.assert(
        fc.property(
          exploitationArb,
          automatableArb,
          technicalImpactArb,
          missionImpactArb,
          (exploitation, automatable, technicalImpact, missionImpact) => {
            const input: SSVCInput = { exploitation, automatable, technicalImpact, missionImpact };
            const result = evaluateSSVC(input);
            return validOutcomes.includes(result.outcome);
          },
        ),
        { numRuns: 200 },
      );
    });
  });
});
