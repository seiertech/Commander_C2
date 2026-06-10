/**
 * Seed Attack Classification Audits — Commander C2 Test Fixtures
 *
 * 4 records: PRE_WARNED with drift, PROTECTED clean, NOVEL shadow IT,
 * PRE_WARNED with inverse pause.
 * Source: Spec #39 Pre-Warned/Protected/Novel Classification
 */

import type { AttackClassificationAudit } from '../entities/attack-classification-audit';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const AUDIT_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-classification-engine' };

export const seedAttackClassificationAudits: AttackClassificationAudit[] = [
  {
    id: seedId('attack-classification-audit', 1),
    entityType: 'attack-classification-audit',
    tenant: SEED_TENANT,
    createdAt: '2026-02-01T08:10:00.000Z',
    updatedAt: '2026-02-01T08:10:00.000Z',
    source: AUDIT_SOURCE,
    auditId: 'aca-0001',
    entityRef: 'identity-svc-prod-01',
    entityType_target: 'identity',
    classification: 'PRE_WARNED',
    classifiedAt: '2026-02-01T08:10:00.000Z',
    postureSnapshotAt: '2026-02-01T08:05:00.000Z',
    postureSnapshot: {
      driftState: 'drifted',
      coveragePercent: 72,
      lastScannedAt: '2026-02-01T07:00:00.000Z',
      openRiskObjects: 3,
      controlAdherence: 55,
    },
    priorityImpact: 25,
    caseRef: 'case-0001',
    inversePaused: false,
  },
  {
    id: seedId('attack-classification-audit', 2),
    entityType: 'attack-classification-audit',
    tenant: SEED_TENANT,
    createdAt: '2026-02-02T09:00:00.000Z',
    updatedAt: '2026-02-02T09:00:00.000Z',
    source: AUDIT_SOURCE,
    auditId: 'aca-0002',
    entityRef: 'asset-payments-api-07',
    entityType_target: 'asset',
    classification: 'PROTECTED',
    classifiedAt: '2026-02-02T09:00:00.000Z',
    postureSnapshotAt: '2026-02-02T08:55:00.000Z',
    postureSnapshot: {
      driftState: 'compliant',
      coveragePercent: 98,
      lastScannedAt: '2026-02-02T06:00:00.000Z',
      openRiskObjects: 0,
      controlAdherence: 96,
    },
    priorityImpact: -10,
    inversePaused: false,
  },
  {
    id: seedId('attack-classification-audit', 3),
    entityType: 'attack-classification-audit',
    tenant: SEED_TENANT,
    createdAt: '2026-02-07T09:20:00.000Z',
    updatedAt: '2026-02-07T09:20:00.000Z',
    source: AUDIT_SOURCE,
    auditId: 'aca-0003',
    entityRef: 'dev-box-jake-personal.local',
    entityType_target: 'asset',
    classification: 'NOVEL',
    classifiedAt: '2026-02-07T09:20:00.000Z',
    postureSnapshotAt: '2026-02-07T09:15:00.000Z',
    postureSnapshot: {
      driftState: 'unknown',
      coveragePercent: 0,
      lastScannedAt: '1970-01-01T00:00:00.000Z',
      openRiskObjects: 0,
      controlAdherence: 0,
    },
    priorityImpact: 40,
    caseRef: 'case-blindspot-0001',
    inversePaused: false,
  },
  {
    id: seedId('attack-classification-audit', 4),
    entityType: 'attack-classification-audit',
    tenant: SEED_TENANT,
    createdAt: '2026-02-07T10:35:00.000Z',
    updatedAt: '2026-02-07T10:35:00.000Z',
    source: AUDIT_SOURCE,
    auditId: 'aca-0004',
    entityRef: 'j.smith@oldcorp.com',
    entityType_target: 'identity',
    classification: 'PRE_WARNED',
    classifiedAt: '2026-02-07T10:35:00.000Z',
    postureSnapshotAt: '2026-02-07T10:30:00.000Z',
    postureSnapshot: {
      driftState: 'unknown',
      coveragePercent: 15,
      lastScannedAt: '2025-11-01T00:00:00.000Z',
      openRiskObjects: 1,
      controlAdherence: 20,
    },
    priorityImpact: 30,
    inversePaused: true,
    inversePauseReason: 'Inverse discovery event inv-0003: identity lookup failed (naming mismatch). Classification paused until entity resolution completes.',
  },
];
