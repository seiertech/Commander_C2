/**
 * Intelligence Common — Shared Type Constants and Value Objects
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 6.2, 7.2, 20.6, 22.2, 22.3
 *
 * Defines array-form type constants for the intelligence domain and shared
 * value objects consumed by both the Admin_Tenant catalogue plane and the
 * Customer_Tenant evaluation plane.
 *
 * Reuses existing COIM SourceSeverity (1–5) and SourceConfidence from coim.ts.
 */

// ─── Platform Intelligence Source Types ──────────────────────────────────────

/** Platform intelligence source types per Req 1.3 */
export const PLATFORM_INTELLIGENCE_SOURCE_TYPES = [
  'cisa_kev',
  'nvd_cve',
  'vendor_advisory',
  'commercial_ioc_feed',
  'misp_feed',
  'stix_taxii_feed',
  'inbound_email',
  'manual_submission',
] as const;

export type PlatformIntelligenceSourceType = typeof PLATFORM_INTELLIGENCE_SOURCE_TYPES[number];

// ─── Platform Record Types ───────────────────────────────────────────────────

/** Platform intelligence record types per Req 3.3 */
export const PLATFORM_RECORD_TYPES = [
  'cve',
  'kev_entry',
  'vendor_advisory',
  'ioc_entry',
  'composite_advisory',
] as const;

export type PlatformRecordType = typeof PLATFORM_RECORD_TYPES[number];

// ─── IOC Categories (exhaustive taxonomy — 26 values) ────────────────────────

/** IOC category taxonomy per Req 6.2 — all 26 indicator types */
export const IOC_CATEGORIES = [
  'file_hash_md5',
  'file_hash_sha1',
  'file_hash_sha256',
  'file_path',
  'domain',
  'fqdn',
  'url',
  'ip_address',
  'cidr_range',
  'email_address',
  'email_subject',
  'sender_domain',
  'registry_key',
  'process_name',
  'mutex',
  'certificate_thumbprint',
  'user_agent',
  'yara_rule',
  'sigma_rule',
  'snort_suricata_rule',
  'cloud_resource_id',
  'azure_ad_object_id',
  'aws_account_id',
  'container_image',
  'package_name',
  'other',
] as const;

export type IocCategory = typeof IOC_CATEGORIES[number];

// ─── IOC Relationship States ─────────────────────────────────────────────────

/** IOC relationship states per Req 7.2 */
export const IOC_RELATIONSHIP_STATES = [
  'linked_to_cve',
  'not_linked_to_cve',
  'suspected_cve_link',
  'linked_to_vendor_advisory',
  'linked_to_campaign',
  'linked_to_malware',
  'linked_to_actor',
  'linked_to_case',
  'linked_to_risk_object',
  'linked_to_action',
  'unclassified',
] as const;

export type IocRelationshipState = typeof IOC_RELATIONSHIP_STATES[number];

// ─── TLP Markings ────────────────────────────────────────────────────────────

/** Traffic Light Protocol markings per Req 22.3 */
export const TLP_MARKINGS = [
  'white',
  'green',
  'amber',
  'amber_strict',
  'red',
] as const;

export type TlpMarking = typeof TLP_MARKINGS[number];

// ─── CVE States ──────────────────────────────────────────────────────────────

/** CVE lifecycle states per Req 4.1 */
export const CVE_STATES = [
  'published',
  'rejected',
  'reserved',
  'disputed',
] as const;

export type CveState = typeof CVE_STATES[number];

// ─── Source Freshness States ─────────────────────────────────────────────────

/** Feed freshness states per Req 2.4 */
export const SOURCE_FRESHNESS_STATES = [
  'fresh',
  'aging',
  'stale',
  'expired',
] as const;

export type SourceFreshnessState = typeof SOURCE_FRESHNESS_STATES[number];

// ─── Tenant Subscription States ──────────────────────────────────────────────

/** Tenant subscription states per Req 10.1 */
export const TENANT_SUBSCRIPTION_STATES = [
  'active',
  'paused',
  'cancelled',
] as const;

export type TenantSubscriptionState = typeof TENANT_SUBSCRIPTION_STATES[number];

// ─── Evaluation Types ────────────────────────────────────────────────────────

/** Intelligence evaluation types per Req 11.1 */
export const EVALUATION_TYPES = [
  'vulnerability_exposure',
  'ioc_match',
  'advisory_applicability',
] as const;

export type EvaluationType = typeof EVALUATION_TYPES[number];

// ─── Tenant Exposure States ──────────────────────────────────────────────────

/** Tenant exposure evaluation states per Req 11.2 */
export const TENANT_EXPOSURE_STATES = [
  'matched',
  'not_matched',
  'potentially_matched',
  'exposed',
  'not_exposed',
  'remediated',
  'accepted_risk',
  'unknown',
] as const;

export type TenantExposureState = typeof TENANT_EXPOSURE_STATES[number];

// ─── IOC Match Types ─────────────────────────────────────────────────────────

/** IOC match type classification per Req 12.1 */
export const IOC_MATCH_TYPES = [
  'exact',
  'partial',
  'heuristic',
] as const;

export type IocMatchType = typeof IOC_MATCH_TYPES[number];

// ─── IOC Case Link Types ─────────────────────────────────────────────────────

/** IOC case link types per Req 13.5 */
export const IOC_CASE_LINK_TYPES = [
  'created_by',
  'enriched_by',
  'triggered_by',
] as const;

export type IocCaseLinkType = typeof IOC_CASE_LINK_TYPES[number];

// ─── Threat Hunt Statuses ────────────────────────────────────────────────────

/** Threat hunt lifecycle statuses per Req 14.1 */
export const THREAT_HUNT_STATUSES = [
  'proposed',
  'queued',
  'running',
  'completed',
  'no_match',
  'match_found',
  'escalated',
] as const;

export type ThreatHuntStatus = typeof THREAT_HUNT_STATUSES[number];

// ─── Push Action Types ───────────────────────────────────────────────────────

/** Push action types per Req 15.1 */
export const PUSH_ACTION_TYPES = [
  'block',
  'allow',
  'alert',
  'quarantine',
] as const;

export type PushActionType = typeof PUSH_ACTION_TYPES[number];

// ─── Push Intent Statuses ────────────────────────────────────────────────────

/** Push action intent statuses per Req 15.2 */
export const PUSH_INTENT_STATUSES = [
  'recommended',
  'requires_approval',
  'approved',
  'queued',
  'pushed_mock',
  'failed_mock',
  'live_push_deferred',
] as const;

export type PushIntentStatus = typeof PUSH_INTENT_STATUSES[number];

// ─── Allow/Block List Types ──────────────────────────────────────────────────

/** Tenant allow/block list types per Req 23.5 */
export const ALLOW_BLOCK_LIST_TYPES = [
  'allow',
  'block',
] as const;

export type AllowBlockListType = typeof ALLOW_BLOCK_LIST_TYPES[number];

// ─── Shared Value Objects ────────────────────────────────────────────────────

/**
 * Per-source attribution entry — tracks what each reporting source claimed
 * about an IOC. Preserved across deduplication (Req 6.5, 8.4, 22.5).
 */
export interface SourceAttributionEntry {
  /** Reporting source ID */
  sourceId: string;
  /** Confidence reported by this source (0–100) */
  reportedConfidence: number;
  /** Severity reported by this source (1–5) */
  reportedSeverity: number;
  /** Original raw value as reported by this source */
  originalRawValue: string;
  /** First time this source reported this IOC */
  firstSeenAt: string;
  /** Last time this source reported this IOC */
  lastSeenAt: string;
}

/**
 * Relationship state transition record — appended to stateHistory
 * on every state change (Req 7.3).
 */
export interface RelationshipStateTransition {
  /** Previous relationship state */
  previousState: IocRelationshipState;
  /** New relationship state */
  newState: IocRelationshipState;
  /** Timestamp of the transition */
  changedAt: string;
  /** Reason for the state change */
  reason: string;
}
