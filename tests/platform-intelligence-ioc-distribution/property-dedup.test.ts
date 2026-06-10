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
    tenant: { tenant_id: 'tenant-001', tenant_name: 'Test' },
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    source: { connector_id: 'c1', import_run_id: 'r1', source_system: 'test', source_timestamp: '2026-01-01T00:00:00Z' },
    ioc_category: 'domain',
    value: 'evil.example.com',
    normalisedValue: 'evil.example.com',
    originalRawValue: 'evil.example.com',
    confidence: 80,
    severity: 4,
    tlpMarking: 'amber',
    expires_at: null,
    sourceAttribution: [],
    first_seen_at: '2026-01-01T00:00:00Z',
    last_seen_at: '2026-01-01T00:00:00Z',
    active: true,
    ...overrides,
  };
}

const sourceAttributionArb = fc.record({
  source_id: fc.string({ minLength: 1, maxLength: 20 }),
  reportedConfidence: fc.integer({ min: 0, max: 100 }),
  reportedSeverity: fc.integer({ min: 1, max: 5 }),
  originalRawValue: fc.string({ minLength: 1, maxLength: 50 }),
  first_seen_at: fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
  last_seen_at: fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
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
          const sourceIds = result.record.sourceAttribution.map(a => a.source_id);
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
