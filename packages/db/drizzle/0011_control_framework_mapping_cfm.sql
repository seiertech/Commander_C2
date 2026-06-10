-- Migration 0011: Control Framework Mapping (CFM)
-- Source: Spec #55 Baseline Configuration Framework; Spec #10 §8;
--         Feature Registry FR-FRAME-001; Kiro Spec 11
-- Resolves: ARCH-DEBT-051 (Control Framework Mapping entity absent)
-- Additive only — five new tables, no modification to existing tables.
-- Workload class: operational-read (compliance queries), configuration (definitions)

-- Enums
DO $$ BEGIN
  CREATE TYPE "framework_category" AS ENUM ('regulatory', 'industry', 'vendor', 'maturity_model', 'internal');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "licence_status" AS ENUM ('open', 'restricted', 'licensed', 'internal_only');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "control_tier" AS ENUM ('mandatory', 'recommended', 'optional');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "evaluation_operator" AS ENUM ('equals', 'not_equals', 'less_than', 'less_than_or_equal', 'greater_than', 'greater_than_or_equal', 'contains', 'not_contains', 'exists', 'not_exists', 'within_days');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "compliance_verdict" AS ENUM ('compliant', 'non_compliant', 'partial', 'unknown', 'not_applicable');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "exception_state" AS ENUM ('none', 'accepted_risk', 'compensating_control', 'waiver', 'deferred');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "mapping_source" AS ENUM ('system', 'manual', 'ai_suggested');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "coverage_contribution" AS ENUM ('full', 'partial', 'evidence_only');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Control Frameworks
CREATE TABLE IF NOT EXISTS "control_frameworks" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "data_classification" "data_classification" NOT NULL DEFAULT 'configuration',
  "framework_id" text NOT NULL,
  "framework_name" text NOT NULL,
  "version" text NOT NULL,
  "category" "framework_category" NOT NULL,
  "publisher" text NOT NULL,
  "total_controls" integer NOT NULL DEFAULT 0,
  "origin" text NOT NULL DEFAULT 'prebuilt',
  "active" boolean NOT NULL DEFAULT true,
  "licence_status" "licence_status" NOT NULL DEFAULT 'open',
  "source_ref" text NOT NULL,
  "mapping_completeness" real NOT NULL DEFAULT 0,
  "last_reviewed_at" timestamp with time zone NOT NULL,
  "licence_notes" text,
  "source_connector_id" text NOT NULL,
  "source_import_run_id" text NOT NULL,
  "source_system" text NOT NULL,
  "source_timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Framework Controls
CREATE TABLE IF NOT EXISTS "framework_controls" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "data_classification" "data_classification" NOT NULL DEFAULT 'configuration',
  "framework_id" text NOT NULL,
  "control_id" text NOT NULL,
  "control_name" text NOT NULL,
  "domain" text NOT NULL,
  "sub_domain" text,
  "objective" text NOT NULL,
  "tier" "control_tier" NOT NULL DEFAULT 'mandatory',
  "parent_control_id" text,
  "source_connector_id" text NOT NULL,
  "source_import_run_id" text NOT NULL,
  "source_system" text NOT NULL,
  "source_timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Control Requirements
CREATE TABLE IF NOT EXISTS "control_requirements" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "data_classification" "data_classification" NOT NULL DEFAULT 'configuration',
  "framework_id" text NOT NULL,
  "control_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "description" text NOT NULL,
  "target_type" text NOT NULL,
  "evaluation_rule" jsonb NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "source_connector_id" text NOT NULL,
  "source_import_run_id" text NOT NULL,
  "source_system" text NOT NULL,
  "source_timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Control Evaluations
CREATE TABLE IF NOT EXISTS "control_evaluations" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "data_classification" "data_classification" NOT NULL DEFAULT 'state',
  "framework_id" text NOT NULL,
  "control_id" text NOT NULL,
  "requirement_id" text NOT NULL,
  "evaluated_entity_type" text NOT NULL,
  "evaluated_entity_id" text NOT NULL,
  "verdict" "compliance_verdict" NOT NULL,
  "evidence_ref" text,
  "risk_object_ref" text,
  "exception_state" "exception_state" DEFAULT 'none',
  "evaluated_at" timestamp with time zone NOT NULL,
  "next_evaluation_due" timestamp with time zone,
  "confidence" integer NOT NULL DEFAULT 0,
  "source_connector_id" text NOT NULL,
  "source_import_run_id" text NOT NULL,
  "source_system" text NOT NULL,
  "source_timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Control Mappings
CREATE TABLE IF NOT EXISTS "control_mappings" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "data_classification" "data_classification" NOT NULL DEFAULT 'configuration',
  "framework_id" text NOT NULL,
  "control_id" text NOT NULL,
  "mapped_entity_type" text NOT NULL,
  "mapped_entity_id" text NOT NULL,
  "confidence" integer NOT NULL DEFAULT 0,
  "mapping_source" "mapping_source" NOT NULL DEFAULT 'system',
  "rationale" text NOT NULL,
  "coverage_contribution" "coverage_contribution" NOT NULL DEFAULT 'partial',
  "source_connector_id" text NOT NULL,
  "source_import_run_id" text NOT NULL,
  "source_system" text NOT NULL,
  "source_timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS "cf_tenant_idx" ON "control_frameworks" ("tenant_id");
CREATE INDEX IF NOT EXISTS "cf_framework_id_idx" ON "control_frameworks" ("framework_id");
CREATE INDEX IF NOT EXISTS "cf_category_idx" ON "control_frameworks" ("category");
CREATE INDEX IF NOT EXISTS "fc_tenant_idx" ON "framework_controls" ("tenant_id");
CREATE INDEX IF NOT EXISTS "fc_framework_id_idx" ON "framework_controls" ("framework_id");
CREATE INDEX IF NOT EXISTS "fc_control_id_idx" ON "framework_controls" ("control_id");
CREATE INDEX IF NOT EXISTS "fc_domain_idx" ON "framework_controls" ("domain");
CREATE INDEX IF NOT EXISTS "cr_tenant_idx" ON "control_requirements" ("tenant_id");
CREATE INDEX IF NOT EXISTS "cr_framework_control_idx" ON "control_requirements" ("framework_id", "control_id");
CREATE INDEX IF NOT EXISTS "ce_tenant_idx" ON "control_evaluations" ("tenant_id");
CREATE INDEX IF NOT EXISTS "ce_framework_control_idx" ON "control_evaluations" ("framework_id", "control_id");
CREATE INDEX IF NOT EXISTS "ce_entity_idx" ON "control_evaluations" ("evaluated_entity_type", "evaluated_entity_id");
CREATE INDEX IF NOT EXISTS "ce_verdict_idx" ON "control_evaluations" ("verdict");
CREATE INDEX IF NOT EXISTS "cm_tenant_idx" ON "control_mappings" ("tenant_id");
CREATE INDEX IF NOT EXISTS "cm_framework_control_idx" ON "control_mappings" ("framework_id", "control_id");
CREATE INDEX IF NOT EXISTS "cm_entity_idx" ON "control_mappings" ("mapped_entity_type", "mapped_entity_id");
