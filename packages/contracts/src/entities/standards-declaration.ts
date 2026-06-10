/**
 * Schema_Compliance — Commander C2 Thesis Layer 1: Standards Declaration
 *
 * Governed by: Thesis §5 — Standards Declaration Layer
 * Purpose: Declare what standard governs what layer, at what version,
 * claiming what conformance level. System-generated evidence.
 *
 * Standard: Internal (thesis-defined construct)
 * Naming: snake_case (thesis-literal)
 */

// ─── Conformance Level ───────────────────────────────────────────────────────

export const CONFORMANCE_LEVELS = ['strict', 'aligned', 'derived', 'partial'] as const;
export type ConformanceLevel = typeof CONFORMANCE_LEVELS[number];

// ─── Schema_Compliance Entity ────────────────────────────────────────────────

export interface SchemaCompliance {
  /** Unique declaration identifier */
  compliance_id: string;
  /** Name of the governing standard (e.g. "OCSF", "ISO/IEC 19770-1:2017") */
  standard_name: string;
  /** Version of the standard (e.g. "1.3.0", "2022") */
  standard_version: string;
  /** What aspect of Commander this standard governs */
  scope: string;
  /** How strictly Commander adheres */
  conformance_level: ConformanceLevel;
  /** Who made this declaration */
  declared_by: string;
  /** When declared (ISO 8601 date) */
  declaration_date: string;
  /** Additional context */
  notes: string | null;
  /** Which standard governs this entity's structure */
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface SchemaComplianceValidation {
  valid: boolean;
  errors: string[];
}

export function validate_schema_compliance(d: SchemaCompliance): SchemaComplianceValidation {
  const errors: string[] = [];

  if (!d.compliance_id || d.compliance_id.trim() === '') errors.push('compliance_id: required');
  if (!d.standard_name || d.standard_name.trim() === '') errors.push('standard_name: required');
  if (!d.standard_version || d.standard_version.trim() === '') errors.push('standard_version: required');
  if (!d.scope || d.scope.trim() === '') errors.push('scope: required');
  if (!(CONFORMANCE_LEVELS as readonly string[]).includes(d.conformance_level)) {
    errors.push('conformance_level: must be strict | aligned | derived | partial');
  }
  if (!d.declared_by || d.declared_by.trim() === '') errors.push('declared_by: required');
  if (!d.declaration_date || d.declaration_date.trim() === '') errors.push('declaration_date: required');
  if (!d.standard_marker || d.standard_marker.trim() === '') errors.push('standard_marker: required');

  return { valid: errors.length === 0, errors };
}
