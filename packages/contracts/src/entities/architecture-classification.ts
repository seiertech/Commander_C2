/**
 * Architecture_Classification — Commander C2 Thesis Layer 2
 *
 * Governed by: Thesis §6 — Architecture Classification & Topology Layer
 * Purpose: Classify architectural views, assets, relationships using TOGAF domains
 * and Zachman aspects/perspectives.
 *
 * Standards: TOGAF (§4 ADM), Zachman (Row/Col classification)
 * Naming: snake_case (thesis-literal)
 */

// ─── TOGAF Domain ────────────────────────────────────────────────────────────

export const TOGAF_DOMAINS = ['business', 'data', 'application', 'technology'] as const;
export type TogafDomain = typeof TOGAF_DOMAINS[number];

// ─── Zachman Aspect (What/How/Where/Who/When/Why) ────────────────────────────

export const ZACHMAN_ASPECTS = ['what', 'how', 'where', 'who', 'when', 'why'] as const;
export type ZachmanAspect = typeof ZACHMAN_ASPECTS[number];

// ─── Zachman Perspective ─────────────────────────────────────────────────────

export const ZACHMAN_PERSPECTIVES = ['planner', 'owner', 'designer', 'builder', 'subcontractor', 'user'] as const;
export type ZachmanPerspective = typeof ZACHMAN_PERSPECTIVES[number];

// ─── Architecture_Classification Entity ──────────────────────────────────────

export interface ArchitectureClassification {
  /** Unique identifier */
  architecture_id: string;
  /** TOGAF architecture domain */
  togaf_domain: TogafDomain;
  /** Zachman aspect — what is being described */
  zachman_aspect: ZachmanAspect;
  /** Zachman perspective — from whose viewpoint */
  zachman_perspective: ZachmanPerspective;
  /** Logical architecture layer */
  logical_layer: string;
  /** Physical architecture layer */
  physical_layer: string;
  /** Service tier classification */
  service_tier: string;
  /** Type of topology this classifies */
  topology_type: string;
  /** Governing standard */
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ArchitectureClassificationValidation {
  valid: boolean;
  errors: string[];
}

export function validate_architecture_classification(a: ArchitectureClassification): ArchitectureClassificationValidation {
  const errors: string[] = [];

  if (!a.architecture_id || a.architecture_id.trim() === '') errors.push('architecture_id: required');
  if (!(TOGAF_DOMAINS as readonly string[]).includes(a.togaf_domain)) {
    errors.push('togaf_domain: must be business | data | application | technology');
  }
  if (!(ZACHMAN_ASPECTS as readonly string[]).includes(a.zachman_aspect)) {
    errors.push('zachman_aspect: must be what | how | where | who | when | why');
  }
  if (!(ZACHMAN_PERSPECTIVES as readonly string[]).includes(a.zachman_perspective)) {
    errors.push('zachman_perspective: must be planner | owner | designer | builder | subcontractor | user');
  }
  if (!a.logical_layer || a.logical_layer.trim() === '') errors.push('logical_layer: required');
  if (!a.physical_layer || a.physical_layer.trim() === '') errors.push('physical_layer: required');
  if (!a.service_tier || a.service_tier.trim() === '') errors.push('service_tier: required');
  if (!a.topology_type || a.topology_type.trim() === '') errors.push('topology_type: required');
  if (!a.standard_marker || a.standard_marker.trim() === '') errors.push('standard_marker: required');

  return { valid: errors.length === 0, errors };
}
