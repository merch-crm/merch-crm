ALTER TYPE "public"."production_stage_status" ADD VALUE 'paused' BEFORE 'done';--> statement-breakpoint
CREATE TABLE "production_time_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"staff_id" uuid,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"activity_type" varchar(50) DEFAULT 'work' NOT NULL,
	"duration" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "production_time_logs" ADD CONSTRAINT "production_time_logs_task_id_production_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."production_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_time_logs" ADD CONSTRAINT "production_time_logs_staff_id_production_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."production_staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "production_time_logs_task_id_idx" ON "production_time_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "production_time_logs_staff_id_idx" ON "production_time_logs" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "production_time_logs_start_time_idx" ON "production_time_logs" USING btree ("start_time");