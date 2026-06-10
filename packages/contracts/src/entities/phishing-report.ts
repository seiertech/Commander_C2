/**
 * Phishing Report — Commander C2 Canonical Entity
 *
 * Communications Excellence Phase 1 data-layer.
 * Represents an employee-submitted phishing report and its lifecycle
 * through triage, detonation verdict binding, and outcome.
 *
 * Constraints:
 * - SOC read-only boundary: verdicts consumed, not produced
 * - All notifications modelled as intent/status (Phase 1)
 */

import type { CommonFields } from './common';

// ─── Phishing Report Types ───────────────────────────────────────────────────

export const PHISHING_TRIAGE_VERDICTS = ['malicious', 'suspicious', 'clean'] as const;
export type PhishingTriageVerdict = typeof PHISHING_TRIAGE_VERDICTS[number];

export const PHISHING_NOTIFICATION_STATUSES = ['pending', 'sent'] as const;
export type PhishingNotificationStatus = typeof PHISHING_NOTIFICATION_STATUSES[number];

export const PHISHING_REPORT_STATUSES = [
  'received',
  'triaging',
  'verdicted',
  'closed',
] as const;
export type PhishingReportStatus = typeof PHISHING_REPORT_STATUSES[number];

// ─── Phishing Report Entity ──────────────────────────────────────────────────

export interface PhishingReport extends CommonFields {
  /** Report identifier */
  reportId: string;
  /** Tenant scope */
  tenantId: string;
  /** Employee who reported (ID or email) */
  reportedBy: string;
  /** When the report was submitted */
  reportedAt: string;
  /** Reference to the original email */
  originalEmailRef: string;
  /** Reference to associated DetonationVerdict (null if not yet available) */
  detonationVerdictId: string | null;
  /** Triage verdict (null if not yet verdicted) */
  triageVerdict: PhishingTriageVerdict | null;
  /** Observable IDs emitted from this report */
  observablesEmitted: string[];
  /** Risk Object ID (if malicious and risk object created) */
  riskObjectId: string | null;
  /** Case ID (if case was created) */
  caseId: string | null;
  /** Employee notification status */
  employeeNotificationStatus: PhishingNotificationStatus;
  /** Current report lifecycle status */
  status: PhishingReportStatus;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PhishingReportValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a PhishingReport for structural correctness.
 */
export function validatePhishingReport(
  report: PhishingReport,
): PhishingReportValidation {
  const errors: string[] = [];

  if (!report.id || report.id.trim() === '') {
    errors.push('id: required');
  }
  if (!report.tenant || !report.tenant.tenantId || report.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!report.reportId || report.reportId.trim() === '') {
    errors.push('reportId: required');
  }
  if (!report.tenantId || report.tenantId.trim() === '') {
    errors.push('tenantId: required');
  }
  if (!report.reportedBy || report.reportedBy.trim() === '') {
    errors.push('reportedBy: required');
  }
  if (!report.reportedAt || report.reportedAt.trim() === '') {
    errors.push('reportedAt: required');
  }
  if (!report.originalEmailRef || report.originalEmailRef.trim() === '') {
    errors.push('originalEmailRef: required');
  }
  if (report.triageVerdict !== null && !PHISHING_TRIAGE_VERDICTS.includes(report.triageVerdict)) {
    errors.push(`triageVerdict: must be one of: ${PHISHING_TRIAGE_VERDICTS.join(', ')} or null`);
  }
  if (!Array.isArray(report.observablesEmitted)) {
    errors.push('observablesEmitted: must be an array');
  }
  if (!report.employeeNotificationStatus || !PHISHING_NOTIFICATION_STATUSES.includes(report.employeeNotificationStatus)) {
    errors.push(`employeeNotificationStatus: must be one of: ${PHISHING_NOTIFICATION_STATUSES.join(', ')}`);
  }
  if (!report.status || !PHISHING_REPORT_STATUSES.includes(report.status)) {
    errors.push(`status: must be one of: ${PHISHING_REPORT_STATUSES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
