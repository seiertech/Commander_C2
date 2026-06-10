/**
 * Seed Customers — Commander SDR Control Plane Fixtures
 *
 * 3 synthetic customer records for Control Plane surface.
 * Source: Master Technical Specification §Commercial Control Plane
 */

import type { Customer } from '../entities/customer';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CP_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-control-plane' };

export const seedCustomers: Customer[] = [
  {
    id: seedId('customer', 1), entityType: 'customer', tenant: SEED_TENANT,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    name: 'Acme Corporation (Mock)', status: 'active', tier: 'enterprise',
    primaryContact: 'ciso@acme.example', tenantCount: 2,
    contractStartDate: '2025-06-01T00:00:00.000Z', contractEndDate: '2027-05-31T00:00:00.000Z',
    region: 'EU-West', industry: 'Financial Services',
  },
  {
    id: seedId('customer', 2), entityType: 'customer', tenant: SEED_TENANT,
    createdAt: '2026-01-05T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    name: 'GlobalTech Industries (Mock)', status: 'active', tier: 'professional',
    primaryContact: 'security@globaltech.example', tenantCount: 1,
    contractStartDate: '2025-09-01T00:00:00.000Z', contractEndDate: '2026-08-31T00:00:00.000Z',
    region: 'US-East', industry: 'Technology',
  },
  {
    id: seedId('customer', 3), entityType: 'customer', tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z', updatedAt: '2026-01-10T00:00:00.000Z', source: CP_SOURCE,
    name: 'NovaCare Health (Mock)', status: 'onboarding', tier: 'starter',
    primaryContact: 'it-sec@novacare.example', tenantCount: 1,
    contractStartDate: '2026-01-15T00:00:00.000Z', contractEndDate: '2027-01-14T00:00:00.000Z',
    region: 'UK', industry: 'Healthcare',
  },
];
