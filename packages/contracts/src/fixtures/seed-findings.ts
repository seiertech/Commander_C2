/**
 * Seed Findings — Commander C2 Test Fixtures
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

const FINDING_SOURCE = { ...SEED_SOURCE, source_system: 'commander-rule-engine' };

export const seedFindings: Finding[] = [
  {
    id: seedId('finding', 1),
    entity_type: 'finding',
    tenant: SEED_TENANT,
    created_at: '2026-02-01T08:00:00.000Z',
    updated_at: '2026-02-01T08:00:00.000Z',
    source: FINDING_SOURCE,
    finding_id: 'find-0001',
    rule_ref: 'rule-drift-mfa-001',
    tenant_id: SEED_TENANT.tenant_id,
    severity: 5,
    confidence: 92,
    dedupe_key: 'drift:mfa-disabled:identity-svc-prod-01',
    affected_entity_type: 'identity',
    affected_entity_ref: 'identity-svc-prod-01',
    proposedActions: [
      { action_id: 'pa-0001-a', action_type: 'create-case', description: 'Open a drift case for MFA regression on a privileged service identity.', automated: false },
      { action_id: 'pa-0001-b', action_type: 'raise-priority', description: 'Flag as P1 — privileged identity with weakened control.', automated: false },
    ],
    status: 'new',
    detected_at: '2026-02-01T08:00:00.000Z',
  },
  {
    id: seedId('finding', 2),
    entity_type: 'finding',
    tenant: SEED_TENANT,
    created_at: '2026-02-02T09:30:00.000Z',
    updated_at: '2026-02-02T11:15:00.000Z',
    source: FINDING_SOURCE,
    finding_id: 'find-0002',
    rule_ref: 'rule-drift-public-bucket-002',
    tenant_id: SEED_TENANT.tenant_id,
    severity: 4,
    confidence: 78,
    dedupe_key: 'drift:public-storage:asset-s3-logs-02',
    affected_entity_type: 'asset',
    affected_entity_ref: 'asset-s3-logs-02',
    proposedActions: [
      { action_id: 'pa-0002-a', action_type: 'open-investigation', description: 'Investigate newly public storage bucket exposure.', automated: false },
      { action_id: 'pa-0002-b', action_type: 'recommend-remediation', description: 'Recommend re-applying block-public-access baseline.', automated: true, targetRef: 'control-block-public-access' },
    ],
    status: 'acknowledged',
    detected_at: '2026-02-02T09:30:00.000Z',
  },
  {
    id: seedId('finding', 3),
    entity_type: 'finding',
    tenant: SEED_TENANT,
    created_at: '2026-02-03T14:05:00.000Z',
    updated_at: '2026-02-03T15:40:00.000Z',
    source: FINDING_SOURCE,
    finding_id: 'find-0003',
    rule_ref: 'rule-drift-stale-cert-003',
    tenant_id: SEED_TENANT.tenant_id,
    severity: 2,
    confidence: 64,
    dedupe_key: 'drift:cert-expiry:asset-edge-lb-03',
    affected_entity_type: 'control',
    affected_entity_ref: 'control-tls-edge-lb-03',
    proposedActions: [
      { action_id: 'pa-0003-a', action_type: 'notify', description: 'Notify platform team of certificate nearing expiry.', automated: true },
    ],
    status: 'suppressed',
    detected_at: '2026-02-03T14:05:00.000Z',
    suppressionReason: 'Known maintenance window — certificate rotation scheduled, suppressed until 2026-02-10.',
  },
  {
    id: seedId('finding', 4),
    entity_type: 'finding',
    tenant: SEED_TENANT,
    created_at: '2026-01-28T07:20:00.000Z',
    updated_at: '2026-02-04T10:00:00.000Z',
    source: FINDING_SOURCE,
    finding_id: 'find-0004',
    rule_ref: 'rule-drift-open-sg-004',
    tenant_id: SEED_TENANT.tenant_id,
    severity: 3,
    confidence: 85,
    dedupe_key: 'drift:open-ingress:asset-sg-app-04',
    affected_entity_type: 'exposure',
    affected_entity_ref: 'exposure-sg-app-0-0-0-0-04',
    proposedActions: [
      { action_id: 'pa-0004-a', action_type: 'create-case', description: 'Open exposure case for 0.0.0.0/0 ingress on application security group.', automated: false },
    ],
    status: 'resolved',
    detected_at: '2026-01-28T07:20:00.000Z',
    resolved_at: '2026-02-04T10:00:00.000Z',
  },
  {
    id: seedId('finding', 5),
    entity_type: 'finding',
    tenant: SEED_TENANT,
    created_at: '2026-02-05T16:45:00.000Z',
    updated_at: '2026-02-05T18:10:00.000Z',
    source: FINDING_SOURCE,
    finding_id: 'find-0005',
    rule_ref: 'rule-drift-mfa-001',
    tenant_id: SEED_TENANT.tenant_id,
    severity: 1,
    confidence: 33,
    dedupe_key: 'drift:mfa-disabled:identity-break-glass-05',
    affected_entity_type: 'identity',
    affected_entity_ref: 'identity-break-glass-05',
    proposedActions: [
      { action_id: 'pa-0005-a', action_type: 'request-verdict', description: 'Request operational verdict before action — may be sanctioned break-glass identity.', automated: false },
    ],
    status: 'false_positive',
    detected_at: '2026-02-05T16:45:00.000Z',
    resolved_at: '2026-02-05T18:10:00.000Z',
  },
];
