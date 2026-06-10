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
  entity_type: 'case-follow';
  /** Subscribing user */
  user_id: string;
  /** Followed case reference */
  case_ref: string;
  /** When the subscription started */
  followed_at: string;
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
  if (!record.tenant || !record.tenant.tenant_id) errors.push('tenant.tenant_id: required');
  if (!record.user_id || record.user_id.trim() === '') errors.push('user_id: required');
  if (!record.case_ref || record.case_ref.trim() === '') errors.push('case_ref: required');
  if (!record.followed_at || record.followed_at.trim() === '') errors.push('followed_at: required');
  if (!Array.isArray(record.notifyOn) || record.notifyOn.length === 0) errors.push('notifyOn: must be non-empty');
  if (Array.isArray(record.notifyOn)) {
    for (const e of record.notifyOn) {
      if (!FOLLOW_EVENT_TYPES.includes(e)) errors.push(`notifyOn: invalid event type '${e}'`);
    }
  }

  return { valid: errors.length === 0, errors };
}
