/**
 * Case Communication Thread — Commander SDR Canonical Entity
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
  displayName: string;
  /** Role in the communication (sender, recipient, cc, observer) */
  role: 'sender' | 'recipient' | 'cc' | 'observer';
}

// ─── Case Communication Thread Entity ────────────────────────────────────────

export interface CaseCommunicationThread extends CommonFields {
  /** Thread identifier */
  threadId: string;
  /** Bound case ID */
  caseId: string;
  /** Tenant ID */
  tenantId: string;
  /** Communication channel */
  channel: CommunicationChannel;
  /** Thread participants */
  participants: ThreadParticipant[];
  /** Current thread status */
  status: CommunicationThreadStatus;
  /** Communication SLA */
  communicationSla: CommunicationSla;
  /** When the initial message was sent */
  sentAt: string;
  /** When the last response was received */
  lastResponseAt: string | null;
  /** Total message count in thread */
  messageCount: number;
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
  if (!thread.tenant || !thread.tenant.tenantId || thread.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!thread.threadId || thread.threadId.trim() === '') {
    errors.push('threadId: required');
  }
  if (!thread.caseId || thread.caseId.trim() === '') {
    errors.push('caseId: required');
  }
  if (!thread.tenantId || thread.tenantId.trim() === '') {
    errors.push('tenantId: required');
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
  if (!thread.sentAt || thread.sentAt.trim() === '') {
    errors.push('sentAt: required');
  }
  if (typeof thread.messageCount !== 'number' || thread.messageCount < 0) {
    errors.push('messageCount: must be a non-negative number');
  }
  if (typeof thread.escalationCount !== 'number' || thread.escalationCount < 0) {
    errors.push('escalationCount: must be a non-negative number');
  }

  return { valid: errors.length === 0, errors };
}
