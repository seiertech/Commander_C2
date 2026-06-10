/**
 * Analytics Table — Commander C2
 *
 * Reference entity for detection rules, ML models, UEBA models, Sigma rules,
 * YARA rules, vendor models, and security control analytics.
 *
 * Source: COIM v1.0 §4.8; 03_REUSABLE_OBJECT_CATALOGUE.md §2.7
 * Authority: DEC-coim-ocsf-source-classification-architecture (DECISIONS.md)
 * Build unit: COIM-E (Analytic Entity)
 * Resolves: ARCH-DEBT-042
 * Data classification: Configuration (analytic definitions are governance configuration)
 *
 * Storage model:
 * - Separate reference table (deduplication — many findings may reference the same analytic)
 * - Referenced from Risk Object/Verdict by (analyticId + analyticType) reference fields
 * - attacks[] stored as bounded JSONB (max 20 entries)
 *
 * Workload class: operational-read, operational-write
 */

import { pgTable, text, integer, timestamp, jsonb, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';

/** Analytic type enum — 8 types (OCSF-informed + Commander extensions) */
export const analyticTypeEnum = pgEnum('analytic_type', [
  'detection_rule',
  'analytic_rule',
  'sigma_rule',
  'yara_rule',
  'ml_model',
  'ueba_model',
  'vendor_model',
  'security_control_analytic',
]);

/** Analytic state enum — Commander-owned lifecycle tracking */
export const analyticStateEnum = pgEnum('analytic_state', [
  'active',
  'deprecated',
  'testing',
]);

export const analytics = pgTable('analytics', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('configuration'),

  // ─── Source-owned fields (immutable after write) ─────────────────────────

  /** Source-provided or Commander-generated unique identifier for the analytic */
  analyticId: text('analytic_id').notNull(),

  /** Human-readable analytic name */
  analyticName: text('analytic_name').notNull(),

  /** Analytic type classification */
  analyticType: analyticTypeEnum('analytic_type').notNull(),

  /** Analytic version */
  version: text('version').notNull(),

  // ─── Commander-owned fields (mutable) ────────────────────────────────────

  /** Analytic lifecycle state */
  state: analyticStateEnum('state').notNull().default('active'),

  /** False positive rate (0-100). Commander-tracked. Optional. */
  false_positive_rate: integer('false_positive_rate'),

  /** ATT&CK bindings (JSONB, bounded max 20). Analytic-to-ATT&CK mapping. */
  attacks: jsonb('attacks').default('[]'),

  // ─── Source provenance ───────────────────────────────────────────────────

  /** Connector that produced this analytic record */
  source_connector_id: text('source_connector_id').notNull(),
  /** Import run identifier */
  sourceImportRunId: text('source_import_run_id').notNull(),
  /** Source system identifier */
  source_system: text('source_system').notNull(),
  /** Timestamp of source extraction */
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  // ─── Timestamps ──────────────────────────────────────────────────────────

  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  /** Deduplication index: same analyticId within a tenant is one analytic record */
  deduplicationIdx: uniqueIndex('analytics_dedup_idx').on(table.tenant_id, table.analyticId),
  /** Filter index: by analytic type */
  typeIdx: index('analytics_type_idx').on(table.analyticType),
  /** Filter index: by analytic state */
  stateIdx: index('analytics_state_idx').on(table.state),
  /** Tenant scope index */
  tenantIdx: index('analytics_tenant_idx').on(table.tenant_id),
}));
