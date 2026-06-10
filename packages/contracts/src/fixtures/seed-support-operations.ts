/**
 * Seed Support Operations — Commander SDR Control Plane Fixtures
 * 3 support operation records. Source: Master Technical Specification §Commercial Control Plane
 */

import type { SupportOperation } from '../entities/support-operation';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CP_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-control-plane' };

export const seedSupportOperations: SupportOperation[] = [
  {
    id: seedId('support', 1), entityType: 'support-operation', tenant: SEED_TENANT,
    createdAt: '2026-01-16T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    customerId: seedId('customer', 1), tenantId: seedId('tc', 1),
    title: 'Connector health check failures — CrowdStrike EDR (Mock)',
    description: 'Customer reports intermittent health check failures on CrowdStrike EDR connector. Ingestion rate degraded.',
    category: 'platform_issue', priority: 'high', status: 'in_progress',
    assignedTo: 'operator-support-01 (Mock)', openedAt: '2026-01-16T10:00:00.000Z',
    resolvedAt: null, resolutionNotes: null,
  },
  {
    id: seedId('support', 2), entityType: 'support-operation', tenant: SEED_TENANT,
    createdAt: '2026-01-14T00:00:00.000Z', updatedAt: '2026-01-15T12:00:00.000Z', source: CP_SOURCE,
    customerId: seedId('customer', 2), tenantId: seedId('tc', 2),
    title: 'Onboarding assistance — custom rule builder access',
    description: 'Customer requesting enablement of custom rule builder feature for their security architects.',
    category: 'onboarding', priority: 'medium', status: 'resolved',
    assignedTo: 'operator-support-02 (Mock)', openedAt: '2026-01-14T09:00:00.000Z',
    resolvedAt: '2026-01-15T12:00:00.000Z', resolutionNotes: 'Feature entitled. Customer notified. Documentation link shared.',
  },
  {
    id: seedId('support', 3), entityType: 'support-operation', tenant: SEED_TENANT,
    createdAt: '2026-01-18T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    customerId: seedId('customer', 3), tenantId: seedId('tc', 3),
    title: 'Provisioning delay — NovaCare Health trial tenant',
    description: 'Trial tenant provisioning taking longer than expected. Customer awaiting access.',
    category: 'onboarding', priority: 'low', status: 'open',
    assignedTo: 'operator-support-01 (Mock)', openedAt: '2026-01-18T08:00:00.000Z',
    resolvedAt: null, resolutionNotes: null,
  },
];
