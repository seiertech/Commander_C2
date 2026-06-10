/**
 * Validation Window Enforcer — Commander C2
 *
 * Phase D2: Evaluates the validation window state for a case.
 * ALL values consumed from the validation-window strategy policy (Spec 43).
 * NO hardcoded defaults. Throws if strategy is missing.
 *
 * Source: Spec #06 Case Management, Spec #32 §Validation Window Strategy
 */

import type { StrategyPolicy } from '../entities/strategy';

/** Full validation window state for a case */
export interface ValidationWindowState {
  /** Whether the case is within the validation window */
  withinWindow: boolean;
  /** Whether evidence is fresh (within freshnessHours) */
  evidenceFresh: boolean;
  /** Whether a refresh is due (based on cadence) */
  refreshDue: boolean;
  /** Hours remaining in the validation window (0 if expired) */
  windowHoursRemaining: number;
  /** Hours since last evidence refresh */
  hoursSinceLastRefresh: number;
  /** Strategy values consumed (for audit/traceability) */
  strategyRef: { policy_id: string; policy_version: string };
}

/**
 * Evaluate the validation window state for a case.
 * ALL values consumed from the validation-window strategy policy.
 *
 * @param enteredValidationAt - ISO timestamp when case entered awaiting-validation
 * @param lastEvidenceRefreshAt - ISO timestamp of last evidence refresh
 * @param strategies - strategy policies array (from Spec 43)
 * @param now - current time (injectable for testing)
 * @throws Error if no active validation-window strategy policy is found
 */
export function evaluateValidationWindow(
  enteredValidationAt: string,
  lastEvidenceRefreshAt: string,
  strategies: StrategyPolicy[],
  now?: Date,
): ValidationWindowState {
  const policy = strategies.find(
    (s) => s.surface_type === 'validation-window' && s.status === 'active',
  );

  if (!policy) {
    throw new Error(
      'No active validation-window strategy policy found. Cannot evaluate validation window without strategy configuration.',
    );
  }

  const config = policy.configuration as {
    window_hours: number;
    freshnessHours: number;
    refreshCadenceHours: number;
  };

  const currentTime = now ?? new Date();
  const enteredAt = new Date(enteredValidationAt);
  const lastRefreshAt = new Date(lastEvidenceRefreshAt);

  const hoursSinceEntry =
    (currentTime.getTime() - enteredAt.getTime()) / (1000 * 60 * 60);
  const hoursSinceLastRefresh =
    (currentTime.getTime() - lastRefreshAt.getTime()) / (1000 * 60 * 60);

  const withinWindow = hoursSinceEntry < config.window_hours;
  const windowHoursRemaining = withinWindow
    ? config.window_hours - hoursSinceEntry
    : 0;

  const evidenceFresh = hoursSinceLastRefresh < config.freshnessHours;
  const refreshDue = hoursSinceLastRefresh >= config.refreshCadenceHours;

  return {
    withinWindow,
    evidenceFresh,
    refreshDue,
    windowHoursRemaining,
    hoursSinceLastRefresh,
    strategyRef: {
      policy_id: policy.id,
      policy_version: policy.policy_version,
    },
  };
}
