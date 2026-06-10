CREATE TYPE "public"."conformance_tier" AS ENUM('certified', 'full', 'baseline', 'planned');--> statement-breakpoint
CREATE TYPE "public"."connector_state" AS ENUM('active', 'paused', 'error', 'pending-approval', 'decommissioned');--> statement-breakpoint
CREATE TYPE "public"."last_run_status" AS ENUM('success', 'partial', 'failed', 'never-run');--> statement-breakpoint
ALTER TABLE "connectors" ALTER COLUMN "state" SET DEFAULT 'pending-approval'::"public"."connector_state";--> statement-breakpoint
ALTER TABLE "connectors" ALTER COLUMN "state" SET DATA TYPE "public"."connector_state" USING "state"::"public"."connector_state";--> statement-breakpoint
ALTER TABLE "connectors" ALTER COLUMN "last_run_status" SET DEFAULT 'never-run'::"public"."last_run_status";--> statement-breakpoint
ALTER TABLE "connectors" ALTER COLUMN "last_run_status" SET DATA TYPE "public"."last_run_status" USING "last_run_status"::"public"."last_run_status";--> statement-breakpoint
ALTER TABLE "connectors" ADD COLUMN "class_conformance" jsonb;