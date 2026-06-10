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
  playbookId: string;
  /** Case this execution is bound to */
  caseId: string;
  /** Tenant scope */
  tenantId: string;
  /** Current step number being executed */
  currentStep: number;
  /** Per-step execution statuses */
  stepStatuses: StepExecutionStatus[];
  /** When execution started */
  startedAt: string;
  /** When execution completed (null if still running) */
  completedAt: string | null;
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
  if (!execution.tenant || !execution.tenant.tenantId || execution.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!execution.executionId || execution.executionId.trim() === '') {
    errors.push('executionId: required');
  }
  if (!execution.playbookId || execution.playbookId.trim() === '') {
    errors.push('playbookId: required');
  }
  if (!execution.caseId || execution.caseId.trim() === '') {
    errors.push('caseId: required');
  }
  if (!execution.tenantId || execution.tenantId.trim() === '') {
    errors.push('tenantId: required');
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
  if (!execution.startedAt || execution.startedAt.trim() === '') {
    errors.push('startedAt: required');
  }
  if (!execution.status || !PLAYBOOK_EXECUTION_STATUSES.includes(execution.status)) {
    errors.push(`status: must be one of: ${PLAYBOOK_EXECUTION_STATUSES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
