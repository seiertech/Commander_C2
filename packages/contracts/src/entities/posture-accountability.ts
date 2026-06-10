/**
 * Posture Accountability Entity — Commander SDR Canonical Model
 *
 * Source: Spec #71 Pre-Warned/Protected/Novel Classification (Spec 39)
 * Decision: DEC-spec39-dual-model — this entity implements the temporal posture
 * accountability model, SEPARATE from the severity escalation model in
 * pre-warned-classification.ts. Both can reference the same entity simultaneously.
 *
 * Purpose: Classify an entity's security posture state over time — tracks whether
 * an entity is PRE_WARNED (threat known but not yet acted on), PROTECTED (controls
 * applied, posture defended), or NOVEL (new/unknown entity with no baseline).
 *
 * The distinction:
 * - pre-warned-classification.ts = How urgent is the threat? (severity escalation)
 * - posture-accountability.ts = How long has the entity been in a known-unprotected
 *   state? (accountability for inaction)
 *
 * Ownership: System (compute from posture signals)
 * Dependencies: Spec 40 (Inverse Discovery — entity resolution failure → NOVEL)
 */

import type { CommonFields } from './common';

// ─── Posture Accountability Classification ───────────────────────────────────

/**
 * PRE_WARNED — Threat known, entity not yet protected (drift/gap/exposure exists)
 * PROTECTED — Controls applied, posture defended, no known unaddressed weakness
 * NOVEL — New/unknown entity with no established baseline (shadow IT, unresolved)
 */
export const POSTURE_ACCOUNTABILITY_CLASSIFICATIONS = ['PRE_WARNED', 'PROTECTED', 'NOVEL'] as const;
export type PostureAccountabilityClassification = typeof POSTURE_ACCOUNTABILITY_CLASSIFICATIONS[number];

// ─── Accountable Entity Type ─────────────────────────────────────────────────

export const ACCOUNTABLE_ENTITY_TYPES = ['asset', 'identity', 'connector', 'component'] as const;
export type AccountableEntityType = typeof ACCOUNTABLE_ENTITY_TYPES[number];

// ─── Record Status ───────────────────────────────────────────────────────────

export const ACCOUNTABILITY_STATUSES = ['active', 'overridden', 'expired'] as const;
export type AccountabilityStatus = typeof ACCOUNTABILITY_STATUSES[number];

// ─── Classifier Source ───────────────────────────────────────────────────────

export const CLASSIFIER_SOURCES = ['system', 'analyst'] as const;
export type ClassifierSource = typeof CLASSIFIER_SOURCES[number];

// ─── Posture Accountability Record ───────────────────────────────────────────

export interface PostureAccountability extends CommonFields {
  entityType: 'posture-accountability';
  /** Unique accountability record identifier */
  accountabilityId: string;
  /** Type of entity being classified */
  accountableEntityType: AccountableEntityType;
  /** Reference to the canonical entity (asset ID, identity ID, etc.) */
  entityRef: string;
  /** Current temporal posture classification */
  classification: PostureAccountabilityClassification;
  /** Previous classification (null if first classification) */
  previousClassification: PostureAccountabilityClassification | null;
  /** When this classification was determined */
  classifiedAt: string;
  /** Who/what determined the classification */
  classifiedBy: ClassifierSource;
  /** Human-readable reason for this classification */
  reason: string;
  /** References to evidence supporting the classification (drift IDs, coverage gap IDs, etc.) */
  evidenceRefs: string[];
  /** Number of days in the current classification state */
  durationInState: number;
  /** Days threshold before escalation triggers (strategy-sourced) */
  escalationThreshold: number;
  /** Current record status */
  status: AccountabilityStatus;
  /** Linked risk object reference (if classification generated from a risk object) */
  linkedRiskObjectRef: string | null;
  /** Linked case reference (if classification triggered case creation) */
  linkedCaseRef: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PostureAccountabilityValidation {
  valid: boolean;
  errors: string[];
}

export function validatePostureAccountability(r: PostureAccountability): PostureAccountabilityValidation {
  const errors: string[] = [];
  if (!r.id || r.id.trim() === '') errors.push('id: required');
  if (!r.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!r.accountabilityId || r.accountabilityId.trim() === '') errors.push('accountabilityId: required');
  if (!ACCOUNTABLE_ENTITY_TYPES.includes(r.accountableEntityType)) errors.push(`accountableEntityType: must be one of: ${ACCOUNTABLE_ENTITY_TYPES.join(', ')}`);
  if (!r.entityRef || r.entityRef.trim() === '') errors.push('entityRef: required');
  if (!POSTURE_ACCOUNTABILITY_CLASSIFICATIONS.includes(r.classification)) errors.push(`classification: must be one of: ${POSTURE_ACCOUNTABILITY_CLASSIFICATIONS.join(', ')}`);
  if (r.previousClassification !== null && !POSTURE_ACCOUNTABILITY_CLASSIFICATIONS.includes(r.previousClassification)) errors.push(`previousClassification: must be null or one of: ${POSTURE_ACCOUNTABILITY_CLASSIFICATIONS.join(', ')}`);
  if (!r.classifiedAt || r.classifiedAt.trim() === '') errors.push('classifiedAt: required');
  if (!CLASSIFIER_SOURCES.includes(r.classifiedBy)) errors.push(`classifiedBy: must be one of: ${CLASSIFIER_SOURCES.join(', ')}`);
  if (!r.reason || r.reason.trim() === '') errors.push('reason: required');
  if (!Array.isArray(r.evidenceRefs)) errors.push('evidenceRefs: must be an array');
  if (typeof r.durationInState !== 'number' || r.durationInState < 0) errors.push('durationInState: must be >= 0');
  if (typeof r.escalationThreshold !== 'number' || r.escalationThreshold < 0) errors.push('escalationThreshold: must be >= 0');
  if (!ACCOUNTABILITY_STATUSES.includes(r.status)) errors.push(`status: must be one of: ${ACCOUNTABILITY_STATUSES.join(', ')}`);
  return { valid: errors.length === 0, errors };
}
