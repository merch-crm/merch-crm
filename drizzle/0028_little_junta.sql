CREATE TYPE "public"."branding_file_type" AS ENUM('logo', 'brandbook');--> statement-breakpoint
CREATE TYPE "public"."defect_reason" AS ENUM('print_error', 'fabric_defect', 'color_mismatch', 'size_error', 'equipment_failure', 'other');--> statement-breakpoint
CREATE TYPE "public"."internal_status" AS ENUM('waiting', 'design', 'approval', 'production', 'done', 'defect');--> statement-breakpoint
CREATE TYPE "public"."order_file_type" AS ENUM('original', 'mockup', 'print');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('individual', 'collection', 'merch');--> statement-breakpoint
CREATE TABLE "application_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#6366F1',
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "application_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_application_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"application_type_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"mentioned_user_ids" jsonb DEFAULT '[]',
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_defects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"order_item_id" uuid,
	"quantity" integer NOT NULL,
	"reason" "defect_reason" NOT NULL,
	"custom_reason" text,
	"comment" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_mockup_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"order_item_id" uuid,
	"version" integer NOT NULL,
	"mockup_path" text NOT NULL,
	"comment" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_branding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"file_type" "branding_file_type" NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_fonts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"family" text NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer,
	"format" text NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'new'::text;--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('new', 'in_work', 'shipped', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";--> statement-breakpoint
ALTER TABLE "print_designs" ADD COLUMN "application_type_id" uuid;--> statement-breakpoint
ALTER TABLE "print_designs" ADD COLUMN "cost_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "print_designs" ADD COLUMN "retail_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "collection_print_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "original_file_path" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "mockup_file_path" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "print_file_path" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "design_progress" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "production_progress" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "production_done" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_type" "order_type" DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "internal_status" "internal_status" DEFAULT 'waiting';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "application_type_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "assigned_designer_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "assigned_production_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "design_progress" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "production_progress" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "return_reason" text;--> statement-breakpoint
ALTER TABLE "user_application_types" ADD CONSTRAINT "user_application_types_application_type_id_application_types_id_fk" FOREIGN KEY ("application_type_id") REFERENCES "public"."application_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_chat_messages" ADD CONSTRAINT "order_chat_messages_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_chat_messages" ADD CONSTRAINT "order_chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_defects" ADD CONSTRAINT "order_defects_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_defects" ADD CONSTRAINT "order_defects_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_defects" ADD CONSTRAINT "order_defects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_mockup_versions" ADD CONSTRAINT "order_mockup_versions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_mockup_versions" ADD CONSTRAINT "order_mockup_versions_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_mockup_versions" ADD CONSTRAINT "order_mockup_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_branding" ADD CONSTRAINT "client_branding_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_fonts" ADD CONSTRAINT "system_fonts_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_types_active_idx" ON "application_types" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "application_types_sort_order_idx" ON "application_types" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "user_app_types_user_idx" ON "user_application_types" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_app_types_type_idx" ON "user_application_types" USING btree ("application_type_id");--> statement-breakpoint
CREATE INDEX "user_app_types_unique_idx" ON "user_application_types" USING btree ("user_id","application_type_id");--> statement-breakpoint
CREATE INDEX "order_chat_order_idx" ON "order_chat_messages" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_chat_user_idx" ON "order_chat_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_chat_created_idx" ON "order_chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_defects_order_idx" ON "order_defects" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_defects_item_idx" ON "order_defects" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "order_defects_created_by_idx" ON "order_defects" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "order_defects_created_idx" ON "order_defects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mockup_versions_order_idx" ON "order_mockup_versions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "mockup_versions_item_idx" ON "order_mockup_versions" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "mockup_versions_version_idx" ON "order_mockup_versions" USING btree ("version");--> statement-breakpoint
CREATE INDEX "client_branding_client_idx" ON "client_branding" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_branding_type_idx" ON "client_branding" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "system_fonts_name_idx" ON "system_fonts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "system_fonts_family_idx" ON "system_fonts" USING btree ("family");--> statement-breakpoint
ALTER TABLE "print_designs" ADD CONSTRAINT "print_designs_application_type_id_application_types_id_fk" FOREIGN KEY ("application_type_id") REFERENCES "public"."application_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_collection_print_id_print_designs_id_fk" FOREIGN KEY ("collection_print_id") REFERENCES "public"."print_designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_application_type_id_application_types_id_fk" FOREIGN KEY ("application_type_id") REFERENCES "public"."application_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_designer_id_users_id_fk" FOREIGN KEY ("assigned_designer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_production_id_users_id_fk" FOREIGN KEY ("assigned_production_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_order_type_idx" ON "orders" USING btree ("order_type");--> statement-breakpoint
CREATE INDEX "orders_internal_status_idx" ON "orders" USING btree ("internal_status");--> statement-breakpoint
CREATE INDEX "orders_application_type_idx" ON "orders" USING btree ("application_type_id");--> statement-breakpoint
CREATE INDEX "orders_designer_idx" ON "orders" USING btree ("assigned_designer_id");--> statement-breakpoint
CREATE INDEX "orders_production_idx" ON "orders" USING btree ("assigned_production_id");