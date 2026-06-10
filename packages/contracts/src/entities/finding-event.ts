/**
 * Finding_Event — Commander C2 Thesis Layer 3: Event & Intelligence
 *
 * Governed by: Thesis §7 — Event & Intelligence Layer
 * Purpose: Interpreted meaning of a signal. Separates raw normalised event form
 * from the finding/detection meaning derived from it.
 *
 * Standard: OCSF 1.3 (event family/category name, normalised severity)
 * Naming: snake_case (thesis-literal)
 */

// ─── Finding_Event Entity ────────────────────────────────────────────────────

export interface FindingEvent {
  /** Unique finding identifier */
  finding_event_id: string;
  /** Parent signal this finding interprets */
  signal_id: string;
  /** OCSF event family/category name */
  event_family: string;
  /** Human-readable finding title */
  title: string;
  /** Finding description */
  description: string;
  /** Normalised severity 0-6 (OCSF: severity_id) */
  normalized_severity: number;
  /** Threat intelligence context */
  threat_context: string | null;
  /** Exploitability indicator */
  exploitability_hint: string | null;
  /** Governing standard */
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface FindingEventValidation {
  valid: boolean;
  errors: string[];
}

export function validate_finding_event(f: FindingEvent): FindingEventValidation {
  const errors: string[] = [];

  if (!f.finding_event_id || f.finding_event_id.trim() === '') errors.push('finding_event_id: required');
  if (!f.signal_id || f.signal_id.trim() === '') errors.push('signal_id: required');
  if (!f.event_family || f.event_family.trim() === '') errors.push('event_family: required');
  if (!f.title || f.title.trim() === '') errors.push('title: required');
  if (!f.description || f.description.trim() === '') errors.push('description: required');
  if (typeof f.normalized_severity !== 'number' || f.normalized_severity < 0 || f.normalized_severity > 6) {
    errors.push('normalized_severity: must be 0-6 integer');
  }
  if (!f.standard_marker || f.standard_marker.trim() === '') errors.push('standard_marker: required');

  return { valid: errors.length === 0, errors };
}
