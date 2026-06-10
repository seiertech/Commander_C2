/**
 * Assignment Engine — Commander SDR Phase D4
 *
 * Full assignment and routing engine that considers:
 * - Team affinity (from routing strategy)
 * - Workload capacity (active cases per analyst, max-load threshold)
 * - Analyst rank (weighted assignment priority)
 * - Specialism match (case type to analyst specialism tags)
 * - Anti-hoarding rules (cap on same-type cases per analyst)
 *
 * ALL numeric and rule values consumed from Spec 43 strategy surfaces.
 * NO hardcoded values. Throws if strategy data is missing.
 *
 * Source: Spec #08 Case Management, Spec #32 Strategy Layer (Routing Strategy)
 * Doctrinal constraints:
 *   - No manual assignment override (Domain Requirement 5, 14)
 *   - All routing registry-driven
 *   - Audit events on every assignment and reassignment
 *   - Closed-loop case model
 *   - SOC boundary: no SOC write actions
 *   - Surface attribution preserved
 */

import type { StrategyPolicy } from '../entities/strategy';
import type { CaseTypeExtended } from '../entities/case';

// ─── Strategy Configuration Types ────────────────────────────────────────────

/** Analyst profile as defined in the routing strategy */
export interface AnalystProfile {
  name: string;
  team: string;
  rank: AnalystRank;
  specialisms: string[];
}

export type AnalystRank = 'junior' | 'mid' | 'senior' | 'lead';

/** Routing strategy configuration shape (D4-extended) */
export interface RoutingStrategyConfig {
  teamAffinity: Record<string, string>;
  escalationPath: string[];
  workloadMax: number;
  antiHoardingCap: number;
  escalationTimeoutHours: number;
  rankWeighting: Record<AnalystRank, number>;
  specialismTags: Record<string, AnalystProfile>;
}

// ─── Assignment Result Types ─────────────────────────────────────────────────

/** Result of an assignment decision */
export interface AssignmentResult {
  success: boolean;
  assignedOwner: string | null;
  assignedOwnerId: string | null;
  assignedTeam: string | null;
  routingRationale: string;
  escalationPath: string[];
  sourcePolicy: { id: string; version: string };
  auditEvent: AssignmentAuditEvent;
}

/** Audit event emitted on every assignment or reassignment */
export interface AssignmentAuditEvent {
  type: 'assignment' | 'reassignment';
  caseId: string;
  caseType: string;
  assignedOwner: string | null;
  assignedOwnerId: string | null;
  assignedTeam: string | null;
  previousOwner: string | null;
  previousOwnerId: string | null;
  reason: string;
  timestamp: string;
  policyRef: { id: string; version: string };
}

/** Reassignment reason types */
export type ReassignmentReason = 'workload-rebalance' | 'escalation-timeout';

/** Reassignment request — system-driven only */
export interface ReassignmentRequest {
  caseId: string;
  caseType: CaseTypeExtended;
  currentOwnerId: string;
  currentOwner: string;
  reason: ReassignmentReason;
}

// ─── Workload Capacity Calculator ────────────────────────────────────────────

/**
 * Counts active cases per analyst and checks against max-load threshold.
 * All thresholds consumed from strategy.
 */
export interface WorkloadSnapshot {
  analystId: string;
  activeCaseCount: number;
  casesByType: Record<string, number>;
}

/**
 * Calculate whether an analyst has capacity for a new case.
 * Returns true if activeCaseCount < workloadMax from strategy.
 */
export function hasCapacity(
  snapshot: WorkloadSnapshot,
  workloadMax: number,
): boolean {
  return snapshot.activeCaseCount < workloadMax;
}

/**
 * Calculate the effective load factor for an analyst.
 * Used for ranking candidates: lower load = higher priority.
 */
export function loadFactor(
  snapshot: WorkloadSnapshot,
  workloadMax: number,
): number {
  if (workloadMax <= 0) return 1;
  return snapshot.activeCaseCount / workloadMax;
}

// ─── Specialism Matcher ──────────────────────────────────────────────────────

/**
 * Matches case type to analyst specialism tags.
 * Returns true if the analyst's specialisms include the case type.
 */
export function matchesSpecialism(
  analystProfile: AnalystProfile,
  caseType: string,
): boolean {
  return analystProfile.specialisms.includes(caseType);
}

/**
 * Filter analysts who have specialism for a given case type.
 */
export function filterBySpecialism(
  analysts: Record<string, AnalystProfile>,
  caseType: string,
): string[] {
  return Object.entries(analysts)
    .filter(([_, profile]) => matchesSpecialism(profile, caseType))
    .map(([id]) => id);
}

// ─── Anti-Hoarding Rule ──────────────────────────────────────────────────────

/**
 * Prevents a single analyst accumulating more than the strategy-defined cap
 * of cases of the same type.
 * Returns true if the analyst can accept another case of this type.
 */
export function passesAntiHoarding(
  snapshot: WorkloadSnapshot,
  caseType: string,
  antiHoardingCap: number,
): boolean {
  const currentCount = snapshot.casesByType[caseType] ?? 0;
  return currentCount < antiHoardingCap;
}

// ─── Rank Scoring ────────────────────────────────────────────────────────────

/**
 * Calculate assignment score for an analyst.
 * Lower score = higher assignment priority.
 * Score = loadFactor * (1 / rankWeight)
 * Junior analysts (weight 1.0) get assigned first; leads (weight 0.4) last.
 */
export function assignmentScore(
  snapshot: WorkloadSnapshot,
  analystProfile: AnalystProfile,
  workloadMax: number,
  rankWeighting: Record<AnalystRank, number>,
): number {
  const load = loadFactor(snapshot, workloadMax);
  const rankWeight = rankWeighting[analystProfile.rank] ?? 1.0;
  // Higher rankWeight = more likely to be assigned (lower score)
  // rankWeight of 1.0 (junior) → divides by 1.0 → score = load
  // rankWeight of 0.4 (lead) → divides by 0.4 → score = load * 2.5 (higher = less likely)
  return load / rankWeight;
}

// ─── Assignment Engine ───────────────────────────────────────────────────────

/**
 * Extract and validate the routing strategy configuration.
 * Throws if the strategy is missing or incomplete.
 */
export function extractRoutingConfig(strategies: StrategyPolicy[]): {
  config: RoutingStrategyConfig;
  policy: StrategyPolicy;
} {
  const routingPolicy = strategies.find(
    (s) => s.surfaceType === 'routing' && s.status === 'active',
  );

  if (!routingPolicy) {
    throw new Error(
      '[AssignmentEngine] STRATEGY GAP: No active routing strategy policy found. ' +
      'Cannot assign without strategy. All assignment values must come from Spec 43.',
    );
  }

  const raw = routingPolicy.configuration as Record<string, unknown>;

  // Validate all required D4 fields exist
  const requiredFields = [
    'teamAffinity', 'escalationPath', 'workloadMax',
    'antiHoardingCap', 'escalationTimeoutHours', 'rankWeighting', 'specialismTags',
  ];

  for (const field of requiredFields) {
    if (raw[field] === undefined || raw[field] === null) {
      throw new Error(
        `[AssignmentEngine] STRATEGY GAP: Routing strategy missing required field '${field}'. ` +
        `Cannot proceed with assignment. All D4 values must be exposed by the strategy layer.`,
      );
    }
  }

  return {
    config: raw as unknown as RoutingStrategyConfig,
    policy: routingPolicy,
  };
}

/**
 * Execute assignment for a case.
 *
 * Algorithm:
 * 1. Resolve team affinity from strategy
 * 2. Filter analysts by team membership
 * 3. Filter by specialism match
 * 4. Filter by workload capacity
 * 5. Filter by anti-hoarding rule
 * 6. Rank remaining candidates by assignment score (rank weighting + load)
 * 7. Assign to top candidate
 * 8. If no candidate found, escalate
 */
export function assignCase(
  caseId: string,
  caseType: CaseTypeExtended,
  workloadSnapshots: WorkloadSnapshot[],
  strategies: StrategyPolicy[],
): AssignmentResult {
  const { config, policy } = extractRoutingConfig(strategies);
  const policyRef = { id: policy.id, version: policy.policyVersion };
  const timestamp = new Date().toISOString();

  // 1. Resolve team affinity
  const targetTeam = config.teamAffinity[caseType as string];
  if (!targetTeam) {
    const result: AssignmentResult = {
      success: false,
      assignedOwner: null,
      assignedOwnerId: null,
      assignedTeam: null,
      routingRationale: `No team affinity configured for case type "${caseType}"`,
      escalationPath: config.escalationPath,
      sourcePolicy: policyRef,
      auditEvent: {
        type: 'assignment',
        caseId,
        caseType: caseType as string,
        assignedOwner: null,
        assignedOwnerId: null,
        assignedTeam: null,
        previousOwner: null,
        previousOwnerId: null,
        reason: `No team affinity for case type "${caseType}" — escalation required`,
        timestamp,
        policyRef,
      },
    };
    return result;
  }

  // 2. Filter analysts by team
  const teamAnalysts = Object.entries(config.specialismTags)
    .filter(([_, profile]) => profile.team === targetTeam);

  // 3. Filter by specialism match
  const specialismMatched = teamAnalysts
    .filter(([_, profile]) => matchesSpecialism(profile, caseType as string));

  // 4. Filter by workload capacity
  const withCapacity = specialismMatched.filter(([analystId]) => {
    const snapshot = workloadSnapshots.find((s) => s.analystId === analystId);
    if (!snapshot) return true; // No snapshot = no active cases = has capacity
    return hasCapacity(snapshot, config.workloadMax);
  });

  // 5. Filter by anti-hoarding
  const passesHoarding = withCapacity.filter(([analystId]) => {
    const snapshot = workloadSnapshots.find((s) => s.analystId === analystId);
    if (!snapshot) return true; // No snapshot = no cases of this type
    return passesAntiHoarding(snapshot, caseType as string, config.antiHoardingCap);
  });

  // 6. Rank by assignment score
  const scored = passesHoarding.map(([analystId, profile]) => {
    const snapshot = workloadSnapshots.find((s) => s.analystId === analystId)
      ?? { analystId, activeCaseCount: 0, casesByType: {} };
    const score = assignmentScore(snapshot, profile, config.workloadMax, config.rankWeighting);
    return { analystId, profile, score };
  });

  scored.sort((a, b) => a.score - b.score);

  // 7. Assign to top candidate
  if (scored.length > 0) {
    const winner = scored[0];
    const rationale = `Assigned to "${winner.profile.name}" (${winner.profile.rank}) in team "${targetTeam}" — ` +
      `specialism match for "${caseType}", load score ${winner.score.toFixed(3)}, ` +
      `within workload max (${config.workloadMax}) and anti-hoarding cap (${config.antiHoardingCap})`;

    return {
      success: true,
      assignedOwner: winner.profile.name,
      assignedOwnerId: winner.analystId,
      assignedTeam: targetTeam,
      routingRationale: rationale,
      escalationPath: config.escalationPath,
      sourcePolicy: policyRef,
      auditEvent: {
        type: 'assignment',
        caseId,
        caseType: caseType as string,
        assignedOwner: winner.profile.name,
        assignedOwnerId: winner.analystId,
        assignedTeam: targetTeam,
        previousOwner: null,
        previousOwnerId: null,
        reason: rationale,
        timestamp,
        policyRef,
      },
    };
  }

  // 8. No candidate — escalation required
  const escalationRationale = `No eligible analyst in team "${targetTeam}" for case type "${caseType}" — ` +
    `all candidates either at workload max (${config.workloadMax}), ` +
    `anti-hoarding cap (${config.antiHoardingCap}), or lack specialism. Escalation required.`;

  return {
    success: false,
    assignedOwner: null,
    assignedOwnerId: null,
    assignedTeam: targetTeam,
    routingRationale: escalationRationale,
    escalationPath: config.escalationPath,
    sourcePolicy: policyRef,
    auditEvent: {
      type: 'assignment',
      caseId,
      caseType: caseType as string,
      assignedOwner: null,
      assignedOwnerId: null,
      assignedTeam: targetTeam,
      previousOwner: null,
      previousOwnerId: null,
      reason: escalationRationale,
      timestamp,
      policyRef,
    },
  };
}

// ─── Reassignment Flow ───────────────────────────────────────────────────────

/**
 * Execute reassignment — system-driven only (workload rebalance or escalation timeout).
 * No manual override paths.
 *
 * Reassignment excludes the current owner from candidates.
 */
export function reassignCase(
  request: ReassignmentRequest,
  workloadSnapshots: WorkloadSnapshot[],
  strategies: StrategyPolicy[],
): AssignmentResult {
  const { config, policy } = extractRoutingConfig(strategies);
  const policyRef = { id: policy.id, version: policy.policyVersion };
  const timestamp = new Date().toISOString();

  const targetTeam = config.teamAffinity[request.caseType as string];
  if (!targetTeam) {
    return {
      success: false,
      assignedOwner: null,
      assignedOwnerId: null,
      assignedTeam: null,
      routingRationale: `Reassignment failed: no team affinity for case type "${request.caseType}"`,
      escalationPath: config.escalationPath,
      sourcePolicy: policyRef,
      auditEvent: {
        type: 'reassignment',
        caseId: request.caseId,
        caseType: request.caseType as string,
        assignedOwner: null,
        assignedOwnerId: null,
        assignedTeam: null,
        previousOwner: request.currentOwner,
        previousOwnerId: request.currentOwnerId,
        reason: `Reassignment (${request.reason}): no team affinity for "${request.caseType}"`,
        timestamp,
        policyRef,
      },
    };
  }

  // Filter analysts: same team, has specialism, NOT current owner
  const candidates = Object.entries(config.specialismTags)
    .filter(([id, profile]) =>
      id !== request.currentOwnerId &&
      profile.team === targetTeam &&
      matchesSpecialism(profile, request.caseType as string),
    );

  // Filter by capacity and anti-hoarding
  const eligible = candidates.filter(([analystId]) => {
    const snapshot = workloadSnapshots.find((s) => s.analystId === analystId);
    if (!snapshot) return true;
    return hasCapacity(snapshot, config.workloadMax) &&
      passesAntiHoarding(snapshot, request.caseType as string, config.antiHoardingCap);
  });

  // Rank by score
  const scored = eligible.map(([analystId, profile]) => {
    const snapshot = workloadSnapshots.find((s) => s.analystId === analystId)
      ?? { analystId, activeCaseCount: 0, casesByType: {} };
    const score = assignmentScore(snapshot, profile, config.workloadMax, config.rankWeighting);
    return { analystId, profile, score };
  });

  scored.sort((a, b) => a.score - b.score);

  if (scored.length > 0) {
    const winner = scored[0];
    const rationale = `Reassigned (${request.reason}) from "${request.currentOwner}" to "${winner.profile.name}" ` +
      `(${winner.profile.rank}) — specialism match, load score ${winner.score.toFixed(3)}`;

    return {
      success: true,
      assignedOwner: winner.profile.name,
      assignedOwnerId: winner.analystId,
      assignedTeam: targetTeam,
      routingRationale: rationale,
      escalationPath: config.escalationPath,
      sourcePolicy: policyRef,
      auditEvent: {
        type: 'reassignment',
        caseId: request.caseId,
        caseType: request.caseType as string,
        assignedOwner: winner.profile.name,
        assignedOwnerId: winner.analystId,
        assignedTeam: targetTeam,
        previousOwner: request.currentOwner,
        previousOwnerId: request.currentOwnerId,
        reason: rationale,
        timestamp,
        policyRef,
      },
    };
  }

  // No eligible candidate — escalation
  const escalationRationale = `Reassignment (${request.reason}) failed: no eligible analyst in "${targetTeam}" ` +
    `excluding current owner "${request.currentOwner}". Escalation required via path: ${config.escalationPath.join(' → ')}`;

  return {
    success: false,
    assignedOwner: null,
    assignedOwnerId: null,
    assignedTeam: targetTeam,
    routingRationale: escalationRationale,
    escalationPath: config.escalationPath,
    sourcePolicy: policyRef,
    auditEvent: {
      type: 'reassignment',
      caseId: request.caseId,
      caseType: request.caseType as string,
      assignedOwner: null,
      assignedOwnerId: null,
      assignedTeam: targetTeam,
      previousOwner: request.currentOwner,
      previousOwnerId: request.currentOwnerId,
      reason: escalationRationale,
      timestamp,
      policyRef,
    },
  };
}

// ─── Escalation Timeout Check ────────────────────────────────────────────────

/**
 * Check if a case has exceeded the escalation timeout.
 * Returns true if the case should be reassigned due to timeout.
 * Timeout value consumed from strategy (escalationTimeoutHours).
 */
export function isEscalationTimeoutExceeded(
  assignedAtIso: string,
  currentTimeIso: string,
  strategies: StrategyPolicy[],
): boolean {
  const { config } = extractRoutingConfig(strategies);
  const assignedAt = new Date(assignedAtIso).getTime();
  const currentTime = new Date(currentTimeIso).getTime();
  const elapsedHours = (currentTime - assignedAt) / (1000 * 60 * 60);
  return elapsedHours >= config.escalationTimeoutHours;
}
