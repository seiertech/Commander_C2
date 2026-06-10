/**
 * Seed Licences — Commander C2 Control Plane Fixtures
 * 3 licence records. Source: Master Technical Specification §Commercial Control Plane
 */

import type { Licence } from '../entities/licence';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CP_SOURCE = { ...SEED_SOURCE, source_system: 'commander-control-plane' };

export const seedLicences: Licence[] = [
  {
    id: seedId('licence', 1), entity_type: 'licence', tenant: SEED_TENANT,
    created_at: '2025-06-01T00:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    customer_id: seedId('customer', 1), tenant_id: seedId('tc', 1),
    licence_type: 'enterprise', status: 'active',
    startDate: '2025-06-01T00:00:00.000Z', endDate: '2027-05-31T00:00:00.000Z',
    max_users: 50, max_assets: 500,
    current_usage: { users: 35, assets: 320, connectors: 5 },
    features: ['full-platform', 'commander-ai', 'push-governance-dry-run'],
    billingCycle: 'annual', renewalDate: '2027-05-31T00:00:00.000Z',
  },
  {
    id: seedId('licence', 2), entity_type: 'licence', tenant: SEED_TENANT,
    created_at: '2025-09-01T00:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    customer_id: seedId('customer', 2), tenant_id: seedId('tc', 2),
    licence_type: 'professional', status: 'active',
    startDate: '2025-09-01T00:00:00.000Z', endDate: '2026-08-31T00:00:00.000Z',
    max_users: 25, max_assets: 200,
    current_usage: { users: 12, assets: 85, connectors: 3 },
    features: ['core-platform', 'commander-ai'],
    billingCycle: 'annual', renewalDate: '2026-08-31T00:00:00.000Z',
  },
  {
    id: seedId('licence', 3), entity_type: 'licence', tenant: SEED_TENANT,
    created_at: '2026-01-15T00:00:00.000Z', updated_at: '2026-01-15T00:00:00.000Z', source: CP_SOURCE,
    customer_id: seedId('customer', 3), tenant_id: seedId('tc', 3),
    licence_type: 'starter', status: 'trial',
    startDate: '2026-01-15T00:00:00.000Z', endDate: '2026-04-15T00:00:00.000Z',
    max_users: 10, max_assets: 50,
    current_usage: { users: 0, assets: 0, connectors: 0 },
    features: ['core-platform'],
    billingCycle: 'monthly', renewalDate: null,
  },
];
