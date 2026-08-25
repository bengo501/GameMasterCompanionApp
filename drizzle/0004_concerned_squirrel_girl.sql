CREATE TYPE "public"."encounter_status" AS ENUM('planned', 'active', 'done');--> statement-breakpoint
CREATE TABLE "combatant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encounter_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"actor_id" uuid,
	"name" text NOT NULL,
	"initiative" integer DEFAULT 0 NOT NULL,
	"hp_current" integer,
	"hp_max" integer,
	"defense" integer,
	"conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_pc" boolean DEFAULT false NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encounter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" "encounter_status" DEFAULT 'planned' NOT NULL,
	"round" integer DEFAULT 1 NOT NULL,
	"active_combatant_id" uuid,
	"notes" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "combatant" ADD CONSTRAINT "combatant_encounter_id_encounter_id_fk" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combatant" ADD CONSTRAINT "combatant_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combatant" ADD CONSTRAINT "combatant_actor_id_actor_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actor"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounter" ADD CONSTRAINT "encounter_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "combatant_encounter_idx" ON "combatant" USING btree ("encounter_id");--> statement-breakpoint
CREATE INDEX "combatant_owner_idx" ON "combatant" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "encounter_campaign_idx" ON "encounter" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "encounter_owner_idx" ON "encounter" USING btree ("owner_id");