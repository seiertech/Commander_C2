/**
 * Property-Based Tests — IOC Normalisation
 *
 * Feature: platform-intelligence-ioc-distribution, Property 2: IOC normalisation idempotence and canonicalisation
 * Validates: Requirements 8.1
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { normaliseIoc } from '../../packages/rules/ioc-normalisation';
import { IOC_CATEGORIES } from '../../packages/contracts/src/entities/intelligence-common';
import type { IocCategory } from '../../packages/contracts/src/entities/intelligence-common';

describe('Property 2: IOC normalisation idempotence and canonicalisation', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 2: IOC normalisation idempotence and canonicalisation
  it('normaliseIoc is idempotent: normalise(normalise(v)) === normalise(v)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        (category: IocCategory, rawValue: string) => {
          const first = normaliseIoc(category, rawValue);
          const second = normaliseIoc(category, first.normalisedValue);
          expect(second.normalisedValue).toBe(first.normalisedValue);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('normaliseIoc always preserves originalRawValue as the input', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        (category: IocCategory, rawValue: string) => {
          const result = normaliseIoc(category, rawValue);
          expect(result.originalRawValue).toBe(rawValue);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('normaliseIoc produces non-empty normalisedValue for non-empty input', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        (category: IocCategory, rawValue: string) => {
          const result = normaliseIoc(category, rawValue);
          expect(result.normalisedValue.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('hash categories produce lowercase output', () => {
    const hashCategories: IocCategory[] = ['file_hash_md5', 'file_hash_sha1', 'file_hash_sha256'];
    const hexStringArb = fc.array(
      fc.constantFrom('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','A','B','C','D','E','F'),
      { minLength: 8, maxLength: 64 },
    ).map(chars => chars.join(''));
    fc.assert(
      fc.property(
        fc.constantFrom(...hashCategories),
        hexStringArb,
        (category: IocCategory, rawValue: string) => {
          const result = normaliseIoc(category, rawValue);
          expect(result.normalisedValue).toBe(result.normalisedValue.toLowerCase());
        },
      ),
      { numRuns: 100 },
    );
  });

  it('domain categories produce lowercase output', () => {
    const domainCategories: IocCategory[] = ['domain', 'fqdn', 'sender_domain'];
    fc.assert(
      fc.property(
        fc.constantFrom(...domainCategories),
        fc.domain(),
        (category: IocCategory, rawValue: string) => {
          const result = normaliseIoc(category, rawValue);
          expect(result.normalisedValue).toBe(result.normalisedValue.toLowerCase());
        },
      ),
      { numRuns: 100 },
    );
  });
});
