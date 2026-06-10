/**
 * Seed Tenant IOC Allow/Block Entries — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 23.5
 *
 * 4 entries: allow + block, with/without expiry. Synthetic data.
 */

import type { TenantIocAllowBlockEntry } from '../entities/tenant-ioc-allowblock-entry';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

export const seedTenantAllowBlockEntries: TenantIocAllowBlockEntry[] = [
  { entity_type: "entity",
    id: seedId('tab', 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-10T09:00:00.000Z',
    updated_at: '2026-01-10T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    ioc_category: 'domain',
    value: 'safe-internal.example.com',
    listType: 'allow',
    added_by: 'analyst-mock-001',
    added_at: '2026-01-10T09:00:00.000Z',
    reason: 'Known-good internal domain — false positive suppression (Mock)',
    expires_at: null,
  },
  { entity_type: "entity",
    id: seedId('tab', 2),
    tenant: SEED_TENANT,
    created_at: '2026-01-11T09:00:00.000Z',
    updated_at: '2026-01-11T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    ioc_category: 'ip_address',
    value: '192.0.2.50',
    listType: 'allow',
    added_by: 'analyst-mock-002',
    added_at: '2026-01-11T09:00:00.000Z',
    reason: 'Sanctioned pen-test IP — temporary allow (Mock)',
    expires_at: '2026-03-01T00:00:00.000Z',
  },
  { entity_type: "entity",
    id: seedId('tab', 3),
    tenant: SEED_TENANT,
    created_at: '2026-01-12T09:00:00.000Z',
    updated_at: '2026-01-12T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    ioc_category: 'file_hash_sha256',
    value: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    listType: 'block',
    added_by: 'analyst-mock-001',
    added_at: '2026-01-12T09:00:00.000Z',
    reason: 'Confirmed ransomware hash — force block regardless of confidence (Mock)',
    expires_at: null,
  },
  { entity_type: "entity",
    id: seedId('tab', 4),
    tenant: SEED_TENANT,
    created_at: '2026-01-13T09:00:00.000Z',
    updated_at: '2026-01-13T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    ioc_category: 'domain',
    value: 'confirmed-c2.example.com',
    listType: 'block',
    added_by: 'analyst-mock-003',
    added_at: '2026-01-13T09:00:00.000Z',
    reason: 'Confirmed C2 domain — temporary force block (Mock)',
    expires_at: '2026-04-01T00:00:00.000Z',
  },
];
