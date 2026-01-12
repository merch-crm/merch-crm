CREATE TYPE "public"."notification_type" AS ENUM('info', 'warning', 'success', 'error');
CREATE TYPE "public"."order_category" AS ENUM('print', 'embroidery', 'merch', 'other');
CREATE TYPE "public"."task_priority" AS ENUM('low', 'normal', 'high');
CREATE TYPE "public"."task_status" AS ENUM('new', 'in_progress', 'done', 'archived');

CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"permissions" jsonb DEFAULT '{}' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);

CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'new' NOT NULL,
	"priority" "task_priority" DEFAULT 'normal' NOT NULL,
	"assigned_to_user_id" uuid,
	"assigned_to_role_id" uuid,
	"created_by" uuid NOT NULL,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "orders" ADD COLUMN "category" "order_category" DEFAULT 'other' NOT NULL;
ALTER TABLE "users" ADD COLUMN "role_id" uuid;
ALTER TABLE "users" ADD COLUMN "phone" text;
ALTER TABLE "users" ADD COLUMN "birthday" date;
ALTER TABLE "users" ADD COLUMN "avatar" text;
ALTER TABLE "users" ADD COLUMN "department" text;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_role_id_roles_id_fk" FOREIGN KEY ("assigned_to_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
