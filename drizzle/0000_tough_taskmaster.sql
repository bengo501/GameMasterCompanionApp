CREATE TYPE "public"."campaign_status" AS ENUM('planning', 'active', 'paused', 'completed', 'archived');--> statement-breakpoint
CREATE TABLE "campaign" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"system_key" text NOT NULL,
	"system_snapshot" jsonb NOT NULL,
	"description" text,
	"tone" text,
	"genre" text,
	"status" "campaign_status" DEFAULT 'planning' NOT NULL,
	"setting" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "campaign_owner_idx" ON "campaign" USING btree ("owner_id");