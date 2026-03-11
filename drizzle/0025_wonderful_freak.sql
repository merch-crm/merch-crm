CREATE TYPE "public"."order_item_design_status" AS ENUM('pending', 'in_progress', 'review', 'approved', 'revision');--> statement-breakpoint
CREATE TYPE "public"."application_category" AS ENUM('print', 'embroidery', 'engraving', 'transfer', 'other');--> statement-breakpoint
CREATE TYPE "public"."equipment_status" AS ENUM('active', 'maintenance', 'repair', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."production_task_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."production_task_status" AS ENUM('pending', 'in_progress', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "order_design_task_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"original_name" text,
	"path" text NOT NULL,
	"thumbnail_path" text,
	"size" integer,
	"mime_type" text,
	"uploaded_by_id" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_design_task_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid,
	"type" text NOT NULL,
	"details" text,
	"old_value" text,
	"new_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_design_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"order_item_id" uuid,
	"number" varchar(50) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "order_item_design_status" DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 0,
	"assignee_id" uuid,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"source_design_id" uuid,
	"client_notes" text,
	"print_area" text,
	"quantity" integer,
	"colors" integer,
	"application_type_id" uuid,
	"completed_at" timestamp,
	"created_by" uuid,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "print_design_mockups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"design_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"preview" text,
	"image_path" text,
	"color" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"brand" varchar(100),
	"model" varchar(100),
	"serial_number" varchar(100),
	"print_width" integer,
	"print_height" integer,
	"print_speed" integer,
	"notes" text,
	"application_type_ids" jsonb DEFAULT '[]'::jsonb,
	"status" "equipment_status" DEFAULT 'active' NOT NULL,
	"location" varchar(255),
	"last_maintenance_at" timestamp,
	"next_maintenance_at" timestamp,
	"maintenance_notes" text,
	"image_path" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "equipment_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "production_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"application_type_id" uuid,
	"equipment_ids" jsonb DEFAULT '[]'::jsonb,
	"capacity" integer DEFAULT 100,
	"is_active" boolean DEFAULT true NOT NULL,
	"color" varchar(7),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "production_lines_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "production_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"event" varchar(50) NOT NULL,
	"details" jsonb,
	"performed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"position" varchar(100),
	"specialization_ids" jsonb DEFAULT '[]'::jsonb,
	"line_ids" jsonb DEFAULT '[]'::jsonb,
	"hourly_rate" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"avatar_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" varchar(50) NOT NULL,
	"order_id" uuid NOT NULL,
	"order_item_id" uuid,
	"application_type_id" uuid,
	"line_id" uuid,
	"assignee_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"completed_quantity" integer DEFAULT 0,
	"status" "production_task_status" DEFAULT 'pending' NOT NULL,
	"priority" "production_task_priority" DEFAULT 'normal' NOT NULL,
	"start_date" timestamp,
	"due_date" timestamp,
	"completed_at" timestamp,
	"estimated_time" integer,
	"actual_time" integer,
	"design_files" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "production_tasks_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "editor_exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"format" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"has_watermark" boolean DEFAULT false,
	"quality" integer,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editor_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"order_item_id" uuid,
	"design_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"width" integer DEFAULT 800 NOT NULL,
	"height" integer DEFAULT 600 NOT NULL,
	"canvas_data" jsonb NOT NULL,
	"thumbnail_path" text,
	"is_template" boolean DEFAULT false,
	"is_finalized" boolean DEFAULT false,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_chat_read_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"last_read_at" timestamp DEFAULT now() NOT NULL,
	"last_read_message_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_types" DROP CONSTRAINT "application_types_name_unique";--> statement-breakpoint
ALTER TABLE "print_designs" DROP CONSTRAINT "print_designs_application_type_id_application_types_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_collection_print_id_print_designs_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_application_type_id_application_types_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_assigned_designer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_assigned_production_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "system_fonts" DROP CONSTRAINT "system_fonts_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "client_branding" ALTER COLUMN "file_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."branding_file_type";--> statement-breakpoint
CREATE TYPE "public"."branding_file_type" AS ENUM('logo_main', 'logo_accent', 'icon', 'font', 'pattern', 'other');--> statement-breakpoint
ALTER TABLE "client_branding" ALTER COLUMN "file_type" SET DATA TYPE "public"."branding_file_type" USING "file_type"::"public"."branding_file_type";--> statement-breakpoint
ALTER TABLE "order_defects" ALTER COLUMN "reason" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."defect_reason";--> statement-breakpoint
CREATE TYPE "public"."defect_reason" AS ENUM('equipment_failure', 'human_error', 'material_defect', 'other');--> statement-breakpoint
ALTER TABLE "order_defects" ALTER COLUMN "reason" SET DATA TYPE "public"."defect_reason" USING "reason"::"public"."defect_reason";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'new'::text;--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('new', 'design', 'production', 'done', 'shipped', 'cancelled');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";--> statement-breakpoint
DROP INDEX "orders_order_type_idx";--> statement-breakpoint
DROP INDEX "orders_internal_status_idx";--> statement-breakpoint
DROP INDEX "orders_application_type_idx";--> statement-breakpoint
DROP INDEX "orders_designer_idx";--> statement-breakpoint
DROP INDEX "orders_production_idx";--> statement-breakpoint
DROP INDEX "application_types_active_idx";--> statement-breakpoint
DROP INDEX "system_fonts_name_idx";--> statement-breakpoint
DROP INDEX "user_app_types_unique_idx";--> statement-breakpoint
DROP INDEX "mockup_versions_version_idx";--> statement-breakpoint
ALTER TABLE "print_designs" ALTER COLUMN "cost_price" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "print_designs" ALTER COLUMN "retail_price" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "application_types" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "application_types" ALTER COLUMN "color" SET DATA TYPE varchar(7);--> statement-breakpoint
ALTER TABLE "application_types" ALTER COLUMN "color" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "order_chat_messages" ALTER COLUMN "mentioned_user_ids" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "order_mockup_versions" ALTER COLUMN "version" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "print_designs" ADD COLUMN "print_file_path" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "application_type_id" uuid;--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "category" "application_category" DEFAULT 'print' NOT NULL;--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "icon" varchar(100);--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "min_quantity" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "max_colors" integer;--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "max_print_area" varchar(50);--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "base_cost" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "cost_per_unit" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "setup_cost" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "estimated_time" integer;--> statement-breakpoint
ALTER TABLE "application_types" ADD COLUMN "setup_time" integer;--> statement-breakpoint
ALTER TABLE "order_defects" ADD COLUMN "inventory_item_id" uuid;--> statement-breakpoint
ALTER TABLE "order_defects" ADD COLUMN "cost_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "order_mockup_versions" ADD COLUMN "file_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_mockup_versions" ADD COLUMN "file_size" integer;--> statement-breakpoint
ALTER TABLE "client_branding" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "client_branding" ADD COLUMN "mime_type" text;--> statement-breakpoint
ALTER TABLE "client_branding" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "system_fonts" ADD COLUMN "regular_path" text;--> statement-breakpoint
ALTER TABLE "system_fonts" ADD COLUMN "bold_path" text;--> statement-breakpoint
ALTER TABLE "system_fonts" ADD COLUMN "italic_path" text;--> statement-breakpoint
ALTER TABLE "system_fonts" ADD COLUMN "bold_italic_path" text;--> statement-breakpoint
ALTER TABLE "system_fonts" ADD COLUMN "category" text DEFAULT 'sans-serif';--> statement-breakpoint
ALTER TABLE "system_fonts" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "system_fonts" ADD COLUMN "is_system" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "system_fonts" ADD COLUMN "sort_order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "order_design_task_files" ADD CONSTRAINT "order_design_task_files_task_id_order_design_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."order_design_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_design_task_files" ADD CONSTRAINT "order_design_task_files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_design_task_history" ADD CONSTRAINT "order_design_task_history_task_id_order_design_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."order_design_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_design_task_history" ADD CONSTRAINT "order_design_task_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_design_tasks" ADD CONSTRAINT "order_design_tasks_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_design_tasks" ADD CONSTRAINT "order_design_tasks_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_design_tasks" ADD CONSTRAINT "order_design_tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_design_tasks" ADD CONSTRAINT "order_design_tasks_source_design_id_print_designs_id_fk" FOREIGN KEY ("source_design_id") REFERENCES "public"."print_designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_design_tasks" ADD CONSTRAINT "order_design_tasks_application_type_id_application_types_id_fk" FOREIGN KEY ("application_type_id") REFERENCES "public"."application_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_design_tasks" ADD CONSTRAINT "order_design_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_design_mockups" ADD CONSTRAINT "print_design_mockups_design_id_print_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."print_designs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_lines" ADD CONSTRAINT "production_lines_application_type_id_application_types_id_fk" FOREIGN KEY ("application_type_id") REFERENCES "public"."application_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_logs" ADD CONSTRAINT "production_logs_task_id_production_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."production_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_logs" ADD CONSTRAINT "production_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_staff" ADD CONSTRAINT "production_staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_tasks" ADD CONSTRAINT "production_tasks_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_tasks" ADD CONSTRAINT "production_tasks_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_tasks" ADD CONSTRAINT "production_tasks_application_type_id_application_types_id_fk" FOREIGN KEY ("application_type_id") REFERENCES "public"."application_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_tasks" ADD CONSTRAINT "production_tasks_line_id_production_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."production_lines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_tasks" ADD CONSTRAINT "production_tasks_assignee_id_production_staff_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."production_staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_tasks" ADD CONSTRAINT "production_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editor_exports" ADD CONSTRAINT "editor_exports_project_id_editor_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."editor_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editor_exports" ADD CONSTRAINT "editor_exports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editor_projects" ADD CONSTRAINT "editor_projects_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editor_projects" ADD CONSTRAINT "editor_projects_design_id_print_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."print_designs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editor_projects" ADD CONSTRAINT "editor_projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_chat_read_status" ADD CONSTRAINT "order_chat_read_status_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_chat_read_status" ADD CONSTRAINT "order_chat_read_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_chat_read_status" ADD CONSTRAINT "order_chat_read_status_last_read_message_id_order_chat_messages_id_fk" FOREIGN KEY ("last_read_message_id") REFERENCES "public"."order_chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_design_task_files_task_idx" ON "order_design_task_files" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "order_design_task_files_created_idx" ON "order_design_task_files" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_design_task_history_task_idx" ON "order_design_task_history" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "order_design_task_history_created_idx" ON "order_design_task_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_design_task_order_idx" ON "order_design_tasks" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_design_task_order_item_idx" ON "order_design_tasks" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "order_design_task_assignee_idx" ON "order_design_tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "order_design_task_status_idx" ON "order_design_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_design_task_created_idx" ON "order_design_tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "print_design_mockups_design_idx" ON "print_design_mockups" USING btree ("design_id");--> statement-breakpoint
CREATE INDEX "print_design_mockups_active_idx" ON "print_design_mockups" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "print_design_mockups_sort_order_idx" ON "print_design_mockups" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "print_design_mockups_created_at_idx" ON "print_design_mockups" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "equipment_code_idx" ON "equipment" USING btree ("code");--> statement-breakpoint
CREATE INDEX "equipment_category_idx" ON "equipment" USING btree ("category");--> statement-breakpoint
CREATE INDEX "equipment_status_idx" ON "equipment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "equipment_created_at_idx" ON "equipment" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "production_lines_code_idx" ON "production_lines" USING btree ("code");--> statement-breakpoint
CREATE INDEX "production_lines_app_type_idx" ON "production_lines" USING btree ("application_type_id");--> statement-breakpoint
CREATE INDEX "production_lines_is_active_idx" ON "production_lines" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "production_lines_created_at_idx" ON "production_lines" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "production_logs_task_id_idx" ON "production_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "production_logs_event_idx" ON "production_logs" USING btree ("event");--> statement-breakpoint
CREATE INDEX "production_logs_created_at_idx" ON "production_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "production_staff_user_id_idx" ON "production_staff" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "production_staff_is_active_idx" ON "production_staff" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "production_staff_email_idx" ON "production_staff" USING btree ("email");--> statement-breakpoint
CREATE INDEX "production_staff_phone_idx" ON "production_staff" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "production_staff_created_at_idx" ON "production_staff" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "production_tasks_number_idx" ON "production_tasks" USING btree ("number");--> statement-breakpoint
CREATE INDEX "production_tasks_order_id_idx" ON "production_tasks" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "production_tasks_line_id_idx" ON "production_tasks" USING btree ("line_id");--> statement-breakpoint
CREATE INDEX "production_tasks_assignee_id_idx" ON "production_tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "production_tasks_status_idx" ON "production_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "production_tasks_priority_idx" ON "production_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "production_tasks_due_date_idx" ON "production_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "production_tasks_sort_order_idx" ON "production_tasks" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "production_tasks_created_at_idx" ON "production_tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "editor_exports_project_id_idx" ON "editor_exports" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "editor_exports_created_at_idx" ON "editor_exports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "editor_projects_order_id_idx" ON "editor_projects" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "editor_projects_design_id_idx" ON "editor_projects" USING btree ("design_id");--> statement-breakpoint
CREATE INDEX "editor_projects_created_by_idx" ON "editor_projects" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "editor_projects_is_template_idx" ON "editor_projects" USING btree ("is_template");--> statement-breakpoint
CREATE INDEX "editor_projects_created_at_idx" ON "editor_projects" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "order_chat_read_order_user_idx" ON "order_chat_read_status" USING btree ("order_id","user_id");--> statement-breakpoint
CREATE INDEX "order_chat_read_status_created_at_idx" ON "order_chat_read_status" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "user_application_types" ADD CONSTRAINT "user_application_types_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_defects" ADD CONSTRAINT "order_defects_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_types_slug_idx" ON "application_types" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "application_types_category_idx" ON "application_types" USING btree ("category");--> statement-breakpoint
CREATE INDEX "application_types_is_active_idx" ON "application_types" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "application_types_created_at_idx" ON "application_types" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_app_types_created_at_idx" ON "user_application_types" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_defects_inventory_idx" ON "order_defects" USING btree ("inventory_item_id");--> statement-breakpoint
CREATE INDEX "order_defects_reason_idx" ON "order_defects" USING btree ("reason");--> statement-breakpoint
CREATE INDEX "mockup_versions_created_idx" ON "order_mockup_versions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "client_branding_sort_idx" ON "client_branding" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "client_branding_created_at_idx" ON "client_branding" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "system_fonts_is_active_idx" ON "system_fonts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "system_fonts_category_idx" ON "system_fonts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "system_fonts_created_at_idx" ON "system_fonts" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_app_types_unique_idx" ON "user_application_types" USING btree ("user_id","application_type_id");--> statement-breakpoint
CREATE INDEX "mockup_versions_version_idx" ON "order_mockup_versions" USING btree ("order_id","version");--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "collection_print_id";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "original_file_path";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "mockup_file_path";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "print_file_path";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "design_progress";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "production_progress";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "production_done";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "order_type";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "internal_status";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "application_type_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "assigned_designer_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "assigned_production_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "design_progress";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "production_progress";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "return_reason";--> statement-breakpoint
ALTER TABLE "order_chat_messages" DROP COLUMN "is_read";--> statement-breakpoint
ALTER TABLE "system_fonts" DROP COLUMN "file_name";--> statement-breakpoint
ALTER TABLE "system_fonts" DROP COLUMN "file_path";--> statement-breakpoint
ALTER TABLE "system_fonts" DROP COLUMN "file_size";--> statement-breakpoint
ALTER TABLE "system_fonts" DROP COLUMN "format";--> statement-breakpoint
ALTER TABLE "system_fonts" DROP COLUMN "uploaded_by";--> statement-breakpoint
ALTER TABLE "application_types" ADD CONSTRAINT "application_types_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "system_fonts" ADD CONSTRAINT "system_fonts_family_unique" UNIQUE("family");--> statement-breakpoint
DROP TYPE "public"."internal_status";--> statement-breakpoint
DROP TYPE "public"."order_file_type";--> statement-breakpoint
DROP TYPE "public"."order_type";