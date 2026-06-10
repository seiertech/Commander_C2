/**
 * Governed Compose Entity — Commander SDR Canonical Model
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
  entityType: 'governed-compose';
  /** Bound case reference */
  caseRef: string;
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
  approvedAt: string | null;
  /** When this approval expires */
  expiresAt: string;
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
  if (!record.tenant || !record.tenant.tenantId) errors.push('tenant.tenantId: required');
  if (!record.caseRef || record.caseRef.trim() === '') errors.push('caseRef: required');
  if (!record.draftSubject || record.draftSubject.trim() === '') errors.push('draftSubject: required');
  if (!record.draftBody || record.draftBody.trim() === '') errors.push('draftBody: required');
  if (!Array.isArray(record.recipients) || record.recipients.length === 0) errors.push('recipients: must be non-empty');
  if (!record.channel || !COMPOSE_CHANNELS.includes(record.channel)) errors.push(`channel: must be one of: ${COMPOSE_CHANNELS.join(', ')}`);
  if (!record.approvalStatus || !APPROVAL_STATUSES.includes(record.approvalStatus)) errors.push(`approvalStatus: must be one of: ${APPROVAL_STATUSES.join(', ')}`);
  if (!record.approverRef || record.approverRef.trim() === '') errors.push('approverRef: required');
  if (!record.expiresAt || record.expiresAt.trim() === '') errors.push('expiresAt: required');

  return { valid: errors.length === 0, errors };
}
