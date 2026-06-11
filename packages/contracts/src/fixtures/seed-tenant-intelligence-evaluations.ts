/**
 * Seed Tenant Intelligence Evaluations — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 11.2
 *
 * 5 evaluations covering all TENANT_EXPOSURE_STATES. Synthetic data, (Mock) markers.
 */

import type { TenantIntelligenceEvaluation } from '../entities/tenant-intelligence-evaluation';
import type { TenantExposureState, EvaluationType } from '../entities/intelligence-common';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

const EVALUATION_FIXTURES: Array<{
  evaluationState: TenantExposureState;
  evaluationType: EvaluationType;
  platformRecordIdx: number;
}> = [
  { evaluationState: 'matched', evaluationType: 'vulnerability_exposure', platformRecordIdx: 1 },
  { evaluationState: 'not_matched', evaluationType: 'ioc_match', platformRecordIdx: 2 },
  { evaluationState: 'exposed', evaluationType: 'vulnerability_exposure', platformRecordIdx: 3 },
  { evaluationState: 'remediated', evaluationType: 'advisory_applicability', platformRecordIdx: 4 },
  { evaluationState: 'accepted_risk', evaluationType: 'vulnerability_exposure', platformRecordIdx: 5 },
];

export const seedTenantIntelligenceEvaluations: TenantIntelligenceEvaluation[] = EVALUATION_FIXTURES.map(
  (fixture, index) => ({
    id: seedId('teval', index + 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    tenant_id: SEED_TENANT.tenant_id,
    platformRecordId: seedId('vir', fixture.platformRecordIdx),
    evaluationType: fixture.evaluationType,
    evaluationState: fixture.evaluationState,
    matchedAssets: index < 3 ? [seedId('asset', index + 1)] : [],
    matchedIdentities: index === 0 ? [seedId('identity', 1)] : [],
    matchedObservables: index < 2 ? [seedId('obs', index + 1)] : [],
    evidenceReferences: [`evidence-ref-eval-mock-${index + 1}`],
    evaluated_at: '2026-01-15T09:00:00.000Z',
  }),
);
