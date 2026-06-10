-- COIM-A: Risk Object Source Classification + Timeline Augmentation
-- Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §4.1, §4.12.
-- Resolves: ARCH-DEBT-039 (source-classification gap), ARCH-DEBT-045 (Risk Object timeline).
-- ADDITIVE ONLY — new enum + nullable columns. No drops, no changes to existing columns.

CREATE TYPE "public"."finding_class" AS ENUM('vulnerability', 'detection', 'compliance', 'incident', 'data_security', 'iam_analysis', 'application_security');--> statement-breakpoint
ALTER TABLE "risk_objects" ADD COLUMN "source_classification" jsonb;--> statement-breakpoint
ALTER TABLE "risk_objects" ADD COLUMN "finding_class" "finding_class";--> statement-breakpoint
ALTER TABLE "risk_objects" ADD COLUMN "severity_id" integer;--> statement-breakpoint
ALTER TABLE "risk_objects" ADD COLUMN "confidence_score" integer;--> statement-breakpoint
ALTER TABLE "risk_objects" ADD COLUMN "source_finding_uid" text;--> statement-breakpoint
ALTER TABLE "risk_objects" ADD COLUMN "affected_entities" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "risk_objects" ADD COLUMN "first_detected_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "risk_objects" ADD COLUMN "last_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "risk_objects" ADD COLUMN "normalised_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "risk_objects_finding_class_idx" ON "risk_objects" ("finding_class");--> statement-breakpoint
CREATE INDEX "risk_objects_severity_id_idx" ON "risk_objects" ("severity_id");--> statement-breakpoint
CREATE INDEX "risk_objects_source_finding_uid_idx" ON "risk_objects" ("source_finding_uid");
