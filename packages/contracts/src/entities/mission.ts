/**
 * Mission Entity — Commander SDR Canonical Model
 *
 * Source: Master Technical Specification §Mission Control,
 *         Spec #57 Security Command and Control Doctrine (strategic alignment)
 *
 * Missions represent strategic security initiatives that align operational
 * case work to executive objectives. They track progress against KPIs and
 * bind to cases that contribute to their outcome.
 *
 * Ownership: SOM, CISO
 * Build Unit: Tier 3 batch (phase1-entity-creation)
 * Unlocks: /mission/overview, /mission/objectives, /mission/impact
 */

import type { CommonFields } from './common';

// ─── Mission Status ──────────────────────────────────────────────────────────

export const MISSION_STATUSES = ['draft', 'active', 'completed', 'archived'] as const;
export type MissionStatus = typeof MISSION_STATUSES[number];

// ─── Mission Priority ────────────────────────────────────────────────────────

export const MISSION_PRIORITIES = [1, 2, 3, 4, 5] as const;
export type MissionPriority = typeof MISSION_PRIORITIES[number];

// ─── Mission Objective ───────────────────────────────────────────────────────

export const OBJECTIVE_STATUSES = ['not_started', 'in_progress', 'completed', 'blocked'] as const;
export type ObjectiveStatus = typeof OBJECTIVE_STATUSES[number];

export interface MissionObjective {
  /** Unique objective identifier within the mission */
  id: string;
  /** Objective description */
  description: string;
  /** Current status */
  status: ObjectiveStatus;
  /** Target completion date */
  targetDate: string;
  /** References to evidence (case IDs, report IDs, etc.) */
  evidenceRefs: string[];
}

// ─── Mission KPI ─────────────────────────────────────────────────────────────

export interface MissionKpi {
  /** KPI name */
  name: string;
  /** Target value */
  target: number;
  /** Current measured value */
  current: number;
  /** Unit of measurement (%, count, hours, days) */
  unit: string;
}

// ─── Mission Binding Rule ────────────────────────────────────────────────────

export const BINDING_RULE_TYPES = ['tag_match', 'service_group', 'dependency'] as const;
export type BindingRuleType = typeof BINDING_RULE_TYPES[number];

export interface MissionBindingRule {
  /** Rule type */
  ruleType: BindingRuleType;
  /** Pattern to match (e.g. tag name, service group name, dependency path) */
  pattern: string;
  /** Whether matches should be automatically bound */
  autoApply: boolean;
}

// ─── Mission Entity ──────────────────────────────────────────────────────────

export interface Mission extends CommonFields {
  entityType: 'mission';
  /** Human-readable mission name */
  name: string;
  /** Detailed description of mission scope and intent */
  description: string;
  /** Current lifecycle status */
  status: MissionStatus;
  /** Priority 1 (highest) to 5 (lowest) */
  priority: MissionPriority;
  /** Structured objectives tracked within this mission */
  objectives: MissionObjective[];
  /** Security domains this mission impacts */
  impactDomains: string[];
  /** Mission owner (role or individual) */
  owner: string;
  /** Mission start date */
  startDate: string;
  /** Target completion date */
  targetDate: string;
  /** Overall progress (0-100) */
  progressPercent: number;
  /** Case IDs aligned to this mission */
  alignedCases: string[];
  /** Key performance indicators */
  kpiMetrics: MissionKpi[];
  /** Mission criticality tier (1 = highest, 5 = lowest) */
  criticality: number;
  /** Scope description for this mission */
  scope: string;
  /** Binding rules for automatic entity binding */
  bindingRules: MissionBindingRule[];
  /** P0 policy reference (null if no P0 policy applies) */
  p0Policy: string | null;
  /** Routing profile for mission-related cases */
  routingProfile: string | null;
  /** When the mission was last reviewed */
  reviewedAt: string | null;
  /** Who reviewed the mission */
  reviewedBy: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface MissionValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Mission entity for structural correctness.
 */
export function validateMission(mission: Mission): MissionValidation {
  const errors: string[] = [];

  if (!mission.id || mission.id.trim() === '') {
    errors.push('id: required');
  }
  if (!mission.tenant || !mission.tenant.tenantId || mission.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!mission.name || mission.name.trim() === '') {
    errors.push('name: required');
  }
  if (!mission.description || mission.description.trim() === '') {
    errors.push('description: required');
  }
  if (!mission.status || !MISSION_STATUSES.includes(mission.status)) {
    errors.push(`status: must be one of: ${MISSION_STATUSES.join(', ')}`);
  }
  if (!mission.priority || !MISSION_PRIORITIES.includes(mission.priority as MissionPriority)) {
    errors.push(`priority: must be 1-5`);
  }
  if (!Array.isArray(mission.objectives)) {
    errors.push('objectives: must be an array');
  } else {
    for (const obj of mission.objectives) {
      if (!obj.id || obj.id.trim() === '') {
        errors.push('objectives[].id: required');
      }
      if (!obj.description || obj.description.trim() === '') {
        errors.push('objectives[].description: required');
      }
      if (!OBJECTIVE_STATUSES.includes(obj.status)) {
        errors.push(`objectives[].status: must be one of: ${OBJECTIVE_STATUSES.join(', ')}`);
      }
      if (!obj.targetDate || obj.targetDate.trim() === '') {
        errors.push('objectives[].targetDate: required');
      }
    }
  }
  if (!Array.isArray(mission.impactDomains) || mission.impactDomains.length === 0) {
    errors.push('impactDomains: must contain at least one domain');
  }
  if (!mission.owner || mission.owner.trim() === '') {
    errors.push('owner: required');
  }
  if (!mission.startDate || mission.startDate.trim() === '') {
    errors.push('startDate: required');
  }
  if (!mission.targetDate || mission.targetDate.trim() === '') {
    errors.push('targetDate: required');
  }
  if (typeof mission.progressPercent !== 'number' || mission.progressPercent < 0 || mission.progressPercent > 100) {
    errors.push('progressPercent: must be 0-100');
  }
  if (!Array.isArray(mission.alignedCases)) {
    errors.push('alignedCases: must be an array');
  }
  if (!Array.isArray(mission.kpiMetrics)) {
    errors.push('kpiMetrics: must be an array');
  } else {
    for (const kpi of mission.kpiMetrics) {
      if (!kpi.name || kpi.name.trim() === '') {
        errors.push('kpiMetrics[].name: required');
      }
      if (typeof kpi.target !== 'number') {
        errors.push('kpiMetrics[].target: must be a number');
      }
      if (typeof kpi.current !== 'number') {
        errors.push('kpiMetrics[].current: must be a number');
      }
      if (!kpi.unit || kpi.unit.trim() === '') {
        errors.push('kpiMetrics[].unit: required');
      }
    }
  }
  if (typeof mission.criticality !== 'number' || mission.criticality < 1 || mission.criticality > 5) {
    errors.push('criticality: must be 1-5');
  }
  if (!mission.scope || mission.scope.trim() === '') {
    errors.push('scope: required');
  }
  if (!Array.isArray(mission.bindingRules)) {
    errors.push('bindingRules: must be an array');
  } else {
    for (const rule of mission.bindingRules) {
      if (!BINDING_RULE_TYPES.includes(rule.ruleType)) {
        errors.push(`bindingRules[].ruleType: must be one of: ${BINDING_RULE_TYPES.join(', ')}`);
      }
      if (!rule.pattern || rule.pattern.trim() === '') {
        errors.push('bindingRules[].pattern: required');
      }
      if (typeof rule.autoApply !== 'boolean') {
        errors.push('bindingRules[].autoApply: must be a boolean');
      }
    }
  }
  if (mission.p0Policy !== null && typeof mission.p0Policy !== 'string') {
    errors.push('p0Policy: must be a string or null');
  }
  if (mission.routingProfile !== null && typeof mission.routingProfile !== 'string') {
    errors.push('routingProfile: must be a string or null');
  }
  if (mission.reviewedAt !== null && typeof mission.reviewedAt !== 'string') {
    errors.push('reviewedAt: must be a string or null');
  }
  if (mission.reviewedBy !== null && typeof mission.reviewedBy !== 'string') {
    errors.push('reviewedBy: must be a string or null');
  }

  return { valid: errors.length === 0, errors };
}
