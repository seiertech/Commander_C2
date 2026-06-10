// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * War Room Communication Cadence Engine — Commander C2
 *
 * Source: WRCEP-1.0 War Room Communication Excellence Proposal (Phase 1)
 * Strategy Surface #19: war-room-cadence
 *
 * Pure functions for cadence computation, stalling detection, and structured update generation.
 *
 * Constraints:
 * - All delivery actions modelled as intent/status (Phase 1)
 * - No live Teams, Graph, email, WebSocket
 */

import type { WarRoom, WarRoomStatus } from '../contracts/src/entities/war-room';

// ─── Cadence Computation ─────────────────────────────────────────────────────

export interface NextUpdateResult {
  nextUpdate: string;
  cadenceMinutes: number;
}

/**
 * Compute the next scheduled update time based on War Room status and cadence profile.
 *
 * Resolves cadence from War Room status:
 * - activated → activatedCadenceMinutes
 * - monitoring → monitoringCadenceMinutes
 * - winding_down → windingDownCadenceMinutes
 * - closed → no further updates (returns cadence 0)
 *
 * @param warRoom - Current War Room state
 * @param lastUpdateTime - ISO 8601 timestamp of last update
 * @param now - Current ISO 8601 timestamp
 */
export function computeNextUpdateTime(
  warRoom: WarRoom,
  lastUpdateTime: string,
  now: string,
): NextUpdateResult {
  const cadenceMinutes = getCadenceForStatus(warRoom);

  if (cadenceMinutes === 0) {
    // Closed — no further updates
    return { nextUpdate: now, cadenceMinutes: 0 };
  }

  const lastUpdate = new Date(lastUpdateTime);
  const nextUpdate = new Date(lastUpdate.getTime() + cadenceMinutes * 60 * 1000);

  return {
    nextUpdate: nextUpdate.toISOString(),
    cadenceMinutes,
  };
}

/**
 * Get the cadence minutes for a given War Room status.
 */
export function getCadenceForStatus(warRoom: WarRoom): number {
  switch (warRoom.status) {
    case 'activated':
      return warRoom.communicationCadence.activatedCadenceMinutes;
    case 'monitoring':
      return warRoom.communicationCadence.monitoringCadenceMinutes;
    case 'winding_down':
      return warRoom.communicationCadence.windingDownCadenceMinutes;
    case 'closed':
      return 0;
    default:
      return 0;
  }
}

// ─── Stalling Detection ──────────────────────────────────────────────────────

export interface StallingResult {
  stalling: boolean;
  minutesSinceLastAction: number;
  shouldEscalate: boolean;
}

/**
 * Detect whether the War Room is stalling (no actions within threshold).
 *
 * @param warRoom - Current War Room state
 * @param lastActionTime - ISO 8601 timestamp of last meaningful action
 * @param now - Current ISO 8601 timestamp
 * @param stallingThresholdMinutes - Minutes of inactivity before stalling is detected
 */
export function detectStalling(
  warRoom: WarRoom,
  lastActionTime: string,
  now: string,
  stallingThresholdMinutes: number,
): StallingResult {
  const lastAction = new Date(lastActionTime).getTime();
  const current = new Date(now).getTime();
  const minutesSinceLastAction = Math.floor((current - lastAction) / (60 * 1000));

  const stalling = minutesSinceLastAction >= stallingThresholdMinutes;
  // Escalate if stalling AND in activated state (most urgent)
  // Or if stalling duration exceeds 2x threshold
  const shouldEscalate = stalling && (
    warRoom.status === 'activated' || minutesSinceLastAction >= stallingThresholdMinutes * 2
  );

  return {
    stalling,
    minutesSinceLastAction,
    shouldEscalate,
  };
}

// ─── War Room Update Value Object ────────────────────────────────────────────

export interface ActionSummary {
  actionId: string;
  description: string;
  completedAt: string;
  actor: string;
}

export interface OpenBlocker {
  description: string;
  since: string;
  assignedTo: string | null;
}

export interface WarRoomUpdate {
  warRoomRef: string;
  status: WarRoomStatus;
  duration: string;
  boundCaseCount: number;
  sinceLastUpdate: ActionSummary[];
  openBlockers: OpenBlocker[];
  nextExpected: string;
  aiConfidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ─── Structured Update Generation ────────────────────────────────────────────

export interface RecentAction {
  actionId: string;
  description: string;
  completedAt: string;
  actor: string;
}

export interface BoundCaseSummary {
  caseId: string;
  caseRef: string;
  status: string;
  priority: string;
}

/**
 * Generate a structured update for the War Room.
 *
 * @param warRoom - Current War Room state
 * @param cases - Bound cases (summary data)
 * @param recentActions - Actions taken since last update
 */
export function generateStructuredUpdate(
  warRoom: WarRoom,
  cases: BoundCaseSummary[],
  recentActions: RecentAction[],
): WarRoomUpdate {
  const activatedAt = new Date(warRoom.createdAt).getTime();
  const now = Date.now();
  const durationMs = now - activatedAt;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const duration = `${durationHours}h ${durationMinutes}m`;

  // Derive AI confidence from available data
  const aiConfidenceLevel = deriveConfidenceLevel(cases, recentActions);

  const sinceLastUpdate: ActionSummary[] = recentActions.map((a) => ({
    actionId: a.actionId,
    description: a.description,
    completedAt: a.completedAt,
    actor: a.actor,
  }));

  return {
    warRoomRef: warRoom.warRoomRef,
    status: warRoom.status,
    duration,
    boundCaseCount: warRoom.boundCaseIds.length,
    sinceLastUpdate,
    openBlockers: [], // Populated by downstream integration
    nextExpected: computeNextUpdateTime(warRoom, new Date().toISOString(), new Date().toISOString()).nextUpdate,
    aiConfidenceLevel,
  };
}

/**
 * Derive AI confidence level based on data completeness.
 */
function deriveConfidenceLevel(
  cases: BoundCaseSummary[],
  recentActions: RecentAction[],
): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (cases.length === 0) return 'LOW';
  if (recentActions.length >= 3 && cases.every((c) => c.status !== 'detected')) return 'HIGH';
  if (recentActions.length >= 1) return 'MEDIUM';
  return 'LOW';
}
