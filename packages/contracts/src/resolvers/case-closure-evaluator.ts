/**
 * Case Closure Evaluator — Commander C2
 *
 * Consumes Closure Gate Strategy from Spec 43.
 * NEVER hardcodes closure conditions. Returns 'unresolved' if strategy data is missing.
 *
 * Source: Spec #32 §Strategy Surfaces (Closure Gate Strategy)
 */

import type { StrategyPolicy } from '../entities/strategy';

export interface ClosureGateResolution {
  status: 'resolved' | 'unresolved';
  gates: string[] | null;
  sourcePolicy: { id: string; version: string } | null;
  reason: string;
}

export function resolveClosureGates(
  strategies: StrategyPolicy[],
): ClosureGateResolution {
  const policy = strategies.find(
    (s) => s.surfaceType === 'closure-gate' && s.status === 'active',
  );

  if (!policy) {
    return { status: 'unresolved', gates: null, sourcePolicy: null, reason: 'No active closure-gate strategy policy found' };
  }

  const config = policy.configuration as { gates?: string[] };

  if (!config.gates || config.gates.length === 0) {
    return { status: 'unresolved', gates: null, sourcePolicy: { id: policy.id, version: policy.policyVersion }, reason: 'Closure gate strategy has no gates configured' };
  }

  return {
    status: 'resolved',
    gates: config.gates,
    sourcePolicy: { id: policy.id, version: policy.policyVersion },
    reason: `Resolved ${config.gates.length} closure gates`,
  };
}
