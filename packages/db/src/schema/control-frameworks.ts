/**
 * Control Framework Mapping Tables — Commander C2
 *
 * Five tables for adherence/control-framework mapping:
 * 1. control_frameworks — the standards themselves
 * 2. framework_controls — individual controls within a framework
 * 3. control_requirements — testable requirements per control
 * 4. control_evaluations — evaluation results per entity per requirement
 * 5. control_mappings — entity-to-control relationship bindings
 *
 * Source: Spec #55 Baseline Configuration Framework;
 *         Spec #10 Platform Security §8;
 *         Feature Registry FR-FRAME-001
 * Build unit: CFM (Control Framework Mapping — Foundational)
 * Resolves: ARCH-DEBT-051 (Control Framework Mapping entity absent)
 *
 * Data classification: Configuration (framework definitions) + State (evaluations)
 * Workload class: operational-read (evaluations queried by adherence pages)
 *
 * NOTE: No cross-workload foreign keys to case/risk-object tables per
 * performance doctrine §5 (they may live in separate physical databases at T2+).
 * Entity references are application-layer enforced.
 */

import { pgTable, text, integer, real, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const frameworkCategoryEnum = pgEnum('framework_category', [
  'regulatory',
  'industry',
  'vendor',
  'maturity_model',
  'internal',
]);

export const licenceStatusEnum = pgEnum('licence_status', [
  'open',
  'restricted',
  'licensed',
  'internal_only',
]);

export const controlTierEnum = pgEnum('control_tier', [
  'mandatory',
  'recommended',
  'optional',
]);

export const evaluationOperatorEnum = pgEnum('evaluation_operator', [
  'equals',
  'not_equals',
  'less_than',
  'less_than_or_equal',
  'greater_than',
  'greater_than_or_equal',
  'contains',
  'not_contains',
  'exists',
  'not_exists',
  'within_days',
]);

export const adherenceVerdictEnum = pgEnum('adherence_verdict', [
  'compliant',
  'non_compliant',
  'partial',
  'unknown',
  'not_applicable',
]);

export const exceptionStateEnum = pgEnum('exception_state', [
  'none',
  'accepted_risk',
  'compensating_control',
  'waiver',
  'deferred',
]);

export const mappingSourceEnum = pgEnum('mapping_source', [
  'system',
  'manual',
  'ai_suggested',
]);

export const coverageContributionEnum = pgEnum('coverage_contribution', [
  'full',
  'partial',
  'evidence_only',
]);

// ─── Control Frameworks Table ────────────────────────────────────────────────

export const controlFrameworks = pgTable('control_frameworks', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('configuration'),
  framework_id: text('framework_id').notNull(),
  frameworkName: text('framework_name').notNull(),
  version: text('version').notNull(),
  category: frameworkCategoryEnum('category').notNull(),
  publisher: text('publisher').notNull(),
  total_controls: integer('total_controls').notNull().default(0),
  origin: text('origin').notNull().default('prebuilt'),
  active: boolean('active').notNull().default(true),
  licence_status: licenceStatusEnum('licence_status').notNull().default('open'),
  source_ref: text('source_ref').notNull(),
  mapping_completeness: real('mapping_completeness').notNull().default(0),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }).notNull(),
  licenceNotes: text('licence_notes'),
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Framework Controls Table ────────────────────────────────────────────────

export const frameworkControls = pgTable('framework_controls', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('configuration'),
  framework_id: text('framework_id').notNull(),
  control_id: text('control_id').notNull(),
  controlName: text('control_name').notNull(),
  domain: text('domain').notNull(),
  subDomain: text('sub_domain'),
  objective: text('objective').notNull(),
  tier: controlTierEnum('tier').notNull().default('mandatory'),
  parentControlId: text('parent_control_id'),
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Control Requirements Table ──────────────────────────────────────────────

export const controlRequirements = pgTable('control_requirements', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('configuration'),
  framework_id: text('framework_id').notNull(),
  control_id: text('control_id').notNull(),
  requirement_id: text('requirement_id').notNull(),
  description: text('description').notNull(),
  targetType: text('target_type').notNull(),
  evaluationRule: jsonb('evaluation_rule').notNull(),
  active: boolean('active').notNull().default(true),
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Control Evaluations Table ───────────────────────────────────────────────

export const controlEvaluations = pgTable('control_evaluations', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('state'),
  framework_id: text('framework_id').notNull(),
  control_id: text('control_id').notNull(),
  requirement_id: text('requirement_id').notNull(),
  evaluatedEntityType: text('evaluated_entity_type').notNull(),
  evaluatedEntityId: text('evaluated_entity_id').notNull(),
  verdict: adherenceVerdictEnum('verdict').notNull(),
  evidence_ref: text('evidence_ref'),
  riskObjectRef: text('risk_object_ref'),
  exception_state: exceptionStateEnum('exception_state').default('none'),
  evaluated_at: timestamp('evaluated_at', { withTimezone: true }).notNull(),
  nextEvaluationDue: timestamp('next_evaluation_due', { withTimezone: true }),
  confidence: integer('confidence').notNull().default(0),
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Control Mappings Table ──────────────────────────────────────────────────

export const controlMappings = pgTable('control_mappings', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('configuration'),
  framework_id: text('framework_id').notNull(),
  control_id: text('control_id').notNull(),
  mappedEntityType: text('mapped_entity_type').notNull(),
  mappedEntityId: text('mapped_entity_id').notNull(),
  confidence: integer('confidence').notNull().default(0),
  mappingSource: mappingSourceEnum('mapping_source').notNull().default('system'),
  rationale: text('rationale').notNull(),
  coverageContribution: coverageContributionEnum('coverage_contribution').notNull().default('partial'),
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
