/**
 * Case Validation Engine — Commander C2 (Unit 11)
 *
 * 11-state validation lifecycle engine with strategy-driven window enforcement.
 * Consumes Validation Window Strategy for all timing values.
 * NO hardcoded validation windows. Returns error if strategy is missing.
 *
 * Source: Spec #06 Case Management, Spec #32 §Validation Window Strategy
 * Doctrinal constraints:
 *   - Strategy-layer consumption (constraint #9)
 *   - Closed-loop case model (constraint #1)
 */

import type { StrategyPolicy } from '../entities/strategy';
import { resolveValidationWindow } from '../resolvers/case-validation-evaluator';

// ─── Types ───────────────────────────────────────────────────────────────────

/** 11 validation states */
export type ValidationState =
  | 'not_started'
  | 'evidence_requested'
  | 'evidence_received'
  | 'validation_running'
  | 'validated_fixed'
  | 'validated_compensated'
  | 'validated_not_fixed'
  | 'validation_inconclusive'
  | 'validation_blocked'
  | 'validation_expired'
  | 'revalidation_required';

/** 11 validation trigger types */
export type ValidationTriggerType =
  | 'source_refresh'
  | 'connector_delta'
  | 'owner_evidence'
  | 'push_execution'
  | 'bas_result'
  | 'siem_soar_deployment'
  | 'control_state_change'
  | 'scanner_refresh'
  | 'identity_graph_change'
  | 'architecture_graph_change'
  | 'communication_evidence';

/** Validation transition */
export interface ValidationTransition {
  from: ValidationState;
  to: ValidationState;
  trigger: ValidationTriggerType | 'system' | 'expiry';
}

/** Evidence record */
export interface EvidenceRecord {
  id: string;
  triggerType: ValidationTriggerType;
  received_at: string; // ISO 8601
  fresh: boolean;
  source_connector_id: string;
}

/** Validation lifecycle state for a case */
export interface CaseValidationState {
  case_id: string;
  current_state: ValidationState;
  enteredStateAt: string;
  evidenceRecords: EvidenceRecord[];
  windowExpiresAt: string | null;
  lastFreshnessCheck: string | null;
  revalidationRequired: boolean;
}

/** Validation evaluation request */
export interface ValidationEvaluationRequest {
  case_id: string;
  current_state: ValidationState;
  enteredStateAt: string;
  evidenceRecords: EvidenceRecord[];
  current_time: string;
}

/** Validation evaluation result */
export interface ValidationEvaluationResult {
  success: boolean;
  newState: ValidationState | null;
  transition: ValidationTransition | null;
  windowState: { withinWindow: boolean; evidenceFresh: boolean; refreshDue: boolean } | null;
  revalidationRequired: boolean;
  rationale: string;
  error: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** All 11 validation states */
export const VALIDATION_STATES: ValidationState[] = [
  'not_started',
  'evidence_requested',
  'evidence_received',
  'validation_running',
  'validated_fixed',
  'validated_compensated',
  'validated_not_fixed',
  'validation_inconclusive',
  'validation_blocked',
  'validation_expired',
  'revalidation_required',
];

/** All 11 validation trigger types */
export const VALIDATION_TRIGGER_TYPES: ValidationTriggerType[] = [
  'source_refresh',
  'connector_delta',
  'owner_evidence',
  'push_execution',
  'bas_result',
  'siem_soar_deployment',
  'control_state_change',
  'scanner_refresh',
  'identity_graph_change',
  'architecture_graph_change',
  'communication_evidence',
];

/**
 * Complete transition graph for the validation lifecycle.
 *
 * Transition rules:
 *   not_started → evidence_requested (any validation trigger)
 *   evidence_requested → evidence_received (any evidence trigger)
 *   evidence_received → validation_running (system — auto-start)
 *   validation_running → validated_fixed | validated_compensated | validated_not_fixed
 *                       | validation_inconclusive | validation_blocked (system — outcome)
 *   validation_running → validation_expired (expiry — window exceeded)
 *   validated_not_fixed → revalidation_required (system)
 *   validation_inconclusive → revalidation_required (system)
 *   validation_blocked → revalidation_required (system)
 *   validation_expired → revalidation_required (expiry)
 *   revalidation_required → evidence_requested (any validation trigger — restart)
 */
export const VALIDATION_TRANSITIONS: ValidationTransition[] = [
  // not_started → evidence_requested (any validation trigger)
  ...VALIDATION_TRIGGER_TYPES.map((trigger): ValidationTransition => ({
    from: 'not_started',
    to: 'evidence_requested',
    trigger,
  })),
  // evidence_requested → evidence_received (any evidence trigger)
  ...VALIDATION_TRIGGER_TYPES.map((trigger): ValidationTransition => ({
    from: 'evidence_requested',
    to: 'evidence_received',
    trigger,
  })),
  // evidence_received → validation_running (system auto-start)
  { from: 'evidence_received', to: 'validation_running', trigger: 'system' },
  // validation_running → outcome states (system)
  { from: 'validation_running', to: 'validated_fixed', trigger: 'system' },
  { from: 'validation_running', to: 'validated_compensated', trigger: 'system' },
  { from: 'validation_running', to: 'validated_not_fixed', trigger: 'system' },
  { from: 'validation_running', to: 'validation_inconclusive', trigger: 'system' },
  { from: 'validation_running', to: 'validation_blocked', trigger: 'system' },
  // validation_running → validation_expired (expiry)
  { from: 'validation_running', to: 'validation_expired', trigger: 'expiry' },
  // failure states → revalidation_required
  { from: 'validated_not_fixed', to: 'revalidation_required', trigger: 'system' },
  { from: 'validation_inconclusive', to: 'revalidation_required', trigger: 'system' },
  { from: 'validation_blocked', to: 'revalidation_required', trigger: 'system' },
  { from: 'validation_expired', to: 'revalidation_required', trigger: 'expiry' },
  // revalidation_required → evidence_requested (any validation trigger — restart)
  ...VALIDATION_TRIGGER_TYPES.map((trigger): ValidationTransition => ({
    from: 'revalidation_required',
    to: 'evidence_requested',
    trigger,
  })),
];

// ─── Transition Functions ────────────────────────────────────────────────────

/**
 * Check if a transition from one state to another is allowed.
 */
export function isValidationTransitionAllowed(
  from: ValidationState,
  to: ValidationState,
): boolean {
  return VALIDATION_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

/**
 * Get all reachable states from a given state.
 */
export function getNextValidationStates(from: ValidationState): ValidationState[] {
  const states = VALIDATION_TRANSITIONS
    .filter((t) => t.from === from)
    .map((t) => t.to);
  return [...new Set(states)];
}

/**
 * Execute a validation state transition.
 * Returns the transition result or an error if the transition is not allowed.
 */
export function executeValidationTransition(
  state: CaseValidationState,
  to: ValidationState,
  trigger: ValidationTriggerType | 'system' | 'expiry',
): { success: boolean; newState: CaseValidationState | null; transition: ValidationTransition | null; error: string | null } {
  const from = state.current_state;

  // Check if this specific transition (from, to, trigger) is allowed
  const matchingTransition = VALIDATION_TRANSITIONS.find(
    (t) => t.from === from && t.to === to && t.trigger === trigger,
  );

  if (!matchingTransition) {
    return {
      success: false,
      newState: null,
      transition: null,
      error: `Transition from '${from}' to '${to}' with trigger '${trigger}' is not allowed`,
    };
  }

  const now = new Date().toISOString();
  const newState: CaseValidationState = {
    ...state,
    current_state: to,
    enteredStateAt: now,
    revalidationRequired: to === 'revalidation_required',
  };

  return {
    success: true,
    newState,
    transition: matchingTransition,
    error: null,
  };
}

// ─── Evidence Freshness ──────────────────────────────────────────────────────

/**
 * Check evidence freshness against strategy-driven freshness hours.
 * Returns which records are fresh and which are stale.
 */
export function checkEvidenceFreshness(
  records: EvidenceRecord[],
  freshnessHours: number,
  current_time: string,
): { allFresh: boolean; staleRecords: EvidenceRecord[] } {
  const now = new Date(currentTime).getTime();
  const freshnessMs = freshnessHours * 60 * 60 * 1000;

  const staleRecords = records.filter((record) => {
    const receivedAt = new Date(record.received_at).getTime();
    return (now - receivedAt) >= freshnessMs;
  });

  return {
    allFresh: staleRecords.length === 0,
    staleRecords,
  };
}

// ─── Window Expiry ───────────────────────────────────────────────────────────

/**
 * Check if the validation window has expired.
 * Uses strategy-driven window hours.
 */
export function checkWindowExpiry(
  enteredStateAt: string,
  window_hours: number,
  current_time: string,
): { expired: boolean; hoursRemaining: number } {
  const enteredAt = new Date(enteredStateAt).getTime();
  const now = new Date(currentTime).getTime();
  const windowMs = windowHours * 60 * 60 * 1000;

  const elapsed = now - enteredAt;
  const remaining = windowMs - elapsed;
  const hoursRemaining = Math.max(0, remaining / (1000 * 60 * 60));

  return {
    expired: elapsed >= windowMs,
    hoursRemaining,
  };
}

// ─── Revalidation Trigger ────────────────────────────────────────────────────

/**
 * Determine if revalidation should be triggered.
 * Revalidation is required when:
 * - Evidence has expired (stale beyond freshness window)
 * - Validation window has been exceeded
 * - Current state is one of the failure/inconclusive/blocked/expired states
 */
export function shouldTriggerRevalidation(
  state: CaseValidationState,
  strategies: StrategyPolicy[],
  current_time: string,
): boolean {
  const resolution = resolveValidationWindow(strategies);

  if (resolution.status === 'unresolved') {
    return false;
  }

  const { window_hours, freshnessHours } = resolution;

  // States that can trigger revalidation
  const revalidatableStates: ValidationState[] = [
    'validated_not_fixed',
    'validation_inconclusive',
    'validation_blocked',
    'validation_expired',
  ];

  if (!revalidatableStates.includes(state.current_state)) {
    return false;
  }

  // Check if window has expired
  if (windowHours !== null) {
    const windowCheck = checkWindowExpiry(state.enteredStateAt, window_hours, currentTime);
    if (windowCheck.expired) {
      return true;
    }
  }

  // Check if evidence has expired
  if (freshnessHours !== null && state.evidenceRecords.length > 0) {
    const freshnessCheck = checkEvidenceFreshness(state.evidenceRecords, freshnessHours, currentTime);
    if (!freshnessCheck.allFresh) {
      return true;
    }
  }

  return false;
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Evaluate validation state for a case using strategy-driven window configuration.
 *
 * Algorithm:
 * 1. Resolve validation window strategy (windowHours, freshnessHours, refreshCadenceHours)
 * 2. Check window expiry
 * 3. Check evidence freshness
 * 4. Determine if state transition is needed
 * 5. Return evaluation result with window state and rationale
 *
 * Returns error result (success: false) if validation-window strategy is missing.
 */
export function evaluateValidation(
  request: ValidationEvaluationRequest,
  strategies: StrategyPolicy[],
): ValidationEvaluationResult {
  const resolution = resolveValidationWindow(strategies);

  if (resolution.status === 'unresolved') {
    return {
      success: false,
      newState: null,
      transition: null,
      windowState: null,
      revalidationRequired: false,
      rationale: '',
      error: `[ValidationEngine] STRATEGY GAP: ${resolution.reason}. Cannot evaluate validation without strategy configuration.`,
    };
  }

  const { window_hours, freshnessHours, refreshCadenceHours } = resolution;

  // Check window expiry
  const windowCheck = checkWindowExpiry(
    request.enteredStateAt,
    windowHours!,
    request.current_time,
  );

  // Check evidence freshness
  const freshnessCheck = freshnessHours !== null
    ? checkEvidenceFreshness(request.evidenceRecords, freshnessHours, request.current_time)
    : { allFresh: true, staleRecords: [] };

  // Check if refresh is due
  let refreshDue = false;
  if (refreshCadenceHours !== null && request.evidenceRecords.length > 0) {
    // Find the most recent evidence
    const mostRecent = request.evidenceRecords.reduce((latest, record) => {
      return new Date(record.received_at).getTime() > new Date(latest.received_at).getTime()
        ? record
        : latest;
    });
    const hoursSinceLastEvidence =
      (new Date(request.current_time).getTime() - new Date(mostRecent.received_at).getTime()) /
      (1000 * 60 * 60);
    refreshDue = hoursSinceLastEvidence >= refreshCadenceHours;
  }

  const windowState = {
    withinWindow: !windowCheck.expired,
    evidenceFresh: freshnessCheck.allFresh,
    refreshDue,
  };

  // Determine if a state transition is needed
  let newState: ValidationState | null = null;
  let transition: ValidationTransition | null = null;
  let revalidationRequired = false;

  // If validation_running and window expired → validation_expired
  if (request.current_state === 'validation_running' && windowCheck.expired) {
    newState = 'validation_expired';
    transition = { from: 'validation_running', to: 'validation_expired', trigger: 'expiry' };
    revalidationRequired = true;
  }
  // If in a failure/inconclusive/blocked/expired state and evidence is stale → revalidation_required
  else if (
    ['validated_not_fixed', 'validation_inconclusive', 'validation_blocked', 'validation_expired'].includes(request.current_state) &&
    !freshnessCheck.allFresh
  ) {
    newState = 'revalidation_required';
    const triggerType = request.current_state === 'validation_expired' ? 'expiry' : 'system';
    transition = { from: request.current_state, to: 'revalidation_required', trigger: triggerType };
    revalidationRequired = true;
  }

  // Build rationale
  let rationale: string;
  if (newState) {
    rationale = `Transition to '${newState}': window ${windowCheck.expired ? 'expired' : `${windowCheck.hoursRemaining.toFixed(1)}h remaining`}, evidence ${freshnessCheck.allFresh ? 'fresh' : `stale (${freshnessCheck.staleRecords.length} records)`}`;
  } else {
    rationale = `No transition needed: window ${windowCheck.expired ? 'expired' : `${windowCheck.hoursRemaining.toFixed(1)}h remaining`}, evidence ${freshnessCheck.allFresh ? 'fresh' : `stale (${freshnessCheck.staleRecords.length} records)`}, refresh ${refreshDue ? 'due' : 'not due'}`;
  }

  return {
    success: true,
    newState,
    transition,
    windowState,
    revalidationRequired,
    rationale,
    error: null,
  };
}
