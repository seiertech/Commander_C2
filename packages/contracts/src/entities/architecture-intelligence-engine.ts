/**
 * Architecture Intelligence Engine Entity — Commander C2 Canonical Model
 *
 * Source: Spec #59 Intelligence Layer Architecture §Posture Stream,
 *         Master Technical Specification §Architecture Intelligence
 *
 * Architecture intelligence records model structural findings across
 * the security estate topology — policy conflicts, coverage gaps,
 * dependency risks, topology anomalies and configuration conflicts.
 *
 * Ownership: All authenticated (read), System (analyse)
 * Build Unit: Tier 3 batch (phase1-engine-entities)
 * Unlocks: /architecture-intelligence, topology analysis surfaces
 */

import type { CommonFields } from './common';

// ─── Analysis Types ──────────────────────────────────────────────────────────

export const ARCHITECTURE_ANALYSIS_TYPES = [
  'policy_conflict',
  'coverage_gap',
  'dependency_risk',
  'topology_anomaly',
  'configuration_conflict',
] as const;
export type ArchitectureAnalysisType = typeof ARCHITECTURE_ANALYSIS_TYPES[number];

// ─── Architecture Intelligence Status ────────────────────────────────────────

export const ARCHITECTURE_INTELLIGENCE_STATUSES = ['open', 'acknowledged', 'resolved'] as const;
export type ArchitectureIntelligenceStatus = typeof ARCHITECTURE_INTELLIGENCE_STATUSES[number];

// ─── Architecture Intelligence Entity ────────────────────────────────────────

export interface ArchitectureIntelligence extends CommonFields {
  entityType: 'architecture-intelligence';
  /** Engine instance that produced this finding */
  engineId: string;
  /** Reference to the primary component under analysis */
  componentRef: string;
  /** Category of architectural analysis */
  analysisType: ArchitectureAnalysisType;
  /** Severity score (0-10) */
  severity: number;
  /** Confidence in the finding (0-1) */
  confidence: number;
  /** When the finding was detected */
  detectedAt: string;
  /** Human-readable description of the finding */
  description: string;
  /** References to all components affected */
  affectedComponents: string[];
  /** Recommended remediation action (null if none) */
  recommendedAction: string | null;
  /** When the finding was resolved (null if unresolved) */
  resolvedAt: string | null;
  /** Current lifecycle status */
  status: ArchitectureIntelligenceStatus;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ArchitectureIntelligenceValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an ArchitectureIntelligence entity for structural correctness.
 */
export function validateArchitectureIntelligence(record: ArchitectureIntelligence): ArchitectureIntelligenceValidation {
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
  if (!record.componentRef || record.componentRef.trim() === '') {
    errors.push('componentRef: required');
  }
  if (!record.analysisType || !ARCHITECTURE_ANALYSIS_TYPES.includes(record.analysisType)) {
    errors.push(`analysisType: must be one of: ${ARCHITECTURE_ANALYSIS_TYPES.join(', ')}`);
  }
  if (typeof record.severity !== 'number' || record.severity < 0 || record.severity > 10) {
    errors.push('severity: must be 0-10');
  }
  if (typeof record.confidence !== 'number' || record.confidence < 0 || record.confidence > 1) {
    errors.push('confidence: must be 0-1');
  }
  if (!record.detectedAt || record.detectedAt.trim() === '') {
    errors.push('detectedAt: required');
  }
  if (!record.description || record.description.trim() === '') {
    errors.push('description: required');
  }
  if (!Array.isArray(record.affectedComponents)) {
    errors.push('affectedComponents: must be an array');
  }
  if (!record.status || !ARCHITECTURE_INTELLIGENCE_STATUSES.includes(record.status)) {
    errors.push(`status: must be one of: ${ARCHITECTURE_INTELLIGENCE_STATUSES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
