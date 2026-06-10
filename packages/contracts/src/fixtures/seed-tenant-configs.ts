/**
 * Seed Tenant Configs — Commander SDR Control Plane Fixtures
 *
 * 3 synthetic tenant configuration records for Control Plane surface.
 * Source: Master Technical Specification §Commercial Control Plane
 */

import type { TenantConfig } from '../entities/tenant-config';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CP_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-control-plane' };

export const seedTenantConfigs: TenantConfig[] = [
  {
    id: seedId('tc', 1), entityType: 'tenant-config', tenant: SEED_TENANT,
    createdAt: '2025-06-01T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    tenantDisplayName: 'Acme Corp — Production', customerId: seedId('customer', 1),
    status: 'active', deploymentRegion: 'eu-west-1', maxUsers: 50, currentUsers: 35,
    maxAssets: 500, currentAssets: 320,
    featuresEnabled: ['feat.commander.grounding_pipeline', 'feat.detection.model_updates_auto', 'feat.push.dry_run'],
    provisionedAt: '2025-06-01T00:00:00.000Z', lastActivityAt: '2026-01-18T06:00:00.000Z',
  },
  {
    id: seedId('tc', 2), entityType: 'tenant-config', tenant: SEED_TENANT,
    createdAt: '2025-06-15T00:00:00.000Z', updatedAt: '2026-01-15T00:00:00.000Z', source: CP_SOURCE,
    tenantDisplayName: 'Acme Corp — Staging', customerId: seedId('customer', 1),
    status: 'active', deploymentRegion: 'eu-west-1', maxUsers: 10, currentUsers: 5,
    maxAssets: 100, currentAssets: 45,
    featuresEnabled: ['feat.commander.grounding_pipeline', 'feat.push.dry_run'],
    provisionedAt: '2025-06-15T00:00:00.000Z', lastActivityAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: seedId('tc', 3), entityType: 'tenant-config', tenant: SEED_TENANT,
    createdAt: '2026-01-15T00:00:00.000Z', updatedAt: '2026-01-15T00:00:00.000Z', source: CP_SOURCE,
    tenantDisplayName: 'NovaCare Health — Production', customerId: seedId('customer', 3),
    status: 'provisioning', deploymentRegion: 'uk-south-1', maxUsers: 25, currentUsers: 0,
    maxAssets: 200, currentAssets: 0,
    featuresEnabled: ['feat.push.dry_run'],
    provisionedAt: '2026-01-15T00:00:00.000Z', lastActivityAt: '2026-01-15T00:00:00.000Z',
  },
];
