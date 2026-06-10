/**
 * Risk, Control & Adherence — Commander C2 Thesis Layer 10 (§15)
 *
 * Governed by: ISO 27005 (risk), ITIL (SLA), NIST/ISO/COBIT (controls)
 * Purpose: Translate event, posture, mission, and workflow state into
 * auditable cyber governance.
 *
 * Entities: Risk_Snapshot, Control_Reference, Control_State, Adherence_Assertion
 * Naming: snake_case (thesis-literal)
 */

// ─── SLA Status ──────────────────────────────────────────────────────────────

export const SLA_STATUSES = ['within_sla', 'at_risk', 'breached'] as const;
export type SlaStatus = typeof SLA_STATUSES[number];

// ─── Risk_Snapshot Entity ────────────────────────────────────────────────────

export interface RiskSnapshot {
  risk_snapshot_id: string;
  asset_id: string;
  case_id: string | null;
  snapshot_time: string;
  inherent_risk: number;
  current_risk: number;
  residual_risk: number;
  risk_reason: string;
  sla_status: SlaStatus;
  standard_marker: string;
}

// ─── Control_Reference Entity ────────────────────────────────────────────────

export interface ControlReference {
  control_reference_id: string;
  framework_name: string;
  framework_version: string;
  category_or_control: string;
  description: string;
  standard_marker: string;
}

// ─── Effectiveness & Validation States ───────────────────────────────────────

export const EFFECTIVENESS_STATES = ['effective', 'partially_effective', 'ineffective', 'not_assessed'] as const;
export type EffectivenessState = typeof EFFECTIVENESS_STATES[number];

export const CONTROL_VALIDATION_STATES = ['validated', 'not_validated', 'expired'] as const;
export type ControlValidationState = typeof CONTROL_VALIDATION_STATES[number];

// ─── Control_State Entity ────────────────────────────────────────────────────

export interface ControlStateEntity {
  control_state_id: string;
  asset_id: string;
  control_reference_id: string;
  effectiveness_state: EffectivenessState;
  validation_state: ControlValidationState;
  last_verified: string;
  evidence_pointer: string;
  standard_marker: string;
}

// ─── Assertion Status ────────────────────────────────────────────────────────

export const ASSERTION_STATUSES = ['compliant', 'non_compliant', 'partial', 'not_assessed'] as const;
export type AssertionStatus = typeof ASSERTION_STATUSES[number];

// ─── Adherence_Assertion Entity ──────────────────────────────────────────────

export interface AdherenceAssertion {
  adherence_assertion_id: string;
  asset_id: string;
  standard_name: string;
  assertion_scope: string;
  assertion_status: AssertionStatus;
  attested_by: string;
  attested_time: string;
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validate_risk_snapshot(r: RiskSnapshot) {
  const errors: string[] = [];
  if (!r.risk_snapshot_id) errors.push('risk_snapshot_id: required');
  if (!r.asset_id) errors.push('asset_id: required');
  if (!r.snapshot_time) errors.push('snapshot_time: required');
  if (typeof r.inherent_risk !== 'number' || r.inherent_risk < 0 || r.inherent_risk > 100) errors.push('inherent_risk: must be 0-100');
  if (typeof r.current_risk !== 'number' || r.current_risk < 0 || r.current_risk > 100) errors.push('current_risk: must be 0-100');
  if (typeof r.residual_risk !== 'number' || r.residual_risk < 0 || r.residual_risk > 100) errors.push('residual_risk: must be 0-100');
  if (!r.risk_reason) errors.push('risk_reason: required');
  if (!(SLA_STATUSES as readonly string[]).includes(r.sla_status)) errors.push('sla_status: invalid');
  if (!r.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_control_reference(c: ControlReference) {
  const errors: string[] = [];
  if (!c.control_reference_id) errors.push('control_reference_id: required');
  if (!c.framework_name) errors.push('framework_name: required');
  if (!c.framework_version) errors.push('framework_version: required');
  if (!c.category_or_control) errors.push('category_or_control: required');
  if (!c.description) errors.push('description: required');
  if (!c.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_control_state(s: ControlStateEntity) {
  const errors: string[] = [];
  if (!s.control_state_id) errors.push('control_state_id: required');
  if (!s.asset_id) errors.push('asset_id: required');
  if (!s.control_reference_id) errors.push('control_reference_id: required');
  if (!(EFFECTIVENESS_STATES as readonly string[]).includes(s.effectiveness_state)) errors.push('effectiveness_state: invalid');
  if (!(CONTROL_VALIDATION_STATES as readonly string[]).includes(s.validation_state)) errors.push('validation_state: invalid');
  if (!s.last_verified) errors.push('last_verified: required');
  if (!s.evidence_pointer) errors.push('evidence_pointer: required');
  if (!s.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_adherence_assertion(a: AdherenceAssertion) {
  const errors: string[] = [];
  if (!a.adherence_assertion_id) errors.push('adherence_assertion_id: required');
  if (!a.asset_id) errors.push('asset_id: required');
  if (!a.standard_name) errors.push('standard_name: required');
  if (!a.assertion_scope) errors.push('assertion_scope: required');
  if (!(ASSERTION_STATUSES as readonly string[]).includes(a.assertion_status)) errors.push('assertion_status: invalid');
  if (!a.attested_by) errors.push('attested_by: required');
  if (!a.attested_time) errors.push('attested_time: required');
  if (!a.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}
