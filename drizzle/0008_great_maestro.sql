CREATE TYPE "public"."measurement_unit_v2" AS ENUM('pcs', 'liters', 'meters', 'kg', 'шт', 'шт.');--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'archive';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'restore';--> statement-breakpoint
ALTER TABLE "inventory_categories" ALTER COLUMN "default_unit" SET DATA TYPE "public"."measurement_unit_v2" USING "default_unit"::text::"public"."measurement_unit_v2";--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "unit" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "unit" SET DATA TYPE "public"."measurement_unit_v2" USING "unit"::text::"public"."measurement_unit_v2";--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "unit" SET DEFAULT 'шт.';--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "selling_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "archived_by" uuid;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "archive_reason" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "zero_stock_since" timestamp;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "storage_locations" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "storage_locations" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_archived_by_users_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."measurement_unit";