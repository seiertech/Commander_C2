/**
 * Inbound Email IOC Submission — Commander C2 Value Object
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 9.3, 24.1, 24.3
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * Modelled only — no mailbox client (Req 9.4).
 * Represents a structured inbound email IOC submission with parsed indicators.
 */

import type { CommonFields } from './common';

// ─── Parsed IOC from Email ───────────────────────────────────────────────────

/** An IOC value parsed from an inbound email, with parser confidence */
export interface ParsedEmailIoc {
  /** Raw IOC value extracted from email */
  value: string;
  /** IOC category as detected by parser */
  detectedCategory: string;
  /** Parser confidence for this IOC (0–100) */
  parserConfidence: number;
}

// ─── Inbound Email Submission Entity ─────────────────────────────────────────

export interface InboundEmailSubmission extends CommonFields {
  /** Sender email address */
  senderAddress: string;
  /** Source organisation */
  sourceOrganisation: string;
  /** When the email was received */
  receivedTimestamp: string;
  /** Attachment references */
  attachmentReferences: string[];
  /** Parsed IOC values from the email body/attachments (Req 9.3) */
  parsedIocValues: ParsedEmailIoc[];
  /** Raw text/body reference (not the content itself) */
  rawBodyReference: string;
  /** Additional submission metadata */
  submissionMetadata: Record<string, unknown>;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface InboundEmailSubmissionValidation {
  valid: boolean;
  errors: string[];
}

export function validateInboundEmailSubmission(
  submission: InboundEmailSubmission,
): InboundEmailSubmissionValidation {
  const errors: string[] = [];

  if (!submission.senderAddress || submission.senderAddress.trim() === '') {
    errors.push('senderAddress: required');
  }

  if (!submission.sourceOrganisation || submission.sourceOrganisation.trim() === '') {
    errors.push('sourceOrganisation: required');
  }

  if (!submission.receivedTimestamp || submission.receivedTimestamp.trim() === '') {
    errors.push('receivedTimestamp: required');
  }

  if (!Array.isArray(submission.parsedIocValues)) {
    errors.push('parsedIocValues: must be an array');
  }

  if (!submission.id || submission.id.trim() === '') {
    errors.push('id: required');
  }

  if (!submission.tenant || !submission.tenant.tenantId || submission.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  return { valid: errors.length === 0, errors };
}
