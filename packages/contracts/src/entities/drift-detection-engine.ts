/**
 * Drift Detection Engine Entity — Commander C2 Canonical Model
 *
 * Source: Spec #58 Security OODA Loop, Master Technical Specification §Drift Detection
 *
 * Drift detection records model configuration, version, policy, access and
 * coverage drift observed across the security estate. Each record tracks the
 * baseline, current state, severity, and remediation suggestions.
 *
 * Ownership: All authenticated (read), System (detect)
 * Build Unit: Tier 3 batch (phase1-engine-entities)
 * Unlocks: /drift-detection, engine intelligence surfaces
 */

import type { CommonFields } from './common';

// ─── Drift Types ─────────────────────────────────────────────────────────────

export const DRIFT_TYPES = ['configuration', 'version', 'policy', 'access', 'coverage'] as const;
export type DriftType = typeof DRIFT_TYPES[number];

// ─── Drift Detection Status ──────────────────────────────────────────────────

export const DRIFT_DETECTION_STATUSES = ['open', 'acknowledged', 'resolved', 'suppressed'] as const;
export type DriftDetectionStatus = typeof DRIFT_DETECTION_STATUSES[number];

// ─── Drift Detection Entity ──────────────────────────────────────────────────

export interface DriftDetection extends CommonFields {
  entity_type: 'drift-detection';
  /** Engine instance that produced this detection */
  engine_id: string;
  /** Human-readable drift detection name */
  name: string;
  /** Category of drift detected */
  driftType: DriftType;
  /** Reference to the source connector */
  sourceConnectorRef: string;
  /** Reference to the baseline configuration */
  baseline_ref: string;
  /** Description of the current observed state */
  current_state: string;
  /** Severity score (higher = more severe) */
  driftSeverity: number;
  /** When the drift was first detected */
  detected_at: string;
  /** When the drift was resolved (null if unresolved) */
  resolved_at: string | null;
  /** Current lifecycle status */
  status: DriftDetectionStatus;
  /** Type of entity affected by the drift */
  affected_entity_type: string;
  /** Reference to the affected entity */
  affected_entity_ref: string;
  /** Suggested remediation action (null if none) */
  remediationSuggestion: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface DriftDetectionValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a DriftDetection entity for structural correctness.
 */
export function validateDriftDetection(record: DriftDetection): DriftDetectionValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') {
    errors.push('id: required');
  }
  if (!record.tenant || !record.tenant.tenant_id || record.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!record.engine_id || record.engine_id.trim() === '') {
    errors.push('engine_id: required');
  }
  if (!record.name || record.name.trim() === '') {
    errors.push('name: required');
  }
  if (!record.driftType || !DRIFT_TYPES.includes(record.driftType)) {
    errors.push(`driftType: must be one of: ${DRIFT_TYPES.join(', ')}`);
  }
  if (!record.sourceConnectorRef || record.sourceConnectorRef.trim() === '') {
    errors.push('sourceConnectorRef: required');
  }
  if (!record.baseline_ref || record.baseline_ref.trim() === '') {
    errors.push('baseline_ref: required');
  }
  if (!record.current_state || record.current_state.trim() === '') {
    errors.push('current_state: required');
  }
  if (typeof record.driftSeverity !== 'number' || record.driftSeverity < 0) {
    errors.push('driftSeverity: must be a non-negative number');
  }
  if (!record.detected_at || record.detected_at.trim() === '') {
    errors.push('detected_at: required');
  }
  if (!record.status || !DRIFT_DETECTION_STATUSES.includes(record.status)) {
    errors.push(`status: must be one of: ${DRIFT_DETECTION_STATUSES.join(', ')}`);
  }
  if (!record.affected_entity_type || record.affected_entity_type.trim() === '') {
    errors.push('affected_entity_type: required');
  }
  if (!record.affected_entity_ref || record.affected_entity_ref.trim() === '') {
    errors.push('affected_entity_ref: required');
  }

  return { valid: errors.length === 0, errors };
}
