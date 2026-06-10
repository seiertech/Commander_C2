// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Property-Based Tests — Allow/Block Evaluation
 *
 * Feature: platform-intelligence-ioc-distribution, Property 13: Allow/block evaluation is decisive and confidence-independent for blocks
 * Validates: Requirements 23.1, 23.2, 23.3, 23.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { evaluateAllowBlock } from '../../packages/rules/allow-block';
import { IOC_CATEGORIES } from '../../packages/contracts/src/entities/intelligence-common';
import type { IocCategory } from '../../packages/contracts/src/entities/intelligence-common';
import type { TenantIocAllowBlockEntry } from '../../packages/contracts/src/entities/tenant-ioc-allowblock-entry';

function makeEntry(
  category: IocCategory,
  value: string,
  listType: 'allow' | 'block',
  id: string = 'entry-001',
): TenantIocAllowBlockEntry {
  return {
    id,
    tenant: { tenant_id: 'tenant-001', tenant_name: 'Test' },
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    source: { connector_id: 'c1', import_run_id: 'r1', source_system: 'test', source_timestamp: '2026-01-01T00:00:00Z' },
    tenant_id: 'tenant-001',
    ioc_category: category,
    value,
    listType,
    addedBy: 'analyst-001',
    addedAt: '2026-01-01T00:00:00Z',
    reason: 'test',
    expiresAt: null,
  };
}

describe('Property 13: Allow/block evaluation is decisive and confidence-independent for blocks', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 13: Allow/block evaluation is decisive and confidence-independent for blocks
  it('block always wins over allow (DEC-allowblock-block-wins)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 1, maxLength: 50 }),
        (category: IocCategory, value: string) => {
          const entries = [
            makeEntry(category, value, 'allow', 'allow-entry-001'),
            makeEntry(category, value, 'block', 'block-entry-001'),
          ];
          const result = evaluateAllowBlock(category, value, entries, '2026-06-01T00:00:00Z');
          expect(result.decision).toBe('force_malicious');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('block decision is independent of platform confidence (always force_malicious)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 1, maxLength: 50 }),
        (category: IocCategory, value: string) => {
          const entries = [makeEntry(category, value, 'block', 'block-001')];
          const result = evaluateAllowBlock(category, value, entries, '2026-06-01T00:00:00Z');
          expect(result.decision).toBe('force_malicious');
          if (result.decision === 'force_malicious') {
            expect(result.blockReference).toBe('block-001');
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('allow entry suppresses when no block present', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 1, maxLength: 50 }),
        (category: IocCategory, value: string) => {
          const entries = [makeEntry(category, value, 'allow', 'allow-001')];
          const result = evaluateAllowBlock(category, value, entries, '2026-06-01T00:00:00Z');
          expect(result.decision).toBe('suppress');
          if (result.decision === 'suppress') {
            expect(result.suppressionReference).toBe('allow-001');
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('no matching entries returns proceed', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 1, maxLength: 50 }),
        (category: IocCategory, value: string) => {
          // Entries for a different value
          const entries = [makeEntry(category, value + '-OTHER', 'block', 'block-001')];
          const result = evaluateAllowBlock(category, value, entries, '2026-06-01T00:00:00Z');
          expect(result.decision).toBe('proceed');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('expired entries are ignored', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 1, maxLength: 50 }),
        (category: IocCategory, value: string) => {
          const entries: TenantIocAllowBlockEntry[] = [{
            ...makeEntry(category, value, 'block', 'expired-block'),
            expiresAt: '2020-01-01T00:00:00Z', // expired
          }];
          const result = evaluateAllowBlock(category, value, entries, '2026-06-01T00:00:00Z');
          expect(result.decision).toBe('proceed');
        },
      ),
      { numRuns: 100 },
    );
  });
});
