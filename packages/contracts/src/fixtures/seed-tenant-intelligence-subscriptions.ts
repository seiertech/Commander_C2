/**
 * Seed Tenant Intelligence Subscriptions — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 10.1
 *
 * 3 subscriptions: active, paused, cancelled. Synthetic data, (Mock) markers.
 */

import type { TenantIntelligenceSubscription } from '../entities/tenant-intelligence-subscription';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

export const seedTenantIntelligenceSubscriptions: TenantIntelligenceSubscription[] = [
  {
    id: seedId('tsub', 1),
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    sourceId: seedId('pis', 1),
    subscriptionState: 'active',
    applicabilityFilters: [
      { sourceType: 'cisa_kev' },
      { iocCategoryInclusion: ['domain', 'ip_address', 'file_hash_sha256'] },
      { severityThreshold: 3 },
      { tlpThreshold: 'amber' },
      { affectedProducts: ['vendor-a-product.example/v1'] },
    ],
    evaluationPreferences: { autoEvaluate: true, notifyOnMatch: true },
    subscribedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: seedId('tsub', 2),
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-14T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    sourceId: seedId('pis', 3),
    subscriptionState: 'paused',
    applicabilityFilters: [
      { sourceType: 'vendor_advisory' },
      { severityThreshold: 4 },
    ],
    evaluationPreferences: { autoEvaluate: false, notifyOnMatch: false },
    subscribedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: seedId('tsub', 3),
    tenant: SEED_TENANT,
    createdAt: '2026-01-05T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    sourceId: seedId('pis', 5),
    subscriptionState: 'cancelled',
    applicabilityFilters: [
      { sourceType: 'misp_feed' },
      { iocCategoryExclusion: ['other'] },
    ],
    evaluationPreferences: { autoEvaluate: true, notifyOnMatch: false },
    subscribedAt: '2026-01-05T09:00:00.000Z',
  },
];
