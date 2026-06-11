/**
 * Case Prioritiser — Commander C2
 *
 * Consumes Prioritisation Weight Strategy from Spec 43 to assign priority.
 * NEVER hardcodes priority values. Returns 'unresolved' if strategy data is missing.
 * P0 priority MUST come from strategy weights, not a hardcoded rule.
 *
 * Source: Spec #32 §Strategy Surfaces (Prioritisation Weight Strategy)
 * Doctrinal constraint: P0 priority overlay (constraint #2)
 * Doctrinal constraint: Strategy-layer consumption (constraint #9)
 */

import type { StrategyPolicy } from '../entities/strategy';

export interface PriorityResolution {
  status: 'resolved' | 'unresolved';
  weights: Record<string, number> | null;
  source_policy: { id: string; version: string } | null;
  reason: string;
}

/**
 * Resolve prioritisation weights for case scoring.
 * Returns the weight configuration from the active Prioritisation Weight Strategy.
 * Actual priority calculation uses these weights against case evidence — not hardcoded.
 */
export function resolvePriority(
  strategies: StrategyPolicy[],
): PriorityResolution {
  const priorityPolicy = strategies.find(
    (s) => s.surface_type === 'prioritisation-weight' && s.status === 'active',
  );

  if (!priorityPolicy) {
    return { status: 'unresolved', weights: null, source_policy: null, reason: 'No active prioritisation-weight strategy policy found' };
  }

  const config = priorityPolicy.configuration as { weights?: Record<string, number> };

  if (!config.weights || Object.keys(config.weights).length === 0) {
    return { status: 'unresolved', weights: null, source_policy: { id: priorityPolicy.id, version: priorityPolicy.policy_version }, reason: 'Prioritisation weight strategy has no weights configured' };
  }

  return {
    status: 'resolved',
    weights: config.weights,
    source_policy: { id: priorityPolicy.id, version: priorityPolicy.policy_version },
    reason: `Resolved ${Object.keys(config.weights).length} prioritisation weights`,
  };
}
