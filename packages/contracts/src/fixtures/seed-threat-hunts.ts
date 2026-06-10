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
  startedAt: string | null;
  completedAt: string | null;
}> = [
  { status: 'proposed', startedAt: null, completedAt: null },
  { status: 'running', startedAt: '2026-01-15T10:00:00.000Z', completedAt: null },
  { status: 'match_found', startedAt: '2026-01-14T10:00:00.000Z', completedAt: '2026-01-15T06:00:00.000Z' },
  { status: 'escalated', startedAt: '2026-01-13T10:00:00.000Z', completedAt: '2026-01-14T12:00:00.000Z' },
];

export const seedThreatHunts: ThreatHuntRecord[] = HUNT_FIXTURES.map(
  (fixture, index) => ({
    id: seedId('thunt', index + 1),
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    triggeringIocId: seedId('ioc', index + 1),
    triggeringMatchId: seedId('tmatch', index + 1),
    huntType: index % 2 === 0 ? 'retroactive-ioc-sweep' : 'hypothesis-driven',
    huntScope: `scope-mock-${index + 1}: all endpoints (Mock)`,
    status: fixture.status,
    assignedTo: `analyst-mock-${(index % 3) + 1}`,
    proposedAt: '2026-01-13T09:00:00.000Z',
    startedAt: fixture.startedAt,
    completedAt: fixture.completedAt,
    findingsRef: fixture.completedAt ? `findings-ref-mock-${index + 1}` : '',
  }),
);
