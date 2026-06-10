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
  {
    id: seedId('tab', 1),
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    iocCategory: 'domain',
    value: 'safe-internal.example.com',
    listType: 'allow',
    addedBy: 'analyst-mock-001',
    addedAt: '2026-01-10T09:00:00.000Z',
    reason: 'Known-good internal domain — false positive suppression (Mock)',
    expiresAt: null,
  },
  {
    id: seedId('tab', 2),
    tenant: SEED_TENANT,
    createdAt: '2026-01-11T09:00:00.000Z',
    updatedAt: '2026-01-11T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    iocCategory: 'ip_address',
    value: '192.0.2.50',
    listType: 'allow',
    addedBy: 'analyst-mock-002',
    addedAt: '2026-01-11T09:00:00.000Z',
    reason: 'Sanctioned pen-test IP — temporary allow (Mock)',
    expiresAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: seedId('tab', 3),
    tenant: SEED_TENANT,
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    iocCategory: 'file_hash_sha256',
    value: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    listType: 'block',
    addedBy: 'analyst-mock-001',
    addedAt: '2026-01-12T09:00:00.000Z',
    reason: 'Confirmed ransomware hash — force block regardless of confidence (Mock)',
    expiresAt: null,
  },
  {
    id: seedId('tab', 4),
    tenant: SEED_TENANT,
    createdAt: '2026-01-13T09:00:00.000Z',
    updatedAt: '2026-01-13T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    iocCategory: 'domain',
    value: 'confirmed-c2.example.com',
    listType: 'block',
    addedBy: 'analyst-mock-003',
    addedAt: '2026-01-13T09:00:00.000Z',
    reason: 'Confirmed C2 domain — temporary force block (Mock)',
    expiresAt: '2026-04-01T00:00:00.000Z',
  },
];
