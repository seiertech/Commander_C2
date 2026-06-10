/**
 * Playbook Engine — Commander C2
 *
 * Communications Excellence Phase 1.
 * Pure functions for playbook trigger evaluation, step condition evaluation,
 * next-step computation, and execution advancement.
 *
 * Condition grammar is BOUNDED — only 6 patterns allowed:
 * - 'always'
 * - 'never'
 * - 'case.{field} == \'{value}\''
 * - 'case.{field} IN [\'{v1}\', \'{v2}\']'
 * - 'no_response_to_step_{N}'
 * - 'time_since_step_{N} > {duration}'
 *
 * No I/O. No side effects.
 */

import type { CommunicationPlaybook, PlaybookStep, PlaybookCondition } from '../contracts/src/entities/communication-playbook';
import type { PlaybookExecution, StepExecutionStatus, PlaybookStepExecutionStatus } from '../contracts/src/entities/playbook-execution';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Minimal case data needed for playbook evaluation */
export interface PlaybookCaseData {
  case_type: string;
  [key: string]: unknown;
}

/** Context for condition evaluation */
export interface PlaybookConditionContext {
  /** Case data fields */
  case: PlaybookCaseData;
  /** Per-step execution statuses */
  stepStatuses: StepExecutionStatus[];
  /** Per-step timestamps (stepNumber → ISO timestamp) */
  timestamps: Record<number, string>;
}

/** Result of computing the next step */
export interface NextStepResult {
  /** Next step number (null if playbook is complete) */
  nextStepNumber: number | null;
  /** The step to execute (null if playbook is complete) */
  action: PlaybookStep | null;
  /** Reason for the decision */
  reason: string;
}

/** Step result for advancing execution */
export interface StepResult {
  /** Step number that completed */
  stepNumber: number;
  /** Whether the step succeeded */
  success: boolean;
  /** Reason for failure if !success */
  failureReason?: string;
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Evaluate whether a playbook trigger activates for the given case data.
 *
 * @param playbook - The playbook to evaluate
 * @param caseData - Case data to check against trigger conditions
 * @returns true if the playbook should activate for this case
 */
export function evaluatePlaybookTrigger(
  playbook: CommunicationPlaybook,
  caseData: PlaybookCaseData,
): boolean {
  // Case type must match
  if (caseData.case_type !== playbook.trigger.case_type) {
    return false;
  }

  // All trigger conditions must evaluate to true
  for (const condition of playbook.trigger.conditions) {
    const context: PlaybookConditionContext = {
      case: caseData,
      stepStatuses: [],
      timestamps: {},
    };
    if (!evaluateStepCondition(condition, context)) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluate a bounded condition statement.
 * Returns boolean — TOTAL function (never throws for valid bounded conditions).
 *
 * @param condition - Bounded condition string
 * @param context - Evaluation context with case, statuses, timestamps
 * @returns boolean result of condition evaluation
 */
export function evaluateStepCondition(
  condition: PlaybookCondition,
  context: PlaybookConditionContext,
): boolean {
  // Pattern 1: always
  if (condition === 'always') {
    return true;
  }

  // Pattern 2: never
  if (condition === 'never') {
    return false;
  }

  // Pattern 3: case.{field} == '{value}'
  const eqMatch = condition.match(/^case\.(\w+)\s*==\s*'([^']*)'$/);
  if (eqMatch) {
    const [, field, value] = eqMatch;
    return String(context.case[field] ?? '') === value;
  }

  // Pattern 4: case.{field} IN ['{v1}', '{v2}']
  const inMatch = condition.match(/^case\.(\w+)\s*IN\s*\[((?:'[^']*'(?:,\s*'[^']*')*))\]$/);
  if (inMatch) {
    const [, field, valuesStr] = inMatch;
    const values = valuesStr.match(/'([^']*)'/g)?.map((v) => v.slice(1, -1)) ?? [];
    return values.includes(String(context.case[field] ?? ''));
  }

  // Pattern 5: no_response_to_step_{N}
  const noResponseMatch = condition.match(/^no_response_to_step_(\d+)$/);
  if (noResponseMatch) {
    const stepNum = parseInt(noResponseMatch[1], 10);
    const stepStatus = context.stepStatuses.find((s) => s.stepNumber === stepNum);
    // No response = step was executed but hasn't been responded to
    // In our model: step is executed but no subsequent step has been executed
    if (!stepStatus) return true; // step doesn't exist — treated as no response
    return stepStatus.status === 'executed';
  }

  // Pattern 6: time_since_step_{N} > {duration}
  const timeMatch = condition.match(/^time_since_step_(\d+)\s*>\s*(\w+)$/);
  if (timeMatch) {
    const [, stepNumStr, duration] = timeMatch;
    const stepNum = parseInt(stepNumStr, 10);
    const timestamp = context.timestamps[stepNum];
    if (!timestamp) return false; // step not yet executed

    const stepTime = new Date(timestamp).getTime();
    const now = Date.now();
    const durationMs = parseDuration(duration);
    return (now - stepTime) > durationMs;
  }

  // Invalid condition — return false (bounded grammar enforcement)
  return false;
}

/**
 * Compute the next step to execute in a playbook.
 *
 * @param execution - Current execution state
 * @param playbook - The playbook being executed
 * @param context - Evaluation context
 * @returns NextStepResult with next step or null if complete
 */
export function computeNextStep(
  execution: PlaybookExecution,
  playbook: CommunicationPlaybook,
  context: PlaybookConditionContext,
): NextStepResult {
  // If execution is completed or aborted, no next step
  if (execution.status !== 'running') {
    return { nextStepNumber: null, action: null, reason: `Execution is ${execution.status}` };
  }

  // Find the next pending step after current
  for (const step of playbook.steps) {
    if (step.stepNumber <= execution.currentStep) continue;

    const stepStatus = execution.stepStatuses.find((s) => s.stepNumber === step.stepNumber);
    if (stepStatus && stepStatus.status !== 'pending') continue;

    // Evaluate condition
    if (evaluateStepCondition(step.condition, context)) {
      return {
        nextStepNumber: step.stepNumber,
        action: step,
        reason: `Step ${step.stepNumber} condition met: ${step.condition}`,
      };
    } else {
      // Condition not met — skip
      continue;
    }
  }

  return { nextStepNumber: null, action: null, reason: 'All steps completed or conditions not met' };
}

/**
 * Advance execution state after a step completes.
 * Returns a new PlaybookExecution (immutable).
 *
 * @param execution - Current execution state
 * @param stepResult - Result of the completed step
 * @returns Updated PlaybookExecution
 */
export function advanceExecution(
  execution: PlaybookExecution,
  stepResult: StepResult,
): PlaybookExecution {
  const newStatus: PlaybookStepExecutionStatus = stepResult.success ? 'executed' : 'failed';

  const updatedStepStatuses: StepExecutionStatus[] = execution.stepStatuses.map((ss) => {
    if (ss.stepNumber === stepResult.stepNumber) {
      return {
        ...ss,
        status: newStatus,
        executedAt: new Date().toISOString(),
        reason: stepResult.failureReason ?? null,
      };
    }
    return ss;
  });

  // If step not in stepStatuses, add it
  if (!execution.stepStatuses.find((ss) => ss.stepNumber === stepResult.stepNumber)) {
    updatedStepStatuses.push({
      stepNumber: stepResult.stepNumber,
      status: newStatus,
      executedAt: new Date().toISOString(),
      reason: stepResult.failureReason ?? null,
    });
  }

  // Determine if execution is complete
  const allDone = updatedStepStatuses.every((ss) => ss.status !== 'pending');
  const anyFailed = updatedStepStatuses.some((ss) => ss.status === 'failed');

  let executionStatus = execution.status;
  let completedAt = execution.completed_at;

  if (anyFailed && !stepResult.success) {
    executionStatus = 'aborted';
    completedAt = new Date().toISOString();
  } else if (allDone) {
    executionStatus = 'completed';
    completedAt = new Date().toISOString();
  }

  return {
    ...execution,
    currentStep: stepResult.stepNumber,
    stepStatuses: updatedStepStatuses,
    status: executionStatus,
    completed_at: completedAt,
    updated_at: new Date().toISOString(),
  };
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Parse an ISO 8601 duration or simple duration string to milliseconds.
 * Supports: PT1H, PT30M, P1D, 1h, 30m, 1d, 24h
 */
function parseDuration(duration: string): number {
  // ISO 8601 duration
  const isoMatch = duration.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (isoMatch) {
    const days = parseInt(isoMatch[1] || '0', 10);
    const hours = parseInt(isoMatch[2] || '0', 10);
    const minutes = parseInt(isoMatch[3] || '0', 10);
    const seconds = parseInt(isoMatch[4] || '0', 10);
    return ((days * 24 + hours) * 60 + minutes) * 60000 + seconds * 1000;
  }

  // Simple duration: 1h, 30m, 1d
  const simpleMatch = duration.match(/^(\d+)([dhms])$/);
  if (simpleMatch) {
    const value = parseInt(simpleMatch[1], 10);
    switch (simpleMatch[2]) {
      case 'd': return value * 86400000;
      case 'h': return value * 3600000;
      case 'm': return value * 60000;
      case 's': return value * 1000;
    }
  }

  // Default: treat as hours
  const numValue = parseInt(duration, 10);
  return isNaN(numValue) ? 0 : numValue * 3600000;
}
