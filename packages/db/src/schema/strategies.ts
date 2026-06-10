/**
 * Strategy Policies Table — Commander SDR
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
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('configuration'),
  /** Which strategy surface this policy belongs to */
  surfaceType: strategySurfaceTypeEnum('surface_type').notNull(),
  /** Policy version (semantic) */
  policyVersion: text('policy_version').notNull(),
  /** Current status */
  status: strategyPolicyStatusEnum('status').notNull().default('draft'),
  /** Policy configuration (JSON — shape varies by surface type) */
  configuration: jsonb('configuration').$type<Record<string, unknown>>().notNull(),
  /** Who proposed this policy */
  proposedBy: text('proposed_by').notNull(),
  /** When it was proposed */
  proposedAt: timestamp('proposed_at', { withTimezone: true }).notNull(),
  /** Approval metadata (null if not yet approved) */
  approval: jsonb('approval').$type<{
    approvedBy: string;
    approvedAt: string;
    condition: string;
    rationale: string;
  } | null>(),
  /** Effective from (null if not yet active) */
  effectiveFrom: timestamp('effective_from', { withTimezone: true }),
  /** Effective until (null if still active) */
  effectiveUntil: timestamp('effective_until', { withTimezone: true }),
  /** Simulation result reference (null if not simulated) */
  simulationRef: text('simulation_ref'),
  /** Source provenance */
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
