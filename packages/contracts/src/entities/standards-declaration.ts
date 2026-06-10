/**
 * Standards Declaration Entity — Commander C2
 *
 * Governed by: Commander C2 Standards Evidence Model (Layer 1)
 * Purpose: Declare what standard governs what layer, at what version,
 * claiming what conformance level. System-generated evidence.
 *
 * Part of the 3-entity evidence model:
 *   StandardsDeclaration → StandardsFieldMapping → StandardsVersionHistory
 */

import type { CommonFields } from './common';

// ─── Standards Category ──────────────────────────────────────────────────────

/** How the standard publishes its definitions */
export type StandardsCategory = 'schema' | 'taxonomy' | 'terminology';

// ─── Conformance Level ───────────────────────────────────────────────────────

export type ConformanceLevel = 'strict' | 'aligned' | 'derived' | 'partial';

// ─── Declaration Status ──────────────────────────────────────────────────────

export type DeclarationStatus = 'active' | 'superseded' | 'draft' | 'under_review';

// ─── Standards Declaration Entity ────────────────────────────────────────────

export interface StandardsDeclaration extends CommonFields {
  entityType: 'standards-declaration';

  /** Unique declaration identifier */
  declarationId: string;

  // ─── Standard identification ───────────────────────────────────────
  /** Standard name (e.g. "OCSF") */
  standardName: string;
  /** Standard version (e.g. "1.3.0") */
  standardVersion: string;
  /** Publisher (e.g. "OCSF Project / Linux Foundation") */
  standardPublisher: string;
  /** Category A (schema), B (taxonomy), or C (terminology) */
  standardCategory: StandardsCategory;
  /** Official reference URL */
  standardUrl: string;

  // ─── Scope ─────────────────────────────────────────────────────────
  /** Which thesis layer this standard governs */
  thesisLayer: string;
  /** What aspect this standard governs within the layer */
  scope: string;
  /** Entity names governed by this standard */
  governedEntities: string[];

  // ─── Conformance ───────────────────────────────────────────────────
  /** How strictly Commander adheres */
  conformanceLevel: ConformanceLevel;
  /** Total fields mapped to this standard */
  totalFields: number;
  /** Fields with conformanceType: 'exact' */
  exactFields: number;
  /** Computed: exactFields / totalFields * 100 */
  conformancePercentage: number;

  // ─── Governance ────────────────────────────────────────────────────
  /** Who declared this alignment */
  declaredBy: string;
  /** When declared */
  declarationDate: string;
  /** Next scheduled review date */
  reviewDate: string;
  /** Previous declaration this supersedes (null if first) */
  supersedes: string | null;
  /** Current status */
  status: DeclarationStatus;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface StandardsDeclarationValidation {
  valid: boolean;
  errors: string[];
}

export function validateStandardsDeclaration(d: StandardsDeclaration): StandardsDeclarationValidation {
  const errors: string[] = [];

  if (!d.id || d.id.trim() === '') errors.push('id: required');
  if (!d.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!d.declarationId || d.declarationId.trim() === '') errors.push('declarationId: required');
  if (!d.standardName || d.standardName.trim() === '') errors.push('standardName: required');
  if (!d.standardVersion || d.standardVersion.trim() === '') errors.push('standardVersion: required');
  if (!d.standardPublisher || d.standardPublisher.trim() === '') errors.push('standardPublisher: required');
  if (!(['schema', 'taxonomy', 'terminology'] as StandardsCategory[]).includes(d.standardCategory)) {
    errors.push('standardCategory: must be schema | taxonomy | terminology');
  }
  if (!d.standardUrl || d.standardUrl.trim() === '') errors.push('standardUrl: required');
  if (!d.thesisLayer || d.thesisLayer.trim() === '') errors.push('thesisLayer: required');
  if (!d.scope || d.scope.trim() === '') errors.push('scope: required');
  if (!Array.isArray(d.governedEntities) || d.governedEntities.length === 0) {
    errors.push('governedEntities: must be non-empty array');
  }
  if (!(['strict', 'aligned', 'derived', 'partial'] as ConformanceLevel[]).includes(d.conformanceLevel)) {
    errors.push('conformanceLevel: must be strict | aligned | derived | partial');
  }
  if (typeof d.totalFields !== 'number' || d.totalFields < 0) errors.push('totalFields: must be >= 0');
  if (typeof d.exactFields !== 'number' || d.exactFields < 0) errors.push('exactFields: must be >= 0');
  if (typeof d.conformancePercentage !== 'number' || d.conformancePercentage < 0 || d.conformancePercentage > 100) {
    errors.push('conformancePercentage: must be 0-100');
  }
  if (!d.declaredBy || d.declaredBy.trim() === '') errors.push('declaredBy: required');
  if (!d.declarationDate || d.declarationDate.trim() === '') errors.push('declarationDate: required');
  if (!d.reviewDate || d.reviewDate.trim() === '') errors.push('reviewDate: required');
  if (!(['active', 'superseded', 'draft', 'under_review'] as DeclarationStatus[]).includes(d.status)) {
    errors.push('status: must be active | superseded | draft | under_review');
  }

  return { valid: errors.length === 0, errors };
}
