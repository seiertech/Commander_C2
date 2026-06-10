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
