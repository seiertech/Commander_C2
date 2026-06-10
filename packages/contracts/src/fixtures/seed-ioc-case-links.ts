/**
 * Seed IOC Case Links — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 13.5
 *
 * 3 links: created_by, enriched_by, triggered_by. Synthetic data.
 */

import type { IocCaseLink } from '../entities/ioc-case-link';
import type { IocCaseLinkType } from '../entities/intelligence-common';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

const LINK_FIXTURES: Array<{ linkType: IocCaseLinkType; matchIdx: number; caseIdx: number }> = [
  { linkType: 'created_by', matchIdx: 1, caseIdx: 1 },
  { linkType: 'enriched_by', matchIdx: 2, caseIdx: 2 },
  { linkType: 'triggered_by', matchIdx: 3, caseIdx: 3 },
];

export const seedIocCaseLinks: IocCaseLink[] = LINK_FIXTURES.map(
  (fixture, index) => ({
    id: seedId('icl', index + 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    iocMatchId: seedId('tmatch', fixture.matchIdx),
    case_id: seedId('case', fixture.caseIdx),
    linkType: fixture.linkType,
    linked_at: '2026-01-15T09:00:00.000Z',
    status: 'active',
  }),
);
