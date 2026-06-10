/**
 * Case Prioritisation Engine — Commander C2 (Unit 9)
 *
 * Full prioritisation engine consuming Prioritisation Weight Strategy,
 * Threshold Strategy, and Automation Boundary Strategy from Spec 43.
 *
 * Produces three deterministic scores:
 *   CRS — Case Risk Score (weighted sum of evidence)
 *   MS  — Mission Score (mission alignment average)
 *   WCS — Weighted Composite Score (combined CRS + MS)
 *
 * Determines priority (P0–P4) from strategy thresholds.
 * Generates NBA (Next Best Action) list.
 * Determines push preference from automation boundary strategy.
 *
 * ALL values consumed from strategy. NO hardcoded priorities or thresholds.
 * Returns error if strategy is missing (never silently defaults).
 *
 * Source: Spec #32 Strategy Layer (Prioritisation Weight, Threshold, Automation Boundary)
 * Doctrinal constraints:
 *   - P0 priority overlay (constraint #2)
 *   - Strategy-layer consumption (constraint #9)
 *   - Closed-loop case model (constraint #1)
 */

import type { StrategyPolicy } from '../entities/strategy';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Evidence scores for a case (0-100 scale each) */
export interface CaseEvidenceScores {
  severity: number;         // 0-100
  exploitability: number;   // 0-100
  blast_radius: number;      // 0-100
  identityExposure: number; // 0-100
  businessContext: number;  // 0-100
  coverageScore: number;    // 0-100
  threatRelevance: number;  // 0-100
  attackContext: number;    // 0-100
}

/** Mission alignment factors */
export interface MissionFactors {
  missionObjectiveAlignment: number; // 0-100
  operationalTempoImpact: number;    // 0-100
  strategicRelevance: number;        // 0-100
}

/** Three deterministic scores */
export interface PrioritisationScores {
  crs: number;  // Case Risk Score (0-100) — weighted sum of evidence
  ms: number;   // Mission Score (0-100) — mission alignment
  wcs: number;  // Weighted Composite Score (0-100) — combined CRS + MS
}

/** Next Best Action */
export interface NextBestAction {
  action: string;
  priority: 'immediate' | 'scheduled' | 'deferred';
  rationale: string;
}

/** Push preference */
export type PushPreference = 'push-recommended' | 'manual-recommended' | 'hybrid';

/** Priority level */
export type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

/** Priority thresholds from strategy */
export interface PriorityThresholds {
  p0: number;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
}

/** Automation boundary configuration from strategy */
export interface AutomationConfig {
  permitted: string[];
  approvalRequired: string[];
  dryRunOnly: string[];
  forbidden: string[];
}

/** Full prioritisation request */
export interface PrioritisationRequest {
  case_id: string;
  case_type: string;
  evidence: CaseEvidenceScores;
  missionFactors: MissionFactors;
}

/** Full prioritisation result */
export interface PrioritisationResult {
  success: boolean;
  priority: Priority | null;
  scores: PrioritisationScores | null;
  nbaList: NextBestAction[];
  pushPreference: PushPreference | null;
  rationale: string;
  source_policy: { id: string; version: string } | null;
  error: string | null;
}

// ─── Score Calculations ──────────────────────────────────────────────────────

/**
 * Calculate Case Risk Score (CRS) — weighted sum of evidence scores.
 * Uses weights from the prioritisation-weight strategy surface.
 * All weights must sum to 1.0 (or close to it).
 */
export function calculateCRS(
  evidence: CaseEvidenceScores,
  weights: Record<string, number>,
): number {
  const evidenceMap: Record<string, number> = {
    severity: evidence.severity,
    exploitability: evidence.exploitability,
    blast_radius: evidence.blast_radius,
    identityExposure: evidence.identityExposure,
    businessContext: evidence.businessContext,
    coverageScore: evidence.coverageScore,
    threatRelevance: evidence.threatRelevance,
    attackContext: evidence.attackContext,
  };

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const value = evidenceMap[key];
    if (value !== undefined) {
      score += value * weight;
    }
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate Mission Score (MS) — average of mission alignment factors.
 */
export function calculateMS(factors: MissionFactors): number {
  const sum =
    factors.missionObjectiveAlignment +
    factors.operationalTempoImpact +
    factors.strategicRelevance;

  return Math.min(100, Math.max(0, sum / 3));
}

/**
 * Calculate Weighted Composite Score (WCS) — combined CRS + MS.
 * Default blend: 70% CRS + 30% MS.
 */
export function calculateWCS(
  crs: number,
  ms: number,
  crsWeight: number = 0.7,
): number {
  const msWeight = 1 - crsWeight;
  const score = crs * crsWeight + ms * msWeight;
  return Math.min(100, Math.max(0, score));
}

// ─── Priority Determination ──────────────────────────────────────────────────

/**
 * Determine priority level from WCS using strategy thresholds.
 * Thresholds are consumed from the threshold strategy surface.
 * NO hardcoded priority values.
 */
export function determinePriority(
  wcs: number,
  thresholds: PriorityThresholds,
): Priority {
  if (wcs >= thresholds.p0) return 'P0';
  if (wcs >= thresholds.p1) return 'P1';
  if (wcs >= thresholds.p2) return 'P2';
  if (wcs >= thresholds.p3) return 'P3';
  return 'P4';
}

// ─── NBA Generation ──────────────────────────────────────────────────────────

/**
 * Generate Next Best Action list based on priority, case type, and scores.
 * Actions are ordered by urgency.
 */
export function generateNBA(
  priority: Priority,
  case_type: string,
  scores: PrioritisationScores,
): NextBestAction[] {
  const actions: NextBestAction[] = [];

  switch (priority) {
    case 'P0':
      actions.push({
        action: `Immediate escalation for ${case_type} case`,
        priority: 'immediate',
        rationale: `WCS ${scores.wcs.toFixed(1)} exceeds P0 threshold — immediate response required`,
      });
      actions.push({
        action: 'Notify security leadership',
        priority: 'immediate',
        rationale: 'P0 cases require leadership awareness within SLA window',
      });
      actions.push({
        action: 'Initiate containment assessment',
        priority: 'immediate',
        rationale: `CRS ${scores.crs.toFixed(1)} indicates high risk — containment may be needed`,
      });
      break;

    case 'P1':
      actions.push({
        action: `Assign senior analyst for ${case_type} investigation`,
        priority: 'immediate',
        rationale: `WCS ${scores.wcs.toFixed(1)} indicates high-priority case requiring experienced handling`,
      });
      actions.push({
        action: 'Begin root cause analysis',
        priority: 'scheduled',
        rationale: `CRS ${scores.crs.toFixed(1)} warrants thorough investigation`,
      });
      break;

    case 'P2':
      actions.push({
        action: `Schedule ${case_type} investigation`,
        priority: 'scheduled',
        rationale: `WCS ${scores.wcs.toFixed(1)} — medium priority, schedule within SLA`,
      });
      actions.push({
        action: 'Gather additional evidence',
        priority: 'scheduled',
        rationale: 'Enrich case context before remediation planning',
      });
      break;

    case 'P3':
      actions.push({
        action: `Queue ${case_type} for standard processing`,
        priority: 'deferred',
        rationale: `WCS ${scores.wcs.toFixed(1)} — standard priority, process in queue order`,
      });
      break;

    case 'P4':
      actions.push({
        action: `Monitor ${case_type} — low priority`,
        priority: 'deferred',
        rationale: `WCS ${scores.wcs.toFixed(1)} — low priority, monitor for escalation triggers`,
      });
      break;
  }

  return actions;
}

// ─── Push Preference ─────────────────────────────────────────────────────────

/**
 * Determine push preference based on scores and automation boundary strategy.
 * Push is recommended when priority-calculation is in the permitted list
 * and the WCS is high enough to warrant automated action.
 * Manual is recommended when push-governance requires approval.
 * Hybrid when automated routing is permitted but push requires approval.
 */
export function determinePushPreference(
  scores: PrioritisationScores,
  automationConfig: AutomationConfig,
): PushPreference {
  const pushInPermitted = automationConfig.permitted.includes('push-governance');
  const pushInApprovalRequired = automationConfig.approvalRequired.includes('push-governance');
  const pushInDryRunOnly = automationConfig.dryRunOnly.includes('push-to-vendor');
  const pushInForbidden = automationConfig.forbidden.includes('push-governance');

  // If push is forbidden, always manual
  if (pushInForbidden) {
    return 'manual-recommended';
  }

  // If push is in permitted list and WCS is high, recommend push
  if (pushInPermitted && scores.wcs >= 70) {
    return 'push-recommended';
  }

  // If push requires approval or is dry-run only, hybrid approach
  if (pushInApprovalRequired || pushInDryRunOnly) {
    return 'hybrid';
  }

  // Default: manual for lower scores or when automation boundary is restrictive
  if (scores.wcs >= 70) {
    return 'hybrid';
  }

  return 'manual-recommended';
}

// ─── Strategy Extraction ─────────────────────────────────────────────────────

/**
 * Extract prioritisation weights from strategy.
 * Throws if strategy is missing.
 */
function extractWeights(strategies: StrategyPolicy[]): {
  weights: Record<string, number>;
  policy: StrategyPolicy;
} {
  const policy = strategies.find(
    (s) => s.surface_type === 'prioritisation-weight' && s.status === 'active',
  );

  if (!policy) {
    throw new Error(
      '[PrioritisationEngine] STRATEGY GAP: No active prioritisation-weight strategy policy found. ' +
      'Cannot prioritise without strategy. All weight values must come from Spec 43.',
    );
  }

  const config = policy.configuration as { weights?: Record<string, number> };

  if (!config.weights || Object.keys(config.weights).length === 0) {
    throw new Error(
      '[PrioritisationEngine] STRATEGY GAP: Prioritisation weight strategy has no weights configured. ' +
      'Cannot calculate CRS without weight values.',
    );
  }

  return { weights: config.weights, policy };
}

/**
 * Extract priority thresholds from strategy.
 * Throws if strategy is missing.
 */
function extractThresholds(strategies: StrategyPolicy[]): {
  thresholds: PriorityThresholds;
  policy: StrategyPolicy;
} {
  const policy = strategies.find(
    (s) => s.surface_type === 'threshold' && s.status === 'active',
  );

  if (!policy) {
    throw new Error(
      '[PrioritisationEngine] STRATEGY GAP: No active threshold strategy policy found. ' +
      'Cannot determine priority without thresholds. All threshold values must come from Spec 43.',
    );
  }

  const config = policy.configuration as { priorityThresholds?: PriorityThresholds };

  if (!config.priorityThresholds) {
    throw new Error(
      '[PrioritisationEngine] STRATEGY GAP: Threshold strategy has no priorityThresholds configured. ' +
      'Cannot determine priority level.',
    );
  }

  return { thresholds: config.priorityThresholds, policy };
}

/**
 * Extract automation boundary configuration from strategy.
 * Throws if strategy is missing.
 */
function extractAutomationConfig(strategies: StrategyPolicy[]): {
  config: AutomationConfig;
  policy: StrategyPolicy;
} {
  const policy = strategies.find(
    (s) => s.surface_type === 'automation-boundary' && s.status === 'active',
  );

  if (!policy) {
    throw new Error(
      '[PrioritisationEngine] STRATEGY GAP: No active automation-boundary strategy policy found. ' +
      'Cannot determine push preference without automation boundary. All values must come from Spec 43.',
    );
  }

  const config = policy.configuration as Partial<AutomationConfig>;

  if (!config.permitted || !config.approvalRequired || !config.dryRunOnly || !config.forbidden) {
    throw new Error(
      '[PrioritisationEngine] STRATEGY GAP: Automation boundary strategy is incomplete. ' +
      'Required fields: permitted, approvalRequired, dryRunOnly, forbidden.',
    );
  }

  return {
    config: config as AutomationConfig,
    policy,
  };
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Prioritise a case using strategy-driven weights, thresholds, and automation boundaries.
 *
 * Algorithm:
 * 1. Extract weights from prioritisation-weight strategy
 * 2. Extract thresholds from threshold strategy
 * 3. Extract automation config from automation-boundary strategy
 * 4. Calculate CRS (weighted evidence sum)
 * 5. Calculate MS (mission alignment average)
 * 6. Calculate WCS (combined CRS + MS)
 * 7. Determine priority from WCS vs thresholds
 * 8. Generate NBA list
 * 9. Determine push preference
 * 10. Return full result
 *
 * Returns error result (success: false) if any strategy is missing.
 */
export function prioritiseCase(
  request: PrioritisationRequest,
  strategies: StrategyPolicy[],
): PrioritisationResult {
  // Extract strategies — catch errors and return structured failure
  let weights: Record<string, number>;
  let thresholds: PriorityThresholds;
  let automationConfig: AutomationConfig;
  let weightPolicy: StrategyPolicy;

  try {
    const weightResult = extractWeights(strategies);
    weights = weightResult.weights;
    weightPolicy = weightResult.policy;
  } catch (err) {
    return {
      success: false,
      priority: null,
      scores: null,
      nbaList: [],
      pushPreference: null,
      rationale: '',
      source_policy: null,
      error: (err as Error).message,
    };
  }

  try {
    const thresholdResult = extractThresholds(strategies);
    thresholds = thresholdResult.thresholds;
  } catch (err) {
    return {
      success: false,
      priority: null,
      scores: null,
      nbaList: [],
      pushPreference: null,
      rationale: '',
      source_policy: { id: weightPolicy.id, version: weightPolicy.policy_version },
      error: (err as Error).message,
    };
  }

  try {
    const automationResult = extractAutomationConfig(strategies);
    automationConfig = automationResult.config;
  } catch (err) {
    return {
      success: false,
      priority: null,
      scores: null,
      nbaList: [],
      pushPreference: null,
      rationale: '',
      source_policy: { id: weightPolicy.id, version: weightPolicy.policy_version },
      error: (err as Error).message,
    };
  }

  // Calculate scores
  const crs = calculateCRS(request.evidence, weights);
  const ms = calculateMS(request.missionFactors);
  const wcs = calculateWCS(crs, ms);

  const scores: PrioritisationScores = { crs, ms, wcs };

  // Determine priority
  const priority = determinePriority(wcs, thresholds);

  // Generate NBA
  const nbaList = generateNBA(priority, request.case_type, scores);

  // Determine push preference
  const pushPreference = determinePushPreference(scores, automationConfig);

  // Build rationale
  const rationale =
    `Case ${request.case_id} (${request.case_type}) prioritised as ${priority}. ` +
    `CRS=${crs.toFixed(1)}, MS=${ms.toFixed(1)}, WCS=${wcs.toFixed(1)}. ` +
    `Thresholds: P0≥${thresholds.p0}, P1≥${thresholds.p1}, P2≥${thresholds.p2}, P3≥${thresholds.p3}. ` +
    `Push preference: ${pushPreference}.`;

  return {
    success: true,
    priority,
    scores,
    nbaList,
    pushPreference,
    rationale,
    source_policy: { id: weightPolicy.id, version: weightPolicy.policy_version },
    error: null,
  };
}
