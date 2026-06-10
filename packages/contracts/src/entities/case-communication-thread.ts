/**
 * Case Communication Thread — Commander C2 Canonical Entity
 *
 * Communications Excellence Phase 1 data-layer.
 * Represents a communication thread bound to a case (email, Teams, or war room).
 * All actions modelled as intent/status — no live email/Teams sends (Phase 1).
 *
 * Constraints:
 * - Teams decisions flow through Commander (never direct state mutation)
 * - SOC read-only boundary preserved
 * - War Room is Phase 3 UI scope
 */

import type { CommonFields } from './common';

// ─── Communication Thread Types ──────────────────────────────────────────────

export const COMMUNICATION_CHANNELS = ['email', 'teams', 'war_room'] as const;
export type CommunicationChannel = typeof COMMUNICATION_CHANNELS[number];

export const COMMUNICATION_THREAD_STATUSES = [
  'initiated',
  'awaiting_response',
  'responded',
  'stale',
  'escalated',
  'closed',
] as const;
export type CommunicationThreadStatus = typeof COMMUNICATION_THREAD_STATUSES[number];

/** SLA definition for a communication thread */
export interface CommunicationSla {
  /** Target response time in hours */
  targetResponseHours: number;
  /** Whether SLA has been breached */
  breached: boolean;
}

/** Participant in a communication thread */
export interface ThreadParticipant {
  /** Participant identifier (email, Teams user ID, role reference) */
  participantId: string;
  /** Display name */
  display_name: string;
  /** Role in the communication (sender, recipient, cc, observer) */
  role: 'sender' | 'recipient' | 'cc' | 'observer';
}

// ─── Case Communication Thread Entity ────────────────────────────────────────

export interface CaseCommunicationThread extends CommonFields {
  /** Thread identifier */
  thread_id: string;
  /** Bound case ID */
  case_id: string;
  /** Tenant ID */
  tenant_id: string;
  /** Communication channel */
  channel: CommunicationChannel;
  /** Thread participants */
  participants: ThreadParticipant[];
  /** Current thread status */
  status: CommunicationThreadStatus;
  /** Communication SLA */
  communicationSla: CommunicationSla;
  /** When the initial message was sent */
  sent_at: string;
  /** When the last response was received */
  lastResponseAt: string | null;
  /** Total message count in thread */
  message_count: number;
  /** Number of times this thread has been escalated */
  escalationCount: number;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface CaseCommunicationThreadValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a CaseCommunicationThread for structural correctness.
 */
export function validateCaseCommunicationThread(
  thread: CaseCommunicationThread,
): CaseCommunicationThreadValidation {
  const errors: string[] = [];

  if (!thread.id || thread.id.trim() === '') {
    errors.push('id: required');
  }
  if (!thread.tenant || !thread.tenant.tenant_id || thread.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!thread.thread_id || thread.thread_id.trim() === '') {
    errors.push('thread_id: required');
  }
  if (!thread.case_id || thread.case_id.trim() === '') {
    errors.push('case_id: required');
  }
  if (!thread.tenant_id || thread.tenant_id.trim() === '') {
    errors.push('tenant_id: required');
  }
  if (!thread.channel || !COMMUNICATION_CHANNELS.includes(thread.channel)) {
    errors.push(`channel: must be one of: ${COMMUNICATION_CHANNELS.join(', ')}`);
  }
  if (!Array.isArray(thread.participants) || thread.participants.length === 0) {
    errors.push('participants: must be a non-empty array');
  }
  if (!thread.status || !COMMUNICATION_THREAD_STATUSES.includes(thread.status)) {
    errors.push(`status: must be one of: ${COMMUNICATION_THREAD_STATUSES.join(', ')}`);
  }
  if (!thread.communicationSla || typeof thread.communicationSla.targetResponseHours !== 'number') {
    errors.push('communicationSla.targetResponseHours: required and must be a number');
  }
  if (!thread.sent_at || thread.sent_at.trim() === '') {
    errors.push('sent_at: required');
  }
  if (typeof thread.message_count !== 'number' || thread.message_count < 0) {
    errors.push('message_count: must be a non-negative number');
  }
  if (typeof thread.escalationCount !== 'number' || thread.escalationCount < 0) {
    errors.push('escalationCount: must be a non-negative number');
  }

  return { valid: errors.length === 0, errors };
}
