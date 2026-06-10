/**
 * Case & Remediation Workflow — Commander C2 Thesis Layer 7 (§11)
 * Includes Layer 6 CTEM Overlay (§10) as ctem_phase field.
 *
 * Governed by: ITIL 4 + OODA + CTEM
 * Purpose: Turn exposure priorities into structured, measurable work.
 *
 * Entities: Case, Remediation_Workflow, Remediation_Action, Action_Template
 * Naming: snake_case (thesis-literal)
 */

// ─── Layer 6: CTEM Phase (Thesis §10 — Exposure Lifecycle Overlay) ───────────

export const CTEM_PHASES = ['scoping', 'discovery', 'prioritization', 'validation', 'mobilization'] as const;
export type CtemPhase = typeof CTEM_PHASES[number];

// ─── OODA State ──────────────────────────────────────────────────────────────

export const OODA_STATES = ['observe', 'orient', 'decide', 'act'] as const;
export type OodaState = typeof OODA_STATES[number];

// ─── ITIL Stage ──────────────────────────────────────────────────────────────

export const ITIL_STAGES = ['identified', 'logged', 'categorized', 'prioritized', 'assigned', 'resolved', 'closed'] as const;
export type ItilStage = typeof ITIL_STAGES[number];

// ─── Impact Scope (ITIL) ─────────────────────────────────────────────────────

export const IMPACT_SCOPES = ['single_asset', 'service', 'business_unit', 'organisation'] as const;
export type ImpactScope = typeof IMPACT_SCOPES[number];

// ─── Urgency (ITIL) ──────────────────────────────────────────────────────────

export const URGENCY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;
export type UrgencyLevel = typeof URGENCY_LEVELS[number];

// ─── Case Entity (Thesis §11) ────────────────────────────────────────────────

export interface CaseThesis {
  case_id: string;
  created_time: string;
  case_type: string;
  related_signal_id: string | null;
  related_asset_id: string | null;
  related_vulnerability_id: string | null;
  impact_scope: ImpactScope;
  urgency: UrgencyLevel;
  priority_level: number;
  status: string;
  itil_stage: ItilStage;
  owner_team: string;
  target_resolution_date: string;
  ctem_phase: CtemPhase;
  ooda_state: OodaState;
  standard_marker: string;
}

// ─── Workflow Status ─────────────────────────────────────────────────────────

export const WORKFLOW_STATUSES = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'] as const;
export type WorkflowStatus = typeof WORKFLOW_STATUSES[number];

export const VALIDATION_STATUSES = ['not_started', 'in_progress', 'passed', 'failed'] as const;
export type ValidationStatus = typeof VALIDATION_STATUSES[number];

export const MOBILIZATION_STATUSES = ['not_started', 'in_progress', 'completed'] as const;
export type MobilizationStatus = typeof MOBILIZATION_STATUSES[number];

// ─── Remediation_Workflow Entity ─────────────────────────────────────────────

export interface RemediationWorkflow {
  workflow_id: string;
  case_id: string;
  workflow_type: string;
  workflow_status: WorkflowStatus;
  assigned_team: string;
  validation_status: ValidationStatus;
  mobilization_status: MobilizationStatus;
  standard_marker: string;
}

// ─── Action Status ───────────────────────────────────────────────────────────

export const ACTION_STATUSES_THESIS = ['pending', 'in_progress', 'completed', 'failed', 'skipped'] as const;
export type ActionStatusThesis = typeof ACTION_STATUSES_THESIS[number];

export const EXECUTION_TYPES = ['manual', 'automated', 'hybrid'] as const;
export type ExecutionType = typeof EXECUTION_TYPES[number];

export const VALIDATION_RESULTS = ['passed', 'failed', 'not_tested'] as const;
export type ValidationResult = typeof VALIDATION_RESULTS[number];

// ─── Remediation_Action Entity ───────────────────────────────────────────────

export interface RemediationAction {
  action_id: string;
  workflow_id: string;
  action_type: string;
  action_sequence: number;
  execution_type: ExecutionType;
  assigned_to: string;
  action_status: ActionStatusThesis;
  action_start_time: string | null;
  action_finish_time: string | null;
  validation_result: ValidationResult | null;
  standard_marker: string;
}

// ─── Action_Template Entity ──────────────────────────────────────────────────

export interface ActionTemplate {
  action_template_id: string;
  template_name: string;
  applicable_case_type: string;
  action_definition: string;
  default_sequence: number;
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface CaseThesisValidation { valid: boolean; errors: string[]; }
export interface RemediationWorkflowValidation { valid: boolean; errors: string[]; }
export interface RemediationActionValidation { valid: boolean; errors: string[]; }
export interface ActionTemplateValidation { valid: boolean; errors: string[]; }

export function validate_case_thesis(c: CaseThesis): CaseThesisValidation {
  const errors: string[] = [];
  if (!c.case_id) errors.push('case_id: required');
  if (!c.created_time) errors.push('created_time: required');
  if (!c.case_type) errors.push('case_type: required');
  if (!(IMPACT_SCOPES as readonly string[]).includes(c.impact_scope)) errors.push('impact_scope: invalid');
  if (!(URGENCY_LEVELS as readonly string[]).includes(c.urgency)) errors.push('urgency: invalid');
  if (typeof c.priority_level !== 'number' || c.priority_level < 1 || c.priority_level > 5) errors.push('priority_level: must be 1-5');
  if (!c.status) errors.push('status: required');
  if (!(ITIL_STAGES as readonly string[]).includes(c.itil_stage)) errors.push('itil_stage: invalid');
  if (!c.owner_team) errors.push('owner_team: required');
  if (!c.target_resolution_date) errors.push('target_resolution_date: required');
  if (!(CTEM_PHASES as readonly string[]).includes(c.ctem_phase)) errors.push('ctem_phase: invalid');
  if (!(OODA_STATES as readonly string[]).includes(c.ooda_state)) errors.push('ooda_state: invalid');
  if (!c.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_remediation_workflow(w: RemediationWorkflow): RemediationWorkflowValidation {
  const errors: string[] = [];
  if (!w.workflow_id) errors.push('workflow_id: required');
  if (!w.case_id) errors.push('case_id: required');
  if (!w.workflow_type) errors.push('workflow_type: required');
  if (!(WORKFLOW_STATUSES as readonly string[]).includes(w.workflow_status)) errors.push('workflow_status: invalid');
  if (!w.assigned_team) errors.push('assigned_team: required');
  if (!(VALIDATION_STATUSES as readonly string[]).includes(w.validation_status)) errors.push('validation_status: invalid');
  if (!(MOBILIZATION_STATUSES as readonly string[]).includes(w.mobilization_status)) errors.push('mobilization_status: invalid');
  if (!w.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_remediation_action(a: RemediationAction): RemediationActionValidation {
  const errors: string[] = [];
  if (!a.action_id) errors.push('action_id: required');
  if (!a.workflow_id) errors.push('workflow_id: required');
  if (!a.action_type) errors.push('action_type: required');
  if (typeof a.action_sequence !== 'number' || a.action_sequence < 1) errors.push('action_sequence: must be positive');
  if (!(EXECUTION_TYPES as readonly string[]).includes(a.execution_type)) errors.push('execution_type: invalid');
  if (!a.assigned_to) errors.push('assigned_to: required');
  if (!(ACTION_STATUSES_THESIS as readonly string[]).includes(a.action_status)) errors.push('action_status: invalid');
  if (!a.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_action_template(t: ActionTemplate): ActionTemplateValidation {
  const errors: string[] = [];
  if (!t.action_template_id) errors.push('action_template_id: required');
  if (!t.template_name) errors.push('template_name: required');
  if (!t.applicable_case_type) errors.push('applicable_case_type: required');
  if (!t.action_definition) errors.push('action_definition: required');
  if (typeof t.default_sequence !== 'number' || t.default_sequence < 1) errors.push('default_sequence: must be positive');
  if (!t.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}
