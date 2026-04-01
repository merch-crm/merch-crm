ALTER TABLE "product_lines" DROP CONSTRAINT "product_lines_category_id_inventory_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "product_lines" DROP CONSTRAINT "product_lines_print_collection_id_print_collections_id_fk";
--> statement-breakpoint
DROP INDEX "product_lines_collection_idx";--> statement-breakpoint
DROP INDEX "product_lines_created_idx";--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "slug" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "category_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "print_collection_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "common_attributes" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "image" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "created_by" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "created_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_lines" ADD COLUMN "base_line_id" varchar(36);--> statement-breakpoint
ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_category_id_inventory_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."inventory_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_print_collection_id_print_collections_id_fk" FOREIGN KEY ("print_collection_id") REFERENCES "public"."print_collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_lines_print_collection_idx" ON "product_lines" USING btree ("print_collection_id");--> statement-breakpoint
CREATE INDEX "product_lines_base_line_idx" ON "product_lines" USING btree ("base_line_id");--> statement-breakpoint
CREATE INDEX "product_lines_sort_order_idx" ON "product_lines" USING btree ("sort_order");