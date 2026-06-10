/**
 * Case Reopening Evaluator — Commander C2
 *
 * Consumes Reopening Trigger Strategy from Spec 43.
 * NEVER hardcodes reopening triggers. Returns 'unresolved' if strategy data is missing.
 *
 * Source: Spec #32 §Strategy Surfaces (Reopening Trigger Strategy)
 */

import type { StrategyPolicy } from '../entities/strategy';

export interface ReopeningResolution {
  status: 'resolved' | 'unresolved';
  triggers: string[] | null;
  source_policy: { id: string; version: string } | null;
  reason: string;
}

export function resolveReopeningTriggers(
  strategies: StrategyPolicy[],
): ReopeningResolution {
  const policy = strategies.find(
    (s) => s.surface_type === 'reopening-trigger' && s.status === 'active',
  );

  if (!policy) {
    return { status: 'unresolved', triggers: null, source_policy: null, reason: 'No active reopening-trigger strategy policy found' };
  }

  const config = policy.configuration as { triggers?: string[] };

  if (!config.triggers || config.triggers.length === 0) {
    return { status: 'unresolved', triggers: null, source_policy: { id: policy.id, version: policy.policy_version }, reason: 'Reopening trigger strategy has no triggers configured' };
  }

  return {
    status: 'resolved',
    triggers: config.triggers,
    source_policy: { id: policy.id, version: policy.policy_version },
    reason: `Resolved ${config.triggers.length} reopening triggers`,
  };
}
