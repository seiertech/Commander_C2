/**
 * Remediation Event Entity — Commander C2
 *
 * Governed by: OCSF 1.3.0 Remediation Activity (class_uid: 2002)
 * Purpose: Track remediation actions taken in response to findings.
 * Links back to FindingEvent; records what was done, by whom, when.
 *
 * Standards adherence:
 *   - OCSF field names EXACT per 1.3.0
 *   - type_uid = class_uid * 100 + activity_id
 *   - commander_ prefix on ALL extension fields
 */

import type { CommonFields } from './common';
import type {
  OcsfBaseEvent,
  OcsfSeverityId,
  CommanderEventExtensions,
} from './ocsf-types';
import { computeTypeUid } from './ocsf-types';

// ─── Remediation Status ──────────────────────────────────────────────────────

export type RemediationStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'rolled_back'
  | 'deferred';

// ─── Remediation Method ──────────────────────────────────────────────────────

export type RemediationMethod =
  | 'automated'
  | 'manual'
  | 'semi_automated'
  | 'ai_recommended';

// ─── Remediation Event Entity ────────────────────────────────────────────────

export interface RemediationEvent extends CommonFields, OcsfBaseEvent, CommanderEventExtensions {
  entityType: 'remediation-event';

  /** Unique remediation identifier */
  remediationId: string;

  // ─── OCSF class identification (Remediation Activity = 2002) ───────
  /** Fixed: 2002 (Remediation Activity) */
  class_uid: 2002;
  /** OCSF category: Findings = 2 */
  category_uid: 2;

  // ─── Remediation details ───────────────────────────────────────────
  /** Title of the remediation action */
  title: string;
  /** Detailed description of what was done */
  description: string;
  /** Current remediation status */
  remediation_status: RemediationStatus;
  /** How the remediation was executed */
  method: RemediationMethod;

  // ─── Source finding ────────────────────────────────────────────────
  /** Finding event ID that triggered this remediation */
  finding_id: string;
  /** Finding title (denormalised for audit) */
  finding_title: string;

  // ─── Execution context ─────────────────────────────────────────────
  /** Who/what executed the remediation */
  executed_by: string;
  /** When execution started */
  execution_start: string;
  /** When execution completed (null if still running) */
  execution_end: string | null;
  /** Duration in milliseconds (null if still running) */
  execution_duration_ms: number | null;

  // ─── Affected resources ────────────────────────────────────────────
  /** Resources affected by remediation */
  affected_resources: string[];
  /** Topology nodes affected */
  commander_affected_node_ids: string[];

  // ─── Verification ──────────────────────────────────────────────────
  /** Whether remediation was verified effective */
  verified: boolean;
  /** Verification timestamp */
  verified_at: string | null;
  /** Post-remediation notes */
  notes: string | null;

  // ─── Approval chain (OODA tempo) ──────────────────────────────────
  /** Whether approval was required */
  commander_approval_required: boolean;
  /** Approval record ID (null if no approval needed) */
  commander_approval_id: string | null;
  /** Time from finding to remediation start (ms) — OODA Observe-to-Act */
  commander_ooda_response_ms: number | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface RemediationEventValidation {
  valid: boolean;
  errors: string[];
}

const REMEDIATION_STATUSES: RemediationStatus[] = [
  'pending', 'in_progress', 'completed', 'failed', 'rolled_back', 'deferred',
];
const REMEDIATION_METHODS: RemediationMethod[] = ['automated', 'manual', 'semi_automated', 'ai_recommended'];

export function validateRemediationEvent(r: RemediationEvent): RemediationEventValidation {
  const errors: string[] = [];

  // Common
  if (!r.id || r.id.trim() === '') errors.push('id: required');
  if (!r.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!r.remediationId || r.remediationId.trim() === '') errors.push('remediationId: required');

  // OCSF required
  if (typeof r.activity_id !== 'number') errors.push('activity_id: required (number)');
  if (r.category_uid !== 2) errors.push('category_uid: must be 2 (Findings)');
  if (r.class_uid !== 2002) errors.push('class_uid: must be 2002 (Remediation Activity)');
  if (![0, 1, 2, 3, 4, 5, 6].includes(r.severity_id)) errors.push('severity_id: must be 0-6');
  if (!r.time || r.time.trim() === '') errors.push('time: required');
  if (!r.metadata) errors.push('metadata: required');

  // type_uid
  const expectedTypeUid = computeTypeUid(r.class_uid, r.activity_id);
  if (r.type_uid !== expectedTypeUid) {
    errors.push(`type_uid: must equal class_uid * 100 + activity_id (expected ${expectedTypeUid}, got ${r.type_uid})`);
  }

  // Remediation-specific
  if (!r.title || r.title.trim() === '') errors.push('title: required');
  if (!r.description || r.description.trim() === '') errors.push('description: required');
  if (!REMEDIATION_STATUSES.includes(r.remediation_status)) {
    errors.push('remediation_status: must be pending | in_progress | completed | failed | rolled_back | deferred');
  }
  if (!REMEDIATION_METHODS.includes(r.method)) {
    errors.push('method: must be automated | manual | semi_automated | ai_recommended');
  }
  if (!r.finding_id || r.finding_id.trim() === '') errors.push('finding_id: required');
  if (!r.finding_title || r.finding_title.trim() === '') errors.push('finding_title: required');
  if (!r.executed_by || r.executed_by.trim() === '') errors.push('executed_by: required');
  if (!r.execution_start || r.execution_start.trim() === '') errors.push('execution_start: required');
  if (!Array.isArray(r.affected_resources)) errors.push('affected_resources: must be array');
  if (!Array.isArray(r.commander_affected_node_ids)) errors.push('commander_affected_node_ids: must be array');
  if (typeof r.verified !== 'boolean') errors.push('verified: must be boolean');
  if (typeof r.commander_approval_required !== 'boolean') errors.push('commander_approval_required: must be boolean');

  // Commander extensions
  if (!r.commander_tenant_id || r.commander_tenant_id.trim() === '') {
    errors.push('commander_tenant_id: required');
  }

  return { valid: errors.length === 0, errors };
}
