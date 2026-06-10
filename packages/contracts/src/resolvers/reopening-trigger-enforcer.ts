/**
 * Reopening Trigger Enforcer — Commander C2
 *
 * Phase D3: Evaluates reopening triggers for a closed case.
 * ALL trigger definitions consumed from the reopening-trigger strategy policy (Spec 43).
 * NO hardcoded defaults. Throws if strategy is missing.
 *
 * Source: Spec #06 Case Management, Spec #32 §Reopening Trigger Strategy
 */

import type { StrategyPolicy } from '../entities/strategy';

/** Conditions to evaluate for case reopening */
export interface ReopeningConditions {
  /** Has new drift been detected since closure? */
  newDriftDetected: boolean;
  /** Has validation failed since closure? */
  validationFailed: boolean;
  /** Has SLA been breached post-closure? */
  slaBreachPostClosure: boolean;
  /** Is there a related P0 escalation? */
  relatedP0Escalation: boolean;
}

/** Result of reopening trigger evaluation */
export interface ReopeningTriggerResult {
  /** Whether ANY trigger fires (case should be reopened) */
  shouldReopen: boolean;
  /** Which triggers fired */
  firedTriggers: { trigger: string; reason: string }[];
  /** Strategy reference for audit */
  strategyRef: { policy_id: string; policy_version: string };
}

/**
 * Trigger evaluation mapping — maps trigger names to their evaluation logic.
 * Each trigger returns a reason string if it fires, or null if it does not.
 */
const TRIGGER_EVALUATORS: Record<string, (conditions: ReopeningConditions) => { fires: boolean; reason: string }> = {
  'new-drift-detected': (conditions) => ({
    fires: conditions.newDriftDetected === true,
    reason: 'New drift detected since closure',
  }),
  'validation-failed': (conditions) => ({
    fires: conditions.validationFailed === true,
    reason: 'Validation failed since closure',
  }),
  'sla-breach-post-closure': (conditions) => ({
    fires: conditions.slaBreachPostClosure === true,
    reason: 'SLA breached post-closure',
  }),
  'related-p0-escalation': (conditions) => ({
    fires: conditions.relatedP0Escalation === true,
    reason: 'Related P0 escalation detected',
  }),
};

/**
 * Evaluate reopening triggers for a closed case.
 * ALL trigger definitions come from the reopening-trigger strategy policy.
 * @throws Error if no active reopening-trigger strategy found
 */
export function evaluateReopeningTriggers(
  conditions: ReopeningConditions,
  strategies: StrategyPolicy[],
): ReopeningTriggerResult {
  const policy = strategies.find(
    (s) => s.surface_type === 'reopening-trigger' && s.status === 'active',
  );

  if (!policy) {
    throw new Error(
      'No active reopening-trigger strategy policy found. Cannot evaluate reopening triggers without strategy configuration.',
    );
  }

  const config = policy.configuration as { triggers?: string[] };

  if (!config.triggers || config.triggers.length === 0) {
    throw new Error(
      'Reopening trigger strategy has no triggers configured. Cannot evaluate reopening triggers without trigger definitions.',
    );
  }

  const firedTriggers: { trigger: string; reason: string }[] = [];

  for (const trigger of config.triggers) {
    const evaluator = TRIGGER_EVALUATORS[trigger];
    if (!evaluator) {
      // Unknown trigger — treat as fired with explanation
      firedTriggers.push({ trigger, reason: `Unknown trigger '${trigger}' — cannot evaluate` });
      continue;
    }
    const result = evaluator(conditions);
    if (result.fires) {
      firedTriggers.push({ trigger, reason: result.reason });
    }
  }

  const shouldReopen = firedTriggers.length > 0;

  return {
    shouldReopen,
    firedTriggers,
    strategyRef: {
      policy_id: policy.id,
      policy_version: policy.policy_version,
    },
  };
}
