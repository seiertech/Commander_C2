/**
 * Unit Tests — Subscription Evaluation Engine
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 10.1, 10.2, 11.1
 *
 * Tests the evaluateSubscription and distributeToTenants pure functions.
 */

import { describe, it, expect } from 'vitest';
import { evaluateSubscription, distributeToTenants } from '../../packages/rules/subscription-evaluation';
import type { TenantIntelligenceSubscription } from '../../packages/contracts/src/entities/tenant-intelligence-subscription';
import { seedId, SEED_TENANT, SEED_SOURCE } from '../../packages/contracts/src/fixtures/seed-tenant';

function makeSubscription(
  overrides: Partial<TenantIntelligenceSubscription> = {},
): TenantIntelligenceSubscription {
  return {
    id: seedId('tsub', 99),
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    sourceId: seedId('pis', 1),
    subscriptionState: 'active',
    applicabilityFilters: [],
    evaluationPreferences: {},
    subscribedAt: '2026-01-10T09:00:00.000Z',
    ...overrides,
  };
}

function makePlatformRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: seedId('pir', 1),
    tenant: { tenantId: 'admin-tenant-001', tenantName: 'Commander Admin (Mock)' },
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    sourceId: seedId('pis', 1),
    recordType: 'cve' as const,
    severity: 4,
    confidence: 85,
    publishedAt: '2026-01-10T00:00:00.000Z',
    lastModifiedAt: '2026-01-14T00:00:00.000Z',
    catalogueVersion: 'v1.0.0',
    rawReference: 'https://nvd.example.com/vuln/CVE-2026-0001',
    ...overrides,
  };
}

describe('evaluateSubscription', () => {
  it('returns relevant=true when no applicability filters exist', () => {
    const sub = makeSubscription({ applicabilityFilters: [] });
    const record = makePlatformRecord();
    const result = evaluateSubscription(record, sub);
    expect(result.relevant).toBe(true);
    expect(result.reasons).toContain('No applicability filters — record accepted by default');
  });

  it('filters by sourceType match', () => {
    const sub = makeSubscription({
      applicabilityFilters: [{ sourceType: 'cisa_kev' }],
    });
    // Record sourceType matches
    const result1 = evaluateSubscription(
      makePlatformRecord({ sourceType: 'cisa_kev' }),
      sub,
    );
    expect(result1.relevant).toBe(true);

    // Record sourceType does NOT match
    const result2 = evaluateSubscription(
      makePlatformRecord({ sourceType: 'nvd_cve' }),
      sub,
    );
    expect(result2.relevant).toBe(false);
  });

  it('filters by iocCategory inclusion', () => {
    const sub = makeSubscription({
      applicabilityFilters: [{ iocCategoryInclusion: ['domain', 'ip_address'] }],
    });

    const result1 = evaluateSubscription(
      makePlatformRecord({ iocCategory: 'domain' }),
      sub,
    );
    expect(result1.relevant).toBe(true);

    const result2 = evaluateSubscription(
      makePlatformRecord({ iocCategory: 'file_hash_sha256' }),
      sub,
    );
    expect(result2.relevant).toBe(false);
  });

  it('filters by iocCategory exclusion', () => {
    const sub = makeSubscription({
      applicabilityFilters: [{ iocCategoryExclusion: ['other'] }],
    });

    const result1 = evaluateSubscription(
      makePlatformRecord({ iocCategory: 'domain' }),
      sub,
    );
    expect(result1.relevant).toBe(true);

    const result2 = evaluateSubscription(
      makePlatformRecord({ iocCategory: 'other' }),
      sub,
    );
    expect(result2.relevant).toBe(false);
  });

  it('filters by severity threshold', () => {
    const sub = makeSubscription({
      applicabilityFilters: [{ severityThreshold: 3 }],
    });

    const result1 = evaluateSubscription(makePlatformRecord({ severity: 4 }), sub);
    expect(result1.relevant).toBe(true);

    const result2 = evaluateSubscription(makePlatformRecord({ severity: 2 }), sub);
    expect(result2.relevant).toBe(false);

    // Exactly at threshold
    const result3 = evaluateSubscription(makePlatformRecord({ severity: 3 }), sub);
    expect(result3.relevant).toBe(true);
  });

  it('filters by TLP threshold', () => {
    const sub = makeSubscription({
      applicabilityFilters: [{ tlpThreshold: 'amber' }],
    });

    const result1 = evaluateSubscription(makePlatformRecord({ tlpMarking: 'green' }), sub);
    expect(result1.relevant).toBe(true);

    const result2 = evaluateSubscription(makePlatformRecord({ tlpMarking: 'red' }), sub);
    expect(result2.relevant).toBe(false);

    // At threshold
    const result3 = evaluateSubscription(makePlatformRecord({ tlpMarking: 'amber' }), sub);
    expect(result3.relevant).toBe(true);
  });

  it('filters by affectedProducts overlap', () => {
    const sub = makeSubscription({
      applicabilityFilters: [{ affectedProducts: ['vendor-a-product.example/v1'] }],
    });

    const result1 = evaluateSubscription(
      makePlatformRecord({ affectedProducts: ['vendor-a-product.example/v1', 'other.example/v2'] }),
      sub,
    );
    expect(result1.relevant).toBe(true);

    const result2 = evaluateSubscription(
      makePlatformRecord({ affectedProducts: ['vendor-b-product.example/v3'] }),
      sub,
    );
    expect(result2.relevant).toBe(false);
  });

  it('requires ALL filters to pass for relevance', () => {
    const sub = makeSubscription({
      applicabilityFilters: [
        { severityThreshold: 4 },
        { iocCategoryInclusion: ['domain'] },
      ],
    });

    // Severity passes but category fails
    const result = evaluateSubscription(
      makePlatformRecord({ severity: 5, iocCategory: 'ip_address' }),
      sub,
    );
    expect(result.relevant).toBe(false);
  });

  it('treats missing fields on record permissively', () => {
    const sub = makeSubscription({
      applicabilityFilters: [{ iocCategoryInclusion: ['domain'] }],
    });

    // Record has no iocCategory — permissive pass
    const result = evaluateSubscription(makePlatformRecord(), sub);
    expect(result.relevant).toBe(true);
  });
});

describe('distributeToTenants', () => {
  it('only evaluates active subscriptions', () => {
    const record = makePlatformRecord({ severity: 5 });
    const subs = [
      makeSubscription({ id: seedId('tsub', 1), subscriptionState: 'active', applicabilityFilters: [] }),
      makeSubscription({ id: seedId('tsub', 2), subscriptionState: 'paused', applicabilityFilters: [] }),
      makeSubscription({ id: seedId('tsub', 3), subscriptionState: 'cancelled', applicabilityFilters: [] }),
    ];

    const results = distributeToTenants(record, subs);
    expect(results).toHaveLength(1);
    expect(results[0].subscriptionId).toBe(seedId('tsub', 1));
  });

  it('returns empty array when no subscriptions match', () => {
    const record = makePlatformRecord({ severity: 1 });
    const subs = [
      makeSubscription({ subscriptionState: 'active', applicabilityFilters: [{ severityThreshold: 4 }] }),
    ];

    const results = distributeToTenants(record, subs);
    expect(results).toHaveLength(0);
  });

  it('produces correct TenantEvaluationInput shape', () => {
    const record = makePlatformRecord({ severity: 5 });
    const sub = makeSubscription({ subscriptionState: 'active', applicabilityFilters: [{ severityThreshold: 3 }] });

    const results = distributeToTenants(record, [sub]);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      tenantId: SEED_TENANT.tenantId,
      subscriptionId: sub.id,
      platformRecordId: record.id,
      reasons: expect.any(Array),
    });
  });
});
