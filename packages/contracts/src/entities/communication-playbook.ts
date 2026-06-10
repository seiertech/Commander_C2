/**
 * Communication Playbook — Commander C2 Canonical Entity
 *
 * Communications Excellence Phase 1 data-layer.
 * Defines structured communication playbooks with ordered steps,
 * bounded condition grammar, and versioned lifecycle.
 *
 * Constraints:
 * - Playbook conditions are BOUNDED (6 patterns only)
 * - No unbounded DSL
 * - All actions modelled as intent/status (no live execution)
 */

import type { CommonFields } from './common';
import type { CaseType } from './case';
import type { CommunicationChannel } from './case-communication-thread';

// ─── Playbook Types ──────────────────────────────────────────────────────────

export const PLAYBOOK_STATUSES = ['draft', 'active', 'superseded'] as const;
export type PlaybookStatus = typeof PLAYBOOK_STATUSES[number];

export const PLAYBOOK_STEP_ACTIONS = [
  'send_acknowledgement',
  'send_remediation_request',
  'send_escalation',
  'send_closure_notice',
  'post_command_bridge',
  'send_adaptive_card',
] as const;
export type PlaybookStepAction = typeof PLAYBOOK_STEP_ACTIONS[number];

/**
 * Bounded condition grammar — ONLY these 6 patterns are valid:
 * - 'always'
 * - 'never'
 * - 'case.{field} == \'{value}\''
 * - 'case.{field} IN [\'{v1}\', \'{v2}\']'
 * - 'no_response_to_step_{N}'
 * - 'time_since_step_{N} > {duration}'
 */
export type PlaybookCondition = string;

/** Playbook trigger — matches a case type + optional conditions */
export interface PlaybookTrigger {
  /** Case type that activates this playbook */
  caseType: CaseType;
  /** Additional bounded conditions (all must be true) */
  conditions: PlaybookCondition[];
}

/** A single step in a communication playbook */
export interface PlaybookStep {
  /** Step number (1-based, ordered) */
  stepNumber: number;
  /** Communication channel for this step */
  channel: CommunicationChannel;
  /** Action to perform */
  action: PlaybookStepAction;
  /** Template reference for message content */
  template: string;
  /** Recipients — literal emails or role references like 'asset_owner' */
  recipients: string[];
  /** Delay before execution (ISO 8601 duration, e.g. 'PT1H', 'P1D') */
  delay: string;
  /** Bounded condition expression for step execution */
  condition: PlaybookCondition;
}

// ─── Communication Playbook Entity ───────────────────────────────────────────

export interface CommunicationPlaybook extends CommonFields {
  /** Playbook identifier */
  playbookId: string;
  /** Human-readable playbook name */
  name: string;
  /** Trigger definition — when this playbook activates */
  trigger: PlaybookTrigger;
  /** Ordered steps */
  steps: PlaybookStep[];
  /** Playbook version (semantic) */
  version: string;
  /** Current lifecycle status */
  status: PlaybookStatus;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface CommunicationPlaybookValidation {
  valid: boolean;
  errors: string[];
}

/** Regex patterns for bounded condition grammar */
const BOUNDED_CONDITION_PATTERNS: RegExp[] = [
  /^always$/,
  /^never$/,
  /^case\.\w+\s*==\s*'[^']*'$/,
  /^case\.\w+\s*IN\s*\[('[^']*'(,\s*'[^']*')*)\]$/,
  /^no_response_to_step_\d+$/,
  /^time_since_step_\d+\s*>\s*\w+$/,
];

/**
 * Validate that a condition string matches the bounded grammar.
 */
export function isValidBoundedCondition(condition: string): boolean {
  return BOUNDED_CONDITION_PATTERNS.some((pattern) => pattern.test(condition));
}

/**
 * Validate a CommunicationPlaybook for structural correctness.
 */
export function validateCommunicationPlaybook(
  playbook: CommunicationPlaybook,
): CommunicationPlaybookValidation {
  const errors: string[] = [];

  if (!playbook.id || playbook.id.trim() === '') {
    errors.push('id: required');
  }
  if (!playbook.tenant || !playbook.tenant.tenantId || playbook.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!playbook.playbookId || playbook.playbookId.trim() === '') {
    errors.push('playbookId: required');
  }
  if (!playbook.name || playbook.name.trim() === '') {
    errors.push('name: required');
  }
  if (!playbook.trigger || !playbook.trigger.caseType) {
    errors.push('trigger.caseType: required');
  }
  if (!Array.isArray(playbook.steps) || playbook.steps.length === 0) {
    errors.push('steps: must be a non-empty array');
  } else {
    for (const step of playbook.steps) {
      if (!PLAYBOOK_STEP_ACTIONS.includes(step.action)) {
        errors.push(`steps[${step.stepNumber}].action: must be a known action`);
      }
      if (!isValidBoundedCondition(step.condition)) {
        errors.push(`steps[${step.stepNumber}].condition: must match bounded grammar`);
      }
    }
  }
  if (!playbook.version || playbook.version.trim() === '') {
    errors.push('version: required');
  }
  if (!playbook.status || !PLAYBOOK_STATUSES.includes(playbook.status)) {
    errors.push(`status: must be one of: ${PLAYBOOK_STATUSES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
