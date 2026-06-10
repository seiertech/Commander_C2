// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
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
  gap_type: CoverageGapType;
  /** Reference to the affected entity */
  affected_entity_ref: string;
  /** Number of days data has been stale (for stale_data type) */
  staleDays?: number;
}

// ─── Exposure Entity ─────────────────────────────────────────────────────────

export interface Exposure extends CommonFields {
  entity_type: 'exposure';
  /** Surface attribution per Spec #60 */
  surface_type: SurfaceAttribution;
  /** Exposure category */
  category: ExposureCategory;
  /** Reference to the affected asset */
  asset_ref: string;
  /** Reference to the affected identity (if applicable) */
  identityRef?: string;
  /** Description of the exposure vector */
  exposure_vector: string;
  /** Severity 1 (critical) to 5 (low) */
  severity: number;
  /** When this exposure was first discovered */
  discovered_at: string;
  /** When this exposure was last validated */
  lastValidatedAt: string;
  /** Current status */
  status: ExposureStatus;
  /** Blast zone grouping identifier */
  blast_zone: string;
  /** Associated coverage gaps */
  coverage_gaps: CoverageGap[];
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
  if (!exposure.tenant || !exposure.tenant.tenant_id || exposure.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!exposure.surface_type || !['internal_attack_surface', 'external_attack_surface'].includes(exposure.surface_type)) {
    errors.push('surface_type: must be internal_attack_surface or external_attack_surface');
  }
  if (!exposure.category || !EXPOSURE_CATEGORIES.includes(exposure.category)) {
    errors.push(`category: must be one of: ${EXPOSURE_CATEGORIES.join(', ')}`);
  }
  if (!exposure.asset_ref || exposure.asset_ref.trim() === '') {
    errors.push('asset_ref: required');
  }
  if (!exposure.exposure_vector || exposure.exposure_vector.trim() === '') {
    errors.push('exposure_vector: required');
  }
  if (typeof exposure.severity !== 'number' || exposure.severity < 1 || exposure.severity > 5) {
    errors.push('severity: must be 1-5');
  }
  if (!exposure.discovered_at || exposure.discovered_at.trim() === '') {
    errors.push('discovered_at: required');
  }
  if (!exposure.lastValidatedAt || exposure.lastValidatedAt.trim() === '') {
    errors.push('lastValidatedAt: required');
  }
  if (!exposure.status || !EXPOSURE_STATUSES.includes(exposure.status)) {
    errors.push(`status: must be one of: ${EXPOSURE_STATUSES.join(', ')}`);
  }
  if (!exposure.blast_zone || exposure.blast_zone.trim() === '') {
    errors.push('blast_zone: required');
  }
  if (!Array.isArray(exposure.coverage_gaps)) {
    errors.push('coverage_gaps: must be an array');
  } else {
    for (const gap of exposure.coverage_gaps) {
      if (!COVERAGE_GAP_TYPES.includes(gap.gap_type)) {
        errors.push(`coverageGaps[].gap_type: must be one of: ${COVERAGE_GAP_TYPES.join(', ')}`);
      }
      if (!gap.affected_entity_ref || gap.affected_entity_ref.trim() === '') {
        errors.push('coverageGaps[].affected_entity_ref: required');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
