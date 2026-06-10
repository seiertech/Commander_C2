/**
 * Property-Based Tests — Confidence Aggregation
 *
 * Feature: platform-intelligence-ioc-distribution, Property 5: Aggregate confidence is bounded, monotonic, and source-preserving
 * Validates: Requirements 8.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { aggregateConfidence, WEAK_SOURCE_CEILING } from '../../packages/rules/confidence-aggregation';
import type { ConfidenceSource } from '../../packages/rules/confidence-aggregation';
import { SOURCE_FRESHNESS_STATES } from '../../packages/contracts/src/entities/intelligence-common';

const confidenceSourceArb: fc.Arbitrary<ConfidenceSource> = fc.record({
  confidence: fc.integer({ min: 0, max: 100 }),
  freshness: fc.constantFrom(...SOURCE_FRESHNESS_STATES),
  isTenantObservation: fc.boolean(),
  isAnalystConfirmation: fc.boolean(),
});

describe('Property 5: Aggregate confidence is bounded, monotonic, and source-preserving', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 5: Aggregate confidence is bounded, monotonic, and source-preserving
  it('output is always bounded to 0–100 (constraint 1)', () => {
    fc.assert(
      fc.property(
        fc.array(confidenceSourceArb, { minLength: 1, maxLength: 10 }),
        (sources: ConfidenceSource[]) => {
          const result = aggregateConfidence(sources);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(100);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('adding a higher-confidence corroborating source never reduces confidence (constraint 2 — monotonicity)', () => {
    fc.assert(
      fc.property(
        fc.array(confidenceSourceArb, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 50, max: 100 }),
        (baseSources: ConfidenceSource[], highConf: number) => {
          const baseResult = aggregateConfidence(baseSources);
          const highSource: ConfidenceSource = {
            confidence: highConf,
            freshness: 'fresh',
            isTenantObservation: false,
            isAnalystConfirmation: false,
          };
          const withHighResult = aggregateConfidence([...baseSources, highSource]);
          expect(withHighResult).toBeGreaterThanOrEqual(baseResult);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('only-weak sources cannot exceed ceiling (constraint 3)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            confidence: fc.integer({ min: 0, max: 39 }),
            freshness: fc.constantFrom(...SOURCE_FRESHNESS_STATES),
            isTenantObservation: fc.constant(false),
            isAnalystConfirmation: fc.constant(false),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (weakSources: ConfidenceSource[]) => {
          const result = aggregateConfidence(weakSources);
          expect(result).toBeLessThanOrEqual(WEAK_SOURCE_CEILING);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('identical inputs produce identical output (constraint 7 — determinism)', () => {
    fc.assert(
      fc.property(
        fc.array(confidenceSourceArb, { minLength: 1, maxLength: 8 }),
        (sources: ConfidenceSource[]) => {
          const result1 = aggregateConfidence(sources);
          const result2 = aggregateConfidence([...sources]);
          expect(result1).toBe(result2);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('empty sources produce 0', () => {
    expect(aggregateConfidence([])).toBe(0);
  });
});
