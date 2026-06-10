/**
 * Standards Field Mapping Entity — Commander C2
 *
 * Governed by: Commander C2 Standards Evidence Model (Layer 1)
 * Purpose: Prove field-by-field conformance. One record per mapped field.
 * This IS the data dictionary — queryable, auditable, versioned.
 *
 * Part of the 3-entity evidence model:
 *   StandardsDeclaration → StandardsFieldMapping → StandardsVersionHistory
 */

import type { CommonFields } from './common';

// ─── Conformance Type ────────────────────────────────────────────────────────

export type ConformanceType = 'exact' | 'semantic_match' | 'extension' | 'derived';

// ─── Standard Requirement Level ──────────────────────────────────────────────

export type StandardRequirement = 'required' | 'recommended' | 'optional';

// ─── Standards Field Mapping Entity ──────────────────────────────────────────

export interface StandardsFieldMapping extends CommonFields {
  entityType: 'standards-field-mapping';

  /** Unique mapping identifier */
  mappingId: string;
  /** Parent StandardsDeclaration */
  declarationId: string;

  // ─── Entity context ────────────────────────────────────────────────
  /** Entity name (e.g. "Signal") */
  entityName: string;
  /** Entity file (e.g. "signal.ts") */
  entityFile: string;

  // ─── Commander field ───────────────────────────────────────────────
  /** Field name in Commander entity */
  commanderFieldName: string;
  /** TypeScript type */
  commanderFieldType: string;
  /** Full path (e.g. "Signal.severity_id") */
  commanderFieldPath: string;

  // ─── Standard field ────────────────────────────────────────────────
  /** Field name in the standard */
  standardFieldName: string;
  /** Path in the standard (e.g. "base_event.severity_id") */
  standardFieldPath: string;
  /** Type in the standard (e.g. "Integer") */
  standardFieldType: string;
  /** Definition from the standard */
  standardDefinition: string;
  /** Requirement level in the standard */
  standardRequirement: StandardRequirement;

  // ─── Conformance ───────────────────────────────────────────────────
  /** How Commander's field relates to the standard's field */
  conformanceType: ConformanceType;
  /** Required if conformanceType is not 'exact' */
  justification: string | null;
  /** Required if conformanceType is 'derived' */
  derivationFormula: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface StandardsFieldMappingValidation {
  valid: boolean;
  errors: string[];
}

export function validateStandardsFieldMapping(m: StandardsFieldMapping): StandardsFieldMappingValidation {
  const errors: string[] = [];

  if (!m.id || m.id.trim() === '') errors.push('id: required');
  if (!m.tenant?.tenantId) errors.push('tenant.tenantId: required');
  if (!m.mappingId || m.mappingId.trim() === '') errors.push('mappingId: required');
  if (!m.declarationId || m.declarationId.trim() === '') errors.push('declarationId: required');
  if (!m.entityName || m.entityName.trim() === '') errors.push('entityName: required');
  if (!m.entityFile || m.entityFile.trim() === '') errors.push('entityFile: required');
  if (!m.commanderFieldName || m.commanderFieldName.trim() === '') errors.push('commanderFieldName: required');
  if (!m.commanderFieldType || m.commanderFieldType.trim() === '') errors.push('commanderFieldType: required');
  if (!m.commanderFieldPath || m.commanderFieldPath.trim() === '') errors.push('commanderFieldPath: required');
  if (!m.standardFieldName || m.standardFieldName.trim() === '') errors.push('standardFieldName: required');
  if (!m.standardFieldPath || m.standardFieldPath.trim() === '') errors.push('standardFieldPath: required');
  if (!m.standardFieldType || m.standardFieldType.trim() === '') errors.push('standardFieldType: required');
  if (!m.standardDefinition || m.standardDefinition.trim() === '') errors.push('standardDefinition: required');
  if (!(['required', 'recommended', 'optional'] as StandardRequirement[]).includes(m.standardRequirement)) {
    errors.push('standardRequirement: must be required | recommended | optional');
  }
  if (!(['exact', 'semantic_match', 'extension', 'derived'] as ConformanceType[]).includes(m.conformanceType)) {
    errors.push('conformanceType: must be exact | semantic_match | extension | derived');
  }
  if (m.conformanceType !== 'exact' && (!m.justification || m.justification.trim() === '')) {
    errors.push('justification: required when conformanceType is not exact');
  }
  if (m.conformanceType === 'derived' && (!m.derivationFormula || m.derivationFormula.trim() === '')) {
    errors.push('derivationFormula: required when conformanceType is derived');
  }

  return { valid: errors.length === 0, errors };
}
