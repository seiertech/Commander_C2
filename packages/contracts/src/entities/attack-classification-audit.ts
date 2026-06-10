/**
 * Attack Classification Audit Entity — Commander C2 Canonical Model
 *
 * Source: Spec #39 Pre-Warned/Protected/Novel Classification
 *         DEC-spec39-dual-model (posture-accountability.ts already exists)
 *
 * An AttackClassificationAudit is the immutable record of classifying an entity
 * as PRE_WARNED, PROTECTED, or NOVEL at a point in time, including the posture
 * snapshot used and the priority impact calculated.
 *
 * Domain: D-13 (Pre-Warned Classification)
 * Use Cases: UC-186 (classify), UC-187 (historical lookup), UC-188 (audit),
 *            UC-189 (priority feed), UC-190 (inverse pause)
 * Route: /platform/audit
 */

import type { CommonFields } from './common';

// ─── Classification ──────────────────────────────────────────────────────────

export const ATTACK_CLASSIFICATIONS = ['PRE_WARNED', 'PROTECTED', 'NOVEL'] as const;
export type AttackClassification = typeof ATTACK_CLASSIFICATIONS[number];

// ─── Posture Snapshot ────────────────────────────────────────────────────────

export interface PostureSnapshot {
  /** Drift state at snapshot time */
  drift_state: 'drifted' | 'compliant' | 'unknown';
  /** Coverage percentage (0–100) */
  coverage_percent: number;
  /** Last time this entity was scanned/verified */
  lastScannedAt: string;
  /** Count of open risk objects for this entity */
  openRiskObjects: number;
  /** Control adherence percentage (0–100) */
  control_adherence: number;
}

// ─── Attack Classification Audit Entity ──────────────────────────────────────

export interface AttackClassificationAudit extends CommonFields {
  entity_type: 'attack-classification-audit';
  /** Unique audit record identifier */
  auditId: string;
  /** Entity being classified */
  entity_ref: string;
  /** Kind of entity */
  entityType_target: string;
  /** Classification result */
  classification: AttackClassification;
  /** When the classification was computed */
  classified_at: string;
  /** When the posture snapshot was captured */
  postureSnapshotAt: string;
  /** Full posture snapshot used for classification */
  posture_snapshot: PostureSnapshot;
  /** Priority adjustment resulting from this classification (-100 to +100) */
  priority_impact: number;
  /** Case associated with this classification (optional) */
  case_ref?: string;
  /** Whether classification is paused due to inverse discovery failure */
  inversePaused: boolean;
  /** Reason for inverse pause (optional) */
  inversePauseReason?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface AttackClassificationAuditValidation {
  valid: boolean;
  errors: string[];
}

export function validateAttackClassificationAudit(audit: AttackClassificationAudit): AttackClassificationAuditValidation {
  const errors: string[] = [];

  if (!audit.id || audit.id.trim() === '') errors.push('id: required');
  if (!audit.tenant || !audit.tenant.tenant_id) errors.push('tenant.tenant_id: required');
  if (!audit.auditId || audit.auditId.trim() === '') errors.push('auditId: required');
  if (!audit.entity_ref || audit.entity_ref.trim() === '') errors.push('entity_ref: required');
  if (!ATTACK_CLASSIFICATIONS.includes(audit.classification)) {
    errors.push(`classification: must be one of: ${ATTACK_CLASSIFICATIONS.join(', ')}`);
  }
  if (!audit.classified_at || audit.classified_at.trim() === '') errors.push('classified_at: required');
  if (!audit.postureSnapshotAt || audit.postureSnapshotAt.trim() === '') errors.push('postureSnapshotAt: required');
  if (!audit.posture_snapshot) {
    errors.push('posture_snapshot: required');
  } else {
    if (typeof audit.posture_snapshot.coverage_percent !== 'number' || audit.posture_snapshot.coverage_percent < 0 || audit.posture_snapshot.coverage_percent > 100) {
      errors.push('postureSnapshot.coverage_percent: must be 0–100');
    }
    if (typeof audit.posture_snapshot.control_adherence !== 'number' || audit.posture_snapshot.control_adherence < 0 || audit.posture_snapshot.control_adherence > 100) {
      errors.push('postureSnapshot.control_adherence: must be 0–100');
    }
  }
  if (typeof audit.priority_impact !== 'number' || audit.priority_impact < -100 || audit.priority_impact > 100) {
    errors.push('priority_impact: must be -100 to +100');
  }
  if (audit.inversePaused && (!audit.inversePauseReason || audit.inversePauseReason.trim() === '')) {
    errors.push('inversePauseReason: required when inversePaused');
  }

  return { valid: errors.length === 0, errors };
}
