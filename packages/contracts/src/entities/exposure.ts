/**
 * Exposure Entity — Commander C2 Canonical Model
 *
 * Source: Spec #60 Internal and External Attack Surface Framework,
 *         Master Technical Specification §Exposure Management
 *
 * Exposure records model discovered attack surface entries — both external
 * (internet-facing) and internal (lateral movement paths). Each record
 * tracks severity, validation state, blast zone grouping, and coverage gaps.
 *
 * Preserves internal_attack_surface / external_attack_surface attribution
 * per Spec #60 (Doctrinal Assertion 10).
 *
 * Ownership: All authenticated (read), System (discover)
 * Build Unit: Tier 3 batch (phase1-entity-creation)
 * Unlocks: /exposure, /exposure/blast-zones, /exposure/coverage-gaps
 */

import type { CommonFields, SurfaceAttribution } from './common';

// ─── Exposure Status ─────────────────────────────────────────────────────────

export const EXPOSURE_STATUSES = ['open', 'mitigated', 'accepted', 'monitoring'] as const;
export type ExposureStatus = typeof EXPOSURE_STATUSES[number];

// ─── Exposure Category ───────────────────────────────────────────────────────

export const EXPOSURE_CATEGORIES = ['network', 'cloud', 'identity', 'application', 'endpoint'] as const;
export type ExposureCategory = typeof EXPOSURE_CATEGORIES[number];

// ─── Coverage Gap Types ──────────────────────────────────────────────────────

export const COVERAGE_GAP_TYPES = ['no_scanner', 'no_edr', 'no_monitoring', 'stale_data'] as const;
export type CoverageGapType = typeof COVERAGE_GAP_TYPES[number];

// ─── Coverage Gap Sub-type ───────────────────────────────────────────────────

export interface CoverageGap {
  /** Type of coverage gap */
  gapType: CoverageGapType;
  /** Reference to the affected entity */
  affectedEntityRef: string;
  /** Number of days data has been stale (for stale_data type) */
  staleDays?: number;
}

// ─── Exposure Entity ─────────────────────────────────────────────────────────

export interface Exposure extends CommonFields {
  entityType: 'exposure';
  /** Surface attribution per Spec #60 */
  surfaceType: SurfaceAttribution;
  /** Exposure category */
  category: ExposureCategory;
  /** Reference to the affected asset */
  assetRef: string;
  /** Reference to the affected identity (if applicable) */
  identityRef?: string;
  /** Description of the exposure vector */
  exposureVector: string;
  /** Severity 1 (critical) to 5 (low) */
  severity: number;
  /** When this exposure was first discovered */
  discoveredAt: string;
  /** When this exposure was last validated */
  lastValidatedAt: string;
  /** Current status */
  status: ExposureStatus;
  /** Blast zone grouping identifier */
  blastZone: string;
  /** Associated coverage gaps */
  coverageGaps: CoverageGap[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ExposureValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an Exposure entity for structural correctness.
 */
export function validateExposure(exposure: Exposure): ExposureValidation {
  const errors: string[] = [];

  if (!exposure.id || exposure.id.trim() === '') {
    errors.push('id: required');
  }
  if (!exposure.tenant || !exposure.tenant.tenantId || exposure.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!exposure.surfaceType || !['internal_attack_surface', 'external_attack_surface'].includes(exposure.surfaceType)) {
    errors.push('surfaceType: must be internal_attack_surface or external_attack_surface');
  }
  if (!exposure.category || !EXPOSURE_CATEGORIES.includes(exposure.category)) {
    errors.push(`category: must be one of: ${EXPOSURE_CATEGORIES.join(', ')}`);
  }
  if (!exposure.assetRef || exposure.assetRef.trim() === '') {
    errors.push('assetRef: required');
  }
  if (!exposure.exposureVector || exposure.exposureVector.trim() === '') {
    errors.push('exposureVector: required');
  }
  if (typeof exposure.severity !== 'number' || exposure.severity < 1 || exposure.severity > 5) {
    errors.push('severity: must be 1-5');
  }
  if (!exposure.discoveredAt || exposure.discoveredAt.trim() === '') {
    errors.push('discoveredAt: required');
  }
  if (!exposure.lastValidatedAt || exposure.lastValidatedAt.trim() === '') {
    errors.push('lastValidatedAt: required');
  }
  if (!exposure.status || !EXPOSURE_STATUSES.includes(exposure.status)) {
    errors.push(`status: must be one of: ${EXPOSURE_STATUSES.join(', ')}`);
  }
  if (!exposure.blastZone || exposure.blastZone.trim() === '') {
    errors.push('blastZone: required');
  }
  if (!Array.isArray(exposure.coverageGaps)) {
    errors.push('coverageGaps: must be an array');
  } else {
    for (const gap of exposure.coverageGaps) {
      if (!COVERAGE_GAP_TYPES.includes(gap.gapType)) {
        errors.push(`coverageGaps[].gapType: must be one of: ${COVERAGE_GAP_TYPES.join(', ')}`);
      }
      if (!gap.affectedEntityRef || gap.affectedEntityRef.trim() === '') {
        errors.push('coverageGaps[].affectedEntityRef: required');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
