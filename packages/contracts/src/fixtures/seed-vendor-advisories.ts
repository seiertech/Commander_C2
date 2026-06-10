/**
 * Seed Vendor Advisories — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 5.1, 5.2, 5.3
 *
 * 3 advisories: multi-CVE, containing IOCs. Synthetic .example domains, (Mock) markers.
 * No real secrets/credentials.
 */

import type { VendorAdvisory } from '../entities/vendor-advisory';
import { seedId, SEED_SOURCE } from './seed-tenant';

const ADMIN_TENANT = { tenantId: 'admin-tenant-001', tenantName: 'Commander Admin (Mock)' };

export const seedVendorAdvisories: VendorAdvisory[] = [
  {
    id: seedId('vadv', 1),
    tenant: ADMIN_TENANT,
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    advisoryId: 'VENDOR-A-2026-001',
    vendor: 'Vendor A (Mock)',
    title: 'Critical RCE in Vendor A Product (Mock)',
    publishedAt: '2026-01-12T00:00:00.000Z',
    lastModifiedAt: '2026-01-14T00:00:00.000Z',
    severity: 5,
    affectedProducts: ['vendor-a-product.example/v1', 'vendor-a-product.example/v2'],
    remediationGuidance: 'Upgrade to vendor-a-product.example/v3 or apply patch KB-2026-001 (Mock)',
    relatedCveIds: ['CVE-2026-0001', 'CVE-2026-0042'],
    containedIocIds: [seedId('ioc', 1), seedId('ioc', 5), seedId('ioc', 7)],
  },
  {
    id: seedId('vadv', 2),
    tenant: ADMIN_TENANT,
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    advisoryId: 'VENDOR-B-2026-042',
    vendor: 'Vendor B (Mock)',
    title: 'Privilege Escalation in Vendor B Framework (Mock)',
    publishedAt: '2026-01-10T00:00:00.000Z',
    lastModifiedAt: '2026-01-13T00:00:00.000Z',
    severity: 4,
    affectedProducts: ['vendor-b-framework.example/v3'],
    remediationGuidance: 'Apply vendor-b-framework.example/v3.1 hotfix (Mock)',
    relatedCveIds: ['CVE-2026-0042'],
    containedIocIds: [seedId('ioc', 8)],
  },
  {
    id: seedId('vadv', 3),
    tenant: ADMIN_TENANT,
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    advisoryId: 'VENDOR-C-2026-SEC-003',
    vendor: 'Vendor C (Mock)',
    title: 'Multiple Vulnerabilities in Vendor C Library (Mock)',
    publishedAt: '2026-01-08T00:00:00.000Z',
    lastModifiedAt: '2026-01-08T00:00:00.000Z',
    severity: 3,
    affectedProducts: ['vendor-c-library.example/v2'],
    remediationGuidance: 'Upgrade to vendor-c-library.example/v2.5 (Mock)',
    relatedCveIds: ['CVE-2026-1100', 'CVE-2026-2200', 'CVE-2026-0099'],
    containedIocIds: [seedId('ioc', 5), seedId('ioc', 6)],
  },
];
