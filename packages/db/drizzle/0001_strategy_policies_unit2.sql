CREATE TYPE "public"."strategy_policy_status" AS ENUM('draft', 'pending-approval', 'approved', 'active', 'superseded', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."strategy_surface_type" AS ENUM('sla', 'threshold', 'automation-boundary', 'routing', 'posture', 'mission-objective', 'operational-tempo', 'domain-specific', 'prioritisation-weight', 'validation-window', 'closure-gate', 'reopening-trigger', 'evidence-sufficiency');--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"data_classification" "data_classification" DEFAULT 'configuration' NOT NULL,
	"surface_type" "strategy_surface_type" NOT NULL,
	"policy_version" text NOT NULL,
	"status" "strategy_policy_status" DEFAULT 'draft' NOT NULL,
	"configuration" jsonb NOT NULL,
	"proposed_by" text NOT NULL,
	"proposed_at" timestamp with time zone NOT NULL,
	"approval" jsonb,
	"effective_from" timestamp with time zone,
	"effective_until" timestamp with time zone,
	"simulation_ref" text,
	"source_connector_id" text NOT NULL,
	"source_import_run_id" text NOT NULL,
	"source_system" text NOT NULL,
	"source_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;