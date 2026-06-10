/**
 * Risk Object Binding Engine — Commander C2
 *
 * Source: Spec #29 Universal Risk Object and Case Binding
 * Unit 7: Every actionable risk object is case-bound.
 *
 * Binding outcomes:
 * - bound_new_case: Risk object bound to a newly created case
 * - linked_existing_case: Risk object linked to an existing open case
 * - suppressed_approved: Risk object suppressed per approved suppression policy
 * - residual_risk_accepted: Risk object accepted as residual risk
 * - allocation_error: Binding failed due to allocation/system error
 *
 * Doctrinal Assertion 1: Cases are system-owned. Binding is system-initiated only.
 */

import type { RiskObjectType } from '../entities/risk-object';

/** Binding outcome types */
export type BindingOutcome =
  | 'bound_new_case'
  | 'linked_existing_case'
  | 'suppressed_approved'
  | 'residual_risk_accepted'
  | 'allocation_error';

/** All binding outcomes as a constant array */
export const BINDING_OUTCOMES: readonly BindingOutcome[] = [
  'bound_new_case',
  'linked_existing_case',
  'suppressed_approved',
  'residual_risk_accepted',
  'allocation_error',
] as const;

/** Request to bind a risk object to a case */
export interface BindingRequest {
  /** Risk object ID to bind */
  riskObjectId: string;
  /** Risk object type */
  riskObjectType: RiskObjectType;
  /** Tenant ID for scoping */
  tenantId: string;
  /** Affected entity ID */
  affectedEntityId: string;
  /** Affected entity type */
  affectedEntityType: string;
  /** Whether an existing open case covers this risk object */
  existingCaseId?: string;
  /** Whether a suppression policy applies */
  suppressionPolicyId?: string;
  /** Whether residual risk acceptance applies */
  residualRiskAcceptanceId?: string;
}

/** Result of a binding operation */
export interface BindingResult {
  /** Whether the binding succeeded */
  success: boolean;
  /** The binding outcome */
  outcome: BindingOutcome;
  /** Case ID (new or existing) if bound/linked */
  caseId: string | null;
  /** Risk object ID that was processed */
  riskObjectId: string;
  /** Error message if allocation_error */
  error: string | null;
  /** Timestamp of binding */
  timestamp: string;
}

/**
 * Bind a risk object to a case.
 *
 * Decision logic:
 * 1. If suppressionPolicyId is provided → suppressed_approved
 * 2. If residualRiskAcceptanceId is provided → residual_risk_accepted
 * 3. If existingCaseId is provided → linked_existing_case
 * 4. If all required fields are valid → bound_new_case (generates new case)
 * 5. Otherwise → allocation_error
 */
export function bindRiskObject(request: BindingRequest): BindingResult {
  const timestamp = new Date().toISOString();

  // Validate required fields
  if (!request.riskObjectId || !request.riskObjectType || !request.tenantId) {
    return {
      success: false,
      outcome: 'allocation_error',
      caseId: null,
      riskObjectId: request.riskObjectId || '',
      error: 'Missing required fields: riskObjectId, riskObjectType, and tenantId are mandatory.',
      timestamp,
    };
  }

  // 1. Suppression check
  if (request.suppressionPolicyId) {
    return {
      success: true,
      outcome: 'suppressed_approved',
      caseId: null,
      riskObjectId: request.riskObjectId,
      error: null,
      timestamp,
    };
  }

  // 2. Residual risk acceptance check
  if (request.residualRiskAcceptanceId) {
    return {
      success: true,
      outcome: 'residual_risk_accepted',
      caseId: null,
      riskObjectId: request.riskObjectId,
      error: null,
      timestamp,
    };
  }

  // 3. Link to existing case
  if (request.existingCaseId) {
    return {
      success: true,
      outcome: 'linked_existing_case',
      caseId: request.existingCaseId,
      riskObjectId: request.riskObjectId,
      error: null,
      timestamp,
    };
  }

  // 4. Bind to new case
  if (request.affectedEntityId && request.affectedEntityType) {
    const newCaseId = `case-${request.tenantId}-${request.riskObjectId}-${Date.now()}`;
    return {
      success: true,
      outcome: 'bound_new_case',
      caseId: newCaseId,
      riskObjectId: request.riskObjectId,
      error: null,
      timestamp,
    };
  }

  // 5. Allocation error — insufficient data to create case
  return {
    success: false,
    outcome: 'allocation_error',
    caseId: null,
    riskObjectId: request.riskObjectId,
    error: 'Cannot bind risk object: missing affectedEntityId or affectedEntityType for new case creation.',
    timestamp,
  };
}
