/**
 * Action / Sub-Action Entity — Commander C2 Canonical Model
 *
 * Source: COIM v1.0 §4.3, §6 (Action/Sub-Action impact);
 *         03_REUSABLE_OBJECT_CATALOGUE §2.3;
 *         Spec #08 Case Management (sub-actions)
 *
 * Build unit: COIM-H (Action/Sub-Action + D3FEND)
 * Resolves: ARCH-DEBT-044 (entity absence), ARCH-DEBT-046 (D3FEND gap)
 *
 * ADDITIVE ONLY — does not modify case lifecycle engine logic.
 * Case lifecycle state `action_decomposed` is the precondition for
 * Action/Sub-Action creation; this entity records what was decomposed,
 * not how the lifecycle transitions.
 */

import type { CommonFields } from './common';

// ─── Outcome Classification ──────────────────────────────────────────────────

/**
 * Outcome classification for a completed sub-action.
 * Tracks whether the sub-action achieved its remediation goal.
 */
export type OutcomeClassification =
  | 'successful'
  | 'partial'
  | 'failed'
  | 'cancelled'
  | 'pending';

export const OUTCOME_CLASSIFICATIONS: OutcomeClassification[] = [
  'successful',
  'partial',
  'failed',
  'cancelled',
  'pending',
];

// ─── D3FEND Tactic Type ──────────────────────────────────────────────────────

/**
 * D3FEND tactic classification for remediation sub-actions.
 * Source: MITRE D3FEND framework — five canonical defensive tactic types.
 * OCSF/COIM influence: 03_REUSABLE_OBJECT_CATALOGUE §2.3.
 *
 * - isolate: Network/process isolation to contain threat
 * - evict: Remove threat actor/malware from environment
 * - restore: Return systems to known-good state
 * - harden: Apply preventive controls/patches
 * - detect: Improve detection capability for similar threats
 */
export type D3FENDTacticType =
  | 'isolate'
  | 'evict'
  | 'restore'
  | 'harden'
  | 'detect';

export const D3FEND_TACTIC_TYPES: D3FENDTacticType[] = [
  'isolate',
  'evict',
  'restore',
  'harden',
  'detect',
];

// ─── D3FEND Countermeasure ───────────────────────────────────────────────────

/**
 * D3FEND countermeasure reference.
 * Maps a sub-action to specific D3FEND countermeasure techniques.
 */
export interface D3FENDCountermeasure {
  /** D3FEND technique ID, e.g. "D3-AL" (Application Layer) */
  technique_id: string;
  /** Human-readable technique name */
  technique_name: string;
  /** Optional D3FEND artifact reference */
  artifactRef?: string;
}

/** Maximum countermeasures per sub-action (bounded array — storage efficiency). */
export const MAX_COUNTERMEASURES = 10;

// ─── Action Entity ───────────────────────────────────────────────────────────

/**
 * Action — top-level remediation plan decomposition.
 *
 * Created when a case transitions to `action_decomposed`.
 * Groups one or more Sub-Actions that form the remediation plan.
 * System-created; not manually editable (doctrinal assertion 1).
 */
export interface Action extends CommonFields {
  entity_type: 'action';
  /** Reference to the owning case */
  case_id: string;
  /** Human-readable action title */
  title: string;
  /** Action description / remediation objective */
  description: string;
  /** Total estimated effort for all sub-actions (hours) */
  estimated_effort_hours: number;
  /** Total actual effort recorded across sub-actions (hours) */
  actual_effort_hours: number;
  /** Overall action status — derived from sub-action outcomes */
  status: ActionStatus;
  /** Approval reference (system-generated or routing-engine ref) */
  approvalRef: string;
  /** Owner assigned via routing engine */
  owner: string;
}

/** Action-level status — derived from sub-action outcomes. */
export type ActionStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export const ACTION_STATUSES: ActionStatus[] = [
  'planned',
  'in_progress',
  'completed',
  'cancelled',
];

// ─── Sub-Action Entity ───────────────────────────────────────────────────────

/**
 * Sub-Action — individual remediation step within an Action.
 *
 * Carries the D3FEND tactic classification (ARCH-DEBT-046).
 * Tracks target entity, execution method, outcome, and effort.
 */
export interface SubAction extends CommonFields {
  entity_type: 'sub_action';
  /** Reference to the parent Action */
  action_id: string;
  /** Reference to the owning case (denormalised for query efficiency) */
  case_id: string;
  /** Entity targeted by this sub-action (asset ID, identity ID, etc.) */
  targetEntity: string;
  /** Type of the target entity */
  targetEntityType: string;
  /** How the remediation is executed (patch, isolate, revoke, etc.) */
  executionMethod: string;
  /** Outcome classification */
  outcomeClassification: OutcomeClassification;
  /** Estimated effort for this sub-action (hours) */
  estimated_effort_hours: number;
  /** Actual effort recorded (hours) */
  actual_effort_hours: number;
  /** Approval reference for this specific sub-action */
  approvalRef: string;
  /** Assigned owner */
  owner: string;
  /** Ordering within the parent Action */
  sequence_order: number;

  // ─── D3FEND Classification (ARCH-DEBT-046) ─────────────────────────────────
  // Source: COIM v1.0 §4.3; 03_REUSABLE_OBJECT_CATALOGUE §2.3.
  // Enables remediation posture analytics and D3FEND coverage measurement.

  /** D3FEND tactic type — classifies the defensive intent of this sub-action. */
  tactic_type: D3FENDTacticType;
  /** D3FEND countermeasures (bounded ≤ MAX_COUNTERMEASURES). */
  countermeasures: D3FENDCountermeasure[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Result of an action/sub-action structural validation. */
export interface ActionValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Structural validation for an Action.
 * Validates required fields and effort constraints.
 */
export function validateAction(action: Action): ActionValidation {
  const errors: string[] = [];

  if (!action.case_id || action.case_id.trim() === '') {
    errors.push('caseId is required.');
  }
  if (!action.title || action.title.trim() === '') {
    errors.push('title is required.');
  }
  if (action.estimated_effort_hours < 0) {
    errors.push(`estimatedEffortHours must be >= 0: ${action.estimated_effort_hours}.`);
  }
  if (action.actual_effort_hours < 0) {
    errors.push(`actualEffortHours must be >= 0: ${action.actual_effort_hours}.`);
  }
  if (!ACTION_STATUSES.includes(action.status)) {
    errors.push(`Invalid action status: ${String(action.status)}.`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Structural validation for a Sub-Action.
 * Validates required fields, effort constraints, D3FEND fields, and bounded arrays.
 */
export function validateSubAction(subAction: SubAction): ActionValidation {
  const errors: string[] = [];

  if (!subAction.action_id || subAction.action_id.trim() === '') {
    errors.push('actionId is required.');
  }
  if (!subAction.case_id || subAction.case_id.trim() === '') {
    errors.push('caseId is required.');
  }
  if (!subAction.targetEntity || subAction.targetEntity.trim() === '') {
    errors.push('targetEntity is required.');
  }
  if (!subAction.executionMethod || subAction.executionMethod.trim() === '') {
    errors.push('executionMethod is required.');
  }
  if (!OUTCOME_CLASSIFICATIONS.includes(subAction.outcomeClassification)) {
    errors.push(`Invalid outcomeClassification: ${String(subAction.outcomeClassification)}.`);
  }
  if (subAction.estimated_effort_hours < 0) {
    errors.push(`estimatedEffortHours must be >= 0: ${subAction.estimated_effort_hours}.`);
  }
  if (subAction.actual_effort_hours < 0) {
    errors.push(`actualEffortHours must be >= 0: ${subAction.actual_effort_hours}.`);
  }
  if (!D3FEND_TACTIC_TYPES.includes(subAction.tactic_type)) {
    errors.push(`Invalid D3FEND tactic_type: ${String(subAction.tactic_type)}.`);
  }
  if (subAction.countermeasures.length > MAX_COUNTERMEASURES) {
    errors.push(`countermeasures[] exceeds max ${MAX_COUNTERMEASURES} (${subAction.countermeasures.length}).`);
  }
  for (const cm of subAction.countermeasures) {
    if (!cm.technique_id || cm.technique_id.trim() === '') {
      errors.push('countermeasure.technique_id is required.');
    }
    if (!cm.technique_name || cm.technique_name.trim() === '') {
      errors.push('countermeasure.technique_name is required.');
    }
  }

  return { valid: errors.length === 0, errors };
}
