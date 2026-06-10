-- COIM-F: Asset / Identity Augmentation
-- Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §6.1, §6.2; 05_ATTRIBUTE_AND_DATA_EFFICIENCY_MODEL §13.
-- Resolves: ARCH-DEBT-045 (Asset/Identity portion).
-- ADDITIVE ONLY — nullable columns added to assets and identities tables. No drops, no changes to existing columns.

-- ── Asset augmentation ────────────────────────────────────────────────────────
ALTER TABLE "assets" ADD COLUMN "lifecycle_state" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "platform" jsonb;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "network_position" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "asset_data_classification" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "last_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "first_discovered_by" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "source_classification" jsonb;--> statement-breakpoint

-- ── Identity augmentation ─────────────────────────────────────────────────────
ALTER TABLE "identities" ADD COLUMN "privilege_level" text;--> statement-breakpoint
ALTER TABLE "identities" ADD COLUMN "authentication_strength" text;--> statement-breakpoint
ALTER TABLE "identities" ADD COLUMN "last_authenticated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identities" ADD COLUMN "entitlement_summary" jsonb;--> statement-breakpoint
ALTER TABLE "identities" ADD COLUMN "risk_factors" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "identities" ADD COLUMN "source_classification" jsonb;
