/**
 * Tenant Intelligence Evaluation — Commander SDR Canonical Entity
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 11.1, 11.2, 11.3, 11.4, 11.5
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * The outcome of evaluating platform intelligence against a specific
 * tenant's assets, identities, observables or telemetry.
 * Tenant risk is created ONLY after a confirmed exposure match.
 * KEV/EPSS alone never create tenant risk (Req 11.5, 18.4).
 */

import type { CommonFields } from './common';
import type { EvaluationType, TenantExposureState } from './intelligence-common';
import { EVALUATION_TYPES, TENANT_EXPOSURE_STATES } from './intelligence-common';

// ─── Tenant Intelligence Evaluation Entity ───────────────────────────────────

export interface TenantIntelligenceEvaluation extends CommonFields {
  /** Customer tenant ID — non-empty (Req 11.4) */
  tenantId: string;
  /** Reference to Platform_Intelligence_Record or IOC — cross-plane, no FK (Req 11.1/11.4, 17.3) */
  platformRecordId: string;
  /** Evaluation type (Req 11.1) */
  evaluationType: EvaluationType;
  /** Evaluation outcome state (Req 11.2/11.4) */
  evaluationState: TenantExposureState;
  /** Matched asset references */
  matchedAssets: string[];
  /** Matched identity references */
  matchedIdentities: string[];
  /** Matched observable references (COIM-D) */
  matchedObservables: string[];
  /** Evidence/provenance references (Req 11.3/11.4) */
  evidenceReferences: string[];
  /** When evaluation was performed */
  evaluatedAt: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface TenantIntelligenceEvaluationValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Tenant_Intelligence_Evaluation for structural correctness.
 * Checks: evaluationState known, tenantId/platformRecordId non-empty,
 * evidenceReferences is array (Req 11.4).
 */
export function validateTenantIntelligenceEvaluation(
  evaluation: TenantIntelligenceEvaluation,
): TenantIntelligenceEvaluationValidation {
  const errors: string[] = [];

  if (!evaluation.tenantId || evaluation.tenantId.trim() === '') {
    errors.push('tenantId: required');
  }

  if (!evaluation.platformRecordId || evaluation.platformRecordId.trim() === '') {
    errors.push('platformRecordId: required, must reference a platform record');
  }

  if (!evaluation.evaluationType || !EVALUATION_TYPES.includes(evaluation.evaluationType)) {
    errors.push(`evaluationType: must be one of: ${EVALUATION_TYPES.join(', ')}`);
  }

  if (!evaluation.evaluationState || !TENANT_EXPOSURE_STATES.includes(evaluation.evaluationState)) {
    errors.push(`evaluationState: must be one of: ${TENANT_EXPOSURE_STATES.join(', ')}`);
  }

  if (!Array.isArray(evaluation.evidenceReferences)) {
    errors.push('evidenceReferences: must be a valid array');
  }

  if (!evaluation.id || evaluation.id.trim() === '') {
    errors.push('id: required');
  }

  if (!evaluation.tenant || !evaluation.tenant.tenantId || evaluation.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  return { valid: errors.length === 0, errors };
}
