/**
 * Signal — Commander C2 Thesis Layer 3: Event & Intelligence
 *
 * Governed by: Thesis §7 — Event & Intelligence Layer
 * Purpose: Normalised event input. Every raw security event ingested into Commander
 * becomes a Signal with OCSF-aligned classification and resolution status.
 *
 * Standard: OCSF 1.3 (category_uid, class_uid, severity_id, time, metadata)
 * Naming: snake_case (thesis-literal)
 */

// ─── Asset Resolution Status ─────────────────────────────────────────────────

export const ASSET_RESOLUTION_STATUSES = ['resolved', 'unresolved', 'partial'] as const;
export type AssetResolutionStatus = typeof ASSET_RESOLUTION_STATUSES[number];

// ─── Signal Entity ───────────────────────────────────────────────────────────

export interface Signal {
  /** Unique signal identifier */
  signal_id: string;
  /** System that produced the signal (OCSF: metadata.product) */
  source_system: string;
  /** Original event ID from source (OCSF: metadata.uid) */
  source_event_id: string;
  /** OCSF event category (OCSF: category_uid mapped to name) */
  ocsf_category: string;
  /** OCSF event class (OCSF: class_uid mapped to name) */
  ocsf_class: string;
  /** Commander signal classification */
  signal_type: string;
  /** Normalised severity 0-6 (OCSF: severity_id) */
  severity: number;
  /** When the event occurred (OCSF: time, ISO 8601) */
  time_observed: string;
  /** Original event payload (JSON string) */
  raw_payload: string;
  /** OCSF-normalised payload (JSON string) */
  normalized_payload: string;
  /** Whether signal resolved to a canonical asset */
  asset_resolution_status: AssetResolutionStatus;
  /** Governing standard */
  standard_marker: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface SignalValidation {
  valid: boolean;
  errors: string[];
}

export function validate_signal(s: Signal): SignalValidation {
  const errors: string[] = [];

  if (!s.signal_id || s.signal_id.trim() === '') errors.push('signal_id: required');
  if (!s.source_system || s.source_system.trim() === '') errors.push('source_system: required');
  if (!s.source_event_id || s.source_event_id.trim() === '') errors.push('source_event_id: required');
  if (!s.ocsf_category || s.ocsf_category.trim() === '') errors.push('ocsf_category: required');
  if (!s.ocsf_class || s.ocsf_class.trim() === '') errors.push('ocsf_class: required');
  if (!s.signal_type || s.signal_type.trim() === '') errors.push('signal_type: required');
  if (typeof s.severity !== 'number' || s.severity < 0 || s.severity > 6) {
    errors.push('severity: must be 0-6 integer');
  }
  if (!s.time_observed || s.time_observed.trim() === '') errors.push('time_observed: required');
  if (!s.raw_payload || s.raw_payload.trim() === '') errors.push('raw_payload: required');
  if (!s.normalized_payload || s.normalized_payload.trim() === '') errors.push('normalized_payload: required');
  if (!(ASSET_RESOLUTION_STATUSES as readonly string[]).includes(s.asset_resolution_status)) {
    errors.push('asset_resolution_status: must be resolved | unresolved | partial');
  }
  if (!s.standard_marker || s.standard_marker.trim() === '') errors.push('standard_marker: required');

  return { valid: errors.length === 0, errors };
}
