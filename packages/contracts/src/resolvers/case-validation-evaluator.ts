/**
 * Case Validation Evaluator — Commander C2
 *
 * Consumes Validation Window Strategy from Spec 43.
 * NEVER hardcodes validation windows. Returns 'unresolved' if strategy data is missing.
 *
 * Source: Spec #32 §Strategy Surfaces (Validation Window Strategy)
 */

import type { StrategyPolicy } from '../entities/strategy';

export interface ValidationResolution {
  status: 'resolved' | 'unresolved';
  window_hours: number | null;
  freshnessHours: number | null;
  refreshCadenceHours: number | null;
  source_policy: { id: string; version: string } | null;
  reason: string;
}

export function resolveValidationWindow(
  strategies: StrategyPolicy[],
): ValidationResolution {
  const policy = strategies.find(
    (s) => s.surface_type === 'validation-window' && s.status === 'active',
  );

  if (!policy) {
    return { status: 'unresolved', window_hours: null, freshnessHours: null, refreshCadenceHours: null, source_policy: null, reason: 'No active validation-window strategy policy found' };
  }

  const config = policy.configuration as { window_hours?: number; freshnessHours?: number; refreshCadenceHours?: number };

  if (config.window_hours == null) {
    return { status: 'unresolved', window_hours: null, freshnessHours: null, refreshCadenceHours: null, source_policy: { id: policy.id, version: policy.policy_version }, reason: 'Validation window strategy has no windowHours configured' };
  }

  return {
    status: 'resolved',
    window_hours: config.window_hours,
    freshnessHours: config.freshnessHours ?? null,
    refreshCadenceHours: config.refreshCadenceHours ?? null,
    source_policy: { id: policy.id, version: policy.policy_version },
    reason: `Resolved validation window: ${config.window_hours}h window, ${config.freshnessHours ?? 'unset'}h freshness`,
  };
}
