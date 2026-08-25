CREATE TYPE "public"."actor_kind" AS ENUM('pc', 'npc');--> statement-breakpoint
CREATE TABLE "actor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"kind" "actor_kind" DEFAULT 'npc' NOT NULL,
	"name" text NOT NULL,
	"concept" text,
	"player_name" text,
	"description" text,
	"notes" text,
	"sheet" jsonb DEFAULT '{"attributes":{},"resources":{}}'::jsonb NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"parent_id" uuid,
	"name" text NOT NULL,
	"type" text,
	"description" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "actor" ADD CONSTRAINT "actor_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_parent_id_location_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."location"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "actor_campaign_idx" ON "actor" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "actor_owner_idx" ON "actor" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "location_campaign_idx" ON "location" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "location_parent_idx" ON "location" USING btree ("parent_id");