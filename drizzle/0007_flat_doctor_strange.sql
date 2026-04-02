ALTER TYPE "public"."measurement_unit" ADD VALUE 'шт.';--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "unit" SET DEFAULT 'шт.';--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "color_marker" text;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "full_path" text;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "default_unit" "measurement_unit";--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "cost_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_slug_unique" UNIQUE("slug");