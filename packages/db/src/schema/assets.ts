/**
 * Assets Table — Commander SDR
 *
 * Canonical asset persistence with tenant scope, source lineage,
 * classification, coverage, and surface attribution.
 *
 * Source: Spec #05 §6.4.2 Asset
 * Data classification: State
 * Domain Requirement 2: source identifiers, normalised identity, ownership,
 *   criticality, environment, exposure state, control coverage references
 */

import { pgTable, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { surfaceAttributionEnum, dataClassificationEnum } from './common';
import { tenants } from './tenants';

export const assets = pgTable('assets', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  /** Data classification per §11.1 */
  dataClassification: dataClassificationEnum('data_classification').notNull().default('state'),
  name: text('name').notNull(),
  classification: text('classification').notNull(),
  owner: text('owner').notNull(),
  environment: text('environment').notNull(),
  /** Source system references (JSON array) */
  sourceRefs: jsonb('source_refs').$type<string[]>().notNull().default([]),
  /** Attack surface attribution (Spec #60) */
  surfaceAttribution: surfaceAttributionEnum('surface_attribution').notNull(),
  /** Coverage metadata */
  coverage: jsonb('coverage').$type<{
    hasEdr: boolean;
    hasVulnScan: boolean;
    hasPatchManagement: boolean;
    hasBackup: boolean;
  }>().notNull(),
  /** Business criticality (1-5) */
  criticality: integer('criticality').notNull().default(3),
  /** Tags */
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  /** Source provenance */
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  // ─── COIM-F augmentation (additive, nullable) ────────────────────────────
  // Source: COIM v1.0 §6.1; 05_ATTRIBUTE_AND_DATA_EFFICIENCY_MODEL §13.
  // Recommended operational-intelligence fields. No drops; no changes to existing columns.
  /** Asset lifecycle state (active/decommissioned/maintenance/unknown). */
  lifecycleState: text('lifecycle_state'),
  /** Structured platform information (OS, version, cloud provider, arch). JSONB. */
  platform: jsonb('platform'),
  /** Network position classification. */
  networkPosition: text('network_position'),
  /** Data classification for data held by this asset. */
  assetDataClassification: text('asset_data_classification'),
  /** When this asset was last confirmed active by a source. */
  lastConfirmedAt: timestamp('last_confirmed_at', { withTimezone: true }),
  /** Which connector/source first discovered this asset. */
  firstDiscoveredBy: text('first_discovered_by'),
  /** Optional source classification for discovery signals (JSONB). */
  sourceClassification: jsonb('source_classification'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
