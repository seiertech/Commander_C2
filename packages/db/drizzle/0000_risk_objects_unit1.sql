CREATE TYPE "public"."case_status" AS ENUM('open', 'in_progress', 'awaiting_validation', 'awaiting_closure', 'closed', 'reopened');--> statement-breakpoint
CREATE TYPE "public"."connector_class" AS ENUM('A', 'B', 'C', 'D');--> statement-breakpoint
CREATE TYPE "public"."data_classification" AS ENUM('configuration', 'state', 'verdict', 'detection', 'case', 'threat_intelligence', 'audit');--> statement-breakpoint
CREATE TYPE "public"."data_residency" AS ENUM('uk', 'us', 'eu');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('P0', 'P1', 'P2', 'P3', 'P4');--> statement-breakpoint
CREATE TYPE "public"."risk_object_type" AS ENUM('coverage_blindspot', 'ooda_phase_degradation', 'vulnerability_drift', 'configuration_drift', 'exposure_drift', 'control_gap', 'identity_risk', 'policy_gap');--> statement-breakpoint
CREATE TYPE "public"."surface_attribution" AS ENUM('internal_attack_surface', 'external_attack_surface');--> statement-breakpoint
CREATE TYPE "public"."treatment_state" AS ENUM('open', 'mitigated', 'accepted', 'transferred');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"data_classification" "data_classification" DEFAULT 'state' NOT NULL,
	"name" text NOT NULL,
	"classification" text NOT NULL,
	"owner" text NOT NULL,
	"environment" text NOT NULL,
	"source_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"surface_attribution" "surface_attribution" NOT NULL,
	"coverage" jsonb NOT NULL,
	"criticality" integer DEFAULT 3 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_connector_id" text NOT NULL,
	"source_import_run_id" text NOT NULL,
	"source_system" text NOT NULL,
	"source_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"data_classification" "data_classification" DEFAULT 'audit' NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" text NOT NULL,
	"actor_name" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"source_signal" text,
	"prior_state" jsonb,
	"new_state" jsonb,
	"rationale" text NOT NULL,
	"immutable" boolean DEFAULT true NOT NULL,
	"source_connector_id" text NOT NULL,
	"source_import_run_id" text NOT NULL,
	"source_system" text NOT NULL,
	"source_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"data_classification" "data_classification" DEFAULT 'case' NOT NULL,
	"case_ref" text NOT NULL,
	"case_type" text NOT NULL,
	"title" text NOT NULL,
	"status" "case_status" DEFAULT 'open' NOT NULL,
	"priority" "priority" NOT NULL,
	"owner" text NOT NULL,
	"team" text NOT NULL,
	"sla_target_hours" integer NOT NULL,
	"sla_breached" boolean DEFAULT false NOT NULL,
	"surface_attribution" "surface_attribution" NOT NULL,
	"related_entities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"audit_trail_ref" text NOT NULL,
	"routing_rationale" text NOT NULL,
	"source_connector_id" text NOT NULL,
	"source_import_run_id" text NOT NULL,
	"source_system" text NOT NULL,
	"source_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cases_case_ref_unique" UNIQUE("case_ref")
);
--> statement-breakpoint
CREATE TABLE "connectors" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"data_classification" "data_classification" DEFAULT 'configuration' NOT NULL,
	"name" text NOT NULL,
	"classes" jsonb NOT NULL,
	"source_type" text NOT NULL,
	"tier" text DEFAULT 'core' NOT NULL,
	"state" text DEFAULT 'pending-approval' NOT NULL,
	"last_run_at" timestamp with time zone,
	"last_run_status" text DEFAULT 'never-run',
	"mapping_pack_version" text NOT NULL,
	"source_connector_id" text NOT NULL,
	"source_import_run_id" text NOT NULL,
	"source_system" text NOT NULL,
	"source_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identities" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"data_classification" "data_classification" DEFAULT 'state' NOT NULL,
	"display_name" text NOT NULL,
	"classification" text NOT NULL,
	"source_system_lineage" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"email" text,
	"department" text,
	"role" text,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"surface_attribution" "surface_attribution" NOT NULL,
	"associated_assets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"source_connector_id" text NOT NULL,
	"source_import_run_id" text NOT NULL,
	"source_system" text NOT NULL,
	"source_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_objects" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"data_classification" "data_classification" DEFAULT 'state' NOT NULL,
	"type" "risk_object_type" NOT NULL,
	"affected_entity_id" text NOT NULL,
	"affected_entity_type" text NOT NULL,
	"justification" text NOT NULL,
	"owner" text NOT NULL,
	"treatment_state" "treatment_state" DEFAULT 'open' NOT NULL,
	"expiry_or_review_trigger" text NOT NULL,
	"source_connector_id" text NOT NULL,
	"source_import_run_id" text NOT NULL,
	"source_system" text NOT NULL,
	"source_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"residency" "data_residency" DEFAULT 'uk' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connectors" ADD CONSTRAINT "connectors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identities" ADD CONSTRAINT "identities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_objects" ADD CONSTRAINT "risk_objects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;