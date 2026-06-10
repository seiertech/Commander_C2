/**
 * Seed Threat Hunt Records — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 14.1
 *
 * 4 threat hunt records covering all THREAT_HUNT_STATUSES. Synthetic data.
 */

import type { ThreatHuntRecord } from '../entities/threat-hunt-record';
import type { ThreatHuntStatus } from '../entities/intelligence-common';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

const HUNT_FIXTURES: Array<{
  status: ThreatHuntStatus;
  started_at: string | null;
  completed_at: string | null;
}> = [
  { status: 'proposed', started_at: null, completed_at: null },
  { status: 'running', started_at: '2026-01-15T10:00:00.000Z', completed_at: null },
  { status: 'match_found', started_at: '2026-01-14T10:00:00.000Z', completed_at: '2026-01-15T06:00:00.000Z' },
  { status: 'escalated', started_at: '2026-01-13T10:00:00.000Z', completed_at: '2026-01-14T12:00:00.000Z' },
];

export const seedThreatHunts: ThreatHuntRecord[] = HUNT_FIXTURES.map(
  (fixture, index) => ({
    id: seedId('thunt', index + 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    triggeringIocId: seedId('ioc', index + 1),
    triggeringMatchId: seedId('tmatch', index + 1),
    hunt_type: index % 2 === 0 ? 'retroactive-ioc-sweep' : 'hypothesis-driven',
    huntScope: `scope-mock-${index + 1}: all endpoints (Mock)`,
    status: fixture.status,
    assigned_to: `analyst-mock-${(index % 3) + 1}`,
    proposed_at: '2026-01-13T09:00:00.000Z',
    started_at: fixture.started_at,
    completed_at: fixture.completed_at,
    findingsRef: fixture.completed_at ? `findings-ref-mock-${index + 1}` : '',
  }),
);
