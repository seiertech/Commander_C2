/**
 * Observables Table — Commander C2
 *
 * First-class typed indicator entity for threat-intelligence correlation,
 * cross-case matching, and indicator-based search.
 *
 * Source: COIM v1.0 §4.5; 03_REUSABLE_OBJECT_CATALOGUE.md §2.5
 * Authority: DEC-coim-ocsf-source-classification-architecture (DECISIONS.md)
 * Build unit: COIM-D (Observable Entity)
 * Resolves: ARCH-DEBT-041
 * Data classification: Threat Intelligence (indicators for correlation)
 *
 * Storage model:
 * - Separate table with many-to-many binding (deduplication)
 * - Bounded JSONB overflow on Risk Object (max 50, via ObservableRef)
 * - Indexed for indicator-based search (value + type composite)
 *
 * Workload class: operational-read, operational-write
 */

import { pgTable, text, integer, timestamp, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';
import { riskObjects } from './risk-objects';

/** Observable type enum — 8 types (OCSF-informed type_id taxonomy) */
export const observableTypeEnum = pgEnum('observable_type', [
  'ip',
  'domain',
  'hash',
  'url',
  'email',
  'certificate',
  'process',
  'file',
]);

export const observables = pgTable('observables', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  // ─── Source-owned fields (immutable after write) ─────────────────────────

  /** Observable type classification */
  observableType: observableTypeEnum('observable_type').notNull(),

  /** Observable value (the indicator itself) */
  value: text('value').notNull(),

  /** First observation timestamp (source-provided, immutable) */
  firstSeen: timestamp('first_seen', { withTimezone: true }).notNull(),

  /** Last observation timestamp (updated on re-observation) */
  lastSeen: timestamp('last_seen', { withTimezone: true }).notNull(),

  // ─── Commander-owned fields (mutable) ────────────────────────────────────

  /** Reputation score (0-100). Enrichment-derived; Commander-owned. */
  reputation: integer('reputation'),

  // ─── Source provenance ───────────────────────────────────────────────────

  /** Connector that produced this observable */
  sourceConnectorId: text('source_connector_id').notNull(),
  /** Import run identifier */
  sourceImportRunId: text('source_import_run_id').notNull(),
  /** Source system identifier */
  sourceSystem: text('source_system').notNull(),
  /** Timestamp of source extraction */
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  // ─── Timestamps ──────────────────────────────────────────────────────────

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  /** Deduplication index: same type+value within a tenant is one observable */
  deduplicationIdx: uniqueIndex('observables_dedup_idx').on(table.tenantId, table.observableType, table.value),
  /** Search index: indicator-based search by value */
  valueIdx: index('observables_value_idx').on(table.value),
  /** Search index: filter by type */
  typeIdx: index('observables_type_idx').on(table.observableType),
  /** Tenant scope index */
  tenantIdx: index('observables_tenant_idx').on(table.tenantId),
}));

/**
 * Observable-to-Risk-Object binding table (many-to-many).
 * Enables deduplication: one observable can be referenced by many risk objects.
 * No cross-workload foreign keys violated — both tables are operational workload.
 */
export const observableRiskObjectBindings = pgTable('observable_risk_object_bindings', {
  /** Observable entity ID */
  observableId: text('observable_id').notNull().references(() => observables.id),
  /** Risk Object entity ID */
  riskObjectId: text('risk_object_id').notNull().references(() => riskObjects.id),
  /** When this binding was created */
  boundAt: timestamp('bound_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  /** Primary key equivalent: one binding per observable-risk-object pair */
  pk: uniqueIndex('observable_ro_binding_pk').on(table.observableId, table.riskObjectId),
  /** Index for lookups by observable (find all risk objects for an indicator) */
  observableIdx: index('observable_ro_binding_observable_idx').on(table.observableId),
  /** Index for lookups by risk object (find all observables for a risk object) */
  riskObjectIdx: index('observable_ro_binding_risk_object_idx').on(table.riskObjectId),
}));
