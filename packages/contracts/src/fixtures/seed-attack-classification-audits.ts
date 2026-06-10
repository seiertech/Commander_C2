/**
 * Seed Attack Classification Audits — Commander C2 Test Fixtures
 *
 * 4 records: PRE_WARNED with drift, PROTECTED clean, NOVEL shadow IT,
 * PRE_WARNED with inverse pause.
 * Source: Spec #39 Pre-Warned/Protected/Novel Classification
 */

import type { AttackClassificationAudit } from '../entities/attack-classification-audit';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const AUDIT_SOURCE = { ...SEED_SOURCE, source_system: 'commander-classification-engine' };

export const seedAttackClassificationAudits: AttackClassificationAudit[] = [
  {
    id: seedId('attack-classification-audit', 1),
    entity_type: 'attack-classification-audit',
    tenant: SEED_TENANT,
    created_at: '2026-02-01T08:10:00.000Z',
    updated_at: '2026-02-01T08:10:00.000Z',
    source: AUDIT_SOURCE,
    auditId: 'aca-0001',
    entity_ref: 'identity-svc-prod-01',
    entityType_target: 'identity',
    classification: 'PRE_WARNED',
    classified_at: '2026-02-01T08:10:00.000Z',
    postureSnapshotAt: '2026-02-01T08:05:00.000Z',
    posture_snapshot: {
      drift_state: 'drifted',
      coverage_percent: 72,
      lastScannedAt: '2026-02-01T07:00:00.000Z',
      openRiskObjects: 3,
      control_adherence: 55,
    },
    priority_impact: 25,
    case_ref: 'case-0001',
    inversePaused: false,
  },
  {
    id: seedId('attack-classification-audit', 2),
    entity_type: 'attack-classification-audit',
    tenant: SEED_TENANT,
    created_at: '2026-02-02T09:00:00.000Z',
    updated_at: '2026-02-02T09:00:00.000Z',
    source: AUDIT_SOURCE,
    auditId: 'aca-0002',
    entity_ref: 'asset-payments-api-07',
    entityType_target: 'asset',
    classification: 'PROTECTED',
    classified_at: '2026-02-02T09:00:00.000Z',
    postureSnapshotAt: '2026-02-02T08:55:00.000Z',
    posture_snapshot: {
      drift_state: 'compliant',
      coverage_percent: 98,
      lastScannedAt: '2026-02-02T06:00:00.000Z',
      openRiskObjects: 0,
      control_adherence: 96,
    },
    priority_impact: -10,
    inversePaused: false,
  },
  {
    id: seedId('attack-classification-audit', 3),
    entity_type: 'attack-classification-audit',
    tenant: SEED_TENANT,
    created_at: '2026-02-07T09:20:00.000Z',
    updated_at: '2026-02-07T09:20:00.000Z',
    source: AUDIT_SOURCE,
    auditId: 'aca-0003',
    entity_ref: 'dev-box-jake-personal.local',
    entityType_target: 'asset',
    classification: 'NOVEL',
    classified_at: '2026-02-07T09:20:00.000Z',
    postureSnapshotAt: '2026-02-07T09:15:00.000Z',
    posture_snapshot: {
      drift_state: 'unknown',
      coverage_percent: 0,
      lastScannedAt: '1970-01-01T00:00:00.000Z',
      openRiskObjects: 0,
      control_adherence: 0,
    },
    priority_impact: 40,
    case_ref: 'case-blindspot-0001',
    inversePaused: false,
  },
  {
    id: seedId('attack-classification-audit', 4),
    entity_type: 'attack-classification-audit',
    tenant: SEED_TENANT,
    created_at: '2026-02-07T10:35:00.000Z',
    updated_at: '2026-02-07T10:35:00.000Z',
    source: AUDIT_SOURCE,
    auditId: 'aca-0004',
    entity_ref: 'j.smith@oldcorp.com',
    entityType_target: 'identity',
    classification: 'PRE_WARNED',
    classified_at: '2026-02-07T10:35:00.000Z',
    postureSnapshotAt: '2026-02-07T10:30:00.000Z',
    posture_snapshot: {
      drift_state: 'unknown',
      coverage_percent: 15,
      lastScannedAt: '2025-11-01T00:00:00.000Z',
      openRiskObjects: 1,
      control_adherence: 20,
    },
    priority_impact: 30,
    inversePaused: true,
    inversePauseReason: 'Inverse discovery event inv-0003: identity lookup failed (naming mismatch). Classification paused until entity resolution completes.',
  },
];
