CREATE TYPE "public"."client_type" AS ENUM('b2c', 'b2b');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('rent', 'salary', 'purchase', 'tax', 'other');--> statement-breakpoint
CREATE TYPE "public"."inventory_item_type" AS ENUM('clothing', 'packaging', 'consumables');--> statement-breakpoint
CREATE TYPE "public"."measurement_unit" AS ENUM('pcs', 'liters', 'meters', 'kg', 'шт');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bank', 'online', 'account');--> statement-breakpoint
CREATE TYPE "public"."production_stage_status" AS ENUM('pending', 'in_progress', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('design', 'production', 'acquisition', 'delivery', 'other');--> statement-breakpoint
ALTER TYPE "public"."security_event_type" ADD VALUE 'admin_impersonation_start';--> statement-breakpoint
ALTER TYPE "public"."security_event_type" ADD VALUE 'admin_impersonation_stop';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'attribute_change';--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category" "expense_category" NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_attribute_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"category_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_attribute_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inventory_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" "payment_method" NOT NULL,
	"is_advance" boolean DEFAULT false NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promocodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_type" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"min_order_amount" numeric(10, 2) DEFAULT '0',
	"max_discount_amount" numeric(10, 2) DEFAULT '0',
	"start_date" timestamp,
	"expires_at" timestamp,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promocodes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "system_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"message" text NOT NULL,
	"stack" text,
	"path" text,
	"method" text,
	"ip_address" text,
	"user_agent" text,
	"severity" text DEFAULT 'error' NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_checklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wiki_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wiki_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"folder_id" uuid,
	"title" text NOT NULL,
	"content" text,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "unit" SET DEFAULT 'pcs'::"public"."measurement_unit";--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "unit" SET DATA TYPE "public"."measurement_unit" USING "unit"::"public"."measurement_unit";--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "low_stock_threshold" SET DEFAULT 10;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "item_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "change_amount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "client_type" "client_type" DEFAULT 'b2c' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "acquisition_source" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "gender" text DEFAULT 'masculine' NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "singular_name" text;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD COLUMN "plural_name" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "item_type" "inventory_item_type" DEFAULT 'clothing' NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "critical_stock_threshold" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "material_code" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "brand_code" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "attributes" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "image_back" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "image_side" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "image_details" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "thumbnail_settings" jsonb;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "material_composition" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "cost_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "stage_prep_status" "production_stage_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "stage_print_status" "production_stage_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "stage_application_status" "production_stage_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "stage_packaging_status" "production_stage_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "advance_amount" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_urgent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "promocode_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "storage_locations" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "type" "task_type" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "order_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "assigned_to_department_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_attribute_types" ADD CONSTRAINT "inventory_attribute_types_category_id_inventory_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."inventory_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_errors" ADD CONSTRAINT "system_errors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_checklists" ADD CONSTRAINT "task_checklists_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_folders" ADD CONSTRAINT "wiki_folders_parent_id_wiki_folders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wiki_folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_folder_id_wiki_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."wiki_folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_parent_id_inventory_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inventory_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_promocode_id_promocodes_id_fk" FOREIGN KEY ("promocode_id") REFERENCES "public"."promocodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_department_id_departments_id_fk" FOREIGN KEY ("assigned_to_department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE("order_number");