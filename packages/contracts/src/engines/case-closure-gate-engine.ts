/**
 * Case Closure Gate Engine — Commander C2 (Unit 12)
 *
 * 12-gate closure evaluation engine with strategy-driven gate configuration.
 * Consumes Closure Gate Strategy for all gate definitions.
 * NO hardcoded gate lists. Returns error if strategy is missing.
 *
 * Source: Spec #06 Case Management, Spec #32 §Closure Gate Strategy
 * Doctrinal constraints:
 *   - Strategy-layer consumption (constraint #9)
 *   - Closed-loop case model (constraint #1)
 *   - System-owned closure only — no manual closure path exists
 */

import type { StrategyPolicy } from '../entities/strategy';

// ─── Types ───────────────────────────────────────────────────────────────────

/** All 12 closure gate types */
export type ClosureGateType =
  | 'technical_validation'
  | 'sub_action_completion'
  | 'communication'
  | 'external_notifier'
  | 'sir_acknowledgement'
  | 'sla_residual_phase'
  | 'exception_suppression_expiry'
  | 'evidence_freshness'
  | 'approval'
  | 'audit_completeness'
  | 'mission_impact'
  | 'fusion_map_state_refresh';

/** Gate status */
export type GateStatus = 'not_evaluated' | 'passed' | 'failed' | 'skipped' | 'not_configured';

/** Individual gate evaluation input */
export interface GateInput {
  technicalValidationPassed: boolean;
  allSubActionsComplete: boolean;
  communicationSent: boolean;
  externalNotifierAcknowledged: boolean;
  sirAcknowledged: boolean;
  slaResidualPhaseComplete: boolean;
  exceptionsExpired: boolean;
  evidenceFresh: boolean;
  approvalGranted: boolean;
  auditComplete: boolean;
  missionImpactAssessed: boolean;
  fusionMapRefreshed: boolean;
}

/** Per-gate result */
export interface GateResult {
  gate: ClosureGateType;
  status: GateStatus;
  reason: string;
  evaluated_at: string;
}

/** Case closure gate state (tracking) */
export interface CaseClosureGateState {
  case_id: string;
  configuredGates: ClosureGateType[];
  gate_results: GateResult[];
  allGatesPass: boolean;
  closurePermitted: boolean;
  evaluated_at: string;
}

/** Closure gate evaluation request */
export interface ClosureGateEvaluationRequest {
  case_id: string;
  gateInput: GateInput;
  current_time: string;
}

/** Closure gate evaluation result */
export interface ClosureGateEvaluationResult {
  success: boolean;
  closureGateState: CaseClosureGateState | null;
  closurePermitted: boolean;
  failedGates: GateResult[];
  rationale: string;
  source_policy: { id: string; version: string } | null;
  error: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** All 12 closure gate types as a constant array */
export const CLOSURE_GATE_TYPES: ClosureGateType[] = [
  'technical_validation',
  'sub_action_completion',
  'communication',
  'external_notifier',
  'sir_acknowledgement',
  'sla_residual_phase',
  'exception_suppression_expiry',
  'evidence_freshness',
  'approval',
  'audit_completeness',
  'mission_impact',
  'fusion_map_state_refresh',
];

// ─── Gate Evaluation Mapping ─────────────────────────────────────────────────

/**
 * Maps each gate type to its evaluation logic against GateInput.
 * Each evaluator returns { passed, reason }.
 */
const GATE_EVALUATORS: Record<ClosureGateType, (input: GateInput) => { passed: boolean; reason: string }> = {
  technical_validation: (input) => ({
    passed: input.technicalValidationPassed,
    reason: input.technicalValidationPassed
      ? 'Technical validation has passed'
      : 'Technical validation has not passed',
  }),
  sub_action_completion: (input) => ({
    passed: input.allSubActionsComplete,
    reason: input.allSubActionsComplete
      ? 'All sub-actions are complete'
      : 'Not all sub-actions are complete',
  }),
  communication: (input) => ({
    passed: input.communicationSent,
    reason: input.communicationSent
      ? 'Communication has been sent'
      : 'Communication has not been sent',
  }),
  external_notifier: (input) => ({
    passed: input.externalNotifierAcknowledged,
    reason: input.externalNotifierAcknowledged
      ? 'External notifier has acknowledged'
      : 'External notifier has not acknowledged',
  }),
  sir_acknowledgement: (input) => ({
    passed: input.sirAcknowledged,
    reason: input.sirAcknowledged
      ? 'SIR has been acknowledged'
      : 'SIR has not been acknowledged',
  }),
  sla_residual_phase: (input) => ({
    passed: input.slaResidualPhaseComplete,
    reason: input.slaResidualPhaseComplete
      ? 'SLA residual phase is complete'
      : 'SLA residual phase is not complete',
  }),
  exception_suppression_expiry: (input) => ({
    passed: input.exceptionsExpired,
    reason: input.exceptionsExpired
      ? 'All exceptions have expired'
      : 'Active exceptions remain',
  }),
  evidence_freshness: (input) => ({
    passed: input.evidenceFresh,
    reason: input.evidenceFresh
      ? 'Evidence is fresh'
      : 'Evidence is stale',
  }),
  approval: (input) => ({
    passed: input.approvalGranted,
    reason: input.approvalGranted
      ? 'Approval has been granted'
      : 'Approval has not been granted',
  }),
  audit_completeness: (input) => ({
    passed: input.auditComplete,
    reason: input.auditComplete
      ? 'Audit is complete'
      : 'Audit is not complete',
  }),
  mission_impact: (input) => ({
    passed: input.missionImpactAssessed,
    reason: input.missionImpactAssessed
      ? 'Mission impact has been assessed'
      : 'Mission impact has not been assessed',
  }),
  fusion_map_state_refresh: (input) => ({
    passed: input.fusionMapRefreshed,
    reason: input.fusionMapRefreshed
      ? 'Fusion map state has been refreshed'
      : 'Fusion map state has not been refreshed',
  }),
};

// ─── Gate Evaluation Functions ───────────────────────────────────────────────

/**
 * Evaluate a single closure gate against the provided input.
 */
export function evaluateGate(
  gate: ClosureGateType,
  input: GateInput,
  current_time: string,
): GateResult {
  const evaluator = GATE_EVALUATORS[gate];
  const { passed, reason } = evaluator(input);

  return {
    gate,
    status: passed ? 'passed' : 'failed',
    reason,
    evaluated_at: currentTime,
  };
}

/**
 * Evaluate all configured gates and produce a CaseClosureGateState.
 * Gates not in the configured list are marked 'not_configured' and skipped.
 * Only configured gates must pass for closure.
 */
export function evaluateAllGates(
  configuredGates: ClosureGateType[],
  input: GateInput,
  current_time: string,
): CaseClosureGateState {
  const gate_results: GateResult[] = CLOSURE_GATE_TYPES.map((gate) => {
    if (!configuredGates.includes(gate)) {
      return {
        gate,
        status: 'not_configured' as GateStatus,
        reason: `Gate '${gate}' is not configured in the closure gate strategy`,
        evaluated_at: currentTime,
      };
    }
    return evaluateGate(gate, input, currentTime);
  });

  const configuredResults = gateResults.filter((r) => r.status !== 'not_configured');
  const allGatesPass = configuredResults.every((r) => r.status === 'passed');

  return {
    case_id: '',
    configuredGates,
    gate_results,
    allGatesPass,
    closurePermitted: allGatesPass,
    evaluated_at: currentTime,
  };
}

/**
 * Extract closure gate configuration from strategy policies.
 * Returns the configured gates and the source policy.
 * Returns null if no active closure-gate strategy is found.
 */
export function extractClosureGateConfig(
  strategies: StrategyPolicy[],
): { gates: ClosureGateType[]; policy: StrategyPolicy } | null {
  const policy = strategies.find(
    (s) => s.surface_type === 'closure-gate' && s.status === 'active',
  );

  if (!policy) {
    return null;
  }

  const config = policy.configuration as { gates?: string[] };

  if (!config.gates || config.gates.length === 0) {
    return null;
  }

  // Filter to only valid ClosureGateType values
  const validGates = config.gates.filter(
    (g): g is ClosureGateType => CLOSURE_GATE_TYPES.includes(g as ClosureGateType),
  );

  return { gates: validGates, policy };
}

/**
 * Main entry point: evaluate closure readiness for a case.
 *
 * Algorithm:
 * 1. Extract closure gate configuration from strategy
 * 2. Evaluate all configured gates against input
 * 3. Determine if closure is permitted (all configured gates must pass)
 * 4. Return comprehensive result with gate state, failed gates, and rationale
 *
 * Returns error result (success: false) if closure-gate strategy is missing.
 */
export function evaluateClosureReadiness(
  request: ClosureGateEvaluationRequest,
  strategies: StrategyPolicy[],
): ClosureGateEvaluationResult {
  const config = extractClosureGateConfig(strategies);

  if (!config) {
    return {
      success: false,
      closureGateState: null,
      closurePermitted: false,
      failedGates: [],
      rationale: '',
      source_policy: null,
      error: '[ClosureGateEngine] STRATEGY GAP: No active closure-gate strategy policy found or strategy has no gates configured. Cannot evaluate closure readiness without strategy configuration.',
    };
  }

  const { gates, policy } = config;

  const gateState = evaluateAllGates(gates, request.gateInput, request.current_time);
  gateState.case_id = request.case_id;

  const failedGates = gateState.gate_results.filter((r) => r.status === 'failed');

  const rationale = gateState.closurePermitted
    ? `All ${gates.length} configured closure gates passed. Closure is permitted.`
    : `${failedGates.length} of ${gates.length} configured closure gates failed. Closure is blocked.`;

  return {
    success: true,
    closureGateState: gateState,
    closurePermitted: gateState.closurePermitted,
    failedGates,
    rationale,
    source_policy: { id: policy.id, version: policy.policy_version },
    error: null,
  };
}

/**
 * Doctrinal assertion: manual closure is always blocked.
 * System-owned closure only — no manual closure path exists.
 * This function always returns true (closure is system-owned).
 */
export function isManualClosureBlocked(): true {
  return true;
}
