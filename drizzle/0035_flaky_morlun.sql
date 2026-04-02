ALTER TYPE "public"."order_item_design_status" ADD VALUE 'not_required';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'completed';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'archived';--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'completed';--> statement-breakpoint
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_product_line_id_product_lines_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_print_design_id_print_designs_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_print_version_id_print_design_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "print_design_files" ALTER COLUMN "file_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "client_branding" ALTER COLUMN "file_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "product_line_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "base_item_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "print_design_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "print_version_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "design_status" "order_item_design_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "task_deadline_notifications" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "task_assignees_created_idx" ON "task_assignees" USING btree ("assigned_at");--> statement-breakpoint
CREATE INDEX "task_watchers_created_idx" ON "task_watchers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_dependencies_created_idx" ON "task_dependencies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_filter_presets_created_idx" ON "task_filter_presets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_deadline_notifications_created_idx" ON "task_deadline_notifications" USING btree ("created_at");