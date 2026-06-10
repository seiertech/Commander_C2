/**
 * Analytic Entity — Commander SDR Canonical Model
 *
 * Source: COIM v1.0 §4.8; 03_REUSABLE_OBJECT_CATALOGUE.md §2.7
 * Authority: DEC-coim-ocsf-source-classification-architecture (DECISIONS.md)
 * Build unit: COIM-E (Analytic Entity)
 * Resolves: ARCH-DEBT-042 (analytic entity absence)
 *
 * Analytic is the broad reusable COIM concept spanning detection rules, ML models,
 * UEBA models, vendor models, Sigma rules, YARA rules, and security control analytics.
 * Enables detection-engineering metrics, false-positive tracking, analytic-to-ATT&CK
 * binding, and model-vs-rule attribution.
 *
 * Ownership model:
 * - Source-owned (immutable after write): analyticId, analyticName, analyticType, version
 * - Commander-owned (mutable): state, falsePositiveRate, attacks[]
 * - Storage: separate reference table; referenced from Risk Object/Verdict by analyticId + analyticType
 *
 * OCSF influence: analytic.json object (type_id: Rule/Behavioral/Statistical/ML)
 * informs structure. OCSF is NOT Commander authority.
 */

import type { CommonFields } from './common';
import type { AttackMapping } from './coim';

// ─── Analytic Type Taxonomy ──────────────────────────────────────────────────

/**
 * Analytic type classification — the broad concept spanning all rule and model types.
 * OCSF influence: analytic.json type_id enum (Rule/Behavioral/Statistical/ML).
 * Commander extension: sigma_rule, yara_rule, ueba_model, security_control_analytic.
 */
export type AnalyticType =
  | 'detection_rule'
  | 'analytic_rule'
  | 'sigma_rule'
  | 'yara_rule'
  | 'ml_model'
  | 'ueba_model'
  | 'vendor_model'
  | 'security_control_analytic';

/** All analytic types as a constant array */
export const ANALYTIC_TYPES: AnalyticType[] = [
  'detection_rule',
  'analytic_rule',
  'sigma_rule',
  'yara_rule',
  'ml_model',
  'ueba_model',
  'vendor_model',
  'security_control_analytic',
];

// ─── Analytic State ──────────────────────────────────────────────────────────

/**
 * Analytic lifecycle state.
 * Commander-owned: tracks whether the analytic is actively producing findings.
 */
export type AnalyticState = 'active' | 'deprecated' | 'testing';

/** All analytic states as a constant array */
export const ANALYTIC_STATES: AnalyticState[] = [
  'active',
  'deprecated',
  'testing',
];

// ─── Analytic Entity ─────────────────────────────────────────────────────────

/**
 * Analytic — a first-class reference entity for the detection rule, ML model,
 * UEBA model, or other analytic that produced a finding or verdict.
 *
 * Referenced from Risk Object and Verdict by (analyticId + analyticType).
 * Full analytic metadata lives here; the referring entity holds only the
 * reference key pair for deduplication.
 */
export interface Analytic extends CommonFields {
  entityType: 'analytic';

  // ─── Source-owned fields (immutable after write) ─────────────────────────

  /** Unique identifier for the analytic (source-provided or Commander-generated) */
  analyticId: string;

  /** Human-readable analytic name */
  analyticName: string;

  /** Analytic type classification */
  analyticType: AnalyticType;

  /** Analytic version (semantic versioning recommended) */
  version: string;

  // ─── Commander-owned fields (mutable) ────────────────────────────────────

  /** Analytic lifecycle state — Commander-tracked */
  state: AnalyticState;

  /**
   * False positive rate (0-100). Optional.
   * Source may provide an initial estimate; Commander tracks and updates.
   */
  falsePositiveRate?: number;

  /**
   * ATT&CK bindings for this analytic (optional, bounded array).
   * Maps the analytic to the ATT&CK techniques it detects.
   */
  attacks?: AttackMapping[];
}

// ─── Analytic Reference (embedded on Risk Object / Verdict) ─────────────────

/**
 * Lightweight reference to an Analytic, embedded on Risk Object and Verdict.
 * Only the key pair (analyticId + analyticType) is stored on the referring entity;
 * full metadata lives in the Analytic reference table.
 */
export interface AnalyticRef {
  analyticId: string;
  analyticType: AnalyticType;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Result of an analytic structural validation. */
export interface AnalyticValidation {
  valid: boolean;
  errors: string[];
}

/** Maximum false positive rate */
export const MAX_FALSE_POSITIVE_RATE = 100;

/** Minimum false positive rate */
export const MIN_FALSE_POSITIVE_RATE = 0;

/** Maximum ATT&CK bindings on an analytic (same bound as SourceClassification) */
export const MAX_ANALYTIC_ATTACK_BINDINGS = 20;

/**
 * Validate an Analytic entity for structural correctness.
 * Does NOT validate business rules (referential integrity, version format).
 * Additive validation — no engine-logic dependency.
 */
export function validateAnalytic(analytic: Analytic): AnalyticValidation {
  const errors: string[] = [];

  // analyticId must be a non-empty string
  if (!analytic.analyticId || analytic.analyticId.trim() === '') {
    errors.push('analyticId: required, must be a non-empty string');
  }

  // analyticName must be a non-empty string
  if (!analytic.analyticName || analytic.analyticName.trim() === '') {
    errors.push('analyticName: required, must be a non-empty string');
  }

  // analyticType must be a known type
  if (!ANALYTIC_TYPES.includes(analytic.analyticType)) {
    errors.push(
      `analyticType: unknown type "${analytic.analyticType}". Must be one of: ${ANALYTIC_TYPES.join(', ')}`,
    );
  }

  // version must be a non-empty string
  if (!analytic.version || analytic.version.trim() === '') {
    errors.push('version: required, must be a non-empty string');
  }

  // state must be a known state
  if (!ANALYTIC_STATES.includes(analytic.state)) {
    errors.push(
      `state: unknown state "${analytic.state}". Must be one of: ${ANALYTIC_STATES.join(', ')}`,
    );
  }

  // falsePositiveRate, if present, must be 0-100
  if (analytic.falsePositiveRate !== undefined) {
    if (
      analytic.falsePositiveRate < MIN_FALSE_POSITIVE_RATE ||
      analytic.falsePositiveRate > MAX_FALSE_POSITIVE_RATE
    ) {
      errors.push(
        `falsePositiveRate: must be between ${MIN_FALSE_POSITIVE_RATE} and ${MAX_FALSE_POSITIVE_RATE}, got ${analytic.falsePositiveRate}`,
      );
    }
  }

  // attacks[], if present, must not exceed the max bound
  if (analytic.attacks !== undefined && analytic.attacks.length > MAX_ANALYTIC_ATTACK_BINDINGS) {
    errors.push(
      `attacks[]: exceeds max ${MAX_ANALYTIC_ATTACK_BINDINGS} bindings (got ${analytic.attacks.length})`,
    );
  }

  return { valid: errors.length === 0, errors };
}
