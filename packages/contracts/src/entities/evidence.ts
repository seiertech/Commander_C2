/**
 * Evidence Entity — Commander C2 Canonical Model
 *
 * Source: COIM v1.0 §4.4; 04_EVIDENCE_MODEL.md (full)
 * Authority: DEC-coim-ocsf-source-classification-architecture (DECISIONS.md)
 * Build unit: COIM-B (Evidence Entity)
 * Resolves: ARCH-DEBT-040 (evidence entity absence)
 *
 * Evidence is typed, timestamped, confidence-weighted provenance.
 * It informs but never governs lifecycle, priority, routing, validation or closure.
 *
 * Ownership model:
 * - Source-owned (immutable after write): evidenceType, source, collected_at, contentRef, immutabilityHash
 * - Commander-owned (mutable): confidence, expires_at, freshnessStatus
 * - Immutable bindings: caseId, subActionId, validationDecisionId, riskObjectId
 *
 * Evidence content is stored in object store (S3/equivalent); this entity holds
 * metadata only. Content integrity verified via SHA-256 immutabilityHash.
 */

import type { CommonFields } from './common';

// ─── Evidence Type Taxonomy ──────────────────────────────────────────────────

/**
 * Evidence type classification.
 * OCSF influence: evidences.json type taxonomy.
 * Commander extension: ai_analysis (Commander AI-generated evidence).
 */
export type EvidenceType =
  | 'log'
  | 'scan'
  | 'verdict'
  | 'screenshot'
  | 'config'
  | 'network_capture'
  | 'file_hash'
  | 'process_dump'
  | 'ai_analysis';

/** All evidence types as a constant array */
export const EVIDENCE_TYPES: EvidenceType[] = [
  'log',
  'scan',
  'verdict',
  'screenshot',
  'config',
  'network_capture',
  'file_hash',
  'process_dump',
  'ai_analysis',
];

// ─── Evidence Source ─────────────────────────────────────────────────────────

/**
 * Evidence source classification — who/what collected the evidence.
 */
export type EvidenceSource = 'connector' | 'analyst' | 'system';

/** All evidence sources as a constant array */
export const EVIDENCE_SOURCES: EvidenceSource[] = [
  'connector',
  'analyst',
  'system',
];

// ─── Freshness Status ────────────────────────────────────────────────────────

/**
 * Evidence freshness status — computed at evaluation time.
 * Fresh (0-24h), Aging (24-72h), Stale (72h-7d), Expired (>7d).
 * Thresholds are strategy-driven and may vary by evidence type and tenant policy.
 */
export type FreshnessStatus = 'fresh' | 'aging' | 'stale' | 'expired';

/** All freshness statuses as a constant array */
export const FRESHNESS_STATUSES: FreshnessStatus[] = [
  'fresh',
  'aging',
  'stale',
  'expired',
];

// ─── Evidence Entity ─────────────────────────────────────────────────────────

/**
 * Evidence — a first-class typed evidence artifact bound to cases and
 * validation decisions. Supports evidence-driven validation, evidence-gated
 * closure, and evidence-triggered reopening per Commander doctrine assertion #1.
 *
 * Content is stored externally (object store); this entity holds metadata only.
 */
export interface Evidence extends CommonFields {
  entity_type: 'evidence';

  // ─── Source-owned fields (immutable after write) ─────────────────────────

  /** Evidence type classification */
  evidence_type: EvidenceType;

  /** Evidence source — who/what collected this evidence */
  evidenceSource: EvidenceSource;

  /** When this evidence was collected (source timestamp, immutable) */
  collected_at: string;

  /** Pointer to evidence content in object store (S3 URI or equivalent) */
  contentRef: string;

  /** SHA-256 hash of evidence content for integrity verification */
  immutabilityHash: string;

  // ─── Commander-owned fields (mutable) ────────────────────────────────────

  /** Confidence in evidence validity (0-100). May be updated based on validation. */
  confidence: number;

  /** When this evidence becomes stale (computed from collectedAt + freshness policy). Optional. */
  expires_at?: string;

  /** Freshness evaluation — computed at evaluation time. */
  freshnessStatus: FreshnessStatus;

  // ─── Immutable bindings ──────────────────────────────────────────────────

  /** Bound case (required). Immutable after write. */
  case_id: string;

  /** Bound sub-action (optional). Immutable after write. */
  subActionId?: string;

  /** Bound validation decision (optional). Immutable after write. */
  validationDecisionId?: string;

  /** Bound risk object (optional). Immutable after write. */
  risk_object_id?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Result of an evidence structural validation. */
export interface EvidenceValidation {
  valid: boolean;
  errors: string[];
}

/** Maximum confidence score */
export const MAX_CONFIDENCE = 100;

/** Minimum confidence score */
export const MIN_CONFIDENCE = 0;

/** SHA-256 hash pattern (64 hex characters) */
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

/**
 * Validate an Evidence entity for structural correctness.
 * Does NOT validate business rules (freshness computation, binding existence).
 * Additive validation — no engine-logic dependency.
 */
export function validateEvidence(evidence: Evidence): EvidenceValidation {
  const errors: string[] = [];

  // evidenceType must be a known type
  if (!EVIDENCE_TYPES.includes(evidence.evidence_type)) {
    errors.push(`evidence_type: unknown type "${evidence.evidence_type}". Must be one of: ${EVIDENCE_TYPES.join(', ')}`);
  }

  // evidenceSource must be a known source
  if (!EVIDENCE_SOURCES.includes(evidence.evidenceSource)) {
    errors.push(`evidenceSource: unknown source "${evidence.evidenceSource}". Must be one of: ${EVIDENCE_SOURCES.join(', ')}`);
  }

  // confidence must be 0-100
  if (evidence.confidence < MIN_CONFIDENCE || evidence.confidence > MAX_CONFIDENCE) {
    errors.push(`confidence: must be between ${MIN_CONFIDENCE} and ${MAX_CONFIDENCE}, got ${evidence.confidence}`);
  }

  // collectedAt must be a non-empty string (ISO 8601)
  if (!evidence.collected_at || evidence.collected_at.trim() === '') {
    errors.push('collected_at: required, must be a non-empty ISO 8601 timestamp');
  }

  // contentRef must be a non-empty string
  if (!evidence.contentRef || evidence.contentRef.trim() === '') {
    errors.push('contentRef: required, must be a non-empty object-store pointer');
  }

  // immutabilityHash must be a valid SHA-256 hash
  if (!evidence.immutabilityHash || !SHA256_PATTERN.test(evidence.immutabilityHash)) {
    errors.push('immutabilityHash: required, must be a valid SHA-256 hash (64 hex characters)');
  }

  // caseId must be a non-empty string (required binding)
  if (!evidence.case_id || evidence.case_id.trim() === '') {
    errors.push('case_id: required binding, must be a non-empty string');
  }

  // freshnessStatus must be a known status
  if (!FRESHNESS_STATUSES.includes(evidence.freshnessStatus)) {
    errors.push(`freshnessStatus: unknown status "${evidence.freshnessStatus}". Must be one of: ${FRESHNESS_STATUSES.join(', ')}`);
  }

  // expiresAt, if present, must be after collectedAt
  if (evidence.expires_at && evidence.collected_at) {
    const expiresDate = new Date(evidence.expires_at).getTime();
    const collectedDate = new Date(evidence.collected_at).getTime();
    if (!isNaN(expiresDate) && !isNaN(collectedDate) && expiresDate <= collectedDate) {
      errors.push('expires_at: must be after collectedAt');
    }
  }

  return { valid: errors.length === 0, errors };
}
