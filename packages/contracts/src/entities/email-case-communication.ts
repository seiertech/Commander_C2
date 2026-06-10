/**
 * Email Case Communication Entity — Commander SDR Canonical Model
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
  entityType: 'email-case-communication';
  /** Unique communication identifier */
  communicationId: string;
  /** Reference to the bound case */
  caseRef: string;
  /** Direction of the communication */
  direction: CommunicationDirection;
  /** Sender email address */
  senderAddress: string;
  /** Recipient email addresses */
  recipientAddresses: string[];
  /** Email subject line */
  subject: string;
  /** Preview of the email body (truncated) */
  bodyPreview: string;
  /** When the email was received */
  receivedAt: string;
  /** When the email was processed by Commander */
  processedAt: string;
  /** Confidence score for case binding (0-1) */
  bindingConfidence: number;
  /** Current processing status */
  status: CommunicationStatus;
  /** Email thread identifier (null if standalone) */
  threadId: string | null;
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
  if (!record.tenant || !record.tenant.tenantId || record.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!record.communicationId || record.communicationId.trim() === '') {
    errors.push('communicationId: required');
  }
  if (!record.caseRef || record.caseRef.trim() === '') {
    errors.push('caseRef: required');
  }
  if (!record.direction || !COMMUNICATION_DIRECTIONS.includes(record.direction)) {
    errors.push(`direction: must be one of: ${COMMUNICATION_DIRECTIONS.join(', ')}`);
  }
  if (!record.senderAddress || record.senderAddress.trim() === '') {
    errors.push('senderAddress: required');
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
  if (!record.receivedAt || record.receivedAt.trim() === '') {
    errors.push('receivedAt: required');
  }
  if (!record.processedAt || record.processedAt.trim() === '') {
    errors.push('processedAt: required');
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
