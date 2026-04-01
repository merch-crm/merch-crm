CREATE TYPE "public"."product_line_type" AS ENUM('base', 'finished');--> statement-breakpoint
CREATE TABLE "print_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cover_image" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "print_design_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"format" text NOT NULL,
	"size" integer,
	"dimensions" text,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "print_design_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"design_id" uuid NOT NULL,
	"name" text NOT NULL,
	"fabric_type" text NOT NULL,
	"preview" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "print_designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"name" text NOT NULL,
	"preview" text,
	"description" text,
	"sku_code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"type" "product_line_type" NOT NULL,
	"category_id" uuid NOT NULL,
	"print_collection_id" uuid,
	"common_attributes" jsonb DEFAULT '{}',
	"description" text,
	"image" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "product_line_id" uuid;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "base_item_id" uuid;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "print_design_id" uuid;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "print_version_id" uuid;--> statement-breakpoint
ALTER TABLE "print_collections" ADD CONSTRAINT "print_collections_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_design_files" ADD CONSTRAINT "print_design_files_version_id_print_design_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."print_design_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_design_versions" ADD CONSTRAINT "print_design_versions_design_id_print_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."print_designs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_designs" ADD CONSTRAINT "print_designs_collection_id_print_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."print_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_category_id_inventory_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."inventory_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_print_collection_id_print_collections_id_fk" FOREIGN KEY ("print_collection_id") REFERENCES "public"."print_collections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "print_collections_active_idx" ON "print_collections" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "print_collections_name_idx" ON "print_collections" USING btree ("name");--> statement-breakpoint
CREATE INDEX "print_collections_created_idx" ON "print_collections" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "print_design_files_version_idx" ON "print_design_files" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "print_design_files_format_idx" ON "print_design_files" USING btree ("format");--> statement-breakpoint
CREATE INDEX "print_design_files_created_idx" ON "print_design_files" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "print_design_versions_design_idx" ON "print_design_versions" USING btree ("design_id");--> statement-breakpoint
CREATE INDEX "print_design_versions_fabric_type_idx" ON "print_design_versions" USING btree ("fabric_type");--> statement-breakpoint
CREATE INDEX "print_design_versions_created_idx" ON "print_design_versions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "print_designs_collection_idx" ON "print_designs" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "print_designs_active_idx" ON "print_designs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "print_designs_created_idx" ON "print_designs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "product_lines_category_idx" ON "product_lines" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_lines_type_idx" ON "product_lines" USING btree ("type");--> statement-breakpoint
CREATE INDEX "product_lines_collection_idx" ON "product_lines" USING btree ("print_collection_id");--> statement-breakpoint
CREATE INDEX "product_lines_active_idx" ON "product_lines" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "product_lines_category_type_idx" ON "product_lines" USING btree ("category_id","type");--> statement-breakpoint
CREATE INDEX "product_lines_created_idx" ON "product_lines" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_line_id_product_lines_id_fk" FOREIGN KEY ("product_line_id") REFERENCES "public"."product_lines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_base_item_id_inventory_items_id_fk" FOREIGN KEY ("base_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_print_design_id_print_designs_id_fk" FOREIGN KEY ("print_design_id") REFERENCES "public"."print_designs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_print_version_id_print_design_versions_id_fk" FOREIGN KEY ("print_version_id") REFERENCES "public"."print_design_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_created_idx" ON "sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inv_items_product_line_idx" ON "inventory_items" USING btree ("product_line_id");--> statement-breakpoint
CREATE INDEX "inv_items_base_item_idx" ON "inventory_items" USING btree ("base_item_id");--> statement-breakpoint
CREATE INDEX "inv_items_print_design_idx" ON "inventory_items" USING btree ("print_design_id");--> statement-breakpoint
CREATE INDEX "inv_items_print_version_idx" ON "inventory_items" USING btree ("print_version_id");