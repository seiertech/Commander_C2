/**
 * Seed Findings — Commander SDR Test Fixtures
 *
 * Synthetic drift/detection findings for rule-engine testing.
 * Source: Spec #34 Drift and Rule Engine
 *
 * 5 records spanning the finding lifecycle (new → acknowledged → suppressed →
 * resolved → false_positive) with varied severity, confidence and affected
 * entity types. Synthetic values only — no real estate data.
 */

import type { Finding } from '../entities/finding';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const FINDING_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-rule-engine' };

export const seedFindings: Finding[] = [
  {
    id: seedId('finding', 1),
    entityType: 'finding',
    tenant: SEED_TENANT,
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-02-01T08:00:00.000Z',
    source: FINDING_SOURCE,
    findingId: 'find-0001',
    ruleRef: 'rule-drift-mfa-001',
    tenantId: SEED_TENANT.tenantId,
    severity: 5,
    confidence: 92,
    dedupeKey: 'drift:mfa-disabled:identity-svc-prod-01',
    affectedEntityType: 'identity',
    affectedEntityRef: 'identity-svc-prod-01',
    proposedActions: [
      { actionId: 'pa-0001-a', actionType: 'create-case', description: 'Open a drift case for MFA regression on a privileged service identity.', automated: false },
      { actionId: 'pa-0001-b', actionType: 'raise-priority', description: 'Flag as P1 — privileged identity with weakened control.', automated: false },
    ],
    status: 'new',
    detectedAt: '2026-02-01T08:00:00.000Z',
  },
  {
    id: seedId('finding', 2),
    entityType: 'finding',
    tenant: SEED_TENANT,
    createdAt: '2026-02-02T09:30:00.000Z',
    updatedAt: '2026-02-02T11:15:00.000Z',
    source: FINDING_SOURCE,
    findingId: 'find-0002',
    ruleRef: 'rule-drift-public-bucket-002',
    tenantId: SEED_TENANT.tenantId,
    severity: 4,
    confidence: 78,
    dedupeKey: 'drift:public-storage:asset-s3-logs-02',
    affectedEntityType: 'asset',
    affectedEntityRef: 'asset-s3-logs-02',
    proposedActions: [
      { actionId: 'pa-0002-a', actionType: 'open-investigation', description: 'Investigate newly public storage bucket exposure.', automated: false },
      { actionId: 'pa-0002-b', actionType: 'recommend-remediation', description: 'Recommend re-applying block-public-access baseline.', automated: true, targetRef: 'control-block-public-access' },
    ],
    status: 'acknowledged',
    detectedAt: '2026-02-02T09:30:00.000Z',
  },
  {
    id: seedId('finding', 3),
    entityType: 'finding',
    tenant: SEED_TENANT,
    createdAt: '2026-02-03T14:05:00.000Z',
    updatedAt: '2026-02-03T15:40:00.000Z',
    source: FINDING_SOURCE,
    findingId: 'find-0003',
    ruleRef: 'rule-drift-stale-cert-003',
    tenantId: SEED_TENANT.tenantId,
    severity: 2,
    confidence: 64,
    dedupeKey: 'drift:cert-expiry:asset-edge-lb-03',
    affectedEntityType: 'control',
    affectedEntityRef: 'control-tls-edge-lb-03',
    proposedActions: [
      { actionId: 'pa-0003-a', actionType: 'notify', description: 'Notify platform team of certificate nearing expiry.', automated: true },
    ],
    status: 'suppressed',
    detectedAt: '2026-02-03T14:05:00.000Z',
    suppressionReason: 'Known maintenance window — certificate rotation scheduled, suppressed until 2026-02-10.',
  },
  {
    id: seedId('finding', 4),
    entityType: 'finding',
    tenant: SEED_TENANT,
    createdAt: '2026-01-28T07:20:00.000Z',
    updatedAt: '2026-02-04T10:00:00.000Z',
    source: FINDING_SOURCE,
    findingId: 'find-0004',
    ruleRef: 'rule-drift-open-sg-004',
    tenantId: SEED_TENANT.tenantId,
    severity: 3,
    confidence: 85,
    dedupeKey: 'drift:open-ingress:asset-sg-app-04',
    affectedEntityType: 'exposure',
    affectedEntityRef: 'exposure-sg-app-0-0-0-0-04',
    proposedActions: [
      { actionId: 'pa-0004-a', actionType: 'create-case', description: 'Open exposure case for 0.0.0.0/0 ingress on application security group.', automated: false },
    ],
    status: 'resolved',
    detectedAt: '2026-01-28T07:20:00.000Z',
    resolvedAt: '2026-02-04T10:00:00.000Z',
  },
  {
    id: seedId('finding', 5),
    entityType: 'finding',
    tenant: SEED_TENANT,
    createdAt: '2026-02-05T16:45:00.000Z',
    updatedAt: '2026-02-05T18:10:00.000Z',
    source: FINDING_SOURCE,
    findingId: 'find-0005',
    ruleRef: 'rule-drift-mfa-001',
    tenantId: SEED_TENANT.tenantId,
    severity: 1,
    confidence: 33,
    dedupeKey: 'drift:mfa-disabled:identity-break-glass-05',
    affectedEntityType: 'identity',
    affectedEntityRef: 'identity-break-glass-05',
    proposedActions: [
      { actionId: 'pa-0005-a', actionType: 'request-verdict', description: 'Request operational verdict before action — may be sanctioned break-glass identity.', automated: false },
    ],
    status: 'false_positive',
    detectedAt: '2026-02-05T16:45:00.000Z',
    resolvedAt: '2026-02-05T18:10:00.000Z',
  },
];
