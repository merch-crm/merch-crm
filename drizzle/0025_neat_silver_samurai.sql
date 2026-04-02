ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_base_item_id_inventory_items_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_print_version_id_print_design_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_product_line_id_product_lines_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_print_design_id_print_designs_id_fk";
--> statement-breakpoint
DROP INDEX "inv_items_product_line_idx";--> statement-breakpoint
DROP INDEX "inv_items_base_item_idx";--> statement-breakpoint
DROP INDEX "inv_items_print_design_idx";--> statement-breakpoint
DROP INDEX "inv_items_print_version_idx";--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "product_line_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "base_item_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "print_design_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_line_id_product_lines_id_fk" FOREIGN KEY ("product_line_id") REFERENCES "public"."product_lines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_print_design_id_print_designs_id_fk" FOREIGN KEY ("print_design_id") REFERENCES "public"."print_designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_items_product_line_idx" ON "inventory_items" USING btree ("product_line_id");--> statement-breakpoint
CREATE INDEX "inventory_items_base_item_idx" ON "inventory_items" USING btree ("base_item_id");--> statement-breakpoint
CREATE INDEX "inventory_items_print_design_idx" ON "inventory_items" USING btree ("print_design_id");--> statement-breakpoint
ALTER TABLE "inventory_items" DROP COLUMN "print_version_id";