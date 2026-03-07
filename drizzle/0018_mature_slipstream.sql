CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_categories" ALTER COLUMN "default_unit" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "unit" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "unit" SET DEFAULT 'шт.'::text;--> statement-breakpoint
DROP TYPE "public"."measurement_unit_v2";--> statement-breakpoint
CREATE TYPE "public"."measurement_unit_v2" AS ENUM('шт.', 'см', 'м', 'гр', 'кг', 'мл', 'л');--> statement-breakpoint
ALTER TABLE "inventory_categories" ALTER COLUMN "default_unit" SET DATA TYPE "public"."measurement_unit_v2" USING "default_unit"::"public"."measurement_unit_v2";--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "unit" SET DEFAULT 'шт.'::"public"."measurement_unit_v2";--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "unit" SET DATA TYPE "public"."measurement_unit_v2" USING "unit"::"public"."measurement_unit_v2";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" USING btree ("expires_at");