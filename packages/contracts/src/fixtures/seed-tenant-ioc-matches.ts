/**
 * Seed Tenant IOC Matches — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 12.1
 *
 * 5 matches: exact/partial/heuristic with various confidences. Synthetic data.
 */

import type { TenantIocMatch } from '../entities/tenant-ioc-match';
import type { IocMatchType } from '../entities/intelligence-common';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

const MATCH_FIXTURES: Array<{
  matchType: IocMatchType;
  confidence: number;
  iocIdx: number;
}> = [
  { matchType: 'exact', confidence: 99, iocIdx: 1 },
  { matchType: 'exact', confidence: 95, iocIdx: 5 },
  { matchType: 'partial', confidence: 72, iocIdx: 7 },
  { matchType: 'heuristic', confidence: 55, iocIdx: 8 },
  { matchType: 'partial', confidence: 68, iocIdx: 3 },
];

export const seedTenantIocMatches: TenantIocMatch[] = MATCH_FIXTURES.map(
  (fixture, index) => ({
    id: seedId('tmatch', index + 1),
    tenant: SEED_TENANT,
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    tenantId: SEED_TENANT.tenantId,
    iocId: seedId('ioc', fixture.iocIdx),
    matchedObservableId: seedId('obs', index + 1),
    matchType: fixture.matchType,
    matchConfidence: fixture.confidence,
    matchedAt: '2026-01-15T09:00:00.000Z',
    matchSource: 'subscription-evaluation-engine (Mock)',
    evidenceReferences: [`evidence-ref-match-mock-${index + 1}`],
  }),
);
