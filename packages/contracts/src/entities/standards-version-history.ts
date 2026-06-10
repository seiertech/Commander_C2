/**
 * Standards Version History Entity — Commander C2
 *
 * Governed by: Commander C2 Standards Evidence Model (Layer 1)
 * Purpose: Track version transitions when a governing standard releases a new version.
 * Maintains full audit trail of what changed and how Commander responded.
 *
 * Part of the 3-entity evidence model:
 *   StandardsDeclaration → StandardsFieldMapping → StandardsVersionHistory
 */

import type { CommonFields } from './common';

// ─── Change Type ─────────────────────────────────────────────────────────────

export type VersionChangeType = 'major' | 'minor' | 'patch' | 'breaking';

// ─── Standards Version History Entity ────────────────────────────────────────

export interface StandardsVersionHistory extends CommonFields {
  entityType: 'standards-version-history';

  /** Unique history entry identifier */
  historyId: string;
  /** Which StandardsDeclaration was updated */
  declarationId: string;

  // ─── Version change ────────────────────────────────────────────────
  /** Previous version (e.g. "1.2.0") */
  previousVersion: string;
  /** New version (e.g. "1.3.0") */
  newVersion: string;
  /** When the standard published the new version */
  changeDate: string;
  /** Severity of the version change */
  changeType: VersionChangeType;

  // ─── Field-level impact ────────────────────────────────────────────
  /** New fields added in the standard */
  fieldsAdded: string[];
  /** Fields removed/deprecated in the standard */
  fieldsRemoved: string[];
  /** Fields with changed semantics */
  fieldsModified: string[];
  /** New fields Commander adopted */
  fieldsAdopted: string[];
  /** New fields not yet adopted (with justification in migrationNotes) */
  fieldsDeferred: string[];

  // ─── Governance ────────────────────────────────────────────────────
  /** Notes on how Commander migrated */
  migrationNotes: string;
  /** Assessment of impact on Commander entities */
  impactAssessment: string;
  /** Who approved the version transition */
  approvedBy: string;
  /** When Commander completed the upgrade (null if not yet done) */
  implementedDate: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface StandardsVersionHistoryValidation {
  valid: boolean;
  errors: string[];
}

export function validateStandardsVersionHistory(h: StandardsVersionHistory): StandardsVersionHistoryValidation {
  const errors: string[] = [];

  if (!h.id || h.id.trim() === '') errors.push('id: required');
  if (!h.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!h.historyId || h.historyId.trim() === '') errors.push('historyId: required');
  if (!h.declarationId || h.declarationId.trim() === '') errors.push('declarationId: required');
  if (!h.previousVersion || h.previousVersion.trim() === '') errors.push('previousVersion: required');
  if (!h.newVersion || h.newVersion.trim() === '') errors.push('newVersion: required');
  if (!h.changeDate || h.changeDate.trim() === '') errors.push('changeDate: required');
  if (!(['major', 'minor', 'patch', 'breaking'] as VersionChangeType[]).includes(h.changeType)) {
    errors.push('changeType: must be major | minor | patch | breaking');
  }
  if (!Array.isArray(h.fieldsAdded)) errors.push('fieldsAdded: must be array');
  if (!Array.isArray(h.fieldsRemoved)) errors.push('fieldsRemoved: must be array');
  if (!Array.isArray(h.fieldsModified)) errors.push('fieldsModified: must be array');
  if (!Array.isArray(h.fieldsAdopted)) errors.push('fieldsAdopted: must be array');
  if (!Array.isArray(h.fieldsDeferred)) errors.push('fieldsDeferred: must be array');
  if (!h.migrationNotes || h.migrationNotes.trim() === '') errors.push('migrationNotes: required');
  if (!h.impactAssessment || h.impactAssessment.trim() === '') errors.push('impactAssessment: required');
  if (!h.approvedBy || h.approvedBy.trim() === '') errors.push('approvedBy: required');

  return { valid: errors.length === 0, errors };
}
