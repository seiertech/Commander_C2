/**
 * Seed Case Follows — Commander C2 Test Fixtures
 *
 * Synthetic case follow/subscription records for the analyst workspace.
 * No real customer data, secrets, or vendor credentials.
 */

import type { CaseFollow } from '../entities/case-follow';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

export const seedCaseFollows: CaseFollow[] = [
  {
    id: seedId('case-follow', 1),
    entity_type: 'case-follow',
    tenant: SEED_TENANT,
    created_at: '2026-01-20T08:00:00.000Z',
    updated_at: '2026-01-20T08:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'case-follow-service' },
    user_id: 'user-analyst-001',
    case_ref: 'case-0001',
    followed_at: '2026-01-20T08:00:00.000Z',
    unfollowedAt: null,
    notifyOn: ['status_change', 'sla_breach', 'escalation', 'new_evidence'],
  },
  {
    id: seedId('case-follow', 2),
    entity_type: 'case-follow',
    tenant: SEED_TENANT,
    created_at: '2026-01-21T10:00:00.000Z',
    updated_at: '2026-01-21T10:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'case-follow-service' },
    user_id: 'user-analyst-001',
    case_ref: 'case-0003',
    followed_at: '2026-01-21T10:00:00.000Z',
    unfollowedAt: null,
    notifyOn: ['status_change', 'new_evidence'],
  },
  {
    id: seedId('case-follow', 3),
    entity_type: 'case-follow',
    tenant: SEED_TENANT,
    created_at: '2026-01-15T14:00:00.000Z',
    updated_at: '2026-01-25T16:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'case-follow-service' },
    user_id: 'user-analyst-001',
    case_ref: 'case-0005',
    followed_at: '2026-01-15T14:00:00.000Z',
    unfollowedAt: '2026-01-25T16:00:00.000Z',
    notifyOn: ['status_change', 'sla_breach'],
  },
  {
    id: seedId('case-follow', 4),
    entity_type: 'case-follow',
    tenant: SEED_TENANT,
    created_at: '2026-01-28T09:00:00.000Z',
    updated_at: '2026-01-28T09:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'case-follow-service' },
    user_id: 'user-analyst-002',
    case_ref: 'case-0002',
    followed_at: '2026-01-28T09:00:00.000Z',
    unfollowedAt: null,
    notifyOn: ['escalation', 'sla_breach'],
  },
];
