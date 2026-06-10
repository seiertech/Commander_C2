/**
 * Strategy Policies Table — Commander C2
 *
 * Strategy policies are versioned configurations for the twenty named
 * strategy surfaces. They are tenant-scoped and follow an approval workflow.
 *
 * Source: Spec #32 Strategy Layer Runtime Surface Specification
 * Migration: 0012_strategy_surface_expansion.sql (13 → 20 surfaces)
 * Data classification: Configuration
 */

import { pgTable, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';

/** Strategy surface type enum — 20 canonical surfaces (migrated from 13 → 20) */
export const strategySurfaceTypeEnum = pgEnum('strategy_surface_type', [
  'sla',
  'threshold',
  'automation-boundary',
  'routing',
  'posture',
  'mission-objective',
  'operational-tempo',
  'domain-specific',
  'prioritisation-weight',
  'validation-window',
  'closure-gate',
  'reopening-trigger',
  'evidence-sufficiency',
  'sla-modifier',
  'correlation-policy',
  'effectiveness-targets',
  'ssvc-decision-tree',
  'communication-playbook',
  'war-room-cadence',
  'journey-intelligence-formula',
]);

/** Strategy policy status enum — 6 lifecycle states */
export const strategyPolicyStatusEnum = pgEnum('strategy_policy_status', [
  'draft',
  'pending-approval',
  'approved',
  'active',
  'superseded',
  'rejected',
]);

export const strategies = pgTable('strategies', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('configuration'),
  /** Which strategy surface this policy belongs to */
  surface_type: strategySurfaceTypeEnum('surface_type').notNull(),
  /** Policy version (semantic) */
  policy_version: text('policy_version').notNull(),
  /** Current status */
  status: strategyPolicyStatusEnum('status').notNull().default('draft'),
  /** Policy configuration (JSON — shape varies by surface type) */
  configuration: jsonb('configuration').$type<Record<string, unknown>>().notNull(),
  /** Who proposed this policy */
  proposed_by: text('proposed_by').notNull(),
  /** When it was proposed */
  proposed_at: timestamp('proposed_at', { withTimezone: true }).notNull(),
  /** Approval metadata (null if not yet approved) */
  approval: jsonb('approval').$type<{
    approved_by: string;
    approved_at: string;
    condition: string;
    rationale: string;
  } | null>(),
  /** Effective from (null if not yet active) */
  effective_from: timestamp('effective_from', { withTimezone: true }),
  /** Effective until (null if still active) */
  effective_until: timestamp('effective_until', { withTimezone: true }),
  /** Simulation result reference (null if not simulated) */
  simulation_ref: text('simulation_ref'),
  /** Source provenance */
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
