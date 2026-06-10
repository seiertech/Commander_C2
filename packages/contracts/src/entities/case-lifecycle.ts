/**
 * Case Lifecycle State Machine — Commander C2 (12-State Closed-Loop)
 *
 * Source: Spec #08 Case Management, Spec #30 Case Validation and Closure
 * Unit 7: Rebaselined 12-state lifecycle engine.
 *
 * Doctrinal Assertion 1: Cases are system-owned. No manual creation, closure, or status edit.
 *
 * 12-State Transition Graph:
 *   detected → bound (binding-engine)
 *   bound → routed (routing-engine)
 *   routed → prioritised (prioritisation-engine)
 *   prioritised → action_decomposed (system)
 *   action_decomposed → in_progress (system)
 *   in_progress → pending_validation (system)
 *   pending_validation → validation_running (validation-engine)
 *   validation_running → validated_pass (validation-engine)
 *   validation_running → validated_fail (validation-engine)
 *   validated_pass → pending_closure_gates (closure-engine)
 *   validated_fail → in_progress (system) [remediation loop]
 *   pending_closure_gates → closed_by_system (closure-engine)
 *   closed_by_system → reopened_by_system (reopening-engine)
 *   reopened_by_system → in_progress (system)
 *
 * Actor enforcement: each transition has a specific permitted actor set.
 */

import type { CaseStatus } from './case';

/**
 * Actors permitted to perform lifecycle transitions.
 * Each engine actor is responsible for specific transitions.
 */
export type LifecycleActor =
  | 'system'
  | 'routing-engine'
  | 'binding-engine'
  | 'prioritisation-engine'
  | 'validation-engine'
  | 'closure-engine'
  | 'reopening-engine'
  | 'reassessment-engine'
  | 'correlation-engine'
  | 'enrichment-engine'
  | 'effectiveness-engine'
  | 'war-room-activation-engine'
  | 'war-room-communication-engine'
  | 'close-out-engine'
  | 'war-room-ai-engine';

/** All valid lifecycle actors */
export const LIFECYCLE_ACTORS: readonly LifecycleActor[] = [
  'system',
  'routing-engine',
  'binding-engine',
  'prioritisation-engine',
  'validation-engine',
  'closure-engine',
  'reopening-engine',
  'reassessment-engine',
  'correlation-engine',
  'enrichment-engine',
  'effectiveness-engine',
  'war-room-activation-engine',
  'war-room-communication-engine',
  'close-out-engine',
  'war-room-ai-engine',
] as const;

/** A single allowed state transition with permitted actors */
export interface CaseTransition {
  from: CaseStatus;
  to: CaseStatus;
  /** Actors permitted to execute this specific transition */
  permittedActors: readonly LifecycleActor[];
}

/** Transition request — required for every lifecycle change */
export interface TransitionRequest {
  /** The transition being requested */
  transition: { from: CaseStatus; to: CaseStatus };
  /** Actor performing the transition */
  actor: LifecycleActor;
  /** Reason for the transition */
  reason: string;
  /** Reference to the audit event recording this transition */
  auditEventRef: string;
}

/**
 * ALLOWED_TRANSITIONS — the complete 12-state lifecycle transition graph.
 * No other transitions are permitted. Manual creation and manual closure are forbidden.
 * Each transition declares its permitted actor set.
 */
export const ALLOWED_TRANSITIONS: readonly CaseTransition[] = [
  { from: 'detected', to: 'bound', permittedActors: ['binding-engine'] },
  { from: 'bound', to: 'routed', permittedActors: ['routing-engine'] },
  { from: 'routed', to: 'prioritised', permittedActors: ['prioritisation-engine'] },
  { from: 'prioritised', to: 'action_decomposed', permittedActors: ['system'] },
  { from: 'action_decomposed', to: 'in_progress', permittedActors: ['system'] },
  { from: 'in_progress', to: 'pending_validation', permittedActors: ['system'] },
  { from: 'in_progress', to: 'prioritised', permittedActors: ['prioritisation-engine'] },
  { from: 'pending_validation', to: 'validation_running', permittedActors: ['validation-engine'] },
  { from: 'validation_running', to: 'validated_pass', permittedActors: ['validation-engine'] },
  { from: 'validation_running', to: 'validated_fail', permittedActors: ['validation-engine'] },
  { from: 'validated_pass', to: 'pending_closure_gates', permittedActors: ['closure-engine'] },
  { from: 'validated_fail', to: 'in_progress', permittedActors: ['system'] },
  { from: 'pending_closure_gates', to: 'closed_by_system', permittedActors: ['closure-engine'] },
  { from: 'closed_by_system', to: 'reopened_by_system', permittedActors: ['reopening-engine'] },
  { from: 'reopened_by_system', to: 'in_progress', permittedActors: ['system'] },
] as const;

/**
 * Check if a transition is allowed by the lifecycle state machine.
 */
export function isTransitionAllowed(from: CaseStatus, to: CaseStatus): boolean {
  return ALLOWED_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

/**
 * Get all valid next states from a given status.
 */
export function getNextStates(from: CaseStatus): CaseStatus[] {
  return ALLOWED_TRANSITIONS.filter((t) => t.from === from).map((t) => t.to);
}

/**
 * Get the permitted actors for a specific transition.
 * Returns empty array if transition is not allowed.
 */
export function getPermittedActors(from: CaseStatus, to: CaseStatus): readonly LifecycleActor[] {
  const transition = ALLOWED_TRANSITIONS.find((t) => t.from === from && t.to === to);
  return transition ? transition.permittedActors : [];
}

// ─── Phase D1: Lifecycle Transition Engine (12-State) ────────────────────────

/** Immutable record of a case lifecycle transition */
export interface CaseTransitionRecord {
  id: string;
  caseId: string;
  from: CaseStatus;
  to: CaseStatus;
  actor: LifecycleActor;
  reason: string;
  auditEventRef: string;
  timestamp: string; // ISO 8601
  /** War Room dual-attribution — links transition to coordinating War Room if applicable */
  warRoomId?: string | null;
}

/** Result of executing a lifecycle transition */
export interface TransitionResult {
  success: boolean;
  newStatus: CaseStatus | null;
  previousStatus: CaseStatus;
  auditEvent: CaseTransitionRecord | null;
  error: string | null;
}

/** Full lifecycle history for a case */
export interface CaseLifecycleHistory {
  caseId: string;
  records: CaseTransitionRecord[];
}

/**
 * Execute a lifecycle transition against the 12-state case state machine.
 *
 * Rules (Doctrinal Assertion 1):
 * - Actor MUST be a valid LifecycleActor
 * - Actor MUST be permitted for the specific transition
 * - Transition MUST be in ALLOWED_TRANSITIONS
 * - request.transition.from MUST match currentStatus
 */
export function executeTransition(
  caseId: string,
  currentStatus: CaseStatus,
  request: TransitionRequest,
): TransitionResult {
  // 1. Validate actor is a known lifecycle actor
  if (!LIFECYCLE_ACTORS.includes(request.actor as LifecycleActor)) {
    return {
      success: false,
      newStatus: null,
      previousStatus: currentStatus,
      auditEvent: null,
      error: `Invalid actor '${request.actor}'. Must be one of: ${LIFECYCLE_ACTORS.join(', ')}.`,
    };
  }

  // 2. Validate request.transition.from matches currentStatus
  if (request.transition.from !== currentStatus) {
    return {
      success: false,
      newStatus: null,
      previousStatus: currentStatus,
      auditEvent: null,
      error: `Transition 'from' state '${request.transition.from}' does not match current status '${currentStatus}'.`,
    };
  }

  // 3. Validate transition is allowed
  if (!isTransitionAllowed(request.transition.from, request.transition.to)) {
    return {
      success: false,
      newStatus: null,
      previousStatus: currentStatus,
      auditEvent: null,
      error: `Transition from '${request.transition.from}' to '${request.transition.to}' is not allowed.`,
    };
  }

  // 4. Validate actor is permitted for this specific transition
  const permittedActors = getPermittedActors(request.transition.from, request.transition.to);
  if (!permittedActors.includes(request.actor)) {
    return {
      success: false,
      newStatus: null,
      previousStatus: currentStatus,
      auditEvent: null,
      error: `Actor '${request.actor}' is not permitted for transition '${request.transition.from}' → '${request.transition.to}'. Permitted: ${permittedActors.join(', ')}.`,
    };
  }

  // 5. Success — produce transition record
  const record: CaseTransitionRecord = {
    id: `txn-${caseId}-${Date.now()}`,
    caseId,
    from: currentStatus,
    to: request.transition.to,
    actor: request.actor,
    reason: request.reason,
    auditEventRef: request.auditEventRef,
    timestamp: new Date().toISOString(),
  };

  return {
    success: true,
    newStatus: request.transition.to,
    previousStatus: currentStatus,
    auditEvent: record,
    error: null,
  };
}

/** Append a transition record to history (immutable) */
export function appendTransitionRecord(
  history: CaseLifecycleHistory,
  record: CaseTransitionRecord,
): CaseLifecycleHistory {
  return { ...history, records: [...history.records, record] };
}

/** Get the current status from history (last transition's 'to' state, or 'detected' if empty) */
export function getCurrentStatusFromHistory(history: CaseLifecycleHistory): CaseStatus {
  if (history.records.length === 0) return 'detected';
  return history.records[history.records.length - 1].to;
}
