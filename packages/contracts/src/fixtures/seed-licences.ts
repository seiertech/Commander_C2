/**
 * Seed Licences — Commander SDR Control Plane Fixtures
 * 3 licence records. Source: Master Technical Specification §Commercial Control Plane
 */

import type { Licence } from '../entities/licence';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CP_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-control-plane' };

export const seedLicences: Licence[] = [
  {
    id: seedId('licence', 1), entityType: 'licence', tenant: SEED_TENANT,
    createdAt: '2025-06-01T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    customerId: seedId('customer', 1), tenantId: seedId('tc', 1),
    licenceType: 'enterprise', status: 'active',
    startDate: '2025-06-01T00:00:00.000Z', endDate: '2027-05-31T00:00:00.000Z',
    maxUsers: 50, maxAssets: 500,
    currentUsage: { users: 35, assets: 320, connectors: 5 },
    features: ['full-platform', 'commander-ai', 'push-governance-dry-run'],
    billingCycle: 'annual', renewalDate: '2027-05-31T00:00:00.000Z',
  },
  {
    id: seedId('licence', 2), entityType: 'licence', tenant: SEED_TENANT,
    createdAt: '2025-09-01T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    customerId: seedId('customer', 2), tenantId: seedId('tc', 2),
    licenceType: 'professional', status: 'active',
    startDate: '2025-09-01T00:00:00.000Z', endDate: '2026-08-31T00:00:00.000Z',
    maxUsers: 25, maxAssets: 200,
    currentUsage: { users: 12, assets: 85, connectors: 3 },
    features: ['core-platform', 'commander-ai'],
    billingCycle: 'annual', renewalDate: '2026-08-31T00:00:00.000Z',
  },
  {
    id: seedId('licence', 3), entityType: 'licence', tenant: SEED_TENANT,
    createdAt: '2026-01-15T00:00:00.000Z', updatedAt: '2026-01-15T00:00:00.000Z', source: CP_SOURCE,
    customerId: seedId('customer', 3), tenantId: seedId('tc', 3),
    licenceType: 'starter', status: 'trial',
    startDate: '2026-01-15T00:00:00.000Z', endDate: '2026-04-15T00:00:00.000Z',
    maxUsers: 10, maxAssets: 50,
    currentUsage: { users: 0, assets: 0, connectors: 0 },
    features: ['core-platform'],
    billingCycle: 'monthly', renewalDate: null,
  },
];
