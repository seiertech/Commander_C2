/**
 * Email Case Communication Entity — Commander C2 Canonical Model
 *
 * Source: Master Technical Specification §Case Communication,
 *         Spec #57 Security Command and Control Doctrine
 *
 * Email case communication records model inbound emails and outbound
 * notifications that are bound to cases. Each record tracks sender,
 * recipients, binding confidence, processing state and thread grouping.
 *
 * Commander may consume case-related email communication read-only
 * and bind it to cases; it must not write SOC-level detections (Doctrine #8).
 *
 * Ownership: All authenticated (read), System (bind/process)
 * Build Unit: Tier 3 batch (phase1-engine-entities)
 * Unlocks: /cases/:id/communications, email binding surfaces
 */

import type { CommonFields } from './common';

// ─── Communication Direction ─────────────────────────────────────────────────

export const COMMUNICATION_DIRECTIONS = ['inbound', 'outbound_notification'] as const;
export type CommunicationDirection = typeof COMMUNICATION_DIRECTIONS[number];

// ─── Communication Status ────────────────────────────────────────────────────

export const COMMUNICATION_STATUSES = ['pending_binding', 'bound', 'rejected', 'duplicate'] as const;
export type CommunicationStatus = typeof COMMUNICATION_STATUSES[number];

// ─── Email Case Communication Entity ─────────────────────────────────────────

export interface EmailCaseCommunication extends CommonFields {
  entity_type: 'email-case-communication';
  /** Unique communication identifier */
  communicationId: string;
  /** Reference to the bound case */
  case_ref: string;
  /** Direction of the communication */
  direction: CommunicationDirection;
  /** Sender email address */
  sender_address: string;
  /** Recipient email addresses */
  recipientAddresses: string[];
  /** Email subject line */
  subject: string;
  /** Preview of the email body (truncated) */
  bodyPreview: string;
  /** When the email was received */
  received_at: string;
  /** When the email was processed by Commander */
  processed_at: string;
  /** Confidence score for case binding (0-1) */
  bindingConfidence: number;
  /** Current processing status */
  status: CommunicationStatus;
  /** Email thread identifier (null if standalone) */
  thread_id: string | null;
  /** Number of attachments */
  attachmentCount: number;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface EmailCaseCommunicationValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an EmailCaseCommunication entity for structural correctness.
 */
export function validateEmailCaseCommunication(record: EmailCaseCommunication): EmailCaseCommunicationValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') {
    errors.push('id: required');
  }
  if (!record.tenant || !record.tenant.tenant_id || record.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!record.communicationId || record.communicationId.trim() === '') {
    errors.push('communicationId: required');
  }
  if (!record.case_ref || record.case_ref.trim() === '') {
    errors.push('case_ref: required');
  }
  if (!record.direction || !COMMUNICATION_DIRECTIONS.includes(record.direction)) {
    errors.push(`direction: must be one of: ${COMMUNICATION_DIRECTIONS.join(', ')}`);
  }
  if (!record.sender_address || record.sender_address.trim() === '') {
    errors.push('sender_address: required');
  }
  if (!Array.isArray(record.recipientAddresses) || record.recipientAddresses.length === 0) {
    errors.push('recipientAddresses: must be a non-empty array');
  }
  if (!record.subject || record.subject.trim() === '') {
    errors.push('subject: required');
  }
  if (!record.bodyPreview || record.bodyPreview.trim() === '') {
    errors.push('bodyPreview: required');
  }
  if (!record.received_at || record.received_at.trim() === '') {
    errors.push('received_at: required');
  }
  if (!record.processed_at || record.processed_at.trim() === '') {
    errors.push('processed_at: required');
  }
  if (typeof record.bindingConfidence !== 'number' || record.bindingConfidence < 0 || record.bindingConfidence > 1) {
    errors.push('bindingConfidence: must be 0-1');
  }
  if (!record.status || !COMMUNICATION_STATUSES.includes(record.status)) {
    errors.push(`status: must be one of: ${COMMUNICATION_STATUSES.join(', ')}`);
  }
  if (typeof record.attachmentCount !== 'number' || record.attachmentCount < 0) {
    errors.push('attachmentCount: must be a non-negative number');
  }

  return { valid: errors.length === 0, errors };
}
