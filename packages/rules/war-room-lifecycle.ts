/**
 * War Room Lifecycle Engine — Commander C2
 *
 * Source: WRCEP-1.0 War Room Communication Excellence Proposal (Phase 1)
 *
 * 4-state lifecycle: activated → monitoring → winding_down → closed
 * Pure function transitions with actor enforcement.
 *
 * Constraints:
 * - Only senior_owner can transition (except system activation)
 * - No reverse transitions allowed
 * - War Room is coordination overlay — does NOT modify case lifecycle
 */

import type { WarRoom, WarRoomStatus, WarRoomMemberRole } from '../contracts/src/entities/war-room';
import { WAR_ROOM_STATUSES } from '../contracts/src/entities/war-room';

// ─── Valid Transitions ───────────────────────────────────────────────────────

export interface WarRoomTransitionDef {
  from: WarRoomStatus;
  to: WarRoomStatus;
}

/** Valid War Room lifecycle transitions — forward only */
export const WAR_ROOM_TRANSITIONS: readonly WarRoomTransitionDef[] = [
  { from: 'activated', to: 'monitoring' },
  { from: 'monitoring', to: 'winding_down' },
  { from: 'winding_down', to: 'closed' },
] as const;

// ─── Transition Result ───────────────────────────────────────────────────────

export interface WarRoomTransitionResult {
  success: boolean;
  warRoom: WarRoom | null;
  error?: string;
}

// ─── Actor Validation ────────────────────────────────────────────────────────

/**
 * Check if a transition is valid in the War Room lifecycle.
 */
export function isWarRoomTransitionAllowed(from: WarRoomStatus, to: WarRoomStatus): boolean {
  return WAR_ROOM_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

/**
 * Get all valid next statuses from a given War Room status.
 */
export function getWarRoomNextStatuses(from: WarRoomStatus): WarRoomStatus[] {
  return WAR_ROOM_TRANSITIONS.filter((t) => t.from === from).map((t) => t.to);
}

// ─── Transition Engine ───────────────────────────────────────────────────────

/**
 * Execute a War Room lifecycle transition.
 *
 * Rules:
 * - Only senior_owner (or system for initial activation) can transition
 * - Only forward transitions allowed (activated→monitoring→winding_down→closed)
 * - No reverse transitions
 *
 * @param warRoom - Current War Room state
 * @param newStatus - Desired new status
 * @param actorRole - Role of the actor requesting the transition
 * @param reason - Reason for the transition
 * @param timestamp - ISO 8601 timestamp
 */
export function transitionWarRoom(
  warRoom: WarRoom,
  newStatus: WarRoomStatus,
  actorRole: WarRoomMemberRole | 'system',
  reason: string,
  timestamp: string,
): WarRoomTransitionResult {
  // 1. Validate new status is a known status
  if (!WAR_ROOM_STATUSES.includes(newStatus)) {
    return {
      success: false,
      warRoom: null,
      error: `Invalid target status '${newStatus}'. Must be one of: ${WAR_ROOM_STATUSES.join(', ')}.`,
    };
  }

  // 2. Validate transition is allowed
  if (!isWarRoomTransitionAllowed(warRoom.status, newStatus)) {
    return {
      success: false,
      warRoom: null,
      error: `Transition from '${warRoom.status}' to '${newStatus}' is not allowed. Valid transitions from '${warRoom.status}': ${getWarRoomNextStatuses(warRoom.status).join(', ') || 'none'}.`,
    };
  }

  // 3. Validate actor authority — only senior_owner (or system for initial activation)
  if (actorRole !== 'senior_owner' && actorRole !== 'system') {
    return {
      success: false,
      warRoom: null,
      error: `Actor role '${actorRole}' is not permitted to transition War Room. Only 'senior_owner' or 'system' can transition.`,
    };
  }

  // 4. Success — produce updated War Room
  const updatedWarRoom: WarRoom = {
    ...warRoom,
    status: newStatus,
    updatedAt: timestamp,
  };

  return {
    success: true,
    warRoom: updatedWarRoom,
  };
}
