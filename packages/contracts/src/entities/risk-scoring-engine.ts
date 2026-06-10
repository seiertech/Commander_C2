/**
 * Risk Scoring (Engine Output) Entity — Commander C2 Canonical Model
 *
 * Source: Spec #34 Drift and Rule Engine
 *
 * A RiskScore is the canonical, tenant-scoped output of risk scoring computed
 * over a target entity. It records the resulting score (0–100), the weighted
 * factors that produced it, and the model/version used so the result is
 * reproducible and auditable.
 *
 * Naming note: the canonical discriminant field is `entityType` (literal
 * 'risk-score'). The "kind of entity that was scored" is therefore recorded as
 * `scoredEntityType` / `scoredEntityRef` to avoid colliding with the load-
 * bearing discriminant used across the canonical union types.
 *
 * Domain: D-04 (Drift & Rule Engine)
 * Use Cases: UC-169 (execute rules), UC-172 (view rule health telemetry)
 * Route: /platform/rules
 */

import type { CommonFields } from './common';

// ─── Risk Factor ─────────────────────────────────────────────────────────────

export interface RiskFactor {
  /** Unique factor identifier */
  factorId: string;
  /** Factor display name */
  name: string;
  /** Relative weight of the factor (0–1) */
  weight: number;
  /** Contribution of this factor to the final score (0–100) */
  contribution: number;
  /** Why this factor contributed as it did */
  rationale: string;
}

// ─── Scored Entity Type (target of the scoring) ──────────────────────────────

export const SCORED_ENTITY_TYPES = [
  'asset',
  'identity',
  'control',
  'vulnerability',
  'exposure',
  'finding',
  'mission',
] as const;
export type ScoredEntityType = typeof SCORED_ENTITY_TYPES[number];

// ─── Risk Score Entity ───────────────────────────────────────────────────────

export interface RiskScore extends CommonFields {
  entityType: 'risk-score';
  /** Unique scoring identifier */
  scoringId: string;
  /** Kind of entity that was scored (was `entityType` in spec — renamed to avoid discriminant clash) */
  scoredEntityType: ScoredEntityType;
  /** Canonical reference to the scored entity (was `entityRef` in spec) */
  scoredEntityRef: string;
  /** Computed risk score (0–100) */
  riskScore: number;
  /** Weighted factors that produced the score */
  factors: RiskFactor[];
  /** When the score was computed */
  computedAt: string;
  /** Model identifier used to compute the score */
  model: string;
  /** Model version */
  version: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface RiskScoreValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a RiskScore entity for structural correctness.
 */
export function validateRiskScore(score: RiskScore): RiskScoreValidation {
  const errors: string[] = [];

  if (!score.id || score.id.trim() === '') {
    errors.push('id: required');
  }
  if (!score.tenant || !score.tenant.tenantId || score.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!score.scoringId || score.scoringId.trim() === '') {
    errors.push('scoringId: required');
  }
  if (!SCORED_ENTITY_TYPES.includes(score.scoredEntityType)) {
    errors.push(`scoredEntityType: must be one of: ${SCORED_ENTITY_TYPES.join(', ')}`);
  }
  if (!score.scoredEntityRef || score.scoredEntityRef.trim() === '') {
    errors.push('scoredEntityRef: required');
  }
  if (typeof score.riskScore !== 'number' || score.riskScore < 0 || score.riskScore > 100) {
    errors.push('riskScore: must be a number between 0 and 100');
  }
  if (!Array.isArray(score.factors)) {
    errors.push('factors: must be an array');
  } else {
    let totalContribution = 0;
    for (const factor of score.factors) {
      if (!factor.factorId || factor.factorId.trim() === '') {
        errors.push('factors[].factorId: required');
      }
      if (typeof factor.weight !== 'number' || factor.weight < 0 || factor.weight > 1) {
        errors.push('factors[].weight: must be a number between 0 and 1');
      }
      if (typeof factor.contribution !== 'number' || factor.contribution < 0 || factor.contribution > 100) {
        errors.push('factors[].contribution: must be a number between 0 and 100');
      } else {
        totalContribution += factor.contribution;
      }
    }
    if (score.factors.length > 0 && totalContribution > 100.0001) {
      errors.push('factors[].contribution: total contribution must not exceed 100');
    }
  }
  if (!score.computedAt || score.computedAt.trim() === '') {
    errors.push('computedAt: required');
  }
  if (!score.model || score.model.trim() === '') {
    errors.push('model: required');
  }
  if (!score.version || score.version.trim() === '') {
    errors.push('version: required');
  }

  return { valid: errors.length === 0, errors };
}
