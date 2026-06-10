/**
 * War Room Activation Engine — Commander C2
 *
 * Source: WRCEP-1.0 War Room Communication Excellence Proposal (Phase 1)
 *
 * Pure functions for evaluating War Room activation conditions and creating War Rooms.
 *
 * Activation sequence: correlation → binding → routing → prioritisation → [if P0] → war-room-activation
 * Explicit sequence check: activation only fires AFTER prioritisation
 * (case must be in 'prioritised' state or later with P0)
 *
 * System rule: P0 priority + any of:
 *   - KEV listed AND CVSS ≥ 9.5 AND external-facing
 *   - Explicit P0 with active exploitation
 *
 * Constraints:
 * - War Room NEVER modifies case lifecycle transitions — coordination only
 * - All delivery actions modelled as intent/status (Phase 1 — no live integrations)
 */

import type { Case, CaseStatus } from '../contracts/src/entities/case';
import type { WarRoom, WarRoomActivationSource, CommunicationCadenceProfile } from '../contracts/src/entities/war-room';

// ─── Priority Signal Input (from prioritisation engine) ──────────────────────

export interface WarRoomPrioritySignal {
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  kevListed?: boolean;
  cvssScore?: number;
  externalFacing?: boolean;
  activeExploitation?: boolean;
}

// ─── Activation Result ───────────────────────────────────────────────────────

export interface ActivationConditionResult {
  shouldActivate: boolean;
  reason: string;
  activationSource: WarRoomActivationSource;
}

// ─── States that are at or past prioritisation ───────────────────────────────

const POST_PRIORITISATION_STATES: readonly CaseStatus[] = [
  'prioritised',
  'action_decomposed',
  'in_progress',
  'pending_validation',
  'validation_running',
  'validated_pass',
  'validated_fail',
  'pending_closure_gates',
  'closed_by_system',
  'reopened_by_system',
] as const;

// ─── Activation Condition Evaluator ──────────────────────────────────────────

/**
 * Evaluate whether a case meets War Room activation conditions.
 *
 * System rule fires when:
 * - Case priority is P0 AND
 * - Case is at or past 'prioritised' state AND
 * - One of:
 *   a) KEV listed AND CVSS ≥ 9.5 AND external-facing
 *   b) Active exploitation confirmed
 *
 * If none of the system rules match but case is P0, returns senior_decision
 * (requires manual activation by senior owner).
 *
 * @param caseData - The case being evaluated
 * @param prioritySignal - Optional enriched priority signal with intelligence context
 */
export function evaluateActivationCondition(
  caseData: Case,
  prioritySignal?: WarRoomPrioritySignal,
): ActivationConditionResult {
  // Sequence check: case must be at or past prioritisation
  if (!POST_PRIORITISATION_STATES.includes(caseData.status as CaseStatus)) {
    return {
      shouldActivate: false,
      reason: `Case '${caseData.caseRef}' has not reached prioritisation (current: ${caseData.status}). Activation sequence requires prioritisation first.`,
      activationSource: 'system_rule',
    };
  }

  // Priority check: must be P0
  const effectivePriority = prioritySignal?.priority ?? caseData.priority;
  if (effectivePriority !== 'P0') {
    return {
      shouldActivate: false,
      reason: `Case '${caseData.caseRef}' priority is '${effectivePriority}'. War Room activation requires P0.`,
      activationSource: 'system_rule',
    };
  }

  // System rule (a): KEV listed AND CVSS ≥ 9.5 AND external-facing
  const kevListed = prioritySignal?.kevListed ?? false;
  const cvssScore = prioritySignal?.cvssScore ?? 0;
  const externalFacing = prioritySignal?.externalFacing ?? false;

  if (kevListed && cvssScore >= 9.5 && externalFacing) {
    return {
      shouldActivate: true,
      reason: `System rule: P0 + KEV listed + CVSS ${cvssScore} (≥9.5) + external-facing. Automatic War Room activation.`,
      activationSource: 'system_rule',
    };
  }

  // System rule (b): Active exploitation
  const activeExploitation = prioritySignal?.activeExploitation ?? false;
  if (activeExploitation) {
    return {
      shouldActivate: true,
      reason: `System rule: P0 + active exploitation confirmed. Automatic War Room activation.`,
      activationSource: 'system_rule',
    };
  }

  // P0 but no system rule match — senior decision required
  return {
    shouldActivate: false,
    reason: `Case '${caseData.caseRef}' is P0 but does not meet automatic activation rules. Senior decision required for War Room activation.`,
    activationSource: 'senior_decision',
  };
}

// ─── Default Cadence Profile ─────────────────────────────────────────────────

export const DEFAULT_CADENCE_PROFILE: CommunicationCadenceProfile = {
  activatedCadenceMinutes: 30,
  monitoringCadenceMinutes: 60,
  windingDownCadenceMinutes: 240,
  execUpdateCadenceMinutes: 120,
};

// ─── War Room Factory ────────────────────────────────────────────────────────

/**
 * Create a new War Room from an activation result.
 *
 * @param activationResult - Must have shouldActivate: true
 * @param caseData - The triggering case
 * @param seniorOwnerId - User ID of the senior owner
 * @param timestamp - ISO 8601 timestamp
 */
export function createWarRoom(
  activationResult: ActivationConditionResult,
  caseData: Case,
  seniorOwnerId: string,
  timestamp: string,
): WarRoom {
  const warRoomRef = `WR-${caseData.caseRef}-${Date.now()}`;

  return {
    id: `war-room-${caseData.id}-${Date.now()}`,
    entityType: 'war-room',
    tenant: caseData.tenant,
    createdAt: timestamp,
    updatedAt: timestamp,
    source: caseData.source,
    warRoomRef,
    status: 'activated',
    activationReason: activationResult.reason,
    activationSource: activationResult.activationSource,
    boundCaseIds: [caseData.id],
    membership: [
      {
        userId: seniorOwnerId,
        role: 'senior_owner',
        joinedAt: timestamp,
        acknowledgedAt: null,
        leftAt: null,
      },
    ],
    subscribers: [],
    communicationCadence: { ...DEFAULT_CADENCE_PROFILE },
    seniorOwnerId,
    aiOrientationState: 'active',
    closeOutReportRef: null,
    auditTrailRef: `audit-war-room-${warRoomRef}`,
  };
}

// ─── Case Binding ────────────────────────────────────────────────────────────

/**
 * Bind an additional case to an existing War Room (immutable).
 *
 * @param warRoom - Current War Room state
 * @param caseId - Case ID to bind
 */
export function bindCaseToWarRoom(warRoom: WarRoom, caseId: string): WarRoom {
  if (warRoom.boundCaseIds.includes(caseId)) {
    return warRoom; // Already bound — idempotent
  }
  return {
    ...warRoom,
    boundCaseIds: [...warRoom.boundCaseIds, caseId],
    updatedAt: new Date().toISOString(),
  };
}
