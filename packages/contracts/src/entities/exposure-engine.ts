/**
 * Exposure Engine Entity — Commander C2 Canonical Model
 *
 * Source: Spec #60 Internal and External Attack Surface Framework,
 *         Master Technical Specification §Exposure Management
 *
 * Exposure computation records model computed attack surface analysis —
 * aggregating asset refs, identity refs, blast zones, attack paths,
 * coverage gaps and exposure scores into actionable intelligence.
 *
 * Ownership: All authenticated (read), System (compute)
 * Build Unit: Tier 3 batch (phase1-engine-entities)
 * Unlocks: /exposure/computations, blast zone analysis surfaces
 */

import type { CommonFields } from './common';

// ─── Surface Types ───────────────────────────────────────────────────────────

export const EXPOSURE_SURFACE_TYPES = ['external', 'internal'] as const;
export type ExposureSurfaceType = typeof EXPOSURE_SURFACE_TYPES[number];

// ─── Exposure Trend ──────────────────────────────────────────────────────────

export const EXPOSURE_TRENDS = ['increasing', 'stable', 'decreasing'] as const;
export type ExposureTrend = typeof EXPOSURE_TRENDS[number];

// ─── Exposure Computation Entity ─────────────────────────────────────────────

export interface ExposureComputation extends CommonFields {
  entityType: 'exposure-computation';
  /** Engine instance that produced this computation */
  engineId: string;
  /** Whether this is external or internal surface analysis */
  surfaceType: ExposureSurfaceType;
  /** Description of the exposure vector */
  exposureVector: string;
  /** References to affected assets */
  assetRefs: string[];
  /** References to affected identities */
  identityRefs: string[];
  /** Blast zone grouping (null if not grouped) */
  blastZoneId: string | null;
  /** Computed exposure score (0-100) */
  exposureScore: number;
  /** Number of identified attack paths */
  attackPathCount: number;
  /** Number of identified coverage gaps */
  coverageGapCount: number;
  /** When this computation was performed */
  computedAt: string;
  /** Trend direction of the exposure */
  trend: ExposureTrend;
  /** References to applied mitigations */
  mitigationRefs: string[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ExposureComputationValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an ExposureComputation entity for structural correctness.
 */
export function validateExposureComputation(record: ExposureComputation): ExposureComputationValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') {
    errors.push('id: required');
  }
  if (!record.tenant || !record.tenant.tenantId || record.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!record.engineId || record.engineId.trim() === '') {
    errors.push('engineId: required');
  }
  if (!record.surfaceType || !EXPOSURE_SURFACE_TYPES.includes(record.surfaceType)) {
    errors.push(`surfaceType: must be one of: ${EXPOSURE_SURFACE_TYPES.join(', ')}`);
  }
  if (!record.exposureVector || record.exposureVector.trim() === '') {
    errors.push('exposureVector: required');
  }
  if (!Array.isArray(record.assetRefs)) {
    errors.push('assetRefs: must be an array');
  }
  if (!Array.isArray(record.identityRefs)) {
    errors.push('identityRefs: must be an array');
  }
  if (typeof record.exposureScore !== 'number' || record.exposureScore < 0 || record.exposureScore > 100) {
    errors.push('exposureScore: must be 0-100');
  }
  if (typeof record.attackPathCount !== 'number' || record.attackPathCount < 0) {
    errors.push('attackPathCount: must be a non-negative number');
  }
  if (typeof record.coverageGapCount !== 'number' || record.coverageGapCount < 0) {
    errors.push('coverageGapCount: must be a non-negative number');
  }
  if (!record.computedAt || record.computedAt.trim() === '') {
    errors.push('computedAt: required');
  }
  if (!record.trend || !EXPOSURE_TRENDS.includes(record.trend)) {
    errors.push(`trend: must be one of: ${EXPOSURE_TRENDS.join(', ')}`);
  }
  if (!Array.isArray(record.mitigationRefs)) {
    errors.push('mitigationRefs: must be an array');
  }

  return { valid: errors.length === 0, errors };
}
