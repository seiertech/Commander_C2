/**
 * Verdict Entity — Commander SDR Canonical Model
 *
 * Source: COIM v1.0 §6 (Verdict impact); Spec #62 Verdict Semantics
 * Authority: DEC-coim-ocsf-source-classification-architecture (DECISIONS.md)
 * Build unit: COIM-C (Verdict Entity Promotion)
 * Resolves: ARCH-DEBT-043 (verdict entity absence as canonical entity)
 *
 * Promotes Verdict from an engine-internal `VerdictRecord` type (in
 * normalisation-layer.ts) to a first-class canonical entity with durable
 * provenance. Preserves existing disposition semantics and severity ordering
 * (Spec #62 unchanged).
 *
 * Verdicts are time-bound, confidence-weighted claims made by tools.
 * They preserve identity, time, disposition, policy reference and source.
 * They must NOT be reduced to binary pass/fail outcomes (Doctrinal Assertion 11).
 *
 * Ownership model:
 * - Source-owned (immutable): disposition, sourceProduct, confidence, observedAt,
 *   policyRef, targetEntityId, targetEntityType, timeBound, expiresAt
 * - Commander-owned: none (verdicts are source provenance)
 */

import type { CommonFields, VerdictDisposition } from './common';
import type { SourceProduct } from './coim';

// ─── Verdict Entity ──────────────────────────────────────────────────────────

/**
 * Verdict — a time-bound, confidence-weighted claim made by a security tool.
 *
 * Promoted from engine-internal `VerdictRecord` to canonical entity per COIM-C.
 * Disposition semantics and severity ordering are unchanged (Spec #62 authority).
 *
 * Verdicts are immutable source provenance. Commander processes them but does
 * not mutate them. Expired verdicts fall back to ALLOW per Spec #62.
 */
export interface Verdict extends CommonFields {
  entityType: 'verdict';

  // ─── Source-owned fields (all immutable) ─────────────────────────────────

  /** Semantic disposition — NOT binary pass/fail (Spec #62, Doctrinal Assertion 11) */
  disposition: VerdictDisposition;

  /** Source tool that issued this verdict */
  sourceProduct: SourceProduct;

  /** Source confidence in this verdict (0-100) */
  confidence: number;

  /** When the verdict was observed/issued (source timestamp) */
  observedAt: string;

  /** Target entity ID (asset, identity, or other entity the verdict applies to) */
  targetEntityId: string;

  /** Target entity type (supports non-identity verdicts per COIM v1.0 §6) */
  targetEntityType: string;

  /** Structured policy reference (what policy triggered this verdict) */
  policyRef: VerdictPolicyRef;

  /** Whether this verdict is time-bound (expires) */
  timeBound: boolean;

  /** When this verdict expires (null if not time-bound) */
  expiresAt: string | null;
}

// ─── Verdict Policy Reference ────────────────────────────────────────────────

/**
 * Structured policy reference — what policy/rule triggered this verdict.
 * Replaces the flat string `policyRef` from the engine-internal VerdictRecord.
 */
export interface VerdictPolicyRef {
  /** Policy identifier */
  policyId: string;
  /** Policy name (human-readable) */
  policyName?: string;
  /** Policy version */
  policyVersion?: string;
  /** Policy source (vendor/system) */
  policySource?: string;
}

// ─── Disposition Severity (re-exported from engine for canonical access) ─────

/**
 * Disposition severity order (highest to lowest):
 * BLOCK > QUARANTINE > REQUIRE_MFA > REQUIRE_COMPLIANT > COACH > MONITOR > AUDIT > ALLOW
 *
 * Per Spec #62: severity ordering is authoritative and unchanged.
 */
export const DISPOSITION_SEVERITY: Record<VerdictDisposition, number> = {
  BLOCK: 8,
  QUARANTINE: 7,
  REQUIRE_MFA: 6,
  REQUIRE_COMPLIANT: 5,
  COACH: 4,
  MONITOR: 3,
  AUDIT: 2,
  ALLOW: 1,
};

/** All dispositions ordered by severity (highest first) */
export const DISPOSITIONS_BY_SEVERITY: VerdictDisposition[] = [
  'BLOCK',
  'QUARANTINE',
  'REQUIRE_MFA',
  'REQUIRE_COMPLIANT',
  'COACH',
  'MONITOR',
  'AUDIT',
  'ALLOW',
];

// ─── Validation ──────────────────────────────────────────────────────────────

/** Result of a verdict structural validation. */
export interface VerdictValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Verdict entity for structural correctness.
 * Does NOT validate business rules (expiry processing, conflict resolution).
 * Preserves Spec #62 semantics — no changes to disposition/severity logic.
 */
export function validateVerdict(verdict: Verdict): VerdictValidation {
  const errors: string[] = [];

  // disposition must be a known VerdictDisposition
  if (!(verdict.disposition in DISPOSITION_SEVERITY)) {
    errors.push(`disposition: unknown "${verdict.disposition}". Must be one of: ${DISPOSITIONS_BY_SEVERITY.join(', ')}`);
  }

  // confidence must be 0-100
  if (verdict.confidence < 0 || verdict.confidence > 100) {
    errors.push(`confidence: must be between 0 and 100, got ${verdict.confidence}`);
  }

  // observedAt must be non-empty
  if (!verdict.observedAt || verdict.observedAt.trim() === '') {
    errors.push('observedAt: required, must be a non-empty ISO 8601 timestamp');
  }

  // targetEntityId must be non-empty
  if (!verdict.targetEntityId || verdict.targetEntityId.trim() === '') {
    errors.push('targetEntityId: required, must be a non-empty string');
  }

  // targetEntityType must be non-empty
  if (!verdict.targetEntityType || verdict.targetEntityType.trim() === '') {
    errors.push('targetEntityType: required, must be a non-empty string');
  }

  // sourceProduct must have vendor and name
  if (!verdict.sourceProduct.vendor || !verdict.sourceProduct.name) {
    errors.push('sourceProduct: vendor and name are required');
  }

  // policyRef must have policyId
  if (!verdict.policyRef.policyId || verdict.policyRef.policyId.trim() === '') {
    errors.push('policyRef.policyId: required, must be a non-empty string');
  }

  // if timeBound, expiresAt should be present
  if (verdict.timeBound && !verdict.expiresAt) {
    errors.push('expiresAt: required when timeBound is true');
  }

  // if not timeBound, expiresAt should be null
  if (!verdict.timeBound && verdict.expiresAt !== null) {
    errors.push('expiresAt: must be null when timeBound is false');
  }

  return { valid: errors.length === 0, errors };
}
