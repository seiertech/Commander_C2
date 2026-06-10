/**
 * Seed Teams Decision Events — Deterministic Fixtures
 *
 * Feature: communications-excellence
 * 3 decision events covering approved/denied/delegated decisions.
 * Teams decisions flow through Commander — no direct state mutation.
 * Synthetic data. No live Teams bot.
 */

import type { TeamsDecisionEvent } from '../entities/teams-decision-event';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

export const seedTeamsDecisionEvents: TeamsDecisionEvent[] = [
  { entity_type: "entity",
    id: seedId('teamsdec', 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-16T10:00:00.000Z',
    updated_at: '2026-01-16T10:15:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-teams-connector (Mock)' },
    event_id: seedId('teamsdec', 1),
    tenant_id: SEED_TENANT.tenant_id,
    case_id: seedId('case', 1),
    requestType: 'approval',
    cardId: 'adaptive-card-001 (Mock)',
    requested_at: '2026-01-16T10:00:00.000Z',
    respondedAt: '2026-01-16T10:15:00.000Z',
    respondedBy: 'team-lead-001@acme.example',
    decision: 'approved',
    validatedByCommander: true,
    executedByCommander: true,
    auditEventRef: seedId('audit', 201),
  },
  { entity_type: "entity",
    id: seedId('teamsdec', 2),
    tenant: SEED_TENANT,
    created_at: '2026-01-16T11:00:00.000Z',
    updated_at: '2026-01-16T11:30:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-teams-connector (Mock)' },
    event_id: seedId('teamsdec', 2),
    tenant_id: SEED_TENANT.tenant_id,
    case_id: seedId('case', 2),
    requestType: 'action_override',
    cardId: 'adaptive-card-002 (Mock)',
    requested_at: '2026-01-16T11:00:00.000Z',
    respondedAt: '2026-01-16T11:30:00.000Z',
    respondedBy: 'ciso@acme.example',
    decision: 'denied',
    validatedByCommander: true,
    executedByCommander: false,
    auditEventRef: seedId('audit', 202),
  },
  { entity_type: "entity",
    id: seedId('teamsdec', 3),
    tenant: SEED_TENANT,
    created_at: '2026-01-16T12:00:00.000Z',
    updated_at: '2026-01-16T12:45:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-teams-connector (Mock)' },
    event_id: seedId('teamsdec', 3),
    tenant_id: SEED_TENANT.tenant_id,
    case_id: seedId('case', 3),
    requestType: 'resource_assignment',
    cardId: 'adaptive-card-003 (Mock)',
    requested_at: '2026-01-16T12:00:00.000Z',
    respondedAt: '2026-01-16T12:45:00.000Z',
    respondedBy: 'team-lead-002@acme.example',
    decision: 'delegated',
    validatedByCommander: true,
    executedByCommander: true,
    auditEventRef: seedId('audit', 203),
  },
];
