/**
 * Drift Detection Engine Entity — Commander SDR Canonical Model
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
  entityType: 'drift-detection';
  /** Engine instance that produced this detection */
  engineId: string;
  /** Human-readable drift detection name */
  name: string;
  /** Category of drift detected */
  driftType: DriftType;
  /** Reference to the source connector */
  sourceConnectorRef: string;
  /** Reference to the baseline configuration */
  baselineRef: string;
  /** Description of the current observed state */
  currentState: string;
  /** Severity score (higher = more severe) */
  driftSeverity: number;
  /** When the drift was first detected */
  detectedAt: string;
  /** When the drift was resolved (null if unresolved) */
  resolvedAt: string | null;
  /** Current lifecycle status */
  status: DriftDetectionStatus;
  /** Type of entity affected by the drift */
  affectedEntityType: string;
  /** Reference to the affected entity */
  affectedEntityRef: string;
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
  if (!record.tenant || !record.tenant.tenantId || record.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!record.engineId || record.engineId.trim() === '') {
    errors.push('engineId: required');
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
  if (!record.baselineRef || record.baselineRef.trim() === '') {
    errors.push('baselineRef: required');
  }
  if (!record.currentState || record.currentState.trim() === '') {
    errors.push('currentState: required');
  }
  if (typeof record.driftSeverity !== 'number' || record.driftSeverity < 0) {
    errors.push('driftSeverity: must be a non-negative number');
  }
  if (!record.detectedAt || record.detectedAt.trim() === '') {
    errors.push('detectedAt: required');
  }
  if (!record.status || !DRIFT_DETECTION_STATUSES.includes(record.status)) {
    errors.push(`status: must be one of: ${DRIFT_DETECTION_STATUSES.join(', ')}`);
  }
  if (!record.affectedEntityType || record.affectedEntityType.trim() === '') {
    errors.push('affectedEntityType: required');
  }
  if (!record.affectedEntityRef || record.affectedEntityRef.trim() === '') {
    errors.push('affectedEntityRef: required');
  }

  return { valid: errors.length === 0, errors };
}
