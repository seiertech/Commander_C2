/**
 * Risk Register Entity — Commander C2
 *
 * Governed by:
 *   - ISO 27005:2022 — Information security risk management
 *   - ISO 31000:2018 — Risk management principles and guidelines
 *
 * Standards adherence:
 *   - ISO 27005: "consequence" (NOT "impact"), "likelihood", "risk level"
 *   - ISO 31000: risk criteria, risk owner, risk treatment
 *   - commander_ prefix on ALL extension fields
 *
 * Purpose: Central register of identified risks with ISO-compliant assessment,
 * treatment tracking, and linkage to findings/topology.
 */

import type { CommonFields } from './common';

// ─── Risk Status (ISO 31000 lifecycle) ───────────────────────────────────────

export type RiskStatus =
  | 'identified'
  | 'analysed'
  | 'evaluated'
  | 'treated'
  | 'accepted'
  | 'closed'
  | 'monitoring';

// ─── Consequence Level (ISO 27005 — NOT "impact") ────────────────────────────

export type ConsequenceLevel =
  | 'negligible'
  | 'minor'
  | 'moderate'
  | 'major'
  | 'catastrophic';

// ─── Likelihood Level (ISO 27005) ────────────────────────────────────────────

export type LikelihoodLevel =
  | 'rare'
  | 'unlikely'
  | 'possible'
  | 'likely'
  | 'almost_certain';

// ─── Risk Level (ISO 27005 — derived from consequence × likelihood) ──────────

export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'critical';

// ─── Treatment Strategy (ISO 31000) ──────────────────────────────────────────

export type TreatmentStrategy =
  | 'avoid'
  | 'modify'
  | 'share'
  | 'retain';

// ─── Risk Register Entity ────────────────────────────────────────────────────

export interface RiskRegister extends CommonFields {
  entityType: 'risk-register';

  /** Unique risk identifier */
  riskId: string;

  // ─── Risk identification (ISO 31000 §6.4.2) ───────────────────────
  /** Risk title */
  title: string;
  /** Detailed risk description */
  description: string;
  /** Risk category (operational, strategic, financial, compliance, technical) */
  category: string;
  /** Risk source — what generates this risk */
  riskSource: string;
  /** Potential event description */
  potentialEvent: string;

  // ─── Risk analysis (ISO 27005 §8.3) ───────────────────────────────
  /** Consequence level (ISO 27005 — NOT "impact") */
  consequence: ConsequenceLevel;
  /** Likelihood level */
  likelihood: LikelihoodLevel;
  /** Computed risk level (consequence × likelihood matrix) */
  riskLevel: RiskLevel;
  /** Numeric risk score (1-25, derived from 5×5 matrix) */
  riskScore: number;

  // ─── Risk evaluation (ISO 31000 §6.4.4) ───────────────────────────
  /** Current status in risk lifecycle */
  status: RiskStatus;
  /** Residual risk level after treatment */
  residualRiskLevel: RiskLevel | null;
  /** Residual risk score after treatment */
  residualRiskScore: number | null;

  // ─── Risk treatment (ISO 31000 §6.5) ──────────────────────────────
  /** Selected treatment strategy */
  treatmentStrategy: TreatmentStrategy | null;
  /** Treatment plan description */
  treatmentPlan: string | null;
  /** Treatment deadline */
  treatmentDeadline: string | null;
  /** Whether treatment is on track */
  treatmentOnTrack: boolean | null;

  // ─── Ownership (ISO 31000 §5.4.2) ─────────────────────────────────
  /** Risk owner (accountable person/role) */
  riskOwner: string;
  /** Risk analyst (person conducting assessment) */
  riskAnalyst: string | null;

  // ─── Context & linkage ─────────────────────────────────────────────
  /** Related finding event IDs */
  relatedFindingIds: string[];
  /** Affected topology node IDs */
  affectedNodeIds: string[];
  /** Related control assessment IDs */
  relatedControlIds: string[];
  /** Review/reassessment date */
  nextReviewDate: string;

  // ─── Commander extensions ──────────────────────────────────────────
  /** commander_: NIST CSF function this risk maps to */
  commander_csfFunction: string | null;
  /** commander_: AI-suggested treatment confidence */
  commander_aiTreatmentConfidence: number | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface RiskRegisterValidation {
  valid: boolean;
  errors: string[];
}

const RISK_STATUSES: RiskStatus[] = ['identified', 'analysed', 'evaluated', 'treated', 'accepted', 'closed', 'monitoring'];
const CONSEQUENCE_LEVELS: ConsequenceLevel[] = ['negligible', 'minor', 'moderate', 'major', 'catastrophic'];
const LIKELIHOOD_LEVELS: LikelihoodLevel[] = ['rare', 'unlikely', 'possible', 'likely', 'almost_certain'];
const RISK_LEVELS: RiskLevel[] = ['very_low', 'low', 'medium', 'high', 'very_high', 'critical'];
const TREATMENT_STRATEGIES: TreatmentStrategy[] = ['avoid', 'modify', 'share', 'retain'];

export function validateRiskRegister(r: RiskRegister): RiskRegisterValidation {
  const errors: string[] = [];

  if (!r.id || r.id.trim() === '') errors.push('id: required');
  if (!r.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!r.riskId || r.riskId.trim() === '') errors.push('riskId: required');
  if (!r.title || r.title.trim() === '') errors.push('title: required');
  if (!r.description || r.description.trim() === '') errors.push('description: required');
  if (!r.category || r.category.trim() === '') errors.push('category: required');
  if (!r.riskSource || r.riskSource.trim() === '') errors.push('riskSource: required');
  if (!r.potentialEvent || r.potentialEvent.trim() === '') errors.push('potentialEvent: required');

  // ISO 27005 analysis
  if (!CONSEQUENCE_LEVELS.includes(r.consequence)) {
    errors.push('consequence: must be negligible | minor | moderate | major | catastrophic');
  }
  if (!LIKELIHOOD_LEVELS.includes(r.likelihood)) {
    errors.push('likelihood: must be rare | unlikely | possible | likely | almost_certain');
  }
  if (!RISK_LEVELS.includes(r.riskLevel)) {
    errors.push('riskLevel: must be very_low | low | medium | high | very_high | critical');
  }
  if (typeof r.riskScore !== 'number' || r.riskScore < 1 || r.riskScore > 25) {
    errors.push('riskScore: must be 1-25');
  }

  // Status & treatment
  if (!RISK_STATUSES.includes(r.status)) {
    errors.push('status: must be valid RiskStatus');
  }
  if (r.treatmentStrategy !== null && !TREATMENT_STRATEGIES.includes(r.treatmentStrategy)) {
    errors.push('treatmentStrategy: must be null or avoid | modify | share | retain');
  }
  if (r.residualRiskLevel !== null && !RISK_LEVELS.includes(r.residualRiskLevel)) {
    errors.push('residualRiskLevel: must be null or valid RiskLevel');
  }

  // Ownership
  if (!r.riskOwner || r.riskOwner.trim() === '') errors.push('riskOwner: required');
  if (!r.nextReviewDate || r.nextReviewDate.trim() === '') errors.push('nextReviewDate: required');

  // Arrays
  if (!Array.isArray(r.relatedFindingIds)) errors.push('relatedFindingIds: must be array');
  if (!Array.isArray(r.affectedNodeIds)) errors.push('affectedNodeIds: must be array');
  if (!Array.isArray(r.relatedControlIds)) errors.push('relatedControlIds: must be array');

  return { valid: errors.length === 0, errors };
}
