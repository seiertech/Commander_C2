/**
 * Capacity, Maturity, Performance & Improvement — Commander C2 Thesis Layer 8 (§12)
 *
 * Governed by: ITIL 4 (capacity), CMMI (maturity), COBIT (governance),
 *              DORA (performance), DMAIC (improvement), Queueing Theory + Little's Law
 * Purpose: Make execution realistic, measurable, and improvable.
 *
 * Entities: Case_Capacity_Model, Case_Demand_Model, Case_Backlog_State,
 *           Case_Assignment_Model, Process_Maturity, Governance_Capability,
 *           Delivery_Performance, Improvement_Program, Case_Management_Metric
 * Naming: snake_case (thesis-literal)
 */

// ─── Skill Levels (ITIL) ─────────────────────────────────────────────────────

export const SKILL_LEVELS = ['L1', 'L2', 'L3', 'L4'] as const;
export type SkillLevel = typeof SKILL_LEVELS[number];

// ─── Case_Capacity_Model ─────────────────────────────────────────────────────

export interface CaseCapacityModel {
  team_id: string;
  skill_level: SkillLevel;
  resource_count: number;
  avg_hours_per_week: number;
  avg_case_handling_rate: number;
  total_capacity_per_week: number;
  standard_marker: string;
}

// ─── Case_Demand_Model ───────────────────────────────────────────────────────

export interface CaseDemandModel {
  case_type: string;
  arrival_rate: number;
  volatility: number;
  peak_factor: number;
  standard_marker: string;
}

// ─── Case_Backlog_State ──────────────────────────────────────────────────────

export interface CaseBacklogState {
  total_cases_open: number;
  new_cases_per_period: number;
  closed_cases_per_period: number;
  backlog_growth_rate: number;
  wip: number;
  standard_marker: string;
}

// ─── Case_Assignment_Model ───────────────────────────────────────────────────

export interface CaseAssignmentModel {
  case_id: string;
  required_capability: SkillLevel;
  assigned_capability_level: SkillLevel;
  skill_match_score: number;
  escalation_path: string;
  standard_marker: string;
}

// ─── Process_Maturity (CMMI) ─────────────────────────────────────────────────

export interface ProcessMaturity {
  process_id: string;
  process_name: string;
  maturity_level: number;
  assessment_scope: string;
  assessment_date: string;
  improvement_plan: string | null;
  standard_marker: string;
}

// ─── Governance_Capability (COBIT) ───────────────────────────────────────────

export interface GovernanceCapability {
  process_id: string;
  cobit_capability_level: number;
  governance_domain: string;
  control_coverage: number;
  performance_measure: string;
  standard_marker: string;
}

// ─── Delivery_Performance (DORA) ─────────────────────────────────────────────

export interface DeliveryPerformance {
  entity_id: string;
  deployment_frequency: string;
  lead_time: string;
  change_failure_rate: number;
  time_to_restore: string;
  measurement_period: string;
  standard_marker: string;
}

// ─── Improvement_Program (DMAIC) ─────────────────────────────────────────────

export const DMAIC_STAGES = ['define', 'measure', 'analyze', 'improve', 'control'] as const;
export type DmaicStage = typeof DMAIC_STAGES[number];

export const CONTROL_STATES = ['not_started', 'in_progress', 'controlled', 'regressed'] as const;
export type ControlState = typeof CONTROL_STATES[number];

export interface ImprovementProgram {
  target_process: string;
  dmaic_stage: DmaicStage;
  baseline_metric: string;
  target_metric: string;
  improvement_actions: string;
  control_state: ControlState;
  standard_marker: string;
}

// ─── Case_Management_Metric ──────────────────────────────────────────────────

export interface CaseManagementMetric {
  metric_id: string;
  metric_name: string;
  metric_scope: string;
  measurement_period: string;
  value: number;
  formula_reference: string;
  owner: string;
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validate_case_capacity_model(m: CaseCapacityModel) {
  const errors: string[] = [];
  if (!m.team_id) errors.push('team_id: required');
  if (!(SKILL_LEVELS as readonly string[]).includes(m.skill_level)) errors.push('skill_level: invalid');
  if (typeof m.resource_count !== 'number' || m.resource_count < 1) errors.push('resource_count: must be positive');
  if (typeof m.avg_hours_per_week !== 'number' || m.avg_hours_per_week <= 0) errors.push('avg_hours_per_week: must be positive');
  if (typeof m.avg_case_handling_rate !== 'number' || m.avg_case_handling_rate <= 0) errors.push('avg_case_handling_rate: must be positive');
  if (!m.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_case_demand_model(d: CaseDemandModel) {
  const errors: string[] = [];
  if (!d.case_type) errors.push('case_type: required');
  if (typeof d.arrival_rate !== 'number' || d.arrival_rate < 0) errors.push('arrival_rate: must be non-negative');
  if (typeof d.volatility !== 'number' || d.volatility < 0 || d.volatility > 5) errors.push('volatility: must be 0-5');
  if (typeof d.peak_factor !== 'number' || d.peak_factor < 1) errors.push('peak_factor: must be >= 1');
  if (!d.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_process_maturity(p: ProcessMaturity) {
  const errors: string[] = [];
  if (!p.process_id) errors.push('process_id: required');
  if (!p.process_name) errors.push('process_name: required');
  if (typeof p.maturity_level !== 'number' || p.maturity_level < 1 || p.maturity_level > 5) errors.push('maturity_level: must be 1-5');
  if (!p.assessment_scope) errors.push('assessment_scope: required');
  if (!p.assessment_date) errors.push('assessment_date: required');
  if (!p.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_governance_capability(g: GovernanceCapability) {
  const errors: string[] = [];
  if (!g.process_id) errors.push('process_id: required');
  if (typeof g.cobit_capability_level !== 'number' || g.cobit_capability_level < 0 || g.cobit_capability_level > 5) errors.push('cobit_capability_level: must be 0-5');
  if (!g.governance_domain) errors.push('governance_domain: required');
  if (typeof g.control_coverage !== 'number' || g.control_coverage < 0 || g.control_coverage > 100) errors.push('control_coverage: must be 0-100');
  if (!g.performance_measure) errors.push('performance_measure: required');
  if (!g.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_delivery_performance(d: DeliveryPerformance) {
  const errors: string[] = [];
  if (!d.entity_id) errors.push('entity_id: required');
  if (!d.deployment_frequency) errors.push('deployment_frequency: required');
  if (!d.lead_time) errors.push('lead_time: required');
  if (typeof d.change_failure_rate !== 'number' || d.change_failure_rate < 0 || d.change_failure_rate > 100) errors.push('change_failure_rate: must be 0-100');
  if (!d.time_to_restore) errors.push('time_to_restore: required');
  if (!d.measurement_period) errors.push('measurement_period: required');
  if (!d.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_improvement_program(i: ImprovementProgram) {
  const errors: string[] = [];
  if (!i.target_process) errors.push('target_process: required');
  if (!(DMAIC_STAGES as readonly string[]).includes(i.dmaic_stage)) errors.push('dmaic_stage: invalid');
  if (!i.baseline_metric) errors.push('baseline_metric: required');
  if (!i.target_metric) errors.push('target_metric: required');
  if (!i.improvement_actions) errors.push('improvement_actions: required');
  if (!(CONTROL_STATES as readonly string[]).includes(i.control_state)) errors.push('control_state: invalid');
  if (!i.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_case_management_metric(m: CaseManagementMetric) {
  const errors: string[] = [];
  if (!m.metric_id) errors.push('metric_id: required');
  if (!m.metric_name) errors.push('metric_name: required');
  if (!m.metric_scope) errors.push('metric_scope: required');
  if (!m.measurement_period) errors.push('measurement_period: required');
  if (typeof m.value !== 'number') errors.push('value: must be number');
  if (!m.formula_reference) errors.push('formula_reference: required');
  if (!m.owner) errors.push('owner: required');
  if (!m.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}
