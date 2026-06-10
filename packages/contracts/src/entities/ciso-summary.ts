/**
 * CISO Summary Entity — Commander C2 Canonical Model
 *
 * Source: Master Technical Specification §Executive Surface,
 *         Spec #57 Security Command and Control Doctrine (executive posture)
 *
 * The CISO Summary is a pre-computed executive aggregate snapshot providing
 * the top-level operating picture for the CISO dashboard. It aggregates
 * posture, risk, exposure, debt, control adherence, and case metrics into
 * a single record updated periodically.
 *
 * Ownership: CISO (consumer), System (producer)
 * Build Unit: Tier 3 batch (phase1-entity-creation)
 * Unlocks: /ciso (top nav workspace tab)
 */

import type { CommonFields } from './common';

// ─── Trend ───────────────────────────────────────────────────────────────────

export const CISO_TRENDS = ['improving', 'stable', 'degrading'] as const;
export type CisoTrend = typeof CISO_TRENDS[number];

// ─── Sub-types ───────────────────────────────────────────────────────────────

export interface PostureScore {
  /** Overall posture score (0-100) */
  overall: number;
  /** Score breakdown by security domain */
  byDomain: Record<string, number>;
}

export interface RiskSummary {
  /** Total active risk objects */
  totalRiskObjects: number;
  /** Open (unresolved) count */
  openCount: number;
  /** Critical severity count */
  critical: number;
  /** High severity count */
  high: number;
  /** Medium severity count */
  medium: number;
  /** Low severity count */
  low: number;
}

export interface ExposureSummary {
  /** External attack surface exposure count */
  externalSurfaceCount: number;
  /** Internal attack surface exposure count */
  internalSurfaceCount: number;
  /** Total identified coverage gaps */
  totalGaps: number;
}

export interface DebtSummary {
  /** Total tracked debt items */
  totalItems: number;
  /** Age of oldest critical debt (days) */
  criticalAge: number;
  /** Average resolution time (days) */
  avgResolutionDays: number;
}

export interface ControlSummary {
  /** Number of active frameworks being tracked */
  frameworksActive: number;
  /** Average adherence percentage across all frameworks */
  avgAdherence: number;
  /** Controls currently non-adherent */
  nonAdherentCount: number;
}

export interface CaseSummary {
  /** Total open cases */
  totalOpen: number;
  /** P0 (critical) cases */
  p0Count: number;
  /** Average case age (days) */
  avgAge: number;
  /** Cases in SLA breach */
  slaBreachCount: number;
}

// ─── CISO Summary Entity ─────────────────────────────────────────────────────

export interface CisoSummary extends CommonFields {
  entityType: 'ciso-summary';
  /** When this summary was computed */
  generatedAt: string;
  /** Overall posture score */
  posture: PostureScore;
  /** Risk object summary */
  riskSummary: RiskSummary;
  /** Exposure summary */
  exposureSummary: ExposureSummary;
  /** Debt summary */
  debtSummary: DebtSummary;
  /** Control adherence summary */
  controlSummary: ControlSummary;
  /** Case management summary */
  caseSummary: CaseSummary;
  /** Top strategic blockers (free-text list) */
  strategicBlockers: string[];
  /** Overall trend direction */
  trend: CisoTrend;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface CisoSummaryValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a CisoSummary entity for structural correctness.
 */
export function validateCisoSummary(summary: CisoSummary): CisoSummaryValidation {
  const errors: string[] = [];

  if (!summary.id || summary.id.trim() === '') {
    errors.push('id: required');
  }
  if (!summary.tenant || !summary.tenant.tenantId || summary.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!summary.generatedAt || summary.generatedAt.trim() === '') {
    errors.push('generatedAt: required');
  }
  if (!summary.posture) {
    errors.push('posture: required');
  } else {
    if (typeof summary.posture.overall !== 'number' || summary.posture.overall < 0 || summary.posture.overall > 100) {
      errors.push('posture.overall: must be 0-100');
    }
    if (!summary.posture.byDomain || typeof summary.posture.byDomain !== 'object') {
      errors.push('posture.byDomain: must be an object');
    }
  }
  if (!summary.riskSummary) {
    errors.push('riskSummary: required');
  } else {
    if (typeof summary.riskSummary.totalRiskObjects !== 'number') errors.push('riskSummary.totalRiskObjects: must be a number');
    if (typeof summary.riskSummary.openCount !== 'number') errors.push('riskSummary.openCount: must be a number');
  }
  if (!summary.exposureSummary) {
    errors.push('exposureSummary: required');
  }
  if (!summary.debtSummary) {
    errors.push('debtSummary: required');
  }
  if (!summary.controlSummary) {
    errors.push('controlSummary: required');
  }
  if (!summary.caseSummary) {
    errors.push('caseSummary: required');
  }
  if (!Array.isArray(summary.strategicBlockers)) {
    errors.push('strategicBlockers: must be an array');
  }
  if (!summary.trend || !CISO_TRENDS.includes(summary.trend)) {
    errors.push(`trend: must be one of: ${CISO_TRENDS.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
