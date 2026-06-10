/**
 * Case Follow Entity — Commander C2 Canonical Model
 *
 * Analyst convenience feature — subscribe to case updates.
 * Users follow cases they're interested in and receive notifications
 * on configured event types (status change, SLA breach, escalation, new evidence).
 *
 * Constraints:
 * - Following does not imply ownership or assignment
 * - Notification preferences are per-subscription
 * - Unfollowing sets unfollowedAt (soft delete)
 */

import type { CommonFields } from './common';

// ─── Follow Event Types ──────────────────────────────────────────────────────

export const FOLLOW_EVENT_TYPES = [
  'status_change',
  'sla_breach',
  'escalation',
  'new_evidence',
] as const;
export type FollowEventType = typeof FOLLOW_EVENT_TYPES[number];

// ─── Case Follow Entity ──────────────────────────────────────────────────────

export interface CaseFollow extends CommonFields {
  entityType: 'case-follow';
  /** Subscribing user */
  userId: string;
  /** Followed case reference */
  caseRef: string;
  /** When the subscription started */
  followedAt: string;
  /** When unfollowed (null if active) */
  unfollowedAt: string | null;
  /** Event types to notify on */
  notifyOn: FollowEventType[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface CaseFollowValidation {
  valid: boolean;
  errors: string[];
}

export function validateCaseFollow(record: CaseFollow): CaseFollowValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') errors.push('id: required');
  if (!record.tenant || !record.tenant.tenantId) errors.push('tenant.tenantId: required');
  if (!record.userId || record.userId.trim() === '') errors.push('userId: required');
  if (!record.caseRef || record.caseRef.trim() === '') errors.push('caseRef: required');
  if (!record.followedAt || record.followedAt.trim() === '') errors.push('followedAt: required');
  if (!Array.isArray(record.notifyOn) || record.notifyOn.length === 0) errors.push('notifyOn: must be non-empty');
  if (Array.isArray(record.notifyOn)) {
    for (const e of record.notifyOn) {
      if (!FOLLOW_EVENT_TYPES.includes(e)) errors.push(`notifyOn: invalid event type '${e}'`);
    }
  }

  return { valid: errors.length === 0, errors };
}
