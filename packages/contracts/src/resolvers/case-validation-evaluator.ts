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
  windowHours: number | null;
  freshnessHours: number | null;
  refreshCadenceHours: number | null;
  sourcePolicy: { id: string; version: string } | null;
  reason: string;
}

export function resolveValidationWindow(
  strategies: StrategyPolicy[],
): ValidationResolution {
  const policy = strategies.find(
    (s) => s.surfaceType === 'validation-window' && s.status === 'active',
  );

  if (!policy) {
    return { status: 'unresolved', windowHours: null, freshnessHours: null, refreshCadenceHours: null, sourcePolicy: null, reason: 'No active validation-window strategy policy found' };
  }

  const config = policy.configuration as { windowHours?: number; freshnessHours?: number; refreshCadenceHours?: number };

  if (config.windowHours == null) {
    return { status: 'unresolved', windowHours: null, freshnessHours: null, refreshCadenceHours: null, sourcePolicy: { id: policy.id, version: policy.policyVersion }, reason: 'Validation window strategy has no windowHours configured' };
  }

  return {
    status: 'resolved',
    windowHours: config.windowHours,
    freshnessHours: config.freshnessHours ?? null,
    refreshCadenceHours: config.refreshCadenceHours ?? null,
    sourcePolicy: { id: policy.id, version: policy.policyVersion },
    reason: `Resolved validation window: ${config.windowHours}h window, ${config.freshnessHours ?? 'unset'}h freshness`,
  };
}
