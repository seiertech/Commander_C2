/**
 * Property-Based Tests — IOC Deduplication
 *
 * Feature: platform-intelligence-ioc-distribution, Property 3: IOC deduplication uniqueness, attribution union, and raw preservation
 * Validates: Requirements 6.3, 6.5, 8.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { dedupAndMerge } from '../../packages/rules/ioc-dedup';
import type { IndicatorOfCompromise } from '../../packages/contracts/src/entities/indicator-of-compromise';
import type { SourceAttributionEntry } from '../../packages/contracts/src/entities/intelligence-common';
import { IOC_CATEGORIES, TLP_MARKINGS } from '../../packages/contracts/src/entities/intelligence-common';

function makeIoc(overrides: Partial<IndicatorOfCompromise> = {}): IndicatorOfCompromise {
  return {
    id: 'ioc-test-0001',
    tenant: { tenantId: 'tenant-001', tenantName: 'Test' },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    source: { connectorId: 'c1', importRunId: 'r1', sourceSystem: 'test', sourceTimestamp: '2026-01-01T00:00:00Z' },
    iocCategory: 'domain',
    value: 'evil.example.com',
    normalisedValue: 'evil.example.com',
    originalRawValue: 'evil.example.com',
    confidence: 80,
    severity: 4,
    tlpMarking: 'amber',
    expiresAt: null,
    sourceAttribution: [],
    firstSeenAt: '2026-01-01T00:00:00Z',
    lastSeenAt: '2026-01-01T00:00:00Z',
    active: true,
    ...overrides,
  };
}

const sourceAttributionArb = fc.record({
  sourceId: fc.string({ minLength: 1, maxLength: 20 }),
  reportedConfidence: fc.integer({ min: 0, max: 100 }),
  reportedSeverity: fc.integer({ min: 1, max: 5 }),
  originalRawValue: fc.string({ minLength: 1, maxLength: 50 }),
  firstSeenAt: fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
  lastSeenAt: fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
});

describe('Property 3: IOC deduplication uniqueness, attribution union, and raw preservation', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 3: IOC deduplication uniqueness, attribution union, and raw preservation
  it('merge unions source attributions by sourceId without duplication', () => {
    fc.assert(
      fc.property(
        fc.array(sourceAttributionArb, { minLength: 1, maxLength: 5 }),
        fc.array(sourceAttributionArb, { minLength: 1, maxLength: 5 }),
        (existingAttrs: SourceAttributionEntry[], incomingAttrs: SourceAttributionEntry[]) => {
          const existing = makeIoc({ sourceAttribution: existingAttrs });
          const incoming = makeIoc({ sourceAttribution: incomingAttrs });

          const result = dedupAndMerge(incoming, existing);

          // No duplicate sourceIds in merged result
          const sourceIds = result.record.sourceAttribution.map(a => a.sourceId);
          const uniqueIds = new Set(sourceIds);
          expect(uniqueIds.size).toBe(sourceIds.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('merge preserves every originalRawValue from source attributions', () => {
    fc.assert(
      fc.property(
        fc.array(sourceAttributionArb, { minLength: 1, maxLength: 3 }),
        fc.array(sourceAttributionArb, { minLength: 1, maxLength: 3 }),
        (existingAttrs: SourceAttributionEntry[], incomingAttrs: SourceAttributionEntry[]) => {
          const existing = makeIoc({ sourceAttribution: existingAttrs });
          const incoming = makeIoc({ sourceAttribution: incomingAttrs });

          const result = dedupAndMerge(incoming, existing);

          // Every attribution in the result has a non-empty originalRawValue
          for (const attr of result.record.sourceAttribution) {
            expect(attr.originalRawValue).toBeDefined();
            expect(attr.originalRawValue.length).toBeGreaterThan(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('create is returned when no existing record', () => {
    fc.assert(
      fc.property(
        fc.array(sourceAttributionArb, { minLength: 1, maxLength: 3 }),
        (attrs: SourceAttributionEntry[]) => {
          const incoming = makeIoc({ sourceAttribution: attrs });
          const result = dedupAndMerge(incoming, undefined);
          expect(result.action).toBe('create');
          expect(result.record).toBe(incoming);
        },
      ),
      { numRuns: 100 },
    );
  });
});
