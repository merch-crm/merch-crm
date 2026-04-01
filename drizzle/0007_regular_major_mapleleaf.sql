CREATE TYPE "public"."storage_location_type" AS ENUM('warehouse', 'production', 'office');--> statement-breakpoint
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_storage_location_id_storage_locations_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_amount" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "promocodes" ADD COLUMN "is_ambassador" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "promocodes" ADD COLUMN "admin_comment" text;--> statement-breakpoint
ALTER TABLE "promocodes" ADD COLUMN "constraints" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "storage_locations" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "storage_locations" ADD COLUMN "type" "storage_location_type" DEFAULT 'warehouse' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "inventory_items" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "inventory_items" DROP COLUMN "storage_location_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "department_legacy";