/**
 * Common Fields — Commander C2 Canonical Entities
 *
 * Every canonical entity includes these common fields.
 * Governed by: Commander C2 internal standard (no external standard governs common fields).
 * All entities are tenant-scoped with deterministic IDs and full audit provenance.
 */

/** Tenant context — required on every record */
export interface TenantContext {
  tenantId: string;
  tenantName: string;
}

/** Source metadata — provenance tracking */
export interface SourceMetadata {
  /** Connector that produced this record */
  connectorId: string;
  /** Import run identifier */
  importRunId: string;
  /** Source system identifier */
  sourceSystem: string;
  /** Timestamp of source extraction */
  sourceTimestamp: string;
}

/** Common fields present on all canonical entities */
export interface CommonFields {
  /** Deterministic unique identifier */
  id: string;
  /** Canonical entity type discriminator */
  entityType: string;
  /** Tenant scope — required, never ambiguous */
  tenant: TenantContext;
  /** When this record was created in Commander */
  createdAt: string;
  /** When this record was last updated */
  updatedAt: string;
  /** Source provenance */
  source: SourceMetadata;
}
