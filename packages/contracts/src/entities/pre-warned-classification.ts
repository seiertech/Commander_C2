/**
 * Pre-Warned Classification Entity — Commander SDR Canonical Model
 *
 * Source: Spec #17 Closed-Loop Control Architecture,
 *         Master Technical Specification §Pre-Warned State Classification
 *
 * Classifies pre-warned state from combined signals produced by Units 24-28:
 * drift detection, identity intelligence, architecture intelligence,
 * vulnerability correlation, and exposure computation.
 *
 * Ownership: System (compute), SOM/CISO (consume)
 * Build Unit: Unit 29 (Pre-Warned Classification)
 * Dependencies: Units 24, 25, 26, 27, 28 (all DONE)
 */

import type { CommonFields } from './common';

// ─── Classification Level ────────────────────────────────────────────────────

export const CLASSIFICATION_LEVELS = ['pre_warned', 'elevated', 'critical', 'imminent'] as const;
export type ClassificationLevel = typeof CLASSIFICATION_LEVELS[number];

// ─── Classification Status ───────────────────────────────────────────────────

export const CLASSIFICATION_STATUSES = ['active', 'acknowledged', 'resolved', 'expired'] as const;
export type ClassificationStatus = typeof CLASSIFICATION_STATUSES[number];

// ─── Pre-Warned Classification Entity ────────────────────────────────────────

export interface PreWarnedClassification extends CommonFields {
  entityType: 'pre-warned-classification';
  /** Unique classification identifier */
  classificationId: string;
  /** References to engine outputs that triggered this classification (drift, identity, arch, vuln, exposure) */
  triggerSources: string[];
  /** Computed classification level */
  classificationLevel: ClassificationLevel;
  /** Confidence in the classification (0-100) */
  confidence: number;
  /** Entity references affected by this classification */
  affectedEntityRefs: string[];
  /** When this classification was computed */
  computedAt: string;
  /** When this classification was acknowledged by an operator */
  acknowledgedAt: string | null;
  /** Recommended actions based on classification */
  recommendedActions: string[];
  /** Current status */
  status: ClassificationStatus;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PreWarnedClassificationValidation {
  valid: boolean;
  errors: string[];
}

export function validatePreWarnedClassification(c: PreWarnedClassification): PreWarnedClassificationValidation {
  const errors: string[] = [];
  if (!c.id || c.id.trim() === '') errors.push('id: required');
  if (!c.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!c.classificationId || c.classificationId.trim() === '') errors.push('classificationId: required');
  if (!Array.isArray(c.triggerSources) || c.triggerSources.length === 0) errors.push('triggerSources: must contain at least one source');
  if (!CLASSIFICATION_LEVELS.includes(c.classificationLevel)) errors.push(`classificationLevel: must be one of: ${CLASSIFICATION_LEVELS.join(', ')}`);
  if (typeof c.confidence !== 'number' || c.confidence < 0 || c.confidence > 100) errors.push('confidence: must be 0-100');
  if (!Array.isArray(c.affectedEntityRefs) || c.affectedEntityRefs.length === 0) errors.push('affectedEntityRefs: must contain at least one ref');
  if (!c.computedAt || c.computedAt.trim() === '') errors.push('computedAt: required');
  if (!Array.isArray(c.recommendedActions)) errors.push('recommendedActions: must be an array');
  if (!CLASSIFICATION_STATUSES.includes(c.status)) errors.push(`status: must be one of: ${CLASSIFICATION_STATUSES.join(', ')}`);
  return { valid: errors.length === 0, errors };
}
