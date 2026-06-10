/**
 * Governed Compose Entity — Commander C2 Canonical Model
 *
 * Source: Spec #25 Case Communication, Spec #26 Broadcast Channel
 *
 * Models outbound draft communications that require approval before send.
 * Implements the "compose → approve → send" workflow per Spec 25 Req 3/5.
 * No live email/Teams send in Phase 1 — intent/status model only.
 *
 * Constraints:
 * - SOC read-only boundary preserved (Doctrine #8)
 * - Approval chain modelled as intent — no live approval system integration
 * - Playbook reference links to communication-playbook.ts template
 */

import type { CommonFields } from './common';

// ─── Compose Channel ─────────────────────────────────────────────────────────

export const COMPOSE_CHANNELS = ['email', 'teams'] as const;
export type ComposeChannel = typeof COMPOSE_CHANNELS[number];

// ─── Approval Status ─────────────────────────────────────────────────────────

export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'expired'] as const;
export type ApprovalStatus = typeof APPROVAL_STATUSES[number];

// ─── Governed Compose Entity ─────────────────────────────────────────────────

export interface GovernedCompose extends CommonFields {
  entity_type: 'governed-compose';
  /** Bound case reference */
  case_ref: string;
  /** Draft subject line */
  draftSubject: string;
  /** Draft body content */
  draftBody: string;
  /** Recipient addresses */
  recipients: string[];
  /** Communication channel */
  channel: ComposeChannel;
  /** Current approval status */
  approvalStatus: ApprovalStatus;
  /** Approver user reference */
  approverRef: string;
  /** When approval was granted (null if pending/rejected/expired) */
  approved_at: string | null;
  /** When this approval expires */
  expires_at: string;
  /** Communication playbook reference (null if ad-hoc) */
  playbookRef: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface GovernedComposeValidation {
  valid: boolean;
  errors: string[];
}

export function validateGovernedCompose(record: GovernedCompose): GovernedComposeValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') errors.push('id: required');
  if (!record.tenant || !record.tenant.tenant_id) errors.push('tenant.tenant_id: required');
  if (!record.case_ref || record.case_ref.trim() === '') errors.push('case_ref: required');
  if (!record.draftSubject || record.draftSubject.trim() === '') errors.push('draftSubject: required');
  if (!record.draftBody || record.draftBody.trim() === '') errors.push('draftBody: required');
  if (!Array.isArray(record.recipients) || record.recipients.length === 0) errors.push('recipients: must be non-empty');
  if (!record.channel || !COMPOSE_CHANNELS.includes(record.channel)) errors.push(`channel: must be one of: ${COMPOSE_CHANNELS.join(', ')}`);
  if (!record.approvalStatus || !APPROVAL_STATUSES.includes(record.approvalStatus)) errors.push(`approvalStatus: must be one of: ${APPROVAL_STATUSES.join(', ')}`);
  if (!record.approverRef || record.approverRef.trim() === '') errors.push('approverRef: required');
  if (!record.expires_at || record.expires_at.trim() === '') errors.push('expires_at: required');

  return { valid: errors.length === 0, errors };
}
