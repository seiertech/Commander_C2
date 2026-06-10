-- Migration 0010: Action/Sub-Action + D3FEND (COIM-H)
-- Source: COIM v1.0 §4.3, §6; 03_REUSABLE_OBJECT_CATALOGUE §2.3; Spec #08
-- Resolves: ARCH-DEBT-044 (entity absence), ARCH-DEBT-046 (D3FEND gap)
-- Additive only — does not modify case lifecycle engine logic.
-- Workload class: operational-write

-- Enums
DO $$ BEGIN
  CREATE TYPE "action_status" AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "outcome_classification" AS ENUM ('successful', 'partial', 'failed', 'cancelled', 'pending');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "d3fend_tactic_type" AS ENUM ('isolate', 'evict', 'restore', 'harden', 'detect');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Actions table
CREATE TABLE IF NOT EXISTS "actions" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "data_classification" "data_classification" NOT NULL DEFAULT 'case',
  "case_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "estimated_effort_hours" real NOT NULL DEFAULT 0,
  "actual_effort_hours" real NOT NULL DEFAULT 0,
  "status" "action_status" NOT NULL DEFAULT 'planned',
  "approval_ref" text NOT NULL,
  "owner" text NOT NULL,
  "source_connector_id" text NOT NULL,
  "source_import_run_id" text NOT NULL,
  "source_system" text NOT NULL,
  "source_timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Sub-Actions table
CREATE TABLE IF NOT EXISTS "sub_actions" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
  "data_classification" "data_classification" NOT NULL DEFAULT 'case',
  "action_id" text NOT NULL REFERENCES "actions"("id"),
  "case_id" text NOT NULL,
  "target_entity" text NOT NULL,
  "target_entity_type" text NOT NULL,
  "execution_method" text NOT NULL,
  "outcome_classification" "outcome_classification" NOT NULL DEFAULT 'pending',
  "estimated_effort_hours" real NOT NULL DEFAULT 0,
  "actual_effort_hours" real NOT NULL DEFAULT 0,
  "approval_ref" text NOT NULL,
  "owner" text NOT NULL,
  "sequence_order" integer NOT NULL DEFAULT 0,
  "tactic_type" "d3fend_tactic_type" NOT NULL,
  "countermeasures" jsonb NOT NULL DEFAULT '[]',
  "source_connector_id" text NOT NULL,
  "source_import_run_id" text NOT NULL,
  "source_system" text NOT NULL,
  "source_timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS "actions_tenant_id_idx" ON "actions" ("tenant_id");
CREATE INDEX IF NOT EXISTS "actions_case_id_idx" ON "actions" ("case_id");
CREATE INDEX IF NOT EXISTS "actions_status_idx" ON "actions" ("status");
CREATE INDEX IF NOT EXISTS "sub_actions_tenant_id_idx" ON "sub_actions" ("tenant_id");
CREATE INDEX IF NOT EXISTS "sub_actions_action_id_idx" ON "sub_actions" ("action_id");
CREATE INDEX IF NOT EXISTS "sub_actions_case_id_idx" ON "sub_actions" ("case_id");
CREATE INDEX IF NOT EXISTS "sub_actions_tactic_type_idx" ON "sub_actions" ("tactic_type");
