/**
 * Control Assessment Entity — Commander C2
 *
 * Governed by:
 *   - NIST CSF 2.0 — Maps controls to CSF categories
 *   - ISO 27005:2022 — Risk treatment controls
 *
 * Purpose: Assess individual security/governance controls.
 * Controls are the atomic unit of posture measurement.
 * Each control maps to NIST CSF category and feeds into PostureScore.
 *
 * Standards adherence:
 *   - NIST CSF 2.0 category/subcategory IDs exact
 *   - ISO 27005 consequence terminology (NOT "impact")
 *   - commander_ prefix on ALL extension fields
 */

import type { CommonFields } from './common';
import type { NistCsfFunction } from './posture-score';

// ─── Control Status ──────────────────────────────────────────────────────────

export type ControlStatus =
  | 'implemented'
  | 'partially_implemented'
  | 'planned'
  | 'not_implemented'
  | 'not_applicable';

// ─── Control Effectiveness ───────────────────────────────────────────────────

export type ControlEffectiveness = 'effective' | 'partially_effective' | 'ineffective' | 'not_assessed';

// ─── Evidence Type ───────────────────────────────────────────────────────────

export type EvidenceType = 'automated_scan' | 'manual_review' | 'documentation' | 'interview' | 'observation' | 'testing';

// ─── Control Assessment Entity ───────────────────────────────────────────────

export interface ControlAssessment extends CommonFields {
  entityType: 'control-assessment';

  /** Unique control assessment identifier */
  controlId: string;

  // ─── Control identification ────────────────────────────────────────
  /** Control name */
  controlName: string;
  /** Control description */
  controlDescription: string;
  /** Control family or grouping */
  controlFamily: string;
  /** Control reference ID (from source framework) */
  controlReferenceId: string;

  // ─── NIST CSF 2.0 mapping ─────────────────────────────────────────
  /** Primary CSF Function */
  csfFunction: NistCsfFunction;
  /** CSF Category ID this control maps to */
  csfCategoryId: string;
  /** CSF Subcategory ID (if applicable) */
  csfSubcategoryId: string | null;

  // ─── Assessment results ────────────────────────────────────────────
  /** Implementation status */
  status: ControlStatus;
  /** Assessed effectiveness */
  effectiveness: ControlEffectiveness;
  /** Score (0-100) */
  score: number;
  /** Assessment date */
  assessedAt: string;
  /** Who assessed */
  assessedBy: string;

  // ─── Evidence ──────────────────────────────────────────────────────
  /** Type of evidence collected */
  evidenceType: EvidenceType;
  /** Evidence description */
  evidenceDescription: string;
  /** Evidence collected date */
  evidenceDate: string;

  // ─── Consequence of failure (ISO 27005 terminology) ────────────────
  /** Consequence if control fails (ISO 27005: NOT "impact") */
  consequenceOfFailure: string;
  /** Consequence severity */
  consequenceSeverity: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';

  // ─── Remediation ───────────────────────────────────────────────────
  /** Required remediation (null if passing) */
  remediationRequired: string | null;
  /** Remediation deadline */
  remediationDeadline: string | null;
  /** Related risk IDs */
  relatedRiskIds: string[];

  // ─── Commander extensions ──────────────────────────────────────────
  /** commander_: Automated adherence check result */
  commander_automatedCheckPassed: boolean | null;
  /** commander_: Last automated check timestamp */
  commander_lastAutomatedCheck: string | null;
  /** commander_: Affected topology nodes */
  commander_affectedNodeIds: string[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ControlAssessmentValidation {
  valid: boolean;
  errors: string[];
}

const CONTROL_STATUSES: ControlStatus[] = [
  'implemented', 'partially_implemented', 'planned', 'not_implemented', 'not_applicable',
];
const CONTROL_EFFECTIVENESS: ControlEffectiveness[] = ['effective', 'partially_effective', 'ineffective', 'not_assessed'];
const EVIDENCE_TYPES: EvidenceType[] = ['automated_scan', 'manual_review', 'documentation', 'interview', 'observation', 'testing'];
const CSF_FUNCTIONS: NistCsfFunction[] = ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'];
const CONSEQUENCE_SEVERITIES = ['negligible', 'minor', 'moderate', 'major', 'catastrophic'] as const;

export function validateControlAssessment(c: ControlAssessment): ControlAssessmentValidation {
  const errors: string[] = [];

  if (!c.id || c.id.trim() === '') errors.push('id: required');
  if (!c.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!c.controlId || c.controlId.trim() === '') errors.push('controlId: required');
  if (!c.controlName || c.controlName.trim() === '') errors.push('controlName: required');
  if (!c.controlDescription || c.controlDescription.trim() === '') errors.push('controlDescription: required');
  if (!c.controlFamily || c.controlFamily.trim() === '') errors.push('controlFamily: required');
  if (!c.controlReferenceId || c.controlReferenceId.trim() === '') errors.push('controlReferenceId: required');

  // NIST CSF
  if (!CSF_FUNCTIONS.includes(c.csfFunction)) {
    errors.push('csfFunction: must be Govern | Identify | Protect | Detect | Respond | Recover');
  }
  if (!c.csfCategoryId || c.csfCategoryId.trim() === '') errors.push('csfCategoryId: required');

  // Assessment
  if (!CONTROL_STATUSES.includes(c.status)) {
    errors.push('status: must be valid ControlStatus');
  }
  if (!CONTROL_EFFECTIVENESS.includes(c.effectiveness)) {
    errors.push('effectiveness: must be effective | partially_effective | ineffective | not_assessed');
  }
  if (typeof c.score !== 'number' || c.score < 0 || c.score > 100) {
    errors.push('score: must be 0-100');
  }
  if (!c.assessedAt || c.assessedAt.trim() === '') errors.push('assessedAt: required');
  if (!c.assessedBy || c.assessedBy.trim() === '') errors.push('assessedBy: required');

  // Evidence
  if (!EVIDENCE_TYPES.includes(c.evidenceType)) {
    errors.push('evidenceType: must be valid EvidenceType');
  }
  if (!c.evidenceDescription || c.evidenceDescription.trim() === '') errors.push('evidenceDescription: required');
  if (!c.evidenceDate || c.evidenceDate.trim() === '') errors.push('evidenceDate: required');

  // Consequence (ISO 27005)
  if (!c.consequenceOfFailure || c.consequenceOfFailure.trim() === '') {
    errors.push('consequenceOfFailure: required');
  }
  if (!CONSEQUENCE_SEVERITIES.includes(c.consequenceSeverity as typeof CONSEQUENCE_SEVERITIES[number])) {
    errors.push('consequenceSeverity: must be negligible | minor | moderate | major | catastrophic');
  }

  // Arrays
  if (!Array.isArray(c.relatedRiskIds)) errors.push('relatedRiskIds: must be array');
  if (!Array.isArray(c.commander_affectedNodeIds)) errors.push('commander_affectedNodeIds: must be array');

  return { valid: errors.length === 0, errors };
}
