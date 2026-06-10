/**
 * Case Reopening Trigger Engine — Commander C2 (Unit 13)
 *
 * 14-trigger reopening evaluation engine with strategy-driven trigger configuration.
 * Consumes Reopening Trigger Strategy for all trigger definitions.
 * NO hardcoded trigger lists. Returns error if strategy is missing.
 *
 * Source: Spec #06 Case Management, Spec #32 §Reopening Trigger Strategy
 * Doctrinal constraints:
 *   - Strategy-layer consumption (constraint #9)
 *   - Closed-loop case model (constraint #1)
 *   - System-owned reopening only — no manual reopening path exists
 */

import type { StrategyPolicy } from '../entities/strategy';

// ─── Types ───────────────────────────────────────────────────────────────────

/** All 14 reopening trigger types */
export type ReopeningTriggerType =
  | 'risk_condition_reappears'
  | 'severity_exploitability_change'
  | 'kev_cvss_epss_change'
  | 'validation_expires_or_fails'
  | 'compensating_control_degrades'
  | 'affected_scope_expands'
  | 'blast_radius_expands'
  | 'mission_impact_increases'
  | 'routing_owner_rejects'
  | 'communication_inbound_evidence'
  | 'connector_freshness_drops'
  | 'tool_coverage_degrades'
  | 'suppression_exception_expires'
  | 'strategy_threshold_requalifies';

/** Trigger evaluation input — conditions to check */
export interface ReopeningTriggerInput {
  riskConditionReappeared: boolean;
  severityOrExploitabilityChanged: boolean;
  kevCvssEpssChanged: boolean;
  validationExpiredOrFailed: boolean;
  compensatingControlDegraded: boolean;
  affectedScopeExpanded: boolean;
  blastRadiusExpanded: boolean;
  missionImpactIncreased: boolean;
  routingOwnerRejected: boolean;
  communicationInboundEvidence: boolean;
  connectorFreshnessDropped: boolean;
  toolCoverageDegraded: boolean;
  suppressionExceptionExpired: boolean;
  strategyThresholdRequalified: boolean;
}

/** Per-trigger result */
export interface TriggerResult {
  trigger: ReopeningTriggerType;
  fired: boolean;
  reason: string;
  evaluatedAt: string;
}

/** Case reopening trigger state (tracking) */
export interface CaseReopeningTriggerState {
  caseId: string;
  configuredTriggers: ReopeningTriggerType[];
  triggerResults: TriggerResult[];
  anyTriggerFired: boolean;
  reopeningRequired: boolean;
  evaluatedAt: string;
}

/** Reopening trigger evaluation request */
export interface ReopeningTriggerEvaluationRequest {
  caseId: string;
  triggerInput: ReopeningTriggerInput;
  currentTime: string;
}

/** Reopening trigger evaluation result */
export interface ReopeningTriggerEvaluationResult {
  success: boolean;
  triggerState: CaseReopeningTriggerState | null;
  reopeningRequired: boolean;
  firedTriggers: TriggerResult[];
  rationale: string;
  sourcePolicy: { id: string; version: string } | null;
  error: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** All 14 reopening trigger types as a constant array */
export const REOPENING_TRIGGER_TYPES: ReopeningTriggerType[] = [
  'risk_condition_reappears',
  'severity_exploitability_change',
  'kev_cvss_epss_change',
  'validation_expires_or_fails',
  'compensating_control_degrades',
  'affected_scope_expands',
  'blast_radius_expands',
  'mission_impact_increases',
  'routing_owner_rejects',
  'communication_inbound_evidence',
  'connector_freshness_drops',
  'tool_coverage_degrades',
  'suppression_exception_expires',
  'strategy_threshold_requalifies',
];

// ─── Trigger Evaluation Mapping ──────────────────────────────────────────────

/**
 * Maps each trigger type to its evaluation logic against ReopeningTriggerInput.
 * Each evaluator returns { fired, reason }.
 */
const TRIGGER_EVALUATORS: Record<ReopeningTriggerType, (input: ReopeningTriggerInput) => { fired: boolean; reason: string }> = {
  risk_condition_reappears: (input) => ({
    fired: input.riskConditionReappeared,
    reason: input.riskConditionReappeared
      ? 'Risk condition has reappeared after closure'
      : 'Risk condition has not reappeared',
  }),
  severity_exploitability_change: (input) => ({
    fired: input.severityOrExploitabilityChanged,
    reason: input.severityOrExploitabilityChanged
      ? 'Severity or exploitability has changed since closure'
      : 'Severity and exploitability remain unchanged',
  }),
  kev_cvss_epss_change: (input) => ({
    fired: input.kevCvssEpssChanged,
    reason: input.kevCvssEpssChanged
      ? 'KEV, CVSS, or EPSS score has changed since closure'
      : 'KEV, CVSS, and EPSS scores remain unchanged',
  }),
  validation_expires_or_fails: (input) => ({
    fired: input.validationExpiredOrFailed,
    reason: input.validationExpiredOrFailed
      ? 'Validation has expired or failed since closure'
      : 'Validation remains valid',
  }),
  compensating_control_degrades: (input) => ({
    fired: input.compensatingControlDegraded,
    reason: input.compensatingControlDegraded
      ? 'Compensating control has degraded'
      : 'Compensating controls remain effective',
  }),
  affected_scope_expands: (input) => ({
    fired: input.affectedScopeExpanded,
    reason: input.affectedScopeExpanded
      ? 'Affected scope has expanded since closure'
      : 'Affected scope has not expanded',
  }),
  blast_radius_expands: (input) => ({
    fired: input.blastRadiusExpanded,
    reason: input.blastRadiusExpanded
      ? 'Blast radius has expanded since closure'
      : 'Blast radius has not expanded',
  }),
  mission_impact_increases: (input) => ({
    fired: input.missionImpactIncreased,
    reason: input.missionImpactIncreased
      ? 'Mission impact has increased since closure'
      : 'Mission impact has not increased',
  }),
  routing_owner_rejects: (input) => ({
    fired: input.routingOwnerRejected,
    reason: input.routingOwnerRejected
      ? 'Routing owner has rejected the case resolution'
      : 'Routing owner has not rejected',
  }),
  communication_inbound_evidence: (input) => ({
    fired: input.communicationInboundEvidence,
    reason: input.communicationInboundEvidence
      ? 'Inbound communication provides new evidence'
      : 'No inbound communication evidence received',
  }),
  connector_freshness_drops: (input) => ({
    fired: input.connectorFreshnessDropped,
    reason: input.connectorFreshnessDropped
      ? 'Connector freshness has dropped below threshold'
      : 'Connector freshness remains within threshold',
  }),
  tool_coverage_degrades: (input) => ({
    fired: input.toolCoverageDegraded,
    reason: input.toolCoverageDegraded
      ? 'Tool coverage has degraded since closure'
      : 'Tool coverage remains adequate',
  }),
  suppression_exception_expires: (input) => ({
    fired: input.suppressionExceptionExpired,
    reason: input.suppressionExceptionExpired
      ? 'Suppression or exception has expired'
      : 'Suppression and exceptions remain active',
  }),
  strategy_threshold_requalifies: (input) => ({
    fired: input.strategyThresholdRequalified,
    reason: input.strategyThresholdRequalified
      ? 'Strategy threshold requalification triggered'
      : 'Strategy thresholds have not requalified',
  }),
};

// ─── Trigger Evaluation Functions ────────────────────────────────────────────

/**
 * Evaluate a single reopening trigger against the provided input.
 */
export function evaluateTrigger(
  trigger: ReopeningTriggerType,
  input: ReopeningTriggerInput,
  currentTime: string,
): TriggerResult {
  const evaluator = TRIGGER_EVALUATORS[trigger];
  const { fired, reason } = evaluator(input);

  return {
    trigger,
    fired,
    reason,
    evaluatedAt: currentTime,
  };
}

/**
 * Evaluate all configured triggers and produce a CaseReopeningTriggerState.
 * Triggers not in the configured list are marked as not fired with 'not_configured' reason and skipped.
 * ANY configured trigger firing → reopening required.
 */
export function evaluateAllTriggers(
  configuredTriggers: ReopeningTriggerType[],
  input: ReopeningTriggerInput,
  currentTime: string,
): CaseReopeningTriggerState {
  const triggerResults: TriggerResult[] = REOPENING_TRIGGER_TYPES.map((trigger) => {
    if (!configuredTriggers.includes(trigger)) {
      return {
        trigger,
        fired: false,
        reason: `Trigger '${trigger}' is not configured in the reopening trigger strategy`,
        evaluatedAt: currentTime,
      };
    }
    return evaluateTrigger(trigger, input, currentTime);
  });

  const configuredResults = triggerResults.filter(
    (r) => !r.reason.includes('not configured'),
  );
  const anyTriggerFired = configuredResults.some((r) => r.fired);

  return {
    caseId: '',
    configuredTriggers,
    triggerResults,
    anyTriggerFired,
    reopeningRequired: anyTriggerFired,
    evaluatedAt: currentTime,
  };
}

/**
 * Extract reopening trigger configuration from strategy policies.
 * Returns the configured triggers and the source policy.
 * Returns null if no active reopening-trigger strategy is found.
 */
export function extractReopeningTriggerConfig(
  strategies: StrategyPolicy[],
): { triggers: ReopeningTriggerType[]; policy: StrategyPolicy } | null {
  const policy = strategies.find(
    (s) => s.surfaceType === 'reopening-trigger' && s.status === 'active',
  );

  if (!policy) {
    return null;
  }

  const config = policy.configuration as { triggers?: string[] };

  if (!config.triggers || config.triggers.length === 0) {
    return null;
  }

  // Filter to only valid ReopeningTriggerType values
  const validTriggers = config.triggers.filter(
    (t): t is ReopeningTriggerType => REOPENING_TRIGGER_TYPES.includes(t as ReopeningTriggerType),
  );

  if (validTriggers.length === 0) {
    return null;
  }

  return { triggers: validTriggers, policy };
}

/**
 * Main entry point: evaluate reopening readiness for a case.
 *
 * Algorithm:
 * 1. Extract reopening trigger configuration from strategy
 * 2. Evaluate all configured triggers against input
 * 3. Determine if reopening is required (ANY configured trigger fires)
 * 4. Return comprehensive result with trigger state, fired triggers, and rationale
 *
 * Returns error result (success: false) if reopening-trigger strategy is missing.
 */
export function evaluateReopeningReadiness(
  request: ReopeningTriggerEvaluationRequest,
  strategies: StrategyPolicy[],
): ReopeningTriggerEvaluationResult {
  const config = extractReopeningTriggerConfig(strategies);

  if (!config) {
    return {
      success: false,
      triggerState: null,
      reopeningRequired: false,
      firedTriggers: [],
      rationale: '',
      sourcePolicy: null,
      error: '[ReopeningTriggerEngine] STRATEGY GAP: No active reopening-trigger strategy policy found or strategy has no triggers configured. Cannot evaluate reopening readiness without strategy configuration.',
    };
  }

  const { triggers, policy } = config;

  const triggerState = evaluateAllTriggers(triggers, request.triggerInput, request.currentTime);
  triggerState.caseId = request.caseId;

  const firedTriggers = triggerState.triggerResults.filter((r) => r.fired);

  const rationale = triggerState.reopeningRequired
    ? `${firedTriggers.length} of ${triggers.length} configured reopening triggers fired. Reopening is required.`
    : `No configured reopening triggers fired. Reopening is not required.`;

  return {
    success: true,
    triggerState,
    reopeningRequired: triggerState.reopeningRequired,
    firedTriggers,
    rationale,
    sourcePolicy: { id: policy.id, version: policy.policyVersion },
    error: null,
  };
}

/**
 * Doctrinal assertion: manual reopening is always blocked.
 * System-owned reopening only — no manual reopening path exists.
 * This function always returns true (reopening is system-owned).
 */
export function isManualReopeningBlocked(): true {
  return true;
}
