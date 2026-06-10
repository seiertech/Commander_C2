/**
 * Seed Entitlement Manifests — Commander C2 Test Fixtures
 *
 * Synthetic entitlement data for commercial control testing.
 * Source: Spec #38 Commander Internal Control Plane
 *
 * 3 manifests: trial tenant, standard tenant, premium tenant.
 */

import type { EntitlementManifest } from '../entities/entitlement-manifest';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const ENTITLEMENT_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-control-plane' };

export const seedEntitlements: EntitlementManifest[] = [
  {
    id: seedId('entitlement-manifest', 1),
    entityType: 'entitlement-manifest',
    tenant: SEED_TENANT,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
    source: ENTITLEMENT_SOURCE,
    manifestId: 'mfst-trial-001',
    tenantId: 'tenant-trial-001',
    modules: [
      { moduleId: 'mod-case-mgmt', name: 'Case Management', category: 'core', enabled: true },
      { moduleId: 'mod-asset-intel', name: 'Asset Intelligence', category: 'core', enabled: true },
      { moduleId: 'mod-identity-intel', name: 'Identity Intelligence', category: 'advanced', enabled: false },
      { moduleId: 'mod-exposure-mgmt', name: 'Exposure Management', category: 'premium', enabled: false },
    ],
    connectorLimit: 3,
    aiEnabled: false,
    automationEnabled: false,
    fusionMapEnabled: false,
    reportingTier: 'basic',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveUntil: '2026-02-01T00:00:00.000Z',
    status: 'trial',
  },
  {
    id: seedId('entitlement-manifest', 2),
    entityType: 'entitlement-manifest',
    tenant: SEED_TENANT,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-20T00:00:00.000Z',
    source: ENTITLEMENT_SOURCE,
    manifestId: 'mfst-standard-001',
    tenantId: 'tenant-standard-001',
    modules: [
      { moduleId: 'mod-case-mgmt', name: 'Case Management', category: 'core', enabled: true },
      { moduleId: 'mod-asset-intel', name: 'Asset Intelligence', category: 'core', enabled: true },
      { moduleId: 'mod-identity-intel', name: 'Identity Intelligence', category: 'advanced', enabled: true },
      { moduleId: 'mod-vuln-mgmt', name: 'Vulnerability Management', category: 'advanced', enabled: true },
      { moduleId: 'mod-exposure-mgmt', name: 'Exposure Management', category: 'premium', enabled: false },
    ],
    connectorLimit: 10,
    aiEnabled: true,
    automationEnabled: true,
    fusionMapEnabled: false,
    reportingTier: 'standard',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveUntil: '2026-12-31T00:00:00.000Z',
    status: 'active',
  },
  {
    id: seedId('entitlement-manifest', 3),
    entityType: 'entitlement-manifest',
    tenant: SEED_TENANT,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-25T00:00:00.000Z',
    source: ENTITLEMENT_SOURCE,
    manifestId: 'mfst-premium-001',
    tenantId: 'tenant-premium-001',
    modules: [
      { moduleId: 'mod-case-mgmt', name: 'Case Management', category: 'core', enabled: true },
      { moduleId: 'mod-asset-intel', name: 'Asset Intelligence', category: 'core', enabled: true },
      { moduleId: 'mod-identity-intel', name: 'Identity Intelligence', category: 'advanced', enabled: true },
      { moduleId: 'mod-vuln-mgmt', name: 'Vulnerability Management', category: 'advanced', enabled: true },
      { moduleId: 'mod-exposure-mgmt', name: 'Exposure Management', category: 'premium', enabled: true },
      { moduleId: 'mod-fusion-map', name: 'Fusion Map', category: 'premium', enabled: true },
    ],
    connectorLimit: 50,
    aiEnabled: true,
    automationEnabled: true,
    fusionMapEnabled: true,
    reportingTier: 'premium',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveUntil: '2027-12-31T00:00:00.000Z',
    status: 'active',
  },
];
