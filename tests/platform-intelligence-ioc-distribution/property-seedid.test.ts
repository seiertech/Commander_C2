/**
 * Property-Based Tests — Deterministic seedId Stability
 *
 * Feature: platform-intelligence-ioc-distribution, Property 17: Deterministic seedId stability
 * Validates: Requirements 1.2, 20.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { seedId } from '../../packages/contracts/src/fixtures/seed-tenant';

describe('Property 17: Deterministic seedId stability', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 17: Deterministic seedId stability
  it('seedId is deterministic: same inputs always produce same output', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 9999 }),
        (prefix: string, index: number) => {
          const id1 = seedId(prefix, index);
          const id2 = seedId(prefix, index);
          expect(id1).toBe(id2);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('seedId produces unique IDs for different indices', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 9998 }),
        (prefix: string, index: number) => {
          const id1 = seedId(prefix, index);
          const id2 = seedId(prefix, index + 1);
          expect(id1).not.toBe(id2);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('seedId format is prefix-NNNN', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('-')),
        fc.integer({ min: 0, max: 9999 }),
        (prefix: string, index: number) => {
          const id = seedId(prefix, index);
          expect(id).toBe(`${prefix}-${String(index).padStart(4, '0')}`);
        },
      ),
      { numRuns: 100 },
    );
  });
});
