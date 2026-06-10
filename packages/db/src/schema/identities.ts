/**
 * Identities Table — Commander SDR
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
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  dataClassification: dataClassificationEnum('data_classification').notNull().default('state'),
  displayName: text('display_name').notNull(),
  /** Identity classification per Spec #18 */
  classification: text('classification').notNull(),
  /** Source system lineage (JSON array) */
  sourceSystemLineage: jsonb('source_system_lineage').$type<string[]>().notNull().default([]),
  email: text('email'),
  department: text('department'),
  role: text('role'),
  /** Risk score (0-100) */
  riskScore: integer('risk_score').notNull().default(0),
  surfaceAttribution: surfaceAttributionEnum('surface_attribution').notNull(),
  /** Associated asset IDs */
  associatedAssets: jsonb('associated_assets').$type<string[]>().notNull().default([]),
  status: text('status').notNull().default('active'),
  /** Source provenance */
  sourceConnectorId: text('source_connector_id').notNull(),
  sourceImportRunId: text('source_import_run_id').notNull(),
  sourceSystem: text('source_system').notNull(),
  sourceTimestamp: timestamp('source_timestamp', { withTimezone: true }).notNull(),
  // ─── COIM-F augmentation (additive, nullable) ────────────────────────────
  // Source: COIM v1.0 §6.2; 05_ATTRIBUTE_AND_DATA_EFFICIENCY_MODEL §13.
  // Recommended operational-intelligence fields. No drops; no changes to existing columns.
  /** Privilege level (standard/elevated/privileged/super-privileged). */
  privilegeLevel: text('privilege_level'),
  /** Authentication strength classification. */
  authenticationStrength: text('authentication_strength'),
  /** When this identity last authenticated (source-provided). */
  lastAuthenticatedAt: timestamp('last_authenticated_at', { withTimezone: true }),
  /** Entitlement summary (JSONB: totalEntitlements, privilegedEntitlements, staleEntitlements, hasAdminAccess). */
  entitlementSummary: jsonb('entitlement_summary'),
  /** Risk factors contributing to riskScore (JSONB array). */
  riskFactors: jsonb('risk_factors').default('[]'),
  /** Optional source classification for IAM signals (JSONB). */
  sourceClassification: jsonb('source_classification'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
