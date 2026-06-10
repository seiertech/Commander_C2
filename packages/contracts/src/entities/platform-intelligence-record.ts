/**
 * Platform Intelligence Record — Commander C2 Canonical Entity (Abstract Parent)
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 3.1, 3.3, 3.4, 20.1, 20.2, 20.3
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * A normalised intelligence record produced by a platform source.
 * Abstract parent for vulnerability and IOC records.
 *
 * Ownership model:
 * - Source-owned (immutable): sourceId, recordType, severity, publishedAt,
 *   lastModifiedAt, rawReference
 * - Commander-owned (mutable): confidence (may be aggregated), catalogueVersion
 */

import type { CommonFields } from './common';
import type { PlatformRecordType } from './intelligence-common';
import { PLATFORM_RECORD_TYPES } from './intelligence-common';

// ─── Platform Intelligence Record Entity ─────────────────────────────────────

export interface PlatformIntelligenceRecord extends CommonFields {
  /** Reference to Platform_Intelligence_Source by ID (application-layer, Req 3.1/3.2) */
  sourceId: string;
  /** Record type classification (Req 3.3) */
  recordType: PlatformRecordType;
  /** Source-assessed severity (SourceSeverity model: 1–5, Req 3.4) */
  severity: number;
  /** Confidence score 0–100 (Req 3.4) */
  confidence: number;
  /** When this record was published at source */
  publishedAt: string;
  /** When this record was last modified at source */
  lastModifiedAt: string;
  /** Catalogue version marker */
  catalogueVersion: string;
  /** Pointer to raw store (not the raw payload itself) */
  rawReference: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PlatformIntelligenceRecordValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Platform_Intelligence_Record entity for structural correctness.
 * Checks: sourceId non-empty, recordType membership, severity 1–5, confidence 0–100.
 * Req 3.4.
 */
export function validatePlatformIntelligenceRecord(
  record: PlatformIntelligenceRecord,
): PlatformIntelligenceRecordValidation {
  const errors: string[] = [];

  if (!record.sourceId || record.sourceId.trim() === '') {
    errors.push('sourceId: required, must reference a valid Platform_Intelligence_Source');
  }

  if (!record.recordType || !PLATFORM_RECORD_TYPES.includes(record.recordType)) {
    errors.push(
      `recordType: must be one of: ${PLATFORM_RECORD_TYPES.join(', ')}`,
    );
  }

  if (record.severity < 1 || record.severity > 5) {
    errors.push(`severity: must be within SourceSeverity model (1–5), got ${record.severity}`);
  }

  if (record.confidence < 0 || record.confidence > 100) {
    errors.push(`confidence: must be 0–100, got ${record.confidence}`);
  }

  if (!record.id || record.id.trim() === '') {
    errors.push('id: required');
  }

  if (!record.tenant || !record.tenant.tenantId || record.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  return { valid: errors.length === 0, errors };
}
