-- COIM-G: Case Aggregation
-- Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §6; 02_SOURCE_CLASSIFICATION_MODEL §10.4; Spec #08 Case Management.
-- Resolves: ARCH-DEBT-045 (Case dwell time portion).
-- ADDITIVE ONLY — nullable columns added to cases table. No drops, no changes to existing columns.

ALTER TABLE "cases" ADD COLUMN "attacks" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "affected_entity_count" integer;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "blast_radius_score" integer;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "dwell_time_hours" integer;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "confidence_aggregate" integer;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "finding_class_breakdown" jsonb;
