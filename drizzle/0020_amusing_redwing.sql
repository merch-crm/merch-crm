CREATE TYPE "public"."print_file_type" AS ENUM('preview', 'source');--> statement-breakpoint
DROP INDEX "print_collections_name_idx";--> statement-breakpoint
DROP INDEX "print_collections_created_idx";--> statement-breakpoint
DROP INDEX "print_design_files_created_idx";--> statement-breakpoint
DROP INDEX "print_design_versions_fabric_type_idx";--> statement-breakpoint
DROP INDEX "print_design_versions_created_idx";--> statement-breakpoint
DROP INDEX "print_designs_created_idx";--> statement-breakpoint
ALTER TABLE "print_collections" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "print_collections" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "print_collections" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "print_collections" ALTER COLUMN "cover_image" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "print_collections" ALTER COLUMN "created_by" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "print_collections" ALTER COLUMN "created_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "print_design_files" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "print_design_files" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "print_design_files" ALTER COLUMN "version_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "print_design_files" ALTER COLUMN "filename" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "print_design_files" ALTER COLUMN "format" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "print_design_files" ALTER COLUMN "size" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "print_design_versions" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "print_design_versions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "print_design_versions" ALTER COLUMN "design_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "print_design_versions" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "print_design_versions" ALTER COLUMN "preview" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "print_designs" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "print_designs" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "print_designs" ALTER COLUMN "collection_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "print_designs" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "print_designs" ALTER COLUMN "preview" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "print_collections" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "print_design_files" ADD COLUMN "original_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "print_design_files" ADD COLUMN "file_type" "print_file_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "print_design_files" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "print_design_files" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "print_design_files" ADD COLUMN "path" varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE "print_design_versions" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "print_collections_sort_order_idx" ON "print_collections" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "print_collections_slug_idx" ON "print_collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "print_collections_created_by_idx" ON "print_collections" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "print_design_files_type_idx" ON "print_design_files" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "print_design_versions_sort_order_idx" ON "print_design_versions" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "print_designs_sort_order_idx" ON "print_designs" USING btree ("sort_order");--> statement-breakpoint
ALTER TABLE "print_design_files" DROP COLUMN "dimensions";--> statement-breakpoint
ALTER TABLE "print_design_files" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "print_design_versions" DROP COLUMN "fabric_type";--> statement-breakpoint
ALTER TABLE "print_designs" DROP COLUMN "sku_code";