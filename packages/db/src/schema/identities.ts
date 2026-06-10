/**
 * Identities Table — Commander C2
 *
 * Canonical identity persistence with classification, lineage,
 * and surface attribution.
 *
 * Source: Spec #05 §6.4.3 Identity, Spec #18 Unified Identity Architecture
 * Data classification: State
 */

import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { surfaceAttributionEnum, dataClassificationEnum } from './common';
import { tenants } from './tenants';

export const identities = pgTable('identities', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('state'),
  display_name: text('display_name').notNull(),
  /** Identity classification per Spec #18 */
  classification: text('classification').notNull(),
  /** Source system lineage (JSON array) */
  source_system_lineage: jsonb('source_system_lineage').$type<string[]>().notNull().default([]),
  email: text('email'),
  department: text('department'),
  role: text('role'),
  /** Risk score (0-100) */
  risk_score: integer('risk_score').notNull().default(0),
  surface_attribution: surfaceAttributionEnum('surface_attribution').notNull(),
  /** Associated asset IDs */
  associated_assets: jsonb('associated_assets').$type<string[]>().notNull().default([]),
  status: text('status').notNull().default('active'),
  /** Source provenance */
  source_connector_id: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  source_system: text('source_system').notNull(),
  source_timestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  // ─── COIM-F augmentation (additive, nullable) ────────────────────────────
  // Source: COIM v1.0 §6.2; 05_ATTRIBUTE_AND_DATA_EFFICIENCY_MODEL §13.
  // Recommended operational-intelligence fields. No drops; no changes to existing columns.
  /** Privilege level (standard/elevated/privileged/super-privileged). */
  privilege_level: text('privilege_level'),
  /** Authentication strength classification. */
  authenticationStrength: text('authentication_strength'),
  /** When this identity last authenticated (source-provided). */
  lastAuthenticatedAt: timestamp('last_authenticated_at', { withTimezone: true }),
  /** Entitlement summary (JSONB: totalEntitlements, privilegedEntitlements, staleEntitlements, hasAdminAccess). */
  entitlementSummary: jsonb('entitlement_summary'),
  /** Risk factors contributing to riskScore (JSONB array). */
  riskFactors: jsonb('risk_factors').default('[]'),
  /** Optional source classification for IAM signals (JSONB). */
  source_classification: jsonb('source_classification'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
