/**
 * Seed Tenant Configs — Commander C2 Control Plane Fixtures
 *
 * 3 synthetic tenant configuration records for Control Plane surface.
 * Source: Master Technical Specification §Commercial Control Plane
 */

import type { TenantConfig } from '../entities/tenant-config';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CP_SOURCE = { ...SEED_SOURCE, source_system: 'commander-control-plane' };

export const seedTenantConfigs: TenantConfig[] = [
  {
    id: seedId('tc', 1), entity_type: 'tenant-config', tenant: SEED_TENANT,
    created_at: '2025-06-01T00:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    tenantDisplayName: 'Acme Corp — Production', customer_id: seedId('customer', 1),
    status: 'active', deploymentRegion: 'eu-west-1', max_users: 50, currentUsers: 35,
    max_assets: 500, currentAssets: 320,
    featuresEnabled: ['feat.commander.grounding_pipeline', 'feat.detection.model_updates_auto', 'feat.push.dry_run'],
    provisionedAt: '2025-06-01T00:00:00.000Z', last_activity_at: '2026-01-18T06:00:00.000Z',
  },
  {
    id: seedId('tc', 2), entity_type: 'tenant-config', tenant: SEED_TENANT,
    created_at: '2025-06-15T00:00:00.000Z', updated_at: '2026-01-15T00:00:00.000Z', source: CP_SOURCE,
    tenantDisplayName: 'Acme Corp — Staging', customer_id: seedId('customer', 1),
    status: 'active', deploymentRegion: 'eu-west-1', max_users: 10, currentUsers: 5,
    max_assets: 100, currentAssets: 45,
    featuresEnabled: ['feat.commander.grounding_pipeline', 'feat.push.dry_run'],
    provisionedAt: '2025-06-15T00:00:00.000Z', last_activity_at: '2026-01-15T00:00:00.000Z',
  },
  {
    id: seedId('tc', 3), entity_type: 'tenant-config', tenant: SEED_TENANT,
    created_at: '2026-01-15T00:00:00.000Z', updated_at: '2026-01-15T00:00:00.000Z', source: CP_SOURCE,
    tenantDisplayName: 'NovaCare Health — Production', customer_id: seedId('customer', 3),
    status: 'provisioning', deploymentRegion: 'uk-south-1', max_users: 25, currentUsers: 0,
    max_assets: 200, currentAssets: 0,
    featuresEnabled: ['feat.push.dry_run'],
    provisionedAt: '2026-01-15T00:00:00.000Z', last_activity_at: '2026-01-15T00:00:00.000Z',
  },
];
