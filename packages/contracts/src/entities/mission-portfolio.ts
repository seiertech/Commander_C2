/**
 * Mission & Strategic Portfolio — Commander C2 Thesis Layer 9 (§14)
 *
 * Governed by: CBP (Capability-Based Planning), OKR, NATO/Admiralty (confidence)
 * Purpose: Turn tactical operational deltas into strategic executive choices.
 *
 * Entities: Mission, Mission_Indicator, Mission_Case_Link
 * Naming: snake_case (thesis-literal)
 */

// ─── Mission Type ────────────────────────────────────────────────────────────

export const MISSION_TYPES = ['posture', 'exposure', 'maturity', 'performance', 'capacity', 'governance'] as const;
export type MissionType = typeof MISSION_TYPES[number];

// ─── Mission Status ──────────────────────────────────────────────────────────

export const MISSION_STATUS_THESIS = ['draft', 'active', 'completed', 'archived'] as const;
export type MissionStatusThesis = typeof MISSION_STATUS_THESIS[number];

// ─── Mission Entity ──────────────────────────────────────────────────────────

export interface MissionThesis {
  mission_id: string;
  mission_name: string;
  capability_domain: string;
  derived_from_model: string;
  current_state_score: number;
  target_state_score: number;
  delta_score: number;
  priority_score: number;
  impact_weighting: number;
  risk_reduction_value: number;
  mission_type: MissionType;
  owner: string;
  timeframe: string;
  status: MissionStatusThesis;
  standard_marker: string;
}

// ─── Mission_Indicator Entity ────────────────────────────────────────────────

export interface MissionIndicator {
  indicator_id: string;
  mission_id: string;
  source_entity: string;
  metric_name: string;
  current_value: number;
  target_value: number;
  delta: number;
  confidence: number;
  standard_marker: string;
}

// ─── Mission_Case_Link Entity ────────────────────────────────────────────────

export interface MissionCaseLink {
  mission_id: string;
  case_id: string;
  contribution_weight: number;
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validate_mission_thesis(m: MissionThesis) {
  const errors: string[] = [];
  if (!m.mission_id) errors.push('mission_id: required');
  if (!m.mission_name) errors.push('mission_name: required');
  if (!m.capability_domain) errors.push('capability_domain: required');
  if (!m.derived_from_model) errors.push('derived_from_model: required');
  if (typeof m.current_state_score !== 'number' || m.current_state_score < 0 || m.current_state_score > 100) errors.push('current_state_score: must be 0-100');
  if (typeof m.target_state_score !== 'number' || m.target_state_score < 0 || m.target_state_score > 100) errors.push('target_state_score: must be 0-100');
  if (typeof m.delta_score !== 'number') errors.push('delta_score: must be number');
  if (typeof m.priority_score !== 'number' || m.priority_score < 0 || m.priority_score > 100) errors.push('priority_score: must be 0-100');
  if (typeof m.impact_weighting !== 'number' || m.impact_weighting < 0 || m.impact_weighting > 10) errors.push('impact_weighting: must be 0-10');
  if (typeof m.risk_reduction_value !== 'number' || m.risk_reduction_value < 0 || m.risk_reduction_value > 100) errors.push('risk_reduction_value: must be 0-100');
  if (!(MISSION_TYPES as readonly string[]).includes(m.mission_type)) errors.push('mission_type: invalid');
  if (!m.owner) errors.push('owner: required');
  if (!m.timeframe) errors.push('timeframe: required');
  if (!(MISSION_STATUS_THESIS as readonly string[]).includes(m.status)) errors.push('status: invalid');
  if (!m.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_mission_indicator(i: MissionIndicator) {
  const errors: string[] = [];
  if (!i.indicator_id) errors.push('indicator_id: required');
  if (!i.mission_id) errors.push('mission_id: required');
  if (!i.source_entity) errors.push('source_entity: required');
  if (!i.metric_name) errors.push('metric_name: required');
  if (typeof i.current_value !== 'number') errors.push('current_value: must be number');
  if (typeof i.target_value !== 'number') errors.push('target_value: must be number');
  if (typeof i.delta !== 'number') errors.push('delta: must be number');
  if (typeof i.confidence !== 'number' || i.confidence < 1 || i.confidence > 6) errors.push('confidence: must be 1-6');
  if (!i.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}

export function validate_mission_case_link(l: MissionCaseLink) {
  const errors: string[] = [];
  if (!l.mission_id) errors.push('mission_id: required');
  if (!l.case_id) errors.push('case_id: required');
  if (typeof l.contribution_weight !== 'number' || l.contribution_weight < 0 || l.contribution_weight > 1) errors.push('contribution_weight: must be 0-1');
  if (!l.standard_marker) errors.push('standard_marker: required');
  return { valid: errors.length === 0, errors };
}
