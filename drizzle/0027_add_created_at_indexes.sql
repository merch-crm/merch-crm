ALTER TABLE "print_collections" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "print_collections" ALTER COLUMN "created_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "print_design_files" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "print_design_files" ALTER COLUMN "version_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "print_design_versions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "print_design_versions" ALTER COLUMN "design_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "print_designs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "print_designs" ALTER COLUMN "collection_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "category_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "print_collection_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "base_line_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "product_lines" ALTER COLUMN "created_by" SET DATA TYPE uuid;--> statement-breakpoint
CREATE INDEX "print_collections_created_at_idx" ON "print_collections" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "print_design_files_created_at_idx" ON "print_design_files" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "print_design_versions_created_at_idx" ON "print_design_versions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "print_designs_created_at_idx" ON "print_designs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "product_lines_created_at_idx" ON "product_lines" USING btree ("created_at");