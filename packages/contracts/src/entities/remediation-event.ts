/**
 * Remediation_Event — Commander C2 Thesis Layer 3: Event & Intelligence
 *
 * Governed by: Thesis §7 — Event & Intelligence Layer
 * Purpose: OCSF-aligned event emitted when a remediation action completes.
 * Closes the loop: signal → case → workflow → action → remediation_event.
 *
 * Standard: OCSF 1.3 (remediation event categories/classes)
 * Naming: snake_case (thesis-literal)
 */

// ─── Remediation Outcome ─────────────────────────────────────────────────────

export const REMEDIATION_OUTCOMES = ['success', 'partial', 'failed', 'deferred'] as const;
export type RemediationOutcome = typeof REMEDIATION_OUTCOMES[number];

// ─── Remediation_Event Entity ────────────────────────────────────────────────

export interface RemediationEvent {
  /** Unique identifier */
  remediation_event_id: string;
  /** Case this remediation belongs to */
  related_case_id: string;
  /** Action that produced this event */
  related_action_id: string;
  /** Remediation outcome */
  outcome: RemediationOutcome;
  /** Post-remediation state */
  result_state: string;
  /** When remediation executed (ISO 8601) */
  execution_time: string;
  /** Summary of what happened */
  output_summary: string;
  /** OCSF remediation category */
  ocsf_category: string;
  /** OCSF remediation class */
  ocsf_class: string;
  /** Governing standard */
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface RemediationEventValidation {
  valid: boolean;
  errors: string[];
}

export function validate_remediation_event(r: RemediationEvent): RemediationEventValidation {
  const errors: string[] = [];

  if (!r.remediation_event_id || r.remediation_event_id.trim() === '') errors.push('remediation_event_id: required');
  if (!r.related_case_id || r.related_case_id.trim() === '') errors.push('related_case_id: required');
  if (!r.related_action_id || r.related_action_id.trim() === '') errors.push('related_action_id: required');
  if (!(REMEDIATION_OUTCOMES as readonly string[]).includes(r.outcome)) {
    errors.push('outcome: must be success | partial | failed | deferred');
  }
  if (!r.result_state || r.result_state.trim() === '') errors.push('result_state: required');
  if (!r.execution_time || r.execution_time.trim() === '') errors.push('execution_time: required');
  if (!r.output_summary || r.output_summary.trim() === '') errors.push('output_summary: required');
  if (!r.ocsf_category || r.ocsf_category.trim() === '') errors.push('ocsf_category: required');
  if (!r.ocsf_class || r.ocsf_class.trim() === '') errors.push('ocsf_class: required');
  if (!r.standard_marker || r.standard_marker.trim() === '') errors.push('standard_marker: required');

  return { valid: errors.length === 0, errors };
}
