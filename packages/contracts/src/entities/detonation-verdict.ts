/**
 * Detonation Verdict — Commander SDR Canonical Entity
 *
 * Communications Excellence Phase 1 data-layer.
 * Represents a verdict consumed from SOC tooling (Microsoft Defender/Graph Security API).
 *
 * Constraints:
 * - Connector class A (read-only operational verdict consumption)
 * - SOC read-only boundary: consumed NOT produced by Commander
 * - No live Graph API (Phase 1)
 */

import type { CommonFields } from './common';

// ─── Detonation Verdict Types ────────────────────────────────────────────────

export const DETONATION_SOURCES = ['microsoft_defender', 'other'] as const;
export type DetonationSource = typeof DETONATION_SOURCES[number];

export const DETONATION_OVERALL_VERDICTS = ['clean', 'suspicious', 'malicious'] as const;
export type DetonationOverallVerdict = typeof DETONATION_OVERALL_VERDICTS[number];

export const DETONATION_CHECK_TYPES = [
  'url_detonation',
  'attachment_sandboxing',
  'header_anomaly',
  'impersonation_scoring',
  'reply_chain_hijacking',
] as const;
export type DetonationCheckType = typeof DETONATION_CHECK_TYPES[number];

export const DETONATION_CHECK_RESULTS = ['pass', 'fail', 'suspicious'] as const;
export type DetonationCheckResult = typeof DETONATION_CHECK_RESULTS[number];

/** Individual detonation check result */
export interface DetonationCheck {
  /** Type of check performed */
  checkType: DetonationCheckType;
  /** Check result */
  result: DetonationCheckResult;
  /** Confidence score 0-100 */
  confidence: number;
  /** Detail string explaining the result */
  detail: string;
}

// ─── Detonation Verdict Entity ───────────────────────────────────────────────

export interface DetonationVerdict extends CommonFields {
  /** Verdict identifier */
  verdictId: string;
  /** Tenant scope */
  tenantId: string;
  /** Reference to the original email message */
  emailMessageId: string;
  /** Detonation source system that produced this verdict */
  detonationSource: DetonationSource;
  /** Overall verdict */
  overallVerdict: DetonationOverallVerdict;
  /** Individual checks performed */
  checks: DetonationCheck[];
  /** When the verdict was received from source */
  receivedAt: string;
  /** When Commander processed the verdict */
  processedAt: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface DetonationVerdictValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a DetonationVerdict for structural correctness.
 */
export function validateDetonationVerdict(
  verdict: DetonationVerdict,
): DetonationVerdictValidation {
  const errors: string[] = [];

  if (!verdict.id || verdict.id.trim() === '') {
    errors.push('id: required');
  }
  if (!verdict.tenant || !verdict.tenant.tenantId || verdict.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!verdict.verdictId || verdict.verdictId.trim() === '') {
    errors.push('verdictId: required');
  }
  if (!verdict.tenantId || verdict.tenantId.trim() === '') {
    errors.push('tenantId: required');
  }
  if (!verdict.emailMessageId || verdict.emailMessageId.trim() === '') {
    errors.push('emailMessageId: required');
  }
  if (!verdict.detonationSource || !DETONATION_SOURCES.includes(verdict.detonationSource)) {
    errors.push(`detonationSource: must be one of: ${DETONATION_SOURCES.join(', ')}`);
  }
  if (!verdict.overallVerdict || !DETONATION_OVERALL_VERDICTS.includes(verdict.overallVerdict)) {
    errors.push(`overallVerdict: must be one of: ${DETONATION_OVERALL_VERDICTS.join(', ')}`);
  }
  if (!Array.isArray(verdict.checks)) {
    errors.push('checks: must be an array');
  } else {
    for (let i = 0; i < verdict.checks.length; i++) {
      const check = verdict.checks[i];
      if (!DETONATION_CHECK_TYPES.includes(check.checkType)) {
        errors.push(`checks[${i}].checkType: must be a known check type`);
      }
      if (!DETONATION_CHECK_RESULTS.includes(check.result)) {
        errors.push(`checks[${i}].result: must be one of: ${DETONATION_CHECK_RESULTS.join(', ')}`);
      }
      if (typeof check.confidence !== 'number' || check.confidence < 0 || check.confidence > 100) {
        errors.push(`checks[${i}].confidence: must be 0-100`);
      }
    }
  }
  if (!verdict.receivedAt || verdict.receivedAt.trim() === '') {
    errors.push('receivedAt: required');
  }
  if (!verdict.processedAt || verdict.processedAt.trim() === '') {
    errors.push('processedAt: required');
  }

  return { valid: errors.length === 0, errors };
}
