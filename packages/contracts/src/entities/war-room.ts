/**
 * War Room Entity — Commander C2 Canonical Model
 *
 * Source: WRCEP-1.0 War Room Communication Excellence Proposal (Phase 1)
 *
 * War Room is an OVERLAY entity — it does NOT modify the 12-state case lifecycle,
 * it does NOT add a case type, and it does NOT alter ALLOWED_TRANSITIONS.
 * War Rooms coordinate response across bound cases during critical incidents.
 *
 * Constraints:
 * - War Room is activated on P0 conditions (system rule or senior decision)
 * - Activation only fires AFTER prioritisation (case must be 'prioritised' or later with P0)
 * - All delivery actions modelled as intent/status (no live Graph, Teams, email, WebSocket)
 * - Reuses TeamsDecisionEvent for approval flows — no duplication
 */

import type { CommonFields } from './common';

// ─── War Room Status ─────────────────────────────────────────────────────────

export const WAR_ROOM_STATUSES = ['activated', 'monitoring', 'winding_down', 'closed'] as const;
export type WarRoomStatus = typeof WAR_ROOM_STATUSES[number];

// ─── War Room Member ─────────────────────────────────────────────────────────

export const WAR_ROOM_MEMBER_ROLES = ['senior_owner', 'coordinator', 'analyst', 'observer'] as const;
export type WarRoomMemberRole = typeof WAR_ROOM_MEMBER_ROLES[number];

export interface WarRoomMember {
  user_id: string;
  role: WarRoomMemberRole;
  joinedAt: string;
  acknowledgedAt: string | null;
  leftAt: string | null;
}

// ─── War Room Subscriber ─────────────────────────────────────────────────────

export const SUBSCRIPTION_CHANNELS = [
  'teams_adaptive_card',
  'email_structured',
  'email_summary',
  'in_app',
] as const;
export type SubscriptionChannel = typeof SUBSCRIPTION_CHANNELS[number];

export const SUBSCRIPTION_CADENCES = [
  'live',
  'hourly',
  'four_hourly',
  'end_of_day',
  'on_state_change',
] as const;
export type SubscriptionCadence = typeof SUBSCRIPTION_CADENCES[number];

export interface WarRoomSubscriber {
  user_id: string;
  channels: SubscriptionChannel[];
  cadence: SubscriptionCadence;
  subscribed_at: string;
  unsubscribedAt: string | null;
}

// ─── Communication Cadence Profile ───────────────────────────────────────────

export interface CommunicationCadenceProfile {
  activatedCadenceMinutes: number;
  monitoringCadenceMinutes: number;
  windingDownCadenceMinutes: number;
  execUpdateCadenceMinutes: number;
}

// ─── War Room Activation Source ──────────────────────────────────────────────

export type WarRoomActivationSource = 'system_rule' | 'senior_decision';

// ─── War Room AI Orientation State ───────────────────────────────────────────

export type WarRoomAiOrientationState = 'active' | 'paused' | 'complete';

// ─── War Room Entity ─────────────────────────────────────────────────────────

export interface WarRoom extends CommonFields {
  entity_type: 'war-room';
  /** Unique War Room reference */
  warRoomRef: string;
  /** Current lifecycle status */
  status: WarRoomStatus;
  /** Why was this War Room activated */
  activationReason: string;
  /** How was this War Room activated */
  activationSource: WarRoomActivationSource;
  /** Case IDs bound to this War Room */
  boundCaseIds: string[];
  /** Membership roster */
  membership: WarRoomMember[];
  /** Subscriber list for updates */
  subscribers: WarRoomSubscriber[];
  /** Communication cadence profile */
  communication_cadence: CommunicationCadenceProfile;
  /** Senior owner responsible for this War Room */
  seniorOwnerId: string;
  /** AI orientation state */
  aiOrientationState: WarRoomAiOrientationState;
  /** Reference to close-out report (null until closed) */
  closeOutReportRef: string | null;
  /** Reference to audit trail */
  auditTrailRef: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface WarRoomValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a WarRoom entity for structural correctness.
 */
export function validateWarRoom(warRoom: WarRoom): WarRoomValidation {
  const errors: string[] = [];

  if (!warRoom.id || warRoom.id.trim() === '') {
    errors.push('id: required');
  }
  if (!warRoom.tenant || !warRoom.tenant.tenant_id || warRoom.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!warRoom.warRoomRef || warRoom.warRoomRef.trim() === '') {
    errors.push('warRoomRef: required');
  }
  if (!warRoom.status || !WAR_ROOM_STATUSES.includes(warRoom.status)) {
    errors.push(`status: must be one of: ${WAR_ROOM_STATUSES.join(', ')}`);
  }
  if (!warRoom.activationReason || warRoom.activationReason.trim() === '') {
    errors.push('activationReason: required');
  }
  if (!warRoom.activationSource || !['system_rule', 'senior_decision'].includes(warRoom.activationSource)) {
    errors.push('activationSource: must be system_rule or senior_decision');
  }
  if (!Array.isArray(warRoom.boundCaseIds) || warRoom.boundCaseIds.length === 0) {
    errors.push('boundCaseIds: must contain at least one case');
  }
  if (!Array.isArray(warRoom.membership) || warRoom.membership.length === 0) {
    errors.push('membership: must contain at least one member');
  }
  if (Array.isArray(warRoom.membership)) {
    const hasSeniorOwner = warRoom.membership.some((m) => m.role === 'senior_owner');
    if (!hasSeniorOwner) {
      errors.push('membership: must contain at least one senior_owner');
    }
    for (const member of warRoom.membership) {
      if (!member.user_id || member.user_id.trim() === '') {
        errors.push('membership[].user_id: required');
      }
      if (!WAR_ROOM_MEMBER_ROLES.includes(member.role)) {
        errors.push(`membership[].role: must be one of: ${WAR_ROOM_MEMBER_ROLES.join(', ')}`);
      }
      if (!member.joinedAt || member.joinedAt.trim() === '') {
        errors.push('membership[].joinedAt: required');
      }
    }
  }
  if (Array.isArray(warRoom.subscribers)) {
    for (const sub of warRoom.subscribers) {
      if (!sub.user_id || sub.user_id.trim() === '') {
        errors.push('subscribers[].user_id: required');
      }
      if (!Array.isArray(sub.channels) || sub.channels.length === 0) {
        errors.push('subscribers[].channels: must contain at least one channel');
      }
      if (Array.isArray(sub.channels)) {
        for (const ch of sub.channels) {
          if (!SUBSCRIPTION_CHANNELS.includes(ch)) {
            errors.push(`subscribers[].channels: invalid channel '${ch}'`);
          }
        }
      }
      if (!SUBSCRIPTION_CADENCES.includes(sub.cadence)) {
        errors.push(`subscribers[].cadence: must be one of: ${SUBSCRIPTION_CADENCES.join(', ')}`);
      }
      if (!sub.subscribed_at || sub.subscribed_at.trim() === '') {
        errors.push('subscribers[].subscribed_at: required');
      }
    }
  }
  if (!warRoom.communication_cadence) {
    errors.push('communication_cadence: required');
  } else {
    if (typeof warRoom.communication_cadence.activatedCadenceMinutes !== 'number' || warRoom.communication_cadence.activatedCadenceMinutes <= 0) {
      errors.push('communicationCadence.activatedCadenceMinutes: must be a positive number');
    }
    if (typeof warRoom.communication_cadence.monitoringCadenceMinutes !== 'number' || warRoom.communication_cadence.monitoringCadenceMinutes <= 0) {
      errors.push('communicationCadence.monitoringCadenceMinutes: must be a positive number');
    }
    if (typeof warRoom.communication_cadence.windingDownCadenceMinutes !== 'number' || warRoom.communication_cadence.windingDownCadenceMinutes <= 0) {
      errors.push('communicationCadence.windingDownCadenceMinutes: must be a positive number');
    }
    if (typeof warRoom.communication_cadence.execUpdateCadenceMinutes !== 'number' || warRoom.communication_cadence.execUpdateCadenceMinutes <= 0) {
      errors.push('communicationCadence.execUpdateCadenceMinutes: must be a positive number');
    }
  }
  if (!warRoom.seniorOwnerId || warRoom.seniorOwnerId.trim() === '') {
    errors.push('seniorOwnerId: required');
  }
  if (!warRoom.aiOrientationState || !['active', 'paused', 'complete'].includes(warRoom.aiOrientationState)) {
    errors.push('aiOrientationState: must be active, paused, or complete');
  }
  if (!warRoom.auditTrailRef || warRoom.auditTrailRef.trim() === '') {
    errors.push('auditTrailRef: required');
  }

  return { valid: errors.length === 0, errors };
}
