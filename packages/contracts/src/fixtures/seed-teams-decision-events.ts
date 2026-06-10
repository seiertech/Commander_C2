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
  {
    id: seedId('teamsdec', 1),
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T10:00:00.000Z',
    updatedAt: '2026-01-16T10:15:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-teams-connector (Mock)' },
    eventId: seedId('teamsdec', 1),
    tenantId: SEED_TENANT.tenantId,
    caseId: seedId('case', 1),
    requestType: 'approval',
    cardId: 'adaptive-card-001 (Mock)',
    requestedAt: '2026-01-16T10:00:00.000Z',
    respondedAt: '2026-01-16T10:15:00.000Z',
    respondedBy: 'team-lead-001@acme.example',
    decision: 'approved',
    validatedByCommander: true,
    executedByCommander: true,
    auditEventRef: seedId('audit', 201),
  },
  {
    id: seedId('teamsdec', 2),
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T11:00:00.000Z',
    updatedAt: '2026-01-16T11:30:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-teams-connector (Mock)' },
    eventId: seedId('teamsdec', 2),
    tenantId: SEED_TENANT.tenantId,
    caseId: seedId('case', 2),
    requestType: 'action_override',
    cardId: 'adaptive-card-002 (Mock)',
    requestedAt: '2026-01-16T11:00:00.000Z',
    respondedAt: '2026-01-16T11:30:00.000Z',
    respondedBy: 'ciso@acme.example',
    decision: 'denied',
    validatedByCommander: true,
    executedByCommander: false,
    auditEventRef: seedId('audit', 202),
  },
  {
    id: seedId('teamsdec', 3),
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T12:00:00.000Z',
    updatedAt: '2026-01-16T12:45:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-teams-connector (Mock)' },
    eventId: seedId('teamsdec', 3),
    tenantId: SEED_TENANT.tenantId,
    caseId: seedId('case', 3),
    requestType: 'resource_assignment',
    cardId: 'adaptive-card-003 (Mock)',
    requestedAt: '2026-01-16T12:00:00.000Z',
    respondedAt: '2026-01-16T12:45:00.000Z',
    respondedBy: 'team-lead-002@acme.example',
    decision: 'delegated',
    validatedByCommander: true,
    executedByCommander: true,
    auditEventRef: seedId('audit', 203),
  },
];
