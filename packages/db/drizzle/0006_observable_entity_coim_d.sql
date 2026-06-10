-- COIM-D: Observable Entity
-- Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §4.5; 03_REUSABLE_OBJECT_CATALOGUE.md §2.5.
-- Resolves: ARCH-DEBT-041 (observable entity absence).
-- ADDITIVE ONLY — new enum, new tables, new indexes. No drops, no changes to existing tables.

CREATE TYPE "public"."observable_type" AS ENUM('ip', 'domain', 'hash', 'url', 'email', 'certificate', 'process', 'file');--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "observables" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "data_classification" "data_classification" NOT NULL DEFAULT 'threat_intelligence',
  "observable_type" "observable_type" NOT NULL,
  "value" text NOT NULL,
  "first_seen" timestamp with time zone NOT NULL,
  "last_seen" timestamp with time zone NOT NULL,
  "reputation" integer,
  "source_connector_id" text NOT NULL,
  "source_import_run_id" text NOT NULL,
  "source_system" text NOT NULL,
  "source_timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "observable_risk_object_bindings" (
  "observable_id" text NOT NULL REFERENCES "observables"("id"),
  "risk_object_id" text NOT NULL REFERENCES "risk_objects"("id"),
  "bound_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint

CREATE UNIQUE INDEX "observables_dedup_idx" ON "observables" ("tenant_id", "observable_type", "value");--> statement-breakpoint
CREATE INDEX "observables_value_idx" ON "observables" ("value");--> statement-breakpoint
CREATE INDEX "observables_type_idx" ON "observables" ("observable_type");--> statement-breakpoint
CREATE INDEX "observables_tenant_idx" ON "observables" ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "observable_ro_binding_pk" ON "observable_risk_object_bindings" ("observable_id", "risk_object_id");--> statement-breakpoint
CREATE INDEX "observable_ro_binding_observable_idx" ON "observable_risk_object_bindings" ("observable_id");--> statement-breakpoint
CREATE INDEX "observable_ro_binding_risk_object_idx" ON "observable_risk_object_bindings" ("risk_object_id");
