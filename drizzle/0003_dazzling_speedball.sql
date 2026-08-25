CREATE TABLE "dice_roll" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"expression" text NOT NULL,
	"label" text,
	"total" integer NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"breakdown" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dice_roll" ADD CONSTRAINT "dice_roll_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dice_roll_campaign_idx" ON "dice_roll" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "dice_roll_owner_idx" ON "dice_roll" USING btree ("owner_id");