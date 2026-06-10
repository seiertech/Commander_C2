/**
 * Seed Risk Scores — Commander C2 Test Fixtures
 *
 * Synthetic risk-scoring outputs for rule-engine telemetry testing.
 * Source: Spec #34 Drift and Rule Engine
 *
 * 4 records across asset, identity, exposure and finding targets, each with
 * weighted factors whose contributions sum to the recorded score. Synthetic
 * values only.
 */

import type { RiskScore } from '../entities/risk-scoring-engine';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const SCORING_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-risk-scoring' };

export const seedRiskScores: RiskScore[] = [
  {
    id: seedId('risk-score', 1),
    entityType: 'risk-score',
    tenant: SEED_TENANT,
    createdAt: '2026-02-01T08:05:00.000Z',
    updatedAt: '2026-02-01T08:05:00.000Z',
    source: SCORING_SOURCE,
    scoringId: 'score-0001',
    scoredEntityType: 'identity',
    scoredEntityRef: 'identity-svc-prod-01',
    riskScore: 88,
    factors: [
      { factorId: 'f-priv', name: 'Privilege Level', weight: 0.4, contribution: 38, rationale: 'Service identity holds admin role on production.' },
      { factorId: 'f-ctrl', name: 'Control Drift', weight: 0.35, contribution: 32, rationale: 'MFA disabled — control regression detected.' },
      { factorId: 'f-expo', name: 'Exposure', weight: 0.25, contribution: 18, rationale: 'Identity used by internet-facing workload.' },
    ],
    computedAt: '2026-02-01T08:05:00.000Z',
    model: 'identity-risk',
    version: '1.2.0',
  },
  {
    id: seedId('risk-score', 2),
    entityType: 'risk-score',
    tenant: SEED_TENANT,
    createdAt: '2026-02-02T09:35:00.000Z',
    updatedAt: '2026-02-02T09:35:00.000Z',
    source: SCORING_SOURCE,
    scoringId: 'score-0002',
    scoredEntityType: 'asset',
    scoredEntityRef: 'asset-s3-logs-02',
    riskScore: 71,
    factors: [
      { factorId: 'f-data', name: 'Data Sensitivity', weight: 0.5, contribution: 40, rationale: 'Bucket stores audit logs containing sensitive metadata.' },
      { factorId: 'f-expo', name: 'Public Exposure', weight: 0.5, contribution: 31, rationale: 'Bucket became publicly readable.' },
    ],
    computedAt: '2026-02-02T09:35:00.000Z',
    model: 'asset-risk',
    version: '1.1.0',
  },
  {
    id: seedId('risk-score', 3),
    entityType: 'risk-score',
    tenant: SEED_TENANT,
    createdAt: '2026-01-28T07:25:00.000Z',
    updatedAt: '2026-01-28T07:25:00.000Z',
    source: SCORING_SOURCE,
    scoringId: 'score-0003',
    scoredEntityType: 'exposure',
    scoredEntityRef: 'exposure-sg-app-0-0-0-0-04',
    riskScore: 59,
    factors: [
      { factorId: 'f-reach', name: 'Reachability', weight: 0.6, contribution: 36, rationale: 'Open ingress from 0.0.0.0/0 on application port.' },
      { factorId: 'f-asset', name: 'Asset Criticality', weight: 0.4, contribution: 23, rationale: 'Attached to a tier-2 application workload.' },
    ],
    computedAt: '2026-01-28T07:25:00.000Z',
    model: 'exposure-risk',
    version: '1.0.0',
  },
  {
    id: seedId('risk-score', 4),
    entityType: 'risk-score',
    tenant: SEED_TENANT,
    createdAt: '2026-02-03T14:10:00.000Z',
    updatedAt: '2026-02-03T14:10:00.000Z',
    source: SCORING_SOURCE,
    scoringId: 'score-0004',
    scoredEntityType: 'finding',
    scoredEntityRef: 'find-0003',
    riskScore: 24,
    factors: [
      { factorId: 'f-sev', name: 'Severity', weight: 0.5, contribution: 12, rationale: 'Low recorded severity (2/5).' },
      { factorId: 'f-conf', name: 'Confidence', weight: 0.3, contribution: 8, rationale: 'Moderate confidence (64).' },
      { factorId: 'f-supp', name: 'Suppression Context', weight: 0.2, contribution: 4, rationale: 'Suppressed under a sanctioned maintenance window.' },
    ],
    computedAt: '2026-02-03T14:10:00.000Z',
    model: 'finding-risk',
    version: '1.0.0',
  },
];
