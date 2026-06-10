/**
 * Evidence Table — Commander C2
 *
 * First-class evidence entity for evidence-driven validation,
 * evidence-gated closure, and evidence-triggered reopening.
 *
 * Source: COIM v1.0 §4.4; 04_EVIDENCE_MODEL.md
 * Authority: DEC-coim-ocsf-source-classification-architecture (DECISIONS.md)
 * Build unit: COIM-B (Evidence Entity)
 * Resolves: ARCH-DEBT-040
 * Data classification: Case (evidence is bound to cases)
 *
 * Content stored in object store (S3/equivalent); this table holds metadata only.
 * Immutability enforced at application layer for source-owned fields.
 *
 * Workload class: operational-read, operational-write
 */

import { pgTable, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';
import { cases } from './cases';

/** Evidence type enum — 9 types (OCSF-informed + Commander ai_analysis) */
export const evidenceTypeEnum = pgEnum('evidence_type', [
  'log',
  'scan',
  'verdict',
  'screenshot',
  'config',
  'network_capture',
  'file_hash',
  'process_dump',
  'ai_analysis',
]);

/** Evidence source enum — who/what collected the evidence */
export const evidenceSourceEnum = pgEnum('evidence_source', [
  'connector',
  'analyst',
  'system',
]);

/** Evidence freshness status enum — computed at evaluation time */
export const freshnessStatusEnum = pgEnum('freshness_status', [
  'fresh',
  'aging',
  'stale',
  'expired',
]);

export const evidence = pgTable('evidence', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('case'),

  // ─── Source-owned fields (immutable after write) ─────────────────────────

  /** Evidence type classification */
  evidence_type: evidenceTypeEnum('evidence_type').notNull(),

  /** Evidence source — connector/analyst/system */
  evidenceSource: evidenceSourceEnum('evidence_source').notNull(),

  /** When this evidence was collected (source timestamp, immutable) */
  collected_at: timestamp('collected_at', { withTimezone: true }).notNull(),

  /** Pointer to evidence content in object store (S3 URI or equivalent) */
  contentRef: text('content_ref').notNull(),

  /** SHA-256 hash of evidence content for integrity verification */
  immutabilityHash: text('immutability_hash').notNull(),

  // ─── Commander-owned fields (mutable) ────────────────────────────────────

  /** Confidence in evidence validity (0-100). May be updated based on validation. */
  confidence: integer('confidence').notNull(),

  /** When this evidence becomes stale (computed from collectedAt + freshness policy) */
  expires_at: timestamp('expires_at', { withTimezone: true }),

  /** Freshness evaluation — computed at evaluation time */
  freshnessStatus: freshnessStatusEnum('freshness_status').notNull().default('fresh'),

  // ─── Immutable bindings ──────────────────────────────────────────────────

  /** Bound case (required). Immutable after write. */
  case_id: text('case_id').notNull().references(() => cases.id),

  /** Bound sub-action (optional). Immutable after write. */
  subActionId: text('sub_action_id'),

  /** Bound validation decision (optional). Immutable after write. */
  validationDecisionId: text('validation_decision_id'),

  /** Bound risk object (optional). Immutable after write. */
  risk_object_id: text('risk_object_id'),

  // ─── Source provenance ───────────────────────────────────────────────────

  /** Connector that produced this evidence */
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
});
