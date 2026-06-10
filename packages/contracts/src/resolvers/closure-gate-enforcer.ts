/**
 * Closure Gate Enforcer — Commander SDR
 *
 * Phase D3: Evaluates closure gates for a case in awaiting-closure state.
 * ALL gate definitions consumed from the closure-gate strategy policy (Spec 43).
 * NO hardcoded defaults. Throws if strategy is missing.
 *
 * Source: Spec #06 Case Management, Spec #32 §Closure Gate Strategy
 */

import type { StrategyPolicy } from '../entities/strategy';

/** Input conditions for closure gate evaluation */
export interface GateEvaluationInput {
  /** Has remediation been verified? */
  remediationVerified: boolean;
  /** Has validation passed? */
  validationPassed: boolean;
  /** Is there active drift on the case? */
  hasActiveDrift: boolean;
  /** Is the SLA breached? */
  slaBreached: boolean;
}

/** Result of closure gate evaluation */
export interface ClosureGateResult {
  /** Whether ALL gates pass (case can proceed to closed) */
  allGatesPass: boolean;
  /** Individual gate results */
  gateResults: { gate: string; passed: boolean; reason: string }[];
  /** Strategy reference for audit */
  strategyRef: { policyId: string; policyVersion: string };
}

/**
 * Gate evaluation mapping — maps gate names to their evaluation logic.
 * Each gate returns true if the gate PASSES.
 */
const GATE_EVALUATORS: Record<string, (input: GateEvaluationInput) => { passed: boolean; reason: string }> = {
  'remediation-verified': (input) => ({
    passed: input.remediationVerified === true,
    reason: input.remediationVerified
      ? 'Remediation has been verified'
      : 'Remediation has not been verified',
  }),
  'validation-passed': (input) => ({
    passed: input.validationPassed === true,
    reason: input.validationPassed
      ? 'Validation has passed'
      : 'Validation has not passed',
  }),
  'no-active-drift': (input) => ({
    passed: input.hasActiveDrift === false,
    reason: input.hasActiveDrift
      ? 'Active drift detected on case'
      : 'No active drift on case',
  }),
  'sla-not-breached': (input) => ({
    passed: input.slaBreached === false,
    reason: input.slaBreached
      ? 'SLA has been breached'
      : 'SLA has not been breached',
  }),
};

/**
 * Evaluate closure gates for a case in awaiting-closure state.
 * ALL gate definitions come from the closure-gate strategy policy.
 * @throws Error if no active closure-gate strategy found
 */
export function evaluateClosureGates(
  input: GateEvaluationInput,
  strategies: StrategyPolicy[],
): ClosureGateResult {
  const policy = strategies.find(
    (s) => s.surfaceType === 'closure-gate' && s.status === 'active',
  );

  if (!policy) {
    throw new Error(
      'No active closure-gate strategy policy found. Cannot evaluate closure gates without strategy configuration.',
    );
  }

  const config = policy.configuration as { gates?: string[] };

  if (!config.gates || config.gates.length === 0) {
    throw new Error(
      'Closure gate strategy has no gates configured. Cannot evaluate closure gates without gate definitions.',
    );
  }

  const gateResults = config.gates.map((gate) => {
    const evaluator = GATE_EVALUATORS[gate];
    if (!evaluator) {
      return { gate, passed: false, reason: `Unknown gate '${gate}' — no evaluator available` };
    }
    const result = evaluator(input);
    return { gate, ...result };
  });

  const allGatesPass = gateResults.every((r) => r.passed);

  return {
    allGatesPass,
    gateResults,
    strategyRef: {
      policyId: policy.id,
      policyVersion: policy.policyVersion,
    },
  };
}
