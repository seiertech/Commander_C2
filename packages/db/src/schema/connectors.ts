/**
 * Connectors Table — Commander SDR
 *
 * Canonical connector persistence with class A/B/C/D enforcement,
 * conformance tier tracking, and state machine.
 *
 * Source: Spec #05 §6.4.4 Connector, Spec #61 Universal Security Signal Connector Contract
 * Data classification: Configuration
 */

import { pgTable, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { connectorClassEnum, dataClassificationEnum } from './common';
import { tenants } from './tenants';

/** Conformance tier enum per Spec #61 §4.1 */
export const conformanceTierEnum = pgEnum('conformance_tier', [
  'certified',
  'full',
  'baseline',
  'planned',
]);

/** Connector state enum — 5 lifecycle states */
export const connectorStateEnum = pgEnum('connector_state', [
  'active',
  'paused',
  'error',
  'pending-approval',
  'decommissioned',
]);

/** Last run status enum */
export const lastRunStatusEnum = pgEnum('last_run_status', [
  'success',
  'partial',
  'failed',
  'never-run',
]);

export const connectors = pgTable('connectors', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('configuration'),
  name: text('name').notNull(),
  /** Connector classes — A/B/C/D only (Spec #61) */
  classes: jsonb('classes').$type<('A' | 'B' | 'C' | 'D')[]>().notNull(),
  sourceType: text('source_type').notNull(),
  tier: text('tier').notNull().default('core'),
  state: connectorStateEnum('state').notNull().default('pending-approval'),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  lastRunStatus: lastRunStatusEnum('last_run_status').default('never-run'),
  mappingPackVersion: text('mapping_pack_version').notNull(),
  /** Per-class conformance tracking (JSON array of ClassConformance) */
  classConformance: jsonb('class_conformance').$type<{
    class: 'A' | 'B' | 'C' | 'D';
    tier: 'certified' | 'full' | 'baseline' | 'planned';
    certifiedAt: string | null;
    lastAssessedAt: string;
  }[]>(),
  /** Source provenance */
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
