CREATE TABLE "calculation_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculation_number" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"calculator_type" varchar(50) NOT NULL,
	"client_name" varchar(255),
	"client_id" uuid,
	"comment" text,
	"total_cost" numeric(12, 2) NOT NULL,
	"selling_price" numeric(12, 2) NOT NULL,
	"quantity" numeric(10, 0) NOT NULL,
	"price_per_item" numeric(12, 2) NOT NULL,
	"margin_percent" numeric(5, 2) NOT NULL,
	"parameters" jsonb NOT NULL,
	"design_files" jsonb DEFAULT '[]' NOT NULL,
	"roll_visualization" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	CONSTRAINT "calculation_history_calculation_number_unique" UNIQUE("calculation_number")
);
--> statement-breakpoint
CREATE TABLE "calculator_defaults" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"calculator_type" varchar(50) NOT NULL,
	"consumables_config" jsonb NOT NULL,
	"urgency_config" jsonb,
	"margin_config" jsonb,
	"print_config" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placement_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL,
	"max_width_mm" integer DEFAULT 100 NOT NULL,
	"max_height_mm" integer DEFAULT 100 NOT NULL,
	"work_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "placement_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "design_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"stored_name" varchar(255) NOT NULL,
	"mime_type" varchar(150) NOT NULL,
	"extension" varchar(50) NOT NULL,
	"size_bytes" integer NOT NULL,
	"file_path" varchar(1000) NOT NULL,
	"thumbnail_path" varchar(1000),
	"calculator_type" varchar(50) NOT NULL,
	"file_dimensions" text,
	"embroidery_data" text,
	"uploaded_by" uuid NOT NULL,
	"calculation_id" uuid,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "design_files_stored_name_unique" UNIQUE("stored_name")
);
--> statement-breakpoint
CREATE TABLE "branding_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text DEFAULT 'Моя компания' NOT NULL,
	"logo_url" text,
	"primary_color" text DEFAULT '#2563eb' NOT NULL,
	"secondary_color" text DEFAULT '#64748b' NOT NULL,
	"phone" text,
	"email" text,
	"website" text,
	"address" text,
	"inn" text,
	"kpp" text,
	"ogrn" text,
	"bank_details" text,
	"footer_text" text,
	"show_qr_code" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "branding_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_base_item_id_inventory_items_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "client_name" text;--> statement-breakpoint
ALTER TABLE "calculation_history" ADD CONSTRAINT "calculation_history_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculation_history" ADD CONSTRAINT "calculation_history_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculation_history" ADD CONSTRAINT "calculation_history_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculator_defaults" ADD CONSTRAINT "calculator_defaults_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_areas" ADD CONSTRAINT "placement_areas_product_id_placement_items_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."placement_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_areas" ADD CONSTRAINT "placement_areas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_areas" ADD CONSTRAINT "placement_areas_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_items" ADD CONSTRAINT "placement_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_items" ADD CONSTRAINT "placement_items_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_files" ADD CONSTRAINT "design_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branding_settings" ADD CONSTRAINT "branding_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calc_history_calculator_type_idx" ON "calculation_history" USING btree ("calculator_type");--> statement-breakpoint
CREATE INDEX "calc_history_created_at_idx" ON "calculation_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "calc_history_deleted_at_idx" ON "calculation_history" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "calc_history_created_by_idx" ON "calculation_history" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "calc_history_client_id_idx" ON "calculation_history" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "calc_history_search_idx" ON "calculation_history" USING btree ("name","calculation_number","client_name","client_id");--> statement-breakpoint
CREATE INDEX "calc_history_client_created_idx" ON "calculation_history" USING btree ("client_id","created_at");--> statement-breakpoint
CREATE INDEX "calc_history_user_type_created_idx" ON "calculation_history" USING btree ("created_by","calculator_type","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "calc_defaults_user_type_idx" ON "calculator_defaults" USING btree ("user_id","calculator_type");--> statement-breakpoint
CREATE INDEX "calc_defaults_type_idx" ON "calculator_defaults" USING btree ("calculator_type");--> statement-breakpoint
CREATE INDEX "calc_defaults_created_idx" ON "calculator_defaults" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "placement_areas_product_id_idx" ON "placement_areas" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "placement_areas_code_idx" ON "placement_areas" USING btree ("code");--> statement-breakpoint
CREATE INDEX "placement_areas_is_active_idx" ON "placement_areas" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "placement_areas_sort_order_idx" ON "placement_areas" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "placement_areas_deleted_at_idx" ON "placement_areas" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "placement_areas_product_code_idx" ON "placement_areas" USING btree ("product_id","code");--> statement-breakpoint
CREATE INDEX "placement_areas_created_idx" ON "placement_areas" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "placement_items_type_idx" ON "placement_items" USING btree ("type");--> statement-breakpoint
CREATE INDEX "placement_items_is_active_idx" ON "placement_items" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "placement_items_sort_order_idx" ON "placement_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "placement_items_deleted_at_idx" ON "placement_items" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "placement_items_created_idx" ON "placement_items" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "design_files_calculator_type_idx" ON "design_files" USING btree ("calculator_type");--> statement-breakpoint
CREATE INDEX "design_files_uploaded_by_idx" ON "design_files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "design_files_calc_id_idx" ON "design_files" USING btree ("calculation_id");--> statement-breakpoint
CREATE INDEX "design_files_uploaded_at_idx" ON "design_files" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX "design_files_deleted_at_idx" ON "design_files" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "design_files_user_calc_idx" ON "design_files" USING btree ("uploaded_by","calculator_type");--> statement-breakpoint
CREATE INDEX "design_files_created_idx" ON "design_files" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "branding_email_idx" ON "branding_settings" USING btree ("email");--> statement-breakpoint
CREATE INDEX "branding_phone_idx" ON "branding_settings" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "branding_created_idx" ON "branding_settings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "branding_user_idx" ON "branding_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_archived_created_idx" ON "orders" USING btree ("status","is_archived","created_at");