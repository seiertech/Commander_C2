/**
 * Case Strategy Bindings Table — Commander SDR
 *
 * Links cases to their governing strategy policies.
 * All case values are derived from strategy layer; none are hardcoded.
 *
 * Source: Spec #32 Strategy Layer Runtime Surface, Spec #08 Case Management
 * Data classification: Configuration
 */

import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';

/** Strategy policy reference shape (stored as JSONB per surface) */
type StrategyPolicyRefJson = {
  surfaceType: string;
  policyId: string;
  policyVersion: string;
  evaluatedAt: string;
};

export const caseStrategyBindings = pgTable('case_strategy_bindings', {
  /** Case ID — primary key (one binding row per case) */
  caseId: text('case_id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('configuration'),
  /** Routing strategy — determines owner/team */
  routingStrategy: jsonb('routing_strategy').$type<StrategyPolicyRefJson>().notNull(),
  /** SLA strategy — determines SLA target hours */
  slaStrategy: jsonb('sla_strategy').$type<StrategyPolicyRefJson>().notNull(),
  /** Prioritisation weight strategy — determines priority calculation */
  prioritisationWeightStrategy: jsonb('prioritisation_weight_strategy').$type<StrategyPolicyRefJson>().notNull(),
  /** Closure gate strategy — determines closure gates */
  closureGateStrategy: jsonb('closure_gate_strategy').$type<StrategyPolicyRefJson>().notNull(),
  /** Reopening trigger strategy — determines reopening triggers */
  reopeningTriggerStrategy: jsonb('reopening_trigger_strategy').$type<StrategyPolicyRefJson>().notNull(),
  /** Validation window strategy — determines validation freshness */
  validationWindowStrategy: jsonb('validation_window_strategy').$type<StrategyPolicyRefJson>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
