/**
 * Indicator of Compromise — Commander SDR Canonical Entity (First-Class)
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 6.1, 6.3, 6.4, 6.5, 22.1, 22.2, 22.3, 22.4, 22.5
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * IOC is a FIRST-CLASS intelligence object with independent lifecycle,
 * confidence, severity, TLP marking, expiry and source attribution.
 * A CVE binding is optional and expressed only through IOC_Relationship.
 *
 * Ownership model:
 * - Source-owned (immutable): iocCategory, value, originalRawValue, tlpMarking,
 *   expiresAt, firstSeenAt
 * - Commander-owned (mutable): normalisedValue, confidence (aggregate),
 *   severity, sourceAttribution, lastSeenAt, active
 */

import type { CommonFields } from './common';
import type { IocCategory, TlpMarking, SourceAttributionEntry } from './intelligence-common';
import { IOC_CATEGORIES, TLP_MARKINGS } from './intelligence-common';

// ─── Indicator of Compromise Entity ──────────────────────────────────────────

export interface IndicatorOfCompromise extends CommonFields {
  /** IOC category from exhaustive taxonomy (Req 6.2/6.4) */
  iocCategory: IocCategory;
  /** Raw indicator string — non-empty (Req 6.1/6.4) */
  value: string;
  /** Normalised form from normaliseIoc (Req 6.1) */
  normalisedValue: string;
  /** Preserved original for analyst review — immutable (Req 6.3, 8.3) */
  originalRawValue: string;
  /** Aggregate confidence 0–100 via aggregateConfidence (Req 6.1, 8.4, 22.1) */
  confidence: number;
  /** Severity (SourceSeverity model: 1–5, Req 6.1, 22.2) */
  severity: number;
  /** TLP marking (Req 6.1, 22.3) */
  tlpMarking: TlpMarking;
  /** Optional expiry for time-bound indicators (Req 6.1, 22.4) */
  expiresAt: string | null;
  /** Per-source attribution entries — preserved on dedup (Req 6.5, 8.4, 22.5) */
  sourceAttribution: SourceAttributionEntry[];
  /** First observation (min across attributions, Req 6.1) */
  firstSeenAt: string;
  /** Last observation (max across attributions, Req 6.1) */
  lastSeenAt: string;
  /** Active status (Req 6.1) */
  active: boolean;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface IndicatorOfCompromiseValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an Indicator_Of_Compromise for structural correctness.
 * Checks: taxonomy membership, non-empty value, confidence 0–100,
 * severity 1–5, TLP membership (Req 6.4).
 */
export function validateIndicatorOfCompromise(
  ioc: IndicatorOfCompromise,
): IndicatorOfCompromiseValidation {
  const errors: string[] = [];

  if (!ioc.iocCategory || !IOC_CATEGORIES.includes(ioc.iocCategory)) {
    errors.push(
      `iocCategory: must be a known taxonomy value from IOC_CATEGORIES`,
    );
  }

  if (!ioc.value || ioc.value.trim() === '') {
    errors.push('value: required, must be a non-empty indicator string');
  }

  if (ioc.confidence < 0 || ioc.confidence > 100) {
    errors.push(`confidence: must be 0–100, got ${ioc.confidence}`);
  }

  if (ioc.severity < 1 || ioc.severity > 5) {
    errors.push(`severity: must be within SourceSeverity model (1–5), got ${ioc.severity}`);
  }

  if (!ioc.tlpMarking || !TLP_MARKINGS.includes(ioc.tlpMarking)) {
    errors.push(`tlpMarking: must be one of: ${TLP_MARKINGS.join(', ')}`);
  }

  if (!ioc.normalisedValue || ioc.normalisedValue.trim() === '') {
    errors.push('normalisedValue: required, must be a non-empty string');
  }

  if (!ioc.originalRawValue || ioc.originalRawValue.trim() === '') {
    errors.push('originalRawValue: required, must preserve original indicator');
  }

  if (!Array.isArray(ioc.sourceAttribution)) {
    errors.push('sourceAttribution: must be an array');
  }

  if (!ioc.id || ioc.id.trim() === '') {
    errors.push('id: required');
  }

  if (!ioc.tenant || !ioc.tenant.tenantId || ioc.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  return { valid: errors.length === 0, errors };
}
