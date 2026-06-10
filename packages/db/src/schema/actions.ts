/**
 * Actions / Sub-Actions Tables — Commander SDR
 *
 * Remediation plan decomposition entities with D3FEND tactic classification.
 * System-created and tenant-scoped. Additive — does not modify case lifecycle.
 *
 * Source: COIM v1.0 §4.3, §6; 03_REUSABLE_OBJECT_CATALOGUE §2.3; Spec #08
 * Build unit: COIM-H (Action/Sub-Action + D3FEND)
 * Resolves: ARCH-DEBT-044 (entity absence), ARCH-DEBT-046 (D3FEND gap)
 *
 * Data classification: Case (remediation actions are case-bound)
 * Workload class: operational-write (case-bound lifecycle data)
 *
 * NOTE: No cross-workload foreign keys per performance doctrine §5.
 * caseId references are application-layer enforced, not FK-constrained,
 * as cases may eventually live in a separate physical database at T2+.
 */

import { pgTable, text, integer, real, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';

// ─── Enums ───────────────────────────────────────────────────────────────────

/** Action status enum */
export const actionStatusEnum = pgEnum('action_status', [
  'planned',
  'in_progress',
  'completed',
  'cancelled',
]);

/** Outcome classification enum for sub-actions */
export const outcomeClassificationEnum = pgEnum('outcome_classification', [
  'successful',
  'partial',
  'failed',
  'cancelled',
  'pending',
]);

/** D3FEND tactic type enum — five canonical defensive tactics */
export const d3fendTacticTypeEnum = pgEnum('d3fend_tactic_type', [
  'isolate',
  'evict',
  'restore',
  'harden',
  'detect',
]);

// ─── Actions Table ───────────────────────────────────────────────────────────

export const actions = pgTable('actions', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('case'),
  /** Reference to the owning case (application-layer enforced, no FK) */
  caseId: text('case_id').notNull(),
  /** Human-readable action title */
  title: text('title').notNull(),
  /** Action description / remediation objective */
  description: text('description').notNull(),
  /** Total estimated effort for all sub-actions (hours) */
  estimatedEffortHours: real('estimated_effort_hours').notNull().default(0),
  /** Total actual effort recorded across sub-actions (hours) */
  actualEffortHours: real('actual_effort_hours').notNull().default(0),
  /** Overall action status */
  status: actionStatusEnum('status').notNull().default('planned'),
  /** Approval reference */
  approvalRef: text('approval_ref').notNull(),
  /** Owner assigned via routing engine */
  owner: text('owner').notNull(),
  /** Source provenance */
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Sub-Actions Table ───────────────────────────────────────────────────────

export const subActions = pgTable('sub_actions', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('case'),
  /** Reference to parent action */
  actionId: text('action_id').notNull().references(() => actions.id),
  /** Reference to the owning case (denormalised, application-layer enforced) */
  caseId: text('case_id').notNull(),
  /** Entity targeted by this sub-action */
  targetEntity: text('target_entity').notNull(),
  /** Type of the target entity */
  targetEntityType: text('target_entity_type').notNull(),
  /** How the remediation is executed */
  executionMethod: text('execution_method').notNull(),
  /** Outcome classification */
  outcomeClassification: outcomeClassificationEnum('outcome_classification').notNull().default('pending'),
  /** Estimated effort (hours) */
  estimatedEffortHours: real('estimated_effort_hours').notNull().default(0),
  /** Actual effort (hours) */
  actualEffortHours: real('actual_effort_hours').notNull().default(0),
  /** Approval reference */
  approvalRef: text('approval_ref').notNull(),
  /** Owner assigned via routing engine */
  owner: text('owner').notNull(),
  /** Ordering within the parent Action */
  sequenceOrder: integer('sequence_order').notNull().default(0),

  // ─── D3FEND Classification (ARCH-DEBT-046) ─────────────────────────────────
  /** D3FEND tactic type */
  tacticType: d3fendTacticTypeEnum('tactic_type').notNull(),
  /** D3FEND countermeasures (bounded JSONB array, max 10 entries) */
  countermeasures: jsonb('countermeasures').notNull().default('[]'),

  /** Source provenance */
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
