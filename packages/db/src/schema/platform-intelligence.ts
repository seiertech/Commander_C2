/**
 * Platform Intelligence Schemas — Catalogue Plane (Admin_Tenant owned)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 17.1, 6.5
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * Tenant-leading keys. Partition-ready high-volume catalogue tables.
 * IOC dedup unique index on (tenant_id, ioc_category, normalised_value).
 * JSONB for bounded composed objects. No cross-workload FKs.
 *
 * Workload class: ingestion-write, operational-read
 * Data classification: threat_intelligence
 */

import { pgTable, text, integer, timestamp, boolean, jsonb, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const platformSourceTypeEnum = pgEnum('platform_source_type', [
  'cisa_kev', 'nvd_cve', 'vendor_advisory', 'commercial_ioc_feed',
  'misp_feed', 'stix_taxii_feed', 'inbound_email', 'manual_submission',
]);

export const platformRecordTypeEnum = pgEnum('platform_record_type', [
  'cve', 'kev_entry', 'vendor_advisory', 'ioc_entry', 'composite_advisory',
]);

export const iocCategoryEnum = pgEnum('ioc_category', [
  'file_hash_md5', 'file_hash_sha1', 'file_hash_sha256', 'file_path',
  'domain', 'fqdn', 'url', 'ip_address', 'cidr_range',
  'email_address', 'email_subject', 'sender_domain',
  'registry_key', 'process_name', 'mutex', 'certificate_thumbprint',
  'user_agent', 'yara_rule', 'sigma_rule', 'snort_suricata_rule',
  'cloud_resource_id', 'azure_ad_object_id', 'aws_account_id',
  'container_image', 'package_name', 'other',
]);

export const iocRelationshipStateEnum = pgEnum('ioc_relationship_state', [
  'linked_to_cve', 'not_linked_to_cve', 'suspected_cve_link',
  'linked_to_vendor_advisory', 'linked_to_campaign', 'linked_to_malware',
  'linked_to_actor', 'linked_to_case', 'linked_to_risk_object',
  'linked_to_action', 'unclassified',
]);

export const tlpMarkingEnum = pgEnum('tlp_marking', [
  'white', 'green', 'amber', 'amber_strict', 'red',
]);

export const cveStateEnum = pgEnum('cve_state', [
  'published', 'rejected', 'reserved', 'disputed',
]);

export const sourceFreshnessEnum = pgEnum('source_freshness', [
  'fresh', 'aging', 'stale', 'expired',
]);

// ─── Platform Intelligence Source ────────────────────────────────────────────

export const platformIntelligenceSources = pgTable('platform_intelligence_sources', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  // Source-owned (immutable)
  name: text('name').notNull(),
  vendor: text('vendor').notNull(),
  sourceType: platformSourceTypeEnum('source_type').notNull(),
  connectorClass: text('connector_class').notNull().default('D'),
  feedReference: text('feed_reference').notNull(),
  licenceStatus: text('licence_status').notNull(),
  sourceMetadataExtra: jsonb('source_metadata_extra'),

  // Commander-owned (mutable)
  refreshCadenceMinutes: integer('refresh_cadence_minutes').notNull(),
  lastSuccessfulSync: timestamp('last_successful_sync', { withTimezone: true }),
  nextScheduledSync: timestamp('next_scheduled_sync', { withTimezone: true }),
  failureState: jsonb('failure_state'),
  sourceFreshness: sourceFreshnessEnum('source_freshness').notNull().default('expired'),
  catalogueVersionHash: text('catalogue_version_hash').notNull().default(''),
  healthState: text('health_state').notNull().default('unknown'),

  // Source provenance
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('pis_tenant_idx').on(table.tenantId),
  sourceTypeIdx: index('pis_source_type_idx').on(table.sourceType),
}));

// ─── Platform Intelligence Record ────────────────────────────────────────────

export const platformIntelligenceRecords = pgTable('platform_intelligence_records', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  sourceId: text('source_id').notNull(),
  recordType: platformRecordTypeEnum('record_type').notNull(),
  severity: integer('severity').notNull(),
  confidence: integer('confidence').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  lastModifiedAt: timestamp('last_modified_at', { withTimezone: true }).notNull(),
  catalogueVersion: text('catalogue_version').notNull(),
  rawReference: text('raw_reference').notNull(),

  // Source provenance
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('pir_tenant_idx').on(table.tenantId),
  sourceIdx: index('pir_source_idx').on(table.sourceId),
  recordTypeIdx: index('pir_record_type_idx').on(table.recordType),
}));

// ─── Vulnerability Intelligence Record ───────────────────────────────────────

export const vulnerabilityIntelligenceRecords = pgTable('vulnerability_intelligence_records', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  sourceId: text('source_id').notNull(),
  recordType: platformRecordTypeEnum('record_type').notNull().default('cve'),
  severity: integer('severity').notNull(),
  confidence: integer('confidence').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  lastModifiedAt: timestamp('last_modified_at', { withTimezone: true }).notNull(),
  catalogueVersion: text('catalogue_version').notNull(),
  rawReference: text('raw_reference').notNull(),

  // CVE-specific
  cveId: text('cve_id').notNull(),
  cvssVector: text('cvss_vector').notNull(),
  cvssScore: integer('cvss_score').notNull(),
  cveState: cveStateEnum('cve_state').notNull(),
  cisaKevStatus: boolean('cisa_kev_status').notNull().default(false),
  kevDateAdded: timestamp('kev_date_added', { withTimezone: true }),
  kevDueDate: timestamp('kev_due_date', { withTimezone: true }),
  epssScore: integer('epss_score'),
  epssPercentile: integer('epss_percentile'),
  affectedProducts: jsonb('affected_products').notNull().default([]),
  references: jsonb('references_list').notNull().default([]),

  // Source provenance
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('vir_tenant_idx').on(table.tenantId),
  cveIdx: index('vir_cve_idx').on(table.cveId),
}));

// ─── Vendor Advisory ─────────────────────────────────────────────────────────

export const vendorAdvisories = pgTable('vendor_advisories', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  advisoryId: text('advisory_id').notNull(),
  vendor: text('vendor').notNull(),
  title: text('title').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  lastModifiedAt: timestamp('last_modified_at', { withTimezone: true }).notNull(),
  severity: integer('severity').notNull(),
  affectedProducts: jsonb('affected_products').notNull().default([]),
  remediationGuidance: text('remediation_guidance').notNull().default(''),
  relatedCveIds: jsonb('related_cve_ids').notNull().default([]),
  containedIocIds: jsonb('contained_ioc_ids').notNull().default([]),

  // Source provenance
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('va_tenant_idx').on(table.tenantId),
  advisoryIdx: index('va_advisory_id_idx').on(table.advisoryId),
}));

// ─── Indicator of Compromise (high-volume, partition-ready) ──────────────────

export const indicatorsOfCompromise = pgTable('indicators_of_compromise', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  iocCategory: iocCategoryEnum('ioc_category').notNull(),
  value: text('value').notNull(),
  normalisedValue: text('normalised_value').notNull(),
  originalRawValue: text('original_raw_value').notNull(),
  confidence: integer('confidence').notNull(),
  severity: integer('severity').notNull(),
  tlpMarking: tlpMarkingEnum('tlp_marking').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  sourceAttribution: jsonb('source_attribution').notNull().default([]),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull(),
  active: boolean('active').notNull().default(true),

  // Source provenance
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  /** IOC dedup unique index: (tenant_id, ioc_category, normalised_value) */
  dedupIdx: uniqueIndex('ioc_dedup_idx').on(table.tenantId, table.iocCategory, table.normalisedValue),
  tenantIdx: index('ioc_tenant_idx').on(table.tenantId),
  categoryIdx: index('ioc_category_idx').on(table.iocCategory),
  valueIdx: index('ioc_normalised_value_idx').on(table.normalisedValue),
}));

// ─── IOC Relationship ────────────────────────────────────────────────────────

export const iocRelationships = pgTable('ioc_relationships', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  iocId: text('ioc_id').notNull(),
  relatedEntityId: text('related_entity_id').notNull(),
  relatedEntityType: text('related_entity_type').notNull(),
  relationshipState: iocRelationshipStateEnum('relationship_state').notNull(),
  confidence: integer('confidence').notNull(),
  establishedAt: timestamp('established_at', { withTimezone: true }).notNull(),
  lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true }).notNull(),
  evidenceRef: text('evidence_ref').notNull(),
  stateHistory: jsonb('state_history').notNull().default([]),

  // Source provenance
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('iocr_tenant_idx').on(table.tenantId),
  iocIdx: index('iocr_ioc_idx').on(table.iocId),
  relatedIdx: index('iocr_related_entity_idx').on(table.relatedEntityId),
}));
