/**
 * Posture Score Entity — Commander C2
 *
 * Governed by: NIST CSF 2.0
 * Purpose: Track cybersecurity posture scores across NIST CSF 2.0 functions,
 * categories, and subcategories. Provides point-in-time snapshots of
 * organisational adherence to NIST framework.
 *
 * NIST CSF 2.0 Functions: Govern, Identify, Protect, Detect, Respond, Recover
 * (6 functions — CSF 2.0 added "Govern" to the original 5)
 *
 * Standards adherence:
 *   - NIST CSF 2.0 function/category/subcategory taxonomy exact
 *   - commander_ prefix on ALL extension fields
 */

import type { CommonFields } from './common';

// ─── NIST CSF 2.0 Functions ──────────────────────────────────────────────────

export type NistCsfFunction =
  | 'Govern'
  | 'Identify'
  | 'Protect'
  | 'Detect'
  | 'Respond'
  | 'Recover';

// ─── Score Tier ──────────────────────────────────────────────────────────────

export type PostureTier =
  | 'partial'      // Tier 1
  | 'risk_informed' // Tier 2
  | 'repeatable'   // Tier 3
  | 'adaptive';    // Tier 4

// ─── Assessment Type ─────────────────────────────────────────────────────────

export type AssessmentType = 'automated' | 'manual' | 'hybrid' | 'continuous';

// ─── Posture Score Entity ────────────────────────────────────────────────────

export interface PostureScore extends CommonFields {
  entityType: 'posture-score';

  /** Unique posture score identifier */
  scoreId: string;

  // ─── NIST CSF 2.0 taxonomy ────────────────────────────────────────
  /** CSF Function (Govern, Identify, Protect, Detect, Respond, Recover) */
  csfFunction: NistCsfFunction;
  /** CSF Category ID (e.g. "GV.OC", "ID.AM", "PR.AC") */
  csfCategoryId: string;
  /** CSF Category name */
  csfCategoryName: string;
  /** CSF Subcategory ID (e.g. "GV.OC-01", "ID.AM-01") — null for function-level scores */
  csfSubcategoryId: string | null;
  /** CSF Subcategory description */
  csfSubcategoryDescription: string | null;

  // ─── Scoring ───────────────────────────────────────────────────────
  /** Current score (0-100) */
  currentScore: number;
  /** Previous score (for trend) */
  previousScore: number | null;
  /** Target score */
  targetScore: number;
  /** Implementation tier */
  tier: PostureTier;
  /** Score trend: positive, negative, stable */
  trend: 'positive' | 'negative' | 'stable';

  // ─── Assessment context ────────────────────────────────────────────
  /** How this score was assessed */
  assessmentType: AssessmentType;
  /** When assessment was conducted */
  assessedAt: string;
  /** Who/what conducted the assessment */
  assessedBy: string;
  /** Next scheduled assessment */
  nextAssessmentDate: string;

  // ─── Evidence ──────────────────────────────────────────────────────
  /** Number of controls assessed for this score */
  controlsAssessed: number;
  /** Number of controls passing */
  controlsPassing: number;
  /** Related control assessment IDs */
  relatedControlIds: string[];

  // ─── Commander extensions ──────────────────────────────────────────
  /** commander_: Weighted contribution to overall posture */
  commander_weightedContribution: number | null;
  /** commander_: AI-predicted score trajectory (30 days) */
  commander_predictedScore30d: number | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PostureScoreValidation {
  valid: boolean;
  errors: string[];
}

const CSF_FUNCTIONS: NistCsfFunction[] = ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'];
const POSTURE_TIERS: PostureTier[] = ['partial', 'risk_informed', 'repeatable', 'adaptive'];
const ASSESSMENT_TYPES: AssessmentType[] = ['automated', 'manual', 'hybrid', 'continuous'];
const TRENDS = ['positive', 'negative', 'stable'] as const;

export function validatePostureScore(p: PostureScore): PostureScoreValidation {
  const errors: string[] = [];

  if (!p.id || p.id.trim() === '') errors.push('id: required');
  if (!p.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!p.scoreId || p.scoreId.trim() === '') errors.push('scoreId: required');

  // NIST CSF taxonomy
  if (!CSF_FUNCTIONS.includes(p.csfFunction)) {
    errors.push('csfFunction: must be Govern | Identify | Protect | Detect | Respond | Recover');
  }
  if (!p.csfCategoryId || p.csfCategoryId.trim() === '') errors.push('csfCategoryId: required');
  if (!p.csfCategoryName || p.csfCategoryName.trim() === '') errors.push('csfCategoryName: required');

  // Scoring
  if (typeof p.currentScore !== 'number' || p.currentScore < 0 || p.currentScore > 100) {
    errors.push('currentScore: must be 0-100');
  }
  if (typeof p.targetScore !== 'number' || p.targetScore < 0 || p.targetScore > 100) {
    errors.push('targetScore: must be 0-100');
  }
  if (!POSTURE_TIERS.includes(p.tier)) {
    errors.push('tier: must be partial | risk_informed | repeatable | adaptive');
  }
  if (!TRENDS.includes(p.trend)) {
    errors.push('trend: must be positive | negative | stable');
  }

  // Assessment
  if (!ASSESSMENT_TYPES.includes(p.assessmentType)) {
    errors.push('assessmentType: must be automated | manual | hybrid | continuous');
  }
  if (!p.assessedAt || p.assessedAt.trim() === '') errors.push('assessedAt: required');
  if (!p.assessedBy || p.assessedBy.trim() === '') errors.push('assessedBy: required');
  if (!p.nextAssessmentDate || p.nextAssessmentDate.trim() === '') errors.push('nextAssessmentDate: required');

  // Evidence
  if (typeof p.controlsAssessed !== 'number' || p.controlsAssessed < 0) {
    errors.push('controlsAssessed: must be >= 0');
  }
  if (typeof p.controlsPassing !== 'number' || p.controlsPassing < 0) {
    errors.push('controlsPassing: must be >= 0');
  }
  if (p.controlsPassing > p.controlsAssessed) {
    errors.push('controlsPassing: cannot exceed controlsAssessed');
  }
  if (!Array.isArray(p.relatedControlIds)) errors.push('relatedControlIds: must be array');

  return { valid: errors.length === 0, errors };
}
