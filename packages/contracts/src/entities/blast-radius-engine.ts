/**
 * Blast Radius (Engine Output) Entity — Commander SDR Canonical Model
 *
 * Source: Spec #34 Drift and Rule Engine
 *
 * A BlastRadius is the canonical, tenant-scoped output of a blast-radius
 * computation: starting from an origin entity, it records the set of affected
 * entities reachable through dependency/impact relationships, a total impact
 * score (0–100), and the traversal depth. It backs rule-change simulation
 * (UC-171) and finding impact assessment.
 *
 * Domain: D-04 (Drift & Rule Engine)
 * Use Cases: UC-171 (simulate rule change — blast radius)
 * Route: /platform/rules/simulation
 */

import type { CommonFields } from './common';

// ─── Affected Entity (reachable from the origin) ─────────────────────────────

export const BLAST_AFFECTED_ENTITY_TYPES = [
  'asset',
  'identity',
  'control',
  'vulnerability',
  'exposure',
  'finding',
  'mission',
  'rule',
] as const;
export type BlastAffectedEntityType = typeof BLAST_AFFECTED_ENTITY_TYPES[number];

export interface AffectedEntity {
  /** Canonical reference to the affected entity */
  entityRef: string;
  /** Kind of affected entity */
  entityType: BlastAffectedEntityType;
  /** Per-entity impact contribution (0–100) */
  impactScore: number;
  /** Traversal distance from the origin (origin = 0) */
  distance: number;
  /** Relationship through which the impact propagated */
  relationship: string;
}

// ─── Blast Radius Entity ─────────────────────────────────────────────────────

export interface BlastRadius extends CommonFields {
  entityType: 'blast-radius';
  /** Unique computation identifier */
  computationId: string;
  /** Canonical reference to the origin entity */
  originEntityRef: string;
  /** Kind of origin entity */
  originEntityType: BlastAffectedEntityType;
  /** Entities affected by changes at the origin */
  affectedEntities: AffectedEntity[];
  /** Aggregate impact score across affected entities (0–100) */
  totalImpactScore: number;
  /** Maximum traversal depth explored */
  depth: number;
  /** When the computation ran */
  computedAt: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface BlastRadiusValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a BlastRadius entity for structural correctness.
 */
export function validateBlastRadius(blast: BlastRadius): BlastRadiusValidation {
  const errors: string[] = [];

  if (!blast.id || blast.id.trim() === '') {
    errors.push('id: required');
  }
  if (!blast.tenant || !blast.tenant.tenantId || blast.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!blast.computationId || blast.computationId.trim() === '') {
    errors.push('computationId: required');
  }
  if (!blast.originEntityRef || blast.originEntityRef.trim() === '') {
    errors.push('originEntityRef: required');
  }
  if (!BLAST_AFFECTED_ENTITY_TYPES.includes(blast.originEntityType)) {
    errors.push(`originEntityType: must be one of: ${BLAST_AFFECTED_ENTITY_TYPES.join(', ')}`);
  }
  if (!Array.isArray(blast.affectedEntities)) {
    errors.push('affectedEntities: must be an array');
  } else {
    for (const affected of blast.affectedEntities) {
      if (!affected.entityRef || affected.entityRef.trim() === '') {
        errors.push('affectedEntities[].entityRef: required');
      }
      if (!BLAST_AFFECTED_ENTITY_TYPES.includes(affected.entityType)) {
        errors.push(`affectedEntities[].entityType: must be one of: ${BLAST_AFFECTED_ENTITY_TYPES.join(', ')}`);
      }
      if (typeof affected.impactScore !== 'number' || affected.impactScore < 0 || affected.impactScore > 100) {
        errors.push('affectedEntities[].impactScore: must be a number between 0 and 100');
      }
      if (typeof affected.distance !== 'number' || affected.distance < 0) {
        errors.push('affectedEntities[].distance: must be a non-negative number');
      }
    }
  }
  if (typeof blast.totalImpactScore !== 'number' || blast.totalImpactScore < 0 || blast.totalImpactScore > 100) {
    errors.push('totalImpactScore: must be a number between 0 and 100');
  }
  if (typeof blast.depth !== 'number' || blast.depth < 0) {
    errors.push('depth: must be a non-negative number');
  }
  if (!blast.computedAt || blast.computedAt.trim() === '') {
    errors.push('computedAt: required');
  }

  return { valid: errors.length === 0, errors };
}
