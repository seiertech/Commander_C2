/**
 * Vendor Advisory — Commander SDR Canonical Entity
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 5.1, 5.2, 5.3, 5.4, 18.1
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * A vendor-issued security advisory that may map to one or many CVEs
 * and may contain IOCs.
 *
 * Ownership model:
 * - Source-owned (immutable): advisoryId, vendor, title, publishedAt, lastModifiedAt,
 *   severity, affectedProducts, remediationGuidance, relatedCveIds
 * - Commander-owned (mutable): containedIocIds (IOCs extracted/normalised as first-class)
 */

import type { CommonFields } from './common';

// ─── Vendor Advisory Entity ──────────────────────────────────────────────────

export interface VendorAdvisory extends CommonFields {
  /** Vendor-assigned advisory identifier — non-empty (Req 5.4) */
  advisoryId: string;
  /** Vendor name — non-empty (Req 5.4) */
  vendor: string;
  /** Advisory title */
  title: string;
  /** When published at source */
  publishedAt: string;
  /** When last modified at source */
  lastModifiedAt: string;
  /** Severity (SourceSeverity model: 1–5) */
  severity: number;
  /** Affected product identifiers */
  affectedProducts: string[];
  /** Remediation guidance text */
  remediationGuidance: string;
  /** Related CVE IDs (one-to-many to CVE, Req 5.2, 18.1) */
  relatedCveIds: string[];
  /** Contained IOC IDs — extracted/normalised as first-class IOCs (Req 5.3) */
  containedIocIds: string[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface VendorAdvisoryValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Vendor_Advisory for structural correctness.
 * Checks: advisoryId non-empty, vendor non-empty, relatedCveIds is array (Req 5.4).
 */
export function validateVendorAdvisory(
  advisory: VendorAdvisory,
): VendorAdvisoryValidation {
  const errors: string[] = [];

  if (!advisory.advisoryId || advisory.advisoryId.trim() === '') {
    errors.push('advisoryId: required, must be a non-empty string');
  }

  if (!advisory.vendor || advisory.vendor.trim() === '') {
    errors.push('vendor: required, must be a non-empty string');
  }

  if (!Array.isArray(advisory.relatedCveIds)) {
    errors.push('relatedCveIds: must be an array');
  }

  if (!Array.isArray(advisory.containedIocIds)) {
    errors.push('containedIocIds: must be an array');
  }

  if (advisory.severity < 1 || advisory.severity > 5) {
    errors.push(`severity: must be within SourceSeverity model (1–5), got ${advisory.severity}`);
  }

  if (!advisory.id || advisory.id.trim() === '') {
    errors.push('id: required');
  }

  if (!advisory.tenant || !advisory.tenant.tenantId || advisory.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  return { valid: errors.length === 0, errors };
}
