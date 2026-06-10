/**
 * Coverage Entity — Commander C2 Canonical Model
 *
 * Source: Master Technical Specification §Coverage Management,
 *         Spec #57 Security Command and Control Doctrine (posture visibility)
 *
 * Coverage records track scanner, EDR, SIEM, and other security tool
 * deployment coverage across the estate. Each record measures coverage
 * percentage, identifies gaps, and tracks trend direction.
 *
 * Ownership: SOM, Security Architect
 * Build Unit: Tier 3 batch (phase1-entity-creation)
 * Unlocks: /coverage, /coverage/scanners, /coverage/telemetry
 */

import type { CommonFields } from './common';

// ─── Coverage Type ───────────────────────────────────────────────────────────

export const COVERAGE_TYPES = [
  'scanner', 'edr', 'siem', 'identity_provider',
  'cloud_posture', 'vulnerability_scanner', 'network_monitor',
] as const;
export type CoverageType = typeof COVERAGE_TYPES[number];

// ─── Coverage Domain ─────────────────────────────────────────────────────────

export const COVERAGE_DOMAINS = ['endpoint', 'network', 'cloud', 'identity', 'application'] as const;
export type CoverageDomain = typeof COVERAGE_DOMAINS[number];

// ─── Coverage Trend ──────────────────────────────────────────────────────────

export const COVERAGE_TRENDS = ['improving', 'stable', 'degrading'] as const;
export type CoverageTrend = typeof COVERAGE_TRENDS[number];

// ─── Coverage Gap Entry ──────────────────────────────────────────────────────

export const COVERAGE_GAP_REASONS = ['not_deployed', 'agent_stale', 'excluded', 'unsupported'] as const;
export type CoverageGapReason = typeof COVERAGE_GAP_REASONS[number];

export interface CoverageGapEntry {
  /** Reference to the asset missing coverage */
  assetRef: string;
  /** Reason for the coverage gap */
  reason: CoverageGapReason;
  /** Number of days since last valid data (for agent_stale) */
  staleDays?: number;
}

// ─── Coverage Entity ─────────────────────────────────────────────────────────

export interface Coverage extends CommonFields {
  entityType: 'coverage';
  /** Type of coverage tool/capability */
  coverageType: CoverageType;
  /** Domain this coverage applies to */
  domain: CoverageDomain;
  /** Total assets in scope */
  totalAssets: number;
  /** Assets with active coverage */
  coveredAssets: number;
  /** Coverage percentage (0-100) */
  coveragePercent: number;
  /** Identified coverage gaps */
  gaps: CoverageGapEntry[];
  /** When coverage was last assessed */
  lastAssessedAt: string;
  /** Coverage trend direction */
  trend: CoverageTrend;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface CoverageValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Coverage entity for structural correctness.
 */
export function validateCoverage(coverage: Coverage): CoverageValidation {
  const errors: string[] = [];

  if (!coverage.id || coverage.id.trim() === '') {
    errors.push('id: required');
  }
  if (!coverage.tenant || !coverage.tenant.tenantId || coverage.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!coverage.coverageType || !COVERAGE_TYPES.includes(coverage.coverageType)) {
    errors.push(`coverageType: must be one of: ${COVERAGE_TYPES.join(', ')}`);
  }
  if (!coverage.domain || !COVERAGE_DOMAINS.includes(coverage.domain)) {
    errors.push(`domain: must be one of: ${COVERAGE_DOMAINS.join(', ')}`);
  }
  if (typeof coverage.totalAssets !== 'number' || coverage.totalAssets < 0) {
    errors.push('totalAssets: must be >= 0');
  }
  if (typeof coverage.coveredAssets !== 'number' || coverage.coveredAssets < 0) {
    errors.push('coveredAssets: must be >= 0');
  }
  if (typeof coverage.coveragePercent !== 'number' || coverage.coveragePercent < 0 || coverage.coveragePercent > 100) {
    errors.push('coveragePercent: must be 0-100');
  }
  if (!Array.isArray(coverage.gaps)) {
    errors.push('gaps: must be an array');
  } else {
    for (const gap of coverage.gaps) {
      if (!gap.assetRef || gap.assetRef.trim() === '') {
        errors.push('gaps[].assetRef: required');
      }
      if (!COVERAGE_GAP_REASONS.includes(gap.reason)) {
        errors.push(`gaps[].reason: must be one of: ${COVERAGE_GAP_REASONS.join(', ')}`);
      }
    }
  }
  if (!coverage.lastAssessedAt || coverage.lastAssessedAt.trim() === '') {
    errors.push('lastAssessedAt: required');
  }
  if (!coverage.trend || !COVERAGE_TRENDS.includes(coverage.trend)) {
    errors.push(`trend: must be one of: ${COVERAGE_TRENDS.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
