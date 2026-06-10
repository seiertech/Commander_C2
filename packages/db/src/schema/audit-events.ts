/**
 * Audit Events Table — Commander C2
 *
 * Immutable audit trail. Every material action emits an audit event.
 *
 * Source: Spec #05 §6.4.5 AuditEntry
 * Data classification: Audit (retained per audit retention policy)
 */

import { pgTable, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';

export const auditEvents = pgTable('audit_events', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('audit'),
  /** Actor who performed the action */
  actorType: text('actor_type').notNull(),
  actorId: text('actor_id').notNull(),
  actorName: text('actor_name').notNull(),
  /** Action performed */
  action: text('action').notNull(),
  /** Entity reference */
  entity_type: text('entity_type').notNull(),
  entity_id: text('entity_id').notNull(),
  /** Source signal that triggered this event */
  sourceSignal: text('source_signal'),
  /** Prior state (JSON) */
  priorState: jsonb('prior_state'),
  /** New state (JSON) */
  newState: jsonb('new_state'),
  /** Machine-readable rationale */
  rationale: text('rationale').notNull(),
  /** Immutable flag — always true for audit records */
  immutable: boolean('immutable').notNull().default(true),
  /** Source provenance */
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
