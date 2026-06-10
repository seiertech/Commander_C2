/**
 * Common Fields — Commander C2 Canonical Entities
 *
 * Every canonical entity includes these common fields.
 * Governed by: Commander C2 internal standard (no external standard governs common fields).
 * All entities are tenant-scoped with deterministic IDs and full audit provenance.
 */

/** Tenant context — required on every record */
export interface TenantContext {
  tenant_id: string;
  tenant_name: string;
}

/** Source metadata — provenance tracking */
export interface SourceMetadata {
  /** Connector that produced this record */
  connector_id: string;
  /** Import run identifier */
  import_run_id: string;
  /** Source system identifier */
  source_system: string;
  /** Timestamp of source extraction */
  source_timestamp: string;
}

/** Common fields present on all canonical entities */
export interface CommonFields {
  /** Deterministic unique identifier */
  id: string;
  /** Canonical entity type discriminator */
  entity_type: string;
  /** Tenant scope — required, never ambiguous */
  tenant: TenantContext;
  /** When this record was created in Commander */
  created_at: string;
  /** When this record was last updated */
  updated_at: string;
  /** Source provenance */
  source: SourceMetadata;
}


// ─── Connector Classification ────────────────────────────────────────────────

/** Connector class (A=detection, B=verdict, C=identity, D=coverage/config) */
export type ConnectorClass = 'A' | 'B' | 'C' | 'D';

/** Labels for UI display */
export const CONNECTOR_CLASS_LABELS: Record<ConnectorClass, string> = {
  A: 'Class A — Detection & Telemetry',
  B: 'Class B — Verdict & Disposition',
  C: 'Class C — Identity & Access',
  D: 'Class D — Coverage & Configuration',
};

// ─── Surface Attribution ─────────────────────────────────────────────────────

/** Internal/External attack surface classification */
export type SurfaceAttribution = 'internal_attack_surface' | 'external_attack_surface';

// ─── Signal Purpose ──────────────────────────────────────────────────────────

/** What the signal is for in the intelligence pipeline */
export type SignalPurpose = 'detection' | 'verdict' | 'identity_context' | 'coverage_state' | 'configuration_state' | 'behavioural_baseline';

// ─── Verdict Disposition ─────────────────────────────────────────────────────

/** Verdict outcome from a Class B connector */
export type VerdictDisposition = 'malicious' | 'suspicious' | 'benign' | 'informational' | 'unresolved' | 'BLOCK' | 'QUARANTINE' | 'REQUIRE_MFA' | 'MONITOR' | 'ALLOW';

// ─── Build Status ────────────────────────────────────────────────────────────

/** Page/feature build status */
export type BuildStatus = 'DONE' | 'BUILD' | 'SCAFFOLD' | 'PLANNED';
