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
  driftState: 'drifted' | 'compliant' | 'unknown';
  /** Coverage percentage (0–100) */
  coveragePercent: number;
  /** Last time this entity was scanned/verified */
  lastScannedAt: string;
  /** Count of open risk objects for this entity */
  openRiskObjects: number;
  /** Control adherence percentage (0–100) */
  controlAdherence: number;
}

// ─── Attack Classification Audit Entity ──────────────────────────────────────

export interface AttackClassificationAudit extends CommonFields {
  entityType: 'attack-classification-audit';
  /** Unique audit record identifier */
  auditId: string;
  /** Entity being classified */
  entityRef: string;
  /** Kind of entity */
  entityType_target: string;
  /** Classification result */
  classification: AttackClassification;
  /** When the classification was computed */
  classifiedAt: string;
  /** When the posture snapshot was captured */
  postureSnapshotAt: string;
  /** Full posture snapshot used for classification */
  postureSnapshot: PostureSnapshot;
  /** Priority adjustment resulting from this classification (-100 to +100) */
  priorityImpact: number;
  /** Case associated with this classification (optional) */
  caseRef?: string;
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
  if (!audit.tenant || !audit.tenant.tenantId) errors.push('tenant.tenantId: required');
  if (!audit.auditId || audit.auditId.trim() === '') errors.push('auditId: required');
  if (!audit.entityRef || audit.entityRef.trim() === '') errors.push('entityRef: required');
  if (!ATTACK_CLASSIFICATIONS.includes(audit.classification)) {
    errors.push(`classification: must be one of: ${ATTACK_CLASSIFICATIONS.join(', ')}`);
  }
  if (!audit.classifiedAt || audit.classifiedAt.trim() === '') errors.push('classifiedAt: required');
  if (!audit.postureSnapshotAt || audit.postureSnapshotAt.trim() === '') errors.push('postureSnapshotAt: required');
  if (!audit.postureSnapshot) {
    errors.push('postureSnapshot: required');
  } else {
    if (typeof audit.postureSnapshot.coveragePercent !== 'number' || audit.postureSnapshot.coveragePercent < 0 || audit.postureSnapshot.coveragePercent > 100) {
      errors.push('postureSnapshot.coveragePercent: must be 0–100');
    }
    if (typeof audit.postureSnapshot.controlAdherence !== 'number' || audit.postureSnapshot.controlAdherence < 0 || audit.postureSnapshot.controlAdherence > 100) {
      errors.push('postureSnapshot.controlAdherence: must be 0–100');
    }
  }
  if (typeof audit.priorityImpact !== 'number' || audit.priorityImpact < -100 || audit.priorityImpact > 100) {
    errors.push('priorityImpact: must be -100 to +100');
  }
  if (audit.inversePaused && (!audit.inversePauseReason || audit.inversePauseReason.trim() === '')) {
    errors.push('inversePauseReason: required when inversePaused');
  }

  return { valid: errors.length === 0, errors };
}
