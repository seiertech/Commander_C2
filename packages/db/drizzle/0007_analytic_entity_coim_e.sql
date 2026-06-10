-- COIM-E: Analytic Entity
-- Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §4.8; 03_REUSABLE_OBJECT_CATALOGUE.md §2.7.
-- Resolves: ARCH-DEBT-042 (analytic entity absence).
-- ADDITIVE ONLY — new enums, new table, new indexes. No drops, no changes to existing tables.

CREATE TYPE "public"."analytic_type" AS ENUM('detection_rule', 'analytic_rule', 'sigma_rule', 'yara_rule', 'ml_model', 'ueba_model', 'vendor_model', 'security_control_analytic');--> statement-breakpoint
CREATE TYPE "public"."analytic_state" AS ENUM('active', 'deprecated', 'testing');--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "analytics" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "data_classification" "data_classification" NOT NULL DEFAULT 'configuration',
  "analytic_id" text NOT NULL,
  "analytic_name" text NOT NULL,
  "analytic_type" "analytic_type" NOT NULL,
  "version" text NOT NULL,
  "state" "analytic_state" NOT NULL DEFAULT 'active',
  "false_positive_rate" integer,
  "attacks" jsonb DEFAULT '[]'::jsonb,
  "source_connector_id" text NOT NULL,
  "source_import_run_id" text NOT NULL,
  "source_system" text NOT NULL,
  "source_timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint

CREATE UNIQUE INDEX "analytics_dedup_idx" ON "analytics" ("tenant_id", "analytic_id");--> statement-breakpoint
CREATE INDEX "analytics_type_idx" ON "analytics" ("analytic_type");--> statement-breakpoint
CREATE INDEX "analytics_state_idx" ON "analytics" ("state");--> statement-breakpoint
CREATE INDEX "analytics_tenant_idx" ON "analytics" ("tenant_id");
