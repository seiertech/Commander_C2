/**
 * Risk Objects Table — Commander C2
 *
 * Risk objects are discrete risk conditions bound to cases and entities.
 * System-created and tenant-scoped.
 *
 * Source: Spec #29 Universal Risk Object and Case Binding
 * Data classification: State
 */

import { pgTable, text, integer, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';

/** Risk object type enum — 8 canonical types */
export const riskObjectTypeEnum = pgEnum('risk_object_type', [
  'coverage_blindspot',
  'ooda_phase_degradation',
  'vulnerability_drift',
  'configuration_drift',
  'exposure_drift',
  'control_gap',
  'identity_risk',
  'policy_gap',
]);

/** Treatment state enum — 4 states */
export const treatmentStateEnum = pgEnum('treatment_state', [
  'open',
  'mitigated',
  'accepted',
  'transferred',
]);

/**
 * Finding class enum — COIM-A source-classification (extracted column).
 * Source: COIM v1.0 §4.1; 02_SOURCE_CLASSIFICATION_MODEL §4.1.
 */
export const findingClassEnum = pgEnum('finding_class', [
  'vulnerability',
  'detection',
  'adherence',
  'incident',
  'data_security',
  'iam_analysis',
  'application_security',
]);

export const riskObjects = pgTable('risk_objects', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('state'),
  /** Risk object type */
  type: riskObjectTypeEnum('type').notNull(),
  /** ID of the affected entity (asset, identity, case, etc.) */
  affected_entity_id: text('affected_entity_id').notNull(),
  /** Type of the affected entity */
  affected_entity_type: text('affected_entity_type').notNull(),
  /** Justification for this risk object's creation */
  justification: text('justification').notNull(),
  /** Owner responsible for treatment */
  owner: text('owner').notNull(),
  /** Current treatment state */
  treatment_state: treatmentStateEnum('treatment_state').notNull().default('open'),
  /** Expiry or review trigger condition */
  expiry_or_review_trigger: text('expiry_or_review_trigger').notNull(),
  /** Source provenance */
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  // ─── COIM-A augmentation (additive, nullable) ──────────────────────────────
  // Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §4.1, §4.12.
  // Immutable source provenance. Resolves ARCH-DEBT-039 + ARCH-DEBT-045 (Risk Object).
  /** Full immutable source-classification object (JSONB). */
  source_classification: jsonb('source_classification'),
  /** Extracted high-frequency fields (indexed for filtering). */
  finding_class: findingClassEnum('finding_class'),
  severity_id: integer('severity_id'),
  confidence_score: integer('confidence_score'),
  /** Source-provided unique finding identifier (deduplication). */
  source_finding_uid: text('source_finding_uid'),
  /** Plural affected entities (singular affected_entity_id retained above). */
  affected_entities: jsonb('affected_entities').default('[]'),
  /** Timeline model — distinct semantics. */
  first_detected_at: timestamp('first_detected_at', { withTimezone: true }),
  last_confirmed_at: timestamp('last_confirmed_at', { withTimezone: true }),
  normalised_at: timestamp('normalised_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
