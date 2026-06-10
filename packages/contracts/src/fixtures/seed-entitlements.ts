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

const ENTITLEMENT_SOURCE = { ...SEED_SOURCE, source_system: 'commander-control-plane' };

export const seedEntitlements: EntitlementManifest[] = [
  {
    id: seedId('entitlement-manifest', 1),
    entity_type: 'entitlement-manifest',
    tenant: SEED_TENANT,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-15T00:00:00.000Z',
    source: ENTITLEMENT_SOURCE,
    manifest_id: 'mfst-trial-001',
    tenant_id: 'tenant-trial-001',
    modules: [
      { module_id: 'mod-case-mgmt', name: 'Case Management', category: 'core', enabled: true },
      { module_id: 'mod-asset-intel', name: 'Asset Intelligence', category: 'core', enabled: true },
      { module_id: 'mod-identity-intel', name: 'Identity Intelligence', category: 'advanced', enabled: false },
      { module_id: 'mod-exposure-mgmt', name: 'Exposure Management', category: 'premium', enabled: false },
    ],
    connectorLimit: 3,
    aiEnabled: false,
    automationEnabled: false,
    fusionMapEnabled: false,
    reportingTier: 'basic',
    effective_from: '2026-01-01T00:00:00.000Z',
    effective_until: '2026-02-01T00:00:00.000Z',
    status: 'trial',
  },
  {
    id: seedId('entitlement-manifest', 2),
    entity_type: 'entitlement-manifest',
    tenant: SEED_TENANT,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-20T00:00:00.000Z',
    source: ENTITLEMENT_SOURCE,
    manifest_id: 'mfst-standard-001',
    tenant_id: 'tenant-standard-001',
    modules: [
      { module_id: 'mod-case-mgmt', name: 'Case Management', category: 'core', enabled: true },
      { module_id: 'mod-asset-intel', name: 'Asset Intelligence', category: 'core', enabled: true },
      { module_id: 'mod-identity-intel', name: 'Identity Intelligence', category: 'advanced', enabled: true },
      { module_id: 'mod-vuln-mgmt', name: 'Vulnerability Management', category: 'advanced', enabled: true },
      { module_id: 'mod-exposure-mgmt', name: 'Exposure Management', category: 'premium', enabled: false },
    ],
    connectorLimit: 10,
    aiEnabled: true,
    automationEnabled: true,
    fusionMapEnabled: false,
    reportingTier: 'standard',
    effective_from: '2026-01-01T00:00:00.000Z',
    effective_until: '2026-12-31T00:00:00.000Z',
    status: 'active',
  },
  {
    id: seedId('entitlement-manifest', 3),
    entity_type: 'entitlement-manifest',
    tenant: SEED_TENANT,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-25T00:00:00.000Z',
    source: ENTITLEMENT_SOURCE,
    manifest_id: 'mfst-premium-001',
    tenant_id: 'tenant-premium-001',
    modules: [
      { module_id: 'mod-case-mgmt', name: 'Case Management', category: 'core', enabled: true },
      { module_id: 'mod-asset-intel', name: 'Asset Intelligence', category: 'core', enabled: true },
      { module_id: 'mod-identity-intel', name: 'Identity Intelligence', category: 'advanced', enabled: true },
      { module_id: 'mod-vuln-mgmt', name: 'Vulnerability Management', category: 'advanced', enabled: true },
      { module_id: 'mod-exposure-mgmt', name: 'Exposure Management', category: 'premium', enabled: true },
      { module_id: 'mod-fusion-map', name: 'Fusion Map', category: 'premium', enabled: true },
    ],
    connectorLimit: 50,
    aiEnabled: true,
    automationEnabled: true,
    fusionMapEnabled: true,
    reportingTier: 'premium',
    effective_from: '2026-01-01T00:00:00.000Z',
    effective_until: '2027-12-31T00:00:00.000Z',
    status: 'active',
  },
];
