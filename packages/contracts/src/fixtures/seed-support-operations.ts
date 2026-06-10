/**
 * Seed Support Operations — Commander C2 Control Plane Fixtures
 * 3 support operation records. Source: Master Technical Specification §Commercial Control Plane
 */

import type { SupportOperation } from '../entities/support-operation';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CP_SOURCE = { ...SEED_SOURCE, source_system: 'commander-control-plane' };

export const seedSupportOperations: SupportOperation[] = [
  {
    id: seedId('support', 1), entity_type: 'support-operation', tenant: SEED_TENANT,
    created_at: '2026-01-16T00:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    customer_id: seedId('customer', 1), tenant_id: seedId('tc', 1),
    title: 'Connector health check failures — CrowdStrike EDR (Mock)',
    description: 'Customer reports intermittent health check failures on CrowdStrike EDR connector. Ingestion rate degraded.',
    category: 'platform_issue', priority: 'high', status: 'in_progress',
    assigned_to: 'operator-support-01 (Mock)', openedAt: '2026-01-16T10:00:00.000Z',
    resolved_at: null, resolutionNotes: null,
  },
  {
    id: seedId('support', 2), entity_type: 'support-operation', tenant: SEED_TENANT,
    created_at: '2026-01-14T00:00:00.000Z', updated_at: '2026-01-15T12:00:00.000Z', source: CP_SOURCE,
    customer_id: seedId('customer', 2), tenant_id: seedId('tc', 2),
    title: 'Onboarding assistance — custom rule builder access',
    description: 'Customer requesting enablement of custom rule builder feature for their security architects.',
    category: 'onboarding', priority: 'medium', status: 'resolved',
    assigned_to: 'operator-support-02 (Mock)', openedAt: '2026-01-14T09:00:00.000Z',
    resolved_at: '2026-01-15T12:00:00.000Z', resolutionNotes: 'Feature entitled. Customer notified. Documentation link shared.',
  },
  {
    id: seedId('support', 3), entity_type: 'support-operation', tenant: SEED_TENANT,
    created_at: '2026-01-18T00:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: CP_SOURCE,
    customer_id: seedId('customer', 3), tenant_id: seedId('tc', 3),
    title: 'Provisioning delay — NovaCare Health trial tenant',
    description: 'Trial tenant provisioning taking longer than expected. Customer awaiting access.',
    category: 'onboarding', priority: 'low', status: 'open',
    assigned_to: 'operator-support-01 (Mock)', openedAt: '2026-01-18T08:00:00.000Z',
    resolved_at: null, resolutionNotes: null,
  },
];
