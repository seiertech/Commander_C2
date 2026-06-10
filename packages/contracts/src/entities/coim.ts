/**
 * COIM Reusable Composed Objects — Commander Operational Intelligence Model
 *
 * Source authority:
 * - DECISIONS.md DEC-coim-ocsf-source-classification-architecture
 * - docs/knowledge/ocsf_assessment/01_COIM_v1_0.md §4
 * - docs/knowledge/ocsf_assessment/02_SOURCE_CLASSIFICATION_MODEL.md §4–§5
 * - docs/knowledge/ocsf_assessment/03_REUSABLE_OBJECT_CATALOGUE.md §2
 *
 * These are the reusable composed objects that form the SourceClassification
 * captured at ingestion time as IMMUTABLE source provenance. They inform but
 * never govern Commander lifecycle, priority, routing, validation or closure.
 *
 * Build unit: COIM-A (Risk Object Source Classification + Timeline Augmentation).
 * Resolves: ARCH-DEBT-039 (source-classification gap), ARCH-DEBT-045 (timeline gap).
 *
 * OCSF is a schema-engineering reference only (finding_info, attack, observable,
 * product, severity_id, confidence_id). OCSF is NOT Commander authority.
 */

import type { ConnectorClass } from './common';

// ─── Finding Class ───────────────────────────────────────────────────────────

/**
 * What type of finding the source reported.
 * OCSF influence: category 2 (Findings) + finding_info.json.
 */
export type FindingClass =
  | 'vulnerability'
  | 'detection'
  | 'adherence'
  | 'incident'
  | 'data_security'
  | 'iam_analysis'
  | 'application_security';

export const FINDING_CLASSES: FindingClass[] = [
  'vulnerability',
  'detection',
  'adherence',
  'incident',
  'data_security',
  'iam_analysis',
  'application_security',
];

// ─── Severity (source-assessed) ──────────────────────────────────────────────

/** Source-assessed severity level. OCSF influence: severity_id enum. */
export type SourceSeverityLevel =
  | 'informational'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

/** Numeric severity ID (1-5), extracted to an indexed column for filtering. */
export const SEVERITY_ID: Record<SourceSeverityLevel, number> = {
  informational: 1,
  low: 2,
  medium: 3,
  high: 4,
  critical: 5,
};

/** Source-assessed severity — preserved independently of Commander priority. */
export interface SourceSeverity {
  severityLevel: SourceSeverityLevel;
  /** Numeric ID 1-5 (extracted to column). */
  severityId: number;
}

// ─── Confidence (source-assessed) ────────────────────────────────────────────

/** Source-assessed confidence level. OCSF influence: confidence_id enum. */
export type SourceConfidenceLevel = 'unknown' | 'low' | 'medium' | 'high';

/** Source-assessed confidence — distinct from Commander AI confidence. */
export interface SourceConfidence {
  confidenceLevel: SourceConfidenceLevel;
  /** Numeric score 0-100 (extracted to column). */
  confidenceScore: number;
}

// ─── Source Product ──────────────────────────────────────────────────────────

/** Structured identification of the source tool. OCSF influence: product.json. */
export interface SourceProduct {
  vendor: string;
  name: string;
  version?: string;
  uid?: string;
  /** Commander connector class (A/B/C/D). */
  connectorClass?: ConnectorClass;
}

// ─── ATT&CK binding ──────────────────────────────────────────────────────────

/** Structured MITRE ATT&CK binding. OCSF influence: attack.json. */
export interface AttackMapping {
  tactic: string;
  technique: string;
  techniqueName: string;
  subTechnique?: string;
  subTechniqueName?: string;
  /** ATT&CK framework version, e.g. "v13.1". */
  version: string;
}

/** Maximum ATT&CK bindings per record (bounded array — storage efficiency). */
export const MAX_ATTACK_BINDINGS = 20;

// ─── Observable reference (embedded) ─────────────────────────────────────────

/**
 * Embedded typed indicator reference on the source classification.
 * The standalone, deduplicated Observable entity is delivered separately (COIM-D);
 * this embedded shape is the bounded overflow array on the Risk Object.
 * OCSF influence: observable.json (type_id taxonomy).
 */
export type ObservableType =
  | 'ip'
  | 'domain'
  | 'hash'
  | 'url'
  | 'email'
  | 'certificate'
  | 'process'
  | 'file';

export interface ObservableRef {
  observableType: ObservableType;
  value: string;
  firstSeen?: string;
  lastSeen?: string;
  /** Reputation score (enrichment-derived; Commander-owned). */
  reputation?: number;
}

/** Maximum embedded observables per record (bounded array — storage efficiency). */
export const MAX_OBSERVABLES = 50;

// ─── Source Classification (composed, immutable) ─────────────────────────────

/**
 * Structured record of what the source reported about a finding.
 * Written once during normalisation; immutable provenance thereafter.
 * Source: 02_SOURCE_CLASSIFICATION_MODEL.md §4–§5.
 */
export interface SourceClassification {
  /** Required: what type of finding. */
  findingClass: FindingClass;
  /** Required: source-assessed severity. */
  sourceSeverity: SourceSeverity;
  /** Required: source-assessed confidence. */
  sourceConfidence: SourceConfidence;
  /** Required: which tool produced the finding. */
  sourceProduct: SourceProduct;
  /** Required: source-provided unique identifier for the finding. */
  sourceFindingUid: string;
  /** Recommended: source-provided activity classification. */
  sourceActivity?: string;
  /** Recommended: ATT&CK bindings (bounded, max MAX_ATTACK_BINDINGS). */
  attacks?: AttackMapping[];
  /** Recommended: typed observables (bounded, max MAX_OBSERVABLES). */
  observables?: ObservableRef[];
}

// ─── Validation helper (additive; no engine-logic dependency) ────────────────

/** Result of a source-classification structural validation. */
export interface SourceClassificationValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Structural validation for a SourceClassification.
 *
 * Enforces: required fields present, severityId 1-5, confidenceScore 0-100,
 * and bounded arrays. This is provenance-shape validation only — it does NOT
 * participate in any governance, lifecycle, priority or routing decision.
 */
export function validateSourceClassification(
  sc: SourceClassification,
): SourceClassificationValidation {
  const errors: string[] = [];

  if (!FINDING_CLASSES.includes(sc.findingClass)) {
    errors.push(`Invalid findingClass: ${String(sc.findingClass)}.`);
  }

  if (sc.sourceSeverity.severityId < 1 || sc.sourceSeverity.severityId > 5) {
    errors.push(`severityId out of range (1-5): ${sc.sourceSeverity.severityId}.`);
  }

  if (
    sc.sourceConfidence.confidenceScore < 0 ||
    sc.sourceConfidence.confidenceScore > 100
  ) {
    errors.push(
      `confidenceScore out of range (0-100): ${sc.sourceConfidence.confidenceScore}.`,
    );
  }

  if (!sc.sourceFindingUid || sc.sourceFindingUid.trim() === '') {
    errors.push('sourceFindingUid is required.');
  }

  if (!sc.sourceProduct.vendor || !sc.sourceProduct.name) {
    errors.push('sourceProduct.vendor and sourceProduct.name are required.');
  }

  if (sc.attacks && sc.attacks.length > MAX_ATTACK_BINDINGS) {
    errors.push(`attacks[] exceeds max ${MAX_ATTACK_BINDINGS} (${sc.attacks.length}).`);
  }

  if (sc.observables && sc.observables.length > MAX_OBSERVABLES) {
    errors.push(`observables[] exceeds max ${MAX_OBSERVABLES} (${sc.observables.length}).`);
  }

  return { valid: errors.length === 0, errors };
}
