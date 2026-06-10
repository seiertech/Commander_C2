/**
 * Verdicts Table — Commander C2
 *
 * First-class canonical verdict entity — time-bound, confidence-weighted
 * claims made by security tools. Promoted from engine-internal VerdictRecord.
 *
 * Source: COIM v1.0 §6; Spec #62 Verdict Semantics
 * Authority: DEC-coim-ocsf-source-classification-architecture (DECISIONS.md)
 * Build unit: COIM-C (Verdict Entity Promotion)
 * Resolves: ARCH-DEBT-043
 * Data classification: Verdict
 *
 * Disposition semantics and severity ordering are unchanged (Spec #62).
 * Verdicts are immutable source provenance — Commander processes but does not mutate.
 *
 * Workload class: operational-read, operational-write
 */

import { pgTable, text, integer, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';

/** Verdict disposition enum — 8 semantic dispositions per Spec #62 */
export const verdictDispositionEnum = pgEnum('verdict_disposition', [
  'BLOCK',
  'QUARANTINE',
  'REQUIRE_MFA',
  'REQUIRE_COMPLIANT',
  'COACH',
  'MONITOR',
  'AUDIT',
  'ALLOW',
]);

export const verdicts = pgTable('verdicts', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('verdict'),

  // ─── Source-owned fields (all immutable) ─────────────────────────────────

  /** Semantic disposition — NOT binary pass/fail */
  disposition: verdictDispositionEnum('disposition').notNull(),

  /** Source tool that issued this verdict (JSONB: vendor, name, version, uid, connectorClass) */
  sourceProduct: jsonb('source_product').notNull(),

  /** Source confidence in this verdict (0-100) */
  confidence: integer('confidence').notNull(),

  /** When the verdict was observed/issued (source timestamp) */
  observedAt: timestamp('observed_at', { withTimezone: true }).notNull(),

  /** Target entity ID */
  targetEntityId: text('target_entity_id').notNull(),

  /** Target entity type (asset, identity, etc.) */
  targetEntityType: text('target_entity_type').notNull(),

  /** Structured policy reference (JSONB: policyId, policyName, policyVersion, policySource) */
  policyRef: jsonb('policy_ref').notNull(),

  /** Whether this verdict is time-bound */
  timeBound: boolean('time_bound').notNull().default(true),

  /** When this verdict expires (null if not time-bound) */
  expiresAt: timestamp('expires_at', { withTimezone: true }),

  // ─── Source provenance ───────────────────────────────────────────────────

  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  // ─── Timestamps ──────────────────────────────────────────────────────────

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
