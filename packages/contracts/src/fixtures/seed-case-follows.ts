/**
 * Seed Case Follows — Commander SDR Test Fixtures
 *
 * Synthetic case follow/subscription records for the analyst workspace.
 * No real customer data, secrets, or vendor credentials.
 */

import type { CaseFollow } from '../entities/case-follow';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

export const seedCaseFollows: CaseFollow[] = [
  {
    id: seedId('case-follow', 1),
    entityType: 'case-follow',
    tenant: SEED_TENANT,
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-01-20T08:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'case-follow-service' },
    userId: 'user-analyst-001',
    caseRef: 'case-0001',
    followedAt: '2026-01-20T08:00:00.000Z',
    unfollowedAt: null,
    notifyOn: ['status_change', 'sla_breach', 'escalation', 'new_evidence'],
  },
  {
    id: seedId('case-follow', 2),
    entityType: 'case-follow',
    tenant: SEED_TENANT,
    createdAt: '2026-01-21T10:00:00.000Z',
    updatedAt: '2026-01-21T10:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'case-follow-service' },
    userId: 'user-analyst-001',
    caseRef: 'case-0003',
    followedAt: '2026-01-21T10:00:00.000Z',
    unfollowedAt: null,
    notifyOn: ['status_change', 'new_evidence'],
  },
  {
    id: seedId('case-follow', 3),
    entityType: 'case-follow',
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T14:00:00.000Z',
    updatedAt: '2026-01-25T16:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'case-follow-service' },
    userId: 'user-analyst-001',
    caseRef: 'case-0005',
    followedAt: '2026-01-15T14:00:00.000Z',
    unfollowedAt: '2026-01-25T16:00:00.000Z',
    notifyOn: ['status_change', 'sla_breach'],
  },
  {
    id: seedId('case-follow', 4),
    entityType: 'case-follow',
    tenant: SEED_TENANT,
    createdAt: '2026-01-28T09:00:00.000Z',
    updatedAt: '2026-01-28T09:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'case-follow-service' },
    userId: 'user-analyst-002',
    caseRef: 'case-0002',
    followedAt: '2026-01-28T09:00:00.000Z',
    unfollowedAt: null,
    notifyOn: ['escalation', 'sla_breach'],
  },
];
