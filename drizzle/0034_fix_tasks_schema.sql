ALTER TYPE "public"."task_priority" ADD VALUE 'urgent';--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TYPE "public"."task_type" ADD VALUE 'general' BEFORE 'design';--> statement-breakpoint
ALTER TYPE "public"."task_type" ADD VALUE 'inventory' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."task_type" ADD VALUE 'maintenance' BEFORE 'other';--> statement-breakpoint
CREATE TABLE "task_assignees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_watchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"added_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_dependencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"depends_on_task_id" uuid NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_filter_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_deadline_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"hours_notified" integer NOT NULL,
	"notified_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assigned_to_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assigned_to_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assigned_to_department_id_departments_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_order_id_orders_id_fk";
--> statement-breakpoint
DROP INDEX "tasks_assigned_user_idx";--> statement-breakpoint
DROP INDEX "tasks_assigned_role_idx";--> statement-breakpoint
DROP INDEX "tasks_assigned_dept_idx";--> statement-breakpoint
DROP INDEX "tasks_order_id_idx";--> statement-breakpoint
DROP INDEX "tasks_created_idx";--> statement-breakpoint
DROP INDEX "tasks_created_by_idx";--> statement-breakpoint
ALTER TABLE "production_logs" ALTER COLUMN "task_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "deadline" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "type" "task_type" DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "creator_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "department_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "delegated_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "delegated_at" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "original_assignee_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "is_auto_created" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "auto_created_reason" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "auto_created_source_type" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "auto_created_source_id" uuid;--> statement-breakpoint
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_watchers" ADD CONSTRAINT "task_watchers_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_watchers" ADD CONSTRAINT "task_watchers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_watchers" ADD CONSTRAINT "task_watchers_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_depends_on_task_id_tasks_id_fk" FOREIGN KEY ("depends_on_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_filter_presets" ADD CONSTRAINT "task_filter_presets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_deadline_notifications" ADD CONSTRAINT "task_deadline_notifications_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "task_assignees_task_user_idx" ON "task_assignees" USING btree ("task_id","user_id");--> statement-breakpoint
CREATE INDEX "task_assignees_task_idx" ON "task_assignees" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_assignees_user_idx" ON "task_assignees" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_watchers_task_user_idx" ON "task_watchers" USING btree ("task_id","user_id");--> statement-breakpoint
CREATE INDEX "task_watchers_task_idx" ON "task_watchers" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_watchers_user_idx" ON "task_watchers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_dependencies_unique_idx" ON "task_dependencies" USING btree ("task_id","depends_on_task_id");--> statement-breakpoint
CREATE INDEX "task_dependencies_task_idx" ON "task_dependencies" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_dependencies_depends_on_idx" ON "task_dependencies" USING btree ("depends_on_task_id");--> statement-breakpoint
CREATE INDEX "task_filter_presets_user_idx" ON "task_filter_presets" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_deadline_notifications_unique_idx" ON "task_deadline_notifications" USING btree ("task_id","hours_notified");--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_delegated_by_user_id_users_id_fk" FOREIGN KEY ("delegated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_original_assignee_id_users_id_fk" FOREIGN KEY ("original_assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_priority_idx" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "tasks_type_idx" ON "tasks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tasks_creator_idx" ON "tasks" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "tasks_department_idx" ON "tasks" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "tasks_deadline_idx" ON "tasks" USING btree ("deadline");--> statement-breakpoint
CREATE INDEX "tasks_created_at_idx" ON "tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tasks_status_deadline_idx" ON "tasks" USING btree ("status","deadline");--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "task_type";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "assigned_to_user_id";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "assigned_to_role_id";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "assigned_to_department_id";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "order_id";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "due_date";