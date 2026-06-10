/**
 * Playbook Execution — Commander C2 Canonical Entity
 *
 * Communications Excellence Phase 1 data-layer.
 * Tracks the runtime execution state of a communication playbook instance.
 * Each execution is bound to a specific playbook, case, and tenant.
 *
 * Constraints:
 * - All actions modelled as intent/status (no live execution)
 * - Step statuses track per-step progression
 */

import type { CommonFields } from './common';

// ─── Playbook Execution Types ────────────────────────────────────────────────

export const PLAYBOOK_STEP_EXECUTION_STATUSES = [
  'pending',
  'executed',
  'skipped',
  'failed',
] as const;
export type PlaybookStepExecutionStatus = typeof PLAYBOOK_STEP_EXECUTION_STATUSES[number];

export const PLAYBOOK_EXECUTION_STATUSES = ['running', 'completed', 'aborted'] as const;
export type PlaybookExecutionStatus = typeof PLAYBOOK_EXECUTION_STATUSES[number];

/** Per-step execution status record */
export interface StepExecutionStatus {
  /** Step number (matches PlaybookStep.stepNumber) */
  stepNumber: number;
  /** Current status of this step */
  status: PlaybookStepExecutionStatus;
  /** When this step was executed (null if pending/skipped) */
  executedAt: string | null;
  /** Reason for skip or failure (null if executed successfully) */
  reason: string | null;
}

// ─── Playbook Execution Entity ───────────────────────────────────────────────

export interface PlaybookExecution extends CommonFields {
  /** Execution identifier */
  executionId: string;
  /** Playbook being executed */
  playbook_id: string;
  /** Case this execution is bound to */
  case_id: string;
  /** Tenant scope */
  tenant_id: string;
  /** Current step number being executed */
  currentStep: number;
  /** Per-step execution statuses */
  stepStatuses: StepExecutionStatus[];
  /** When execution started */
  started_at: string;
  /** When execution completed (null if still running) */
  completed_at: string | null;
  /** Overall execution status */
  status: PlaybookExecutionStatus;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PlaybookExecutionValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a PlaybookExecution for structural correctness.
 */
export function validatePlaybookExecution(
  execution: PlaybookExecution,
): PlaybookExecutionValidation {
  const errors: string[] = [];

  if (!execution.id || execution.id.trim() === '') {
    errors.push('id: required');
  }
  if (!execution.tenant || !execution.tenant.tenant_id || execution.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!execution.executionId || execution.executionId.trim() === '') {
    errors.push('executionId: required');
  }
  if (!execution.playbook_id || execution.playbook_id.trim() === '') {
    errors.push('playbook_id: required');
  }
  if (!execution.case_id || execution.case_id.trim() === '') {
    errors.push('case_id: required');
  }
  if (!execution.tenant_id || execution.tenant_id.trim() === '') {
    errors.push('tenant_id: required');
  }
  if (typeof execution.currentStep !== 'number' || execution.currentStep < 0) {
    errors.push('currentStep: must be a non-negative number');
  }
  if (!Array.isArray(execution.stepStatuses)) {
    errors.push('stepStatuses: must be an array');
  } else {
    for (const ss of execution.stepStatuses) {
      if (!PLAYBOOK_STEP_EXECUTION_STATUSES.includes(ss.status)) {
        errors.push(`stepStatuses[${ss.stepNumber}].status: must be a known status`);
      }
    }
  }
  if (!execution.started_at || execution.started_at.trim() === '') {
    errors.push('started_at: required');
  }
  if (!execution.status || !PLAYBOOK_EXECUTION_STATUSES.includes(execution.status)) {
    errors.push(`status: must be one of: ${PLAYBOOK_EXECUTION_STATUSES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
