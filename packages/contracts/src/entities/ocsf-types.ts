/**
 * OCSF 1.3.0 Shared Types — Commander C2
 *
 * Governed by: OCSF 1.3.0 (Linux Foundation)
 * Purpose: Canonical type definitions shared across all OCSF-governed entities.
 *
 * Standards adherence:
 *   - Field names EXACT per OCSF 1.3.0 specification
 *   - type_uid = class_uid * 100 + activity_id
 *   - severity_id values exact per OCSF enumeration
 *   - commander_ prefix on ALL extension fields
 */

// ─── OCSF Severity ───────────────────────────────────────────────────────────

/**
 * OCSF severity_id enumeration (exact)
 * 0=Unknown, 1=Informational, 2=Low, 3=Medium, 4=High, 5=Critical, 6=Fatal
 */
export type OcsfSeverityId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const OCSF_SEVERITY_LABELS: Record<OcsfSeverityId, string> = {
  0: 'Unknown',
  1: 'Informational',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Critical',
  6: 'Fatal',
};

// ─── OCSF Status ─────────────────────────────────────────────────────────────

/**
 * OCSF status_id enumeration
 * 0=Unknown, 1=Success, 2=Failure, 99=Other
 */
export type OcsfStatusId = 0 | 1 | 2 | 99;

export const OCSF_STATUS_LABELS: Record<OcsfStatusId, string> = {
  0: 'Unknown',
  1: 'Success',
  2: 'Failure',
  99: 'Other',
};

// ─── OCSF Activity ───────────────────────────────────────────────────────────

/**
 * OCSF activity_id — base activities common to all classes
 * 0=Unknown, 1=Create, 2=Read, 3=Update, 4=Delete, 99=Other
 */
export type OcsfBaseActivityId = 0 | 1 | 2 | 3 | 4 | 99;

// ─── OCSF Category UIDs ──────────────────────────────────────────────────────

/**
 * OCSF category_uid enumeration
 * 1=System Activity, 2=Findings, 3=Identity & Access, 4=Network Activity,
 * 5=Discovery, 6=Application Activity
 */
export type OcsfCategoryUid = 1 | 2 | 3 | 4 | 5 | 6;

export const OCSF_CATEGORY_LABELS: Record<OcsfCategoryUid, string> = {
  1: 'System Activity',
  2: 'Findings',
  3: 'Identity & Access Management',
  4: 'Network Activity',
  5: 'Discovery',
  6: 'Application Activity',
};

// ─── OCSF Metadata Object ────────────────────────────────────────────────────

/** OCSF metadata object — required on all events */
export interface OcsfMetadata {
  /** Product that generated the event */
  product: OcsfProduct;
  /** Schema version (e.g. "1.3.0") */
  version: string;
  /** Unique event ID */
  uid: string;
  /** Correlation UID for related events */
  correlation_uid?: string;
  /** Log name */
  log_name?: string;
  /** Log provider */
  log_provider?: string;
  /** Original time from source */
  original_time?: string;
  /** Processing time */
  processed_time?: string;
  /** Sequence number */
  sequence?: number;
}

/** OCSF product object */
export interface OcsfProduct {
  /** Product name */
  name: string;
  /** Vendor name */
  vendor_name: string;
  /** Product version */
  version?: string;
  /** Product UID */
  uid?: string;
}

// ─── OCSF Observable ─────────────────────────────────────────────────────────

/** OCSF observable — enriched indicator */
export interface OcsfObservable {
  /** Observable name */
  name: string;
  /** Observable type (e.g. "IP Address", "Domain Name", "Hash") */
  type: string;
  /** Observable type ID */
  type_id: number;
  /** Observable value */
  value: string;
  /** Reputation score */
  reputation?: OcsfReputation;
}

/** OCSF reputation object */
export interface OcsfReputation {
  /** Base score (0-100) */
  base_score: number;
  /** Provider */
  provider: string;
  /** Score interpretation */
  score_id: number;
}

// ─── OCSF Enrichment ─────────────────────────────────────────────────────────

/** OCSF enrichment object */
export interface OcsfEnrichment {
  /** Enrichment name */
  name: string;
  /** Enrichment value */
  value: string;
  /** Data source */
  provider: string;
  /** Enrichment type */
  type?: string;
}

// ─── OCSF Base Event (Required + Recommended + Optional) ─────────────────────

/**
 * OCSF base_event required fields — present on ALL OCSF events.
 * These fields are EXACT per OCSF 1.3.0 specification.
 */
export interface OcsfBaseEvent {
  // ─── Required fields ───────────────────────────────────────────────
  /** Activity identifier */
  activity_id: number;
  /** Category UID */
  category_uid: OcsfCategoryUid;
  /** Class UID — identifies the event class */
  class_uid: number;
  /** Severity identifier */
  severity_id: OcsfSeverityId;
  /** Event timestamp (RFC 3339) */
  time: string;
  /** Type UID = class_uid * 100 + activity_id */
  type_uid: number;
  /** Event metadata */
  metadata: OcsfMetadata;

  // ─── Recommended fields ────────────────────────────────────────────
  /** Human-readable message */
  message?: string;
  /** Observables found in this event */
  observables?: OcsfObservable[];
  /** Status identifier */
  status_id?: OcsfStatusId;
  /** Status name */
  status?: string;
  /** Status code from source */
  status_code?: string;
  /** Status detail */
  status_detail?: string;
  /** Timezone offset from UTC (minutes) */
  timezone_offset?: number;

  // ─── Optional fields ───────────────────────────────────────────────
  /** Severity name (derived from severity_id) */
  severity?: string;
  /** Enrichment data */
  enrichments?: OcsfEnrichment[];
  /** Raw event data */
  raw_data?: string;
  /** Hash of raw data */
  raw_data_hash?: string;
  /** Size of raw data in bytes */
  raw_data_size?: number;
  /** Event count (for aggregated events) */
  count?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Start time (RFC 3339) */
  start_time?: string;
  /** End time (RFC 3339) */
  end_time?: string;
  /** Unmapped fields from source */
  unmapped?: Record<string, unknown>;
  /** Activity name (derived from activity_id) */
  activity_name?: string;
  /** Category name (derived from category_uid) */
  category_name?: string;
  /** Class name (derived from class_uid) */
  class_name?: string;
  /** Type name (derived from type_uid) */
  type_name?: string;
}

// ─── NATO/Admiralty Grading ──────────────────────────────────────────────────

/**
 * NATO/Admiralty source reliability grading (STANAG 2022 / AJP-2.1)
 * A=Completely Reliable, B=Usually Reliable, C=Fairly Reliable,
 * D=Not Usually Reliable, E=Unreliable, F=Reliability Cannot Be Judged
 */
export type NatoSourceReliability = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/**
 * NATO/Admiralty information credibility grading
 * 1=Confirmed, 2=Probably True, 3=Possibly True,
 * 4=Doubtful, 5=Improbable, 6=Truth Cannot Be Judged
 */
export type NatoInformationCredibility = 1 | 2 | 3 | 4 | 5 | 6;

export const NATO_RELIABILITY_LABELS: Record<NatoSourceReliability, string> = {
  A: 'Completely Reliable',
  B: 'Usually Reliable',
  C: 'Fairly Reliable',
  D: 'Not Usually Reliable',
  E: 'Unreliable',
  F: 'Reliability Cannot Be Judged',
};

export const NATO_CREDIBILITY_LABELS: Record<NatoInformationCredibility, string> = {
  1: 'Confirmed',
  2: 'Probably True',
  3: 'Possibly True',
  4: 'Doubtful',
  5: 'Improbable',
  6: 'Truth Cannot Be Judged',
};

// ─── Commander Extensions (commander_ prefix) ────────────────────────────────

/**
 * Commander extension fields — namespaced with commander_ prefix.
 * These extend OCSF events with platform-specific context.
 */
export interface CommanderEventExtensions {
  /** Commander tenant ID */
  commander_tenant_id: string;
  /** Commander correlation chain ID */
  commander_correlation_chain_id?: string;
  /** Commander processing stage */
  commander_processing_stage?: string;
  /** Commander AI confidence score (0-1) */
  commander_ai_confidence?: number;
  /** Commander risk contribution score */
  commander_risk_contribution?: number;
}

// ─── Utility: type_uid Computation ───────────────────────────────────────────

/**
 * Compute OCSF type_uid from class_uid and activity_id.
 * Formula: type_uid = class_uid * 100 + activity_id
 */
export function computeTypeUid(class_uid: number, activity_id: number): number {
  return class_uid * 100 + activity_id;
}

/**
 * Derive severity label from severity_id.
 */
export function deriveSeverityLabel(severity_id: OcsfSeverityId): string {
  return OCSF_SEVERITY_LABELS[severity_id];
}
