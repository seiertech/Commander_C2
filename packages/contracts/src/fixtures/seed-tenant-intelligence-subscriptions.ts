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
  { entity_type: "entity",
    id: seedId('tsub', 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-10T09:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    source_id: seedId('pis', 1),
    subscriptionState: 'active',
    applicabilityFilters: [
      { source_type: 'cisa_kev' },
      { iocCategoryInclusion: ['domain', 'ip_address', 'file_hash_sha256'] },
      { severityThreshold: 3 },
      { tlpThreshold: 'amber' },
      { affected_products: ['vendor-a-product.example/v1'] },
    ],
    evaluationPreferences: { autoEvaluate: true, notifyOnMatch: true },
    subscribed_at: '2026-01-10T09:00:00.000Z',
  },
  { entity_type: "entity",
    id: seedId('tsub', 2),
    tenant: SEED_TENANT,
    created_at: '2026-01-10T09:00:00.000Z',
    updated_at: '2026-01-14T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    source_id: seedId('pis', 3),
    subscriptionState: 'paused',
    applicabilityFilters: [
      { source_type: 'vendor_advisory' },
      { severityThreshold: 4 },
    ],
    evaluationPreferences: { autoEvaluate: false, notifyOnMatch: false },
    subscribed_at: '2026-01-10T09:00:00.000Z',
  },
  { entity_type: "entity",
    id: seedId('tsub', 3),
    tenant: SEED_TENANT,
    created_at: '2026-01-05T09:00:00.000Z',
    updated_at: '2026-01-12T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    source_id: seedId('pis', 5),
    subscriptionState: 'cancelled',
    applicabilityFilters: [
      { source_type: 'misp_feed' },
      { iocCategoryExclusion: ['other'] },
    ],
    evaluationPreferences: { autoEvaluate: true, notifyOnMatch: false },
    subscribed_at: '2026-01-05T09:00:00.000Z',
  },
];
