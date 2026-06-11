/**
 * Tenant Intelligence Schemas — Evaluation Plane (Customer_Tenant owned)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 17.2, 17.3
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * Tenant-leading keys. Cross-plane and caseId references as plain columns
 * (no FK across the Admin↔Customer boundary). No cross-workload foreign keys.
 *
 * Workload class: operational-write, operational-read
 * Data classification: threat_intelligence
 */

import { pgTable, text, integer, timestamp, boolean, jsonb, pgEnum, index } from 'drizzle-orm/pg-core';
import { dataClassificationEnum } from './common';
import { tenants } from './tenants';
import { iocCategoryEnum, tlpMarkingEnum } from './platform-intelligence';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const tenantSubscriptionStateEnum = pgEnum('tenant_subscription_state', [
  'active', 'paused', 'cancelled',
]);

export const evaluationTypeEnum = pgEnum('evaluation_type', [
  'vulnerability_exposure', 'ioc_match', 'advisory_applicability',
]);

export const tenantExposureStateEnum = pgEnum('tenant_exposure_state', [
  'matched', 'not_matched', 'potentially_matched', 'exposed',
  'not_exposed', 'remediated', 'accepted_risk', 'unknown',
]);

export const iocMatchTypeEnum = pgEnum('ioc_match_type', [
  'exact', 'partial', 'heuristic',
]);

export const allowBlockListTypeEnum = pgEnum('allow_block_list_type', [
  'allow', 'block',
]);

export const iocCaseLinkTypeEnum = pgEnum('ioc_case_link_type', [
  'created_by', 'enriched_by', 'triggered_by',
]);

export const threatHuntStatusEnum = pgEnum('threat_hunt_status', [
  'proposed', 'queued', 'running', 'completed',
  'no_match', 'match_found', 'escalated',
]);

export const pushActionTypeEnum = pgEnum('push_action_type', [
  'block', 'allow', 'alert', 'quarantine',
]);

export const pushIntentStatusEnum = pgEnum('push_intent_status', [
  'recommended', 'requires_approval', 'approved', 'queued',
  'pushed_mock', 'failed_mock', 'live_push_deferred',
]);

// ─── Tenant Intelligence Subscription ────────────────────────────────────────

export const tenantIntelligenceSubscriptions = pgTable('tenant_intelligence_subscriptions', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  source_id: text('source_id').notNull(), // Cross-plane reference — no FK
  subscriptionState: tenantSubscriptionStateEnum('subscription_state').notNull(),
  applicabilityFilters: jsonb('applicability_filters').notNull().default([]),
  evaluationPreferences: jsonb('evaluation_preferences').notNull().default({}),
  subscribed_at: timestamp('subscribed_at', { withTimezone: true }).notNull(),

  // Source provenance
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('tis_tenant_idx').on(table.tenant_id),
  sourceIdx: index('tis_source_idx').on(table.source_id),
}));

// ─── Tenant Intelligence Evaluation ──────────────────────────────────────────

export const tenantIntelligenceEvaluations = pgTable('tenant_intelligence_evaluations', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  platformRecordId: text('platform_record_id').notNull(), // Cross-plane reference — no FK
  evaluationType: evaluationTypeEnum('evaluation_type').notNull(),
  evaluationState: tenantExposureStateEnum('evaluation_state').notNull(),
  matchedAssets: jsonb('matched_assets').notNull().default([]),
  matchedIdentities: jsonb('matched_identities').notNull().default([]),
  matchedObservables: jsonb('matched_observables').notNull().default([]),
  evidenceReferences: jsonb('evidence_references').notNull().default([]),
  evaluated_at: timestamp('evaluated_at', { withTimezone: true }).notNull(),

  // Source provenance
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('tie_tenant_idx').on(table.tenant_id),
  platformRecordIdx: index('tie_platform_record_idx').on(table.platformRecordId),
}));

// ─── Tenant IOC Match ────────────────────────────────────────────────────────

export const tenantIocMatches = pgTable('tenant_ioc_matches', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  ioc_id: text('ioc_id').notNull(), // Cross-plane reference — no FK
  matchedObservableId: text('matched_observable_id').notNull(), // Ref to Observable (same workload)
  matchType: iocMatchTypeEnum('match_type').notNull(),
  matchConfidence: integer('match_confidence').notNull(),
  matchedAt: timestamp('matched_at', { withTimezone: true }).notNull(),
  matchSource: text('match_source').notNull(),
  evidenceReferences: jsonb('evidence_references').notNull().default([]),

  // Source provenance
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('tim_tenant_idx').on(table.tenant_id),
  iocIdx: index('tim_ioc_idx').on(table.ioc_id),
  observableIdx: index('tim_observable_idx').on(table.matchedObservableId),
}));

// ─── Tenant IOC Allow/Block Entry ────────────────────────────────────────────

export const tenantIocAllowBlockEntries = pgTable('tenant_ioc_allowblock_entries', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  ioc_category: iocCategoryEnum('ioc_category').notNull(),
  value: text('value').notNull(),
  listType: allowBlockListTypeEnum('list_type').notNull(),
  addedBy: text('added_by').notNull(),
  addedAt: timestamp('added_at', { withTimezone: true }).notNull(),
  reason: text('reason').notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }),

  // Source provenance
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('tab_tenant_idx').on(table.tenant_id),
  valueLookupIdx: index('tab_value_lookup_idx').on(table.tenant_id, table.ioc_category, table.value),
}));

// ─── IOC Case Link ───────────────────────────────────────────────────────────

export const iocCaseLinks = pgTable('ioc_case_links', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  iocMatchId: text('ioc_match_id').notNull(),
  case_id: text('case_id').notNull(), // Application-layer reference — no cross-workload FK
  linkType: iocCaseLinkTypeEnum('link_type').notNull(),
  linkedAt: timestamp('linked_at', { withTimezone: true }).notNull(),
  status: text('status').notNull(),

  // Source provenance
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('icl_tenant_idx').on(table.tenant_id),
  caseIdx: index('icl_case_idx').on(table.case_id),
}));

// ─── Vulnerability Case Link ─────────────────────────────────────────────────

export const vulnerabilityCaseLinks = pgTable('vulnerability_case_links', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  evaluationId: text('evaluation_id').notNull(),
  case_id: text('case_id').notNull(), // Application-layer reference — no cross-workload FK
  linkType: text('link_type').notNull(),
  linkedAt: timestamp('linked_at', { withTimezone: true }).notNull(),
  status: text('status').notNull(),

  // Source provenance
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('vcl_tenant_idx').on(table.tenant_id),
  caseIdx: index('vcl_case_idx').on(table.case_id),
}));

// ─── Threat Hunt Record ──────────────────────────────────────────────────────

export const threatHuntRecords = pgTable('threat_hunt_records', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  triggeringIocId: text('triggering_ioc_id').notNull(),
  triggeringMatchId: text('triggering_match_id').notNull(),
  huntType: text('hunt_type').notNull(),
  huntScope: text('hunt_scope').notNull(),
  status: threatHuntStatusEnum('status').notNull(),
  assigned_to: text('assigned_to').notNull(),
  proposed_at: timestamp('proposed_at', { withTimezone: true }).notNull(),
  started_at: timestamp('started_at', { withTimezone: true }),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  findingsRef: text('findings_ref').notNull(),

  // Source provenance
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('thr_tenant_idx').on(table.tenant_id),
  iocIdx: index('thr_ioc_idx').on(table.triggeringIocId),
}));

// ─── Push Action Intent ──────────────────────────────────────────────────────

export const pushActionIntents = pgTable('push_action_intents', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('threat_intelligence'),

  ioc_id: text('ioc_id').notNull(),
  ioc_category: iocCategoryEnum('ioc_category').notNull(),
  targetSystemType: text('target_system_type').notNull(),
  action_type: pushActionTypeEnum('action_type').notNull(),
  intent_status: pushIntentStatusEnum('intent_status').notNull(),
  requestedBy: text('requested_by').notNull(),
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull(),
  approved_by: text('approved_by'),
  approved_at: timestamp('approved_at', { withTimezone: true }),
  executionReference: text('execution_reference').notNull(),

  // Source provenance
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),

  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('pai_tenant_idx').on(table.tenant_id),
  iocIdx: index('pai_ioc_idx').on(table.ioc_id),
}));
