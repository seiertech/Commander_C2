/**
 * Control Framework Mapping Entities — Commander SDR Canonical Model
 *
 * Source: Spec #55 Baseline Configuration Framework Model and Defaults;
 *         Spec #10 Platform Security (§8 Baseline Profiles);
 *         Feature Registry FR-FRAME-001 (Control Framework Baseline Profiles);
 *         Kiro Spec 11 (Control Coverage & Editable Baselines)
 *
 * Build unit: CFM (Control Framework Mapping — Foundational)
 * Resolves: ARCH-DEBT-051 (Control Framework Mapping entity absent)
 *
 * FIVE entities:
 * 1. ControlFramework — the adherence standard itself (ISO 27001, NIST CSF, etc.)
 * 2. FrameworkControl — individual control within a framework
 * 3. ControlRequirement — testable requirement bound to a control
 * 4. ControlEvaluation — result of evaluating an entity against a requirement
 * 5. ControlMapping — relationship binding Commander entities to framework controls
 *
 * METHODOLOGY:
 * - Ingestion is the first classification layer, NOT the adherence decision layer
 * - OCSF/event class informs but never determines adherence alone
 * - Adherence evaluation compares asset/identity/case/risk/evidence state
 *   against defined requirements to produce a verdict
 * - Commander identity is primary — controls are mapped TO framework controls
 *
 * SOURCING RULE:
 * - Record source of truth, version, publisher, licence/use constraints
 * - Do NOT copy restricted framework text
 * - For restricted frameworks: store control ID, short internal summary,
 *   and reference metadata only
 *
 * ADDITIVE ONLY — does not modify case lifecycle or existing entity logic.
 */

import type { CommonFields } from './common';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CONTROL FRAMEWORK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Framework category — distinguishes regulatory obligations from
 * industry standards and internal controls.
 */
export type FrameworkCategory =
  | 'regulatory'       // DORA, NIS2, PCI-DSS, Cyber Essentials
  | 'industry'         // ISO 27001, NIST CSF, CIS Controls, SOC 2
  | 'vendor'           // AWS Well-Architected, Azure Security Benchmark
  | 'maturity_model'   // Zero Trust, CTEM
  | 'internal';        // Custom organisational controls

export const FRAMEWORK_CATEGORIES: FrameworkCategory[] = [
  'regulatory',
  'industry',
  'vendor',
  'maturity_model',
  'internal',
];

/** Licence/use status — governs what content can be stored/displayed. */
export type LicenceStatus =
  | 'open'             // Freely available (NIST CSF, CIS benchmarks community)
  | 'restricted'       // May reference but not reproduce full text (ISO)
  | 'licensed'         // Organisation holds distribution licence
  | 'internal_only';   // Internal — no external sourcing constraint

export const LICENCE_STATUSES: LicenceStatus[] = [
  'open',
  'restricted',
  'licensed',
  'internal_only',
];

/**
 * ControlFramework — the adherence standard itself.
 *
 * Represents a versioned adherence/control framework available to a tenant.
 * Tenant-scoped: frameworks are enabled/disabled per tenant.
 * Origin distinguishes prebuilt Commander-shipped frameworks from
 * tenant-custom or tenant-uploaded frameworks.
 */
export interface ControlFramework extends CommonFields {
  entityType: 'control_framework';
  /** Short code identifier (e.g. 'iso-27001', 'nist-csf-2.0', 'cis-v8') */
  frameworkId: string;
  /** Full display name */
  frameworkName: string;
  /** Framework version string */
  version: string;
  /** Framework category */
  category: FrameworkCategory;
  /** Publisher/owner of the framework */
  publisher: string;
  /** Total control count in this framework version */
  totalControls: number;
  /** Prebuilt (Commander-shipped) or custom (tenant-provided) */
  origin: 'prebuilt' | 'custom';
  /** Active/enabled for this tenant */
  active: boolean;
  /** Licence/use status governing content storage */
  licenceStatus: LicenceStatus;
  /** Source reference URL or document identifier */
  sourceRef: string;
  /** Mapping completeness (0-100): what % of controls have at least one mapping */
  mappingCompleteness: number;
  /** Last reviewed date (ISO 8601) */
  lastReviewedAt: string;
  /** Notes on licence constraints (free text) */
  licenceNotes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. FRAMEWORK CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

/** Implementation tier for a control within a framework. */
export type ControlTier = 'mandatory' | 'recommended' | 'optional';

export const CONTROL_TIERS: ControlTier[] = [
  'mandatory',
  'recommended',
  'optional',
];

/**
 * FrameworkControl — individual control within a framework.
 *
 * For restricted frameworks (ISO), the `objective` field contains only
 * a short internal summary — not reproduced standard text.
 */
export interface FrameworkControl extends CommonFields {
  entityType: 'framework_control';
  /** Parent framework ID */
  frameworkId: string;
  /** Control identifier within the framework (e.g. 'A.8.1', 'PR.AC-1', '1.1') */
  controlId: string;
  /** Control display name */
  controlName: string;
  /** Domain/category within the framework (e.g. 'Access Control', 'Protect') */
  domain: string;
  /** Sub-domain if applicable */
  subDomain?: string;
  /** Control objective or short internal summary */
  objective: string;
  /** Implementation tier */
  tier: ControlTier;
  /** Parent control ID for hierarchical frameworks (null if top-level) */
  parentControlId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CONTROL REQUIREMENT
// ═══════════════════════════════════════════════════════════════════════════════

/** The type of entity a requirement tests against. */
export type RequirementTargetType =
  | 'asset'
  | 'identity'
  | 'case'
  | 'risk_object'
  | 'evidence'
  | 'connector'
  | 'analytic'
  | 'action'
  | 'sub_action';

export const REQUIREMENT_TARGET_TYPES: RequirementTargetType[] = [
  'asset',
  'identity',
  'case',
  'risk_object',
  'evidence',
  'connector',
  'analytic',
  'action',
  'sub_action',
];

/**
 * ControlRequirement — a testable requirement bound to a framework control.
 *
 * Defines WHAT is being tested for adherence:
 * - patch_age_days <= 30
 * - mfa_enabled == true
 * - edr_present == true
 * - encryption_enabled == true
 * - privileged_access_reviewed within 90 days
 *
 * Requirements bridge the gap between abstract framework controls
 * and concrete, measurable conditions in the Commander data model.
 */
export interface ControlRequirement extends CommonFields {
  entityType: 'control_requirement';
  /** Parent framework ID */
  frameworkId: string;
  /** Parent control ID */
  controlId: string;
  /** Requirement identifier (scoped within the control) */
  requirementId: string;
  /** Human-readable description of what is required */
  description: string;
  /** What entity type this requirement evaluates */
  targetType: RequirementTargetType;
  /** Machine-readable evaluation rule (structured, not code) */
  evaluationRule: EvaluationRule;
  /** Whether this requirement is active for evaluation */
  active: boolean;
}

/**
 * EvaluationRule — structured definition of what to check.
 * This is a data structure, not executable code.
 * Evaluation engines interpret this to produce ControlEvaluation results.
 */
export interface EvaluationRule {
  /** Field or property to evaluate (dot-notation path) */
  field: string;
  /** Comparison operator */
  operator: EvaluationOperator;
  /** Expected value (string-encoded for portability) */
  expectedValue: string;
  /** Unit of measurement if applicable */
  unit?: string;
}

export type EvaluationOperator =
  | 'equals'
  | 'not_equals'
  | 'less_than'
  | 'less_than_or_equal'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'contains'
  | 'not_contains'
  | 'exists'
  | 'not_exists'
  | 'within_days';

export const EVALUATION_OPERATORS: EvaluationOperator[] = [
  'equals',
  'not_equals',
  'less_than',
  'less_than_or_equal',
  'greater_than',
  'greater_than_or_equal',
  'contains',
  'not_contains',
  'exists',
  'not_exists',
  'within_days',
];

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CONTROL EVALUATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Adherence evaluation result. */
export type AdherenceVerdict =
  | 'compliant'
  | 'non_compliant'
  | 'partial'
  | 'unknown'
  | 'not_applicable';

export const ADHERENCE_VERDICTS: AdherenceVerdict[] = [
  'compliant',
  'non_compliant',
  'partial',
  'unknown',
  'not_applicable',
];

/**
 * ControlEvaluation — result of evaluating an entity against a requirement.
 *
 * Produced when Commander evaluates a specific entity's state against
 * a ControlRequirement. This is the adherence decision layer.
 *
 * Includes exception/accepted-risk state and SLA/treatment state
 * from the owning Risk Object (if one exists for non-adherence).
 */
export interface ControlEvaluation extends CommonFields {
  entityType: 'control_evaluation';
  /** Framework being evaluated */
  frameworkId: string;
  /** Control being evaluated */
  controlId: string;
  /** Requirement being evaluated */
  requirementId: string;
  /** Entity being evaluated */
  evaluatedEntityType: RequirementTargetType;
  evaluatedEntityId: string;
  /** Evaluation verdict */
  verdict: AdherenceVerdict;
  /** Evidence supporting the verdict (reference to evidence entity or inline) */
  evidenceRef?: string;
  /** If non-compliant, reference to the created/linked Risk Object */
  riskObjectRef?: string;
  /** Exception state (accepted risk, compensating control, waiver) */
  exceptionState?: ExceptionState;
  /** When this evaluation was performed */
  evaluatedAt: string;
  /** When the next evaluation is due */
  nextEvaluationDue?: string;
  /** Evaluation confidence (0-100) */
  confidence: number;
}

export type ExceptionState =
  | 'none'
  | 'accepted_risk'
  | 'compensating_control'
  | 'waiver'
  | 'deferred';

export const EXCEPTION_STATES: ExceptionState[] = [
  'none',
  'accepted_risk',
  'compensating_control',
  'waiver',
  'deferred',
];

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CONTROL MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/** Entity types that can be mapped to framework controls. */
export type MappedEntityType =
  | 'risk_object'
  | 'case'
  | 'action'
  | 'sub_action'
  | 'analytic'
  | 'evidence'
  | 'strategy_policy'
  | 'asset'
  | 'identity'
  | 'connector';

export const MAPPED_ENTITY_TYPES: MappedEntityType[] = [
  'risk_object',
  'case',
  'action',
  'sub_action',
  'analytic',
  'evidence',
  'strategy_policy',
  'asset',
  'identity',
  'connector',
];

/** Source of the mapping — who/what created it. */
export type MappingSource = 'system' | 'manual' | 'ai_suggested';

export const MAPPING_SOURCES: MappingSource[] = [
  'system',
  'manual',
  'ai_suggested',
];

/** Coverage contribution level. */
export type CoverageContribution = 'full' | 'partial' | 'evidence_only';

export const COVERAGE_CONTRIBUTIONS: CoverageContribution[] = [
  'full',
  'partial',
  'evidence_only',
];

/**
 * ControlMapping — relationship binding Commander entities to framework controls.
 *
 * Commander identity is primary: entities are mapped TO framework controls,
 * not derived FROM them. This preserves the Commander canonical model as
 * the system of record, with framework mapping as an overlay.
 */
export interface ControlMapping extends CommonFields {
  entityType: 'control_mapping';
  /** Target framework */
  frameworkId: string;
  /** Target control within the framework */
  controlId: string;
  /** Commander entity being mapped */
  mappedEntityType: MappedEntityType;
  mappedEntityId: string;
  /** Mapping confidence (0-100) */
  confidence: number;
  /** Source of the mapping */
  mappingSource: MappingSource;
  /** Mapping rationale */
  rationale: string;
  /** Coverage contribution level */
  coverageContribution: CoverageContribution;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Validation result shape (consistent with other Commander entities). */
export interface ControlFrameworkValidation {
  valid: boolean;
  errors: string[];
}

/** Validate a ControlFramework entity. */
export function validateControlFramework(fw: ControlFramework): ControlFrameworkValidation {
  const errors: string[] = [];
  if (!fw.frameworkId || fw.frameworkId.trim() === '') errors.push('frameworkId is required.');
  if (!fw.frameworkName || fw.frameworkName.trim() === '') errors.push('frameworkName is required.');
  if (!fw.version || fw.version.trim() === '') errors.push('version is required.');
  if (!FRAMEWORK_CATEGORIES.includes(fw.category)) errors.push(`Invalid category: ${String(fw.category)}.`);
  if (!fw.publisher || fw.publisher.trim() === '') errors.push('publisher is required.');
  if (fw.totalControls < 0) errors.push(`totalControls must be >= 0: ${fw.totalControls}.`);
  if (!LICENCE_STATUSES.includes(fw.licenceStatus)) errors.push(`Invalid licenceStatus: ${String(fw.licenceStatus)}.`);
  if (fw.mappingCompleteness < 0 || fw.mappingCompleteness > 100) errors.push(`mappingCompleteness must be 0-100: ${fw.mappingCompleteness}.`);
  return { valid: errors.length === 0, errors };
}

/** Validate a FrameworkControl entity. */
export function validateFrameworkControl(ctrl: FrameworkControl): ControlFrameworkValidation {
  const errors: string[] = [];
  if (!ctrl.frameworkId || ctrl.frameworkId.trim() === '') errors.push('frameworkId is required.');
  if (!ctrl.controlId || ctrl.controlId.trim() === '') errors.push('controlId is required.');
  if (!ctrl.controlName || ctrl.controlName.trim() === '') errors.push('controlName is required.');
  if (!ctrl.domain || ctrl.domain.trim() === '') errors.push('domain is required.');
  if (!ctrl.objective || ctrl.objective.trim() === '') errors.push('objective is required.');
  if (!CONTROL_TIERS.includes(ctrl.tier)) errors.push(`Invalid tier: ${String(ctrl.tier)}.`);
  return { valid: errors.length === 0, errors };
}

/** Validate a ControlRequirement entity. */
export function validateControlRequirement(req: ControlRequirement): ControlFrameworkValidation {
  const errors: string[] = [];
  if (!req.frameworkId || req.frameworkId.trim() === '') errors.push('frameworkId is required.');
  if (!req.controlId || req.controlId.trim() === '') errors.push('controlId is required.');
  if (!req.requirementId || req.requirementId.trim() === '') errors.push('requirementId is required.');
  if (!req.description || req.description.trim() === '') errors.push('description is required.');
  if (!REQUIREMENT_TARGET_TYPES.includes(req.targetType)) errors.push(`Invalid targetType: ${String(req.targetType)}.`);
  if (!req.evaluationRule) errors.push('evaluationRule is required.');
  else {
    if (!req.evaluationRule.field || req.evaluationRule.field.trim() === '') errors.push('evaluationRule.field is required.');
    if (!EVALUATION_OPERATORS.includes(req.evaluationRule.operator)) errors.push(`Invalid evaluationRule.operator: ${String(req.evaluationRule.operator)}.`);
  }
  return { valid: errors.length === 0, errors };
}

/** Validate a ControlEvaluation entity. */
export function validateControlEvaluation(ev: ControlEvaluation): ControlFrameworkValidation {
  const errors: string[] = [];
  if (!ev.frameworkId || ev.frameworkId.trim() === '') errors.push('frameworkId is required.');
  if (!ev.controlId || ev.controlId.trim() === '') errors.push('controlId is required.');
  if (!ev.requirementId || ev.requirementId.trim() === '') errors.push('requirementId is required.');
  if (!REQUIREMENT_TARGET_TYPES.includes(ev.evaluatedEntityType)) errors.push(`Invalid evaluatedEntityType: ${String(ev.evaluatedEntityType)}.`);
  if (!ev.evaluatedEntityId || ev.evaluatedEntityId.trim() === '') errors.push('evaluatedEntityId is required.');
  if (!ADHERENCE_VERDICTS.includes(ev.verdict)) errors.push(`Invalid verdict: ${String(ev.verdict)}.`);
  if (!ev.evaluatedAt || ev.evaluatedAt.trim() === '') errors.push('evaluatedAt is required.');
  if (ev.confidence < 0 || ev.confidence > 100) errors.push(`confidence must be 0-100: ${ev.confidence}.`);
  if (ev.exceptionState && !EXCEPTION_STATES.includes(ev.exceptionState)) errors.push(`Invalid exceptionState: ${String(ev.exceptionState)}.`);
  return { valid: errors.length === 0, errors };
}

/** Validate a ControlMapping entity. */
export function validateControlMapping(m: ControlMapping): ControlFrameworkValidation {
  const errors: string[] = [];
  if (!m.frameworkId || m.frameworkId.trim() === '') errors.push('frameworkId is required.');
  if (!m.controlId || m.controlId.trim() === '') errors.push('controlId is required.');
  if (!MAPPED_ENTITY_TYPES.includes(m.mappedEntityType)) errors.push(`Invalid mappedEntityType: ${String(m.mappedEntityType)}.`);
  if (!m.mappedEntityId || m.mappedEntityId.trim() === '') errors.push('mappedEntityId is required.');
  if (m.confidence < 0 || m.confidence > 100) errors.push(`confidence must be 0-100: ${m.confidence}.`);
  if (!MAPPING_SOURCES.includes(m.mappingSource)) errors.push(`Invalid mappingSource: ${String(m.mappingSource)}.`);
  if (!m.rationale || m.rationale.trim() === '') errors.push('rationale is required.');
  if (!COVERAGE_CONTRIBUTIONS.includes(m.coverageContribution)) errors.push(`Invalid coverageContribution: ${String(m.coverageContribution)}.`);
  return { valid: errors.length === 0, errors };
}
