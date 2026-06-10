CREATE TABLE "case_strategy_bindings" (
	"case_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"data_classification" "data_classification" DEFAULT 'configuration' NOT NULL,
	"routing_strategy" jsonb NOT NULL,
	"sla_strategy" jsonb NOT NULL,
	"prioritisation_weight_strategy" jsonb NOT NULL,
	"closure_gate_strategy" jsonb NOT NULL,
	"reopening_trigger_strategy" jsonb NOT NULL,
	"validation_window_strategy" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_strategy_bindings" ADD CONSTRAINT "case_strategy_bindings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;