ALTER TABLE "cameras" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "employee_faces" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "presence_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "presence_settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workstations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "xiaomi_accounts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "cameras" CASCADE;--> statement-breakpoint
DROP TABLE "employee_faces" CASCADE;--> statement-breakpoint
DROP TABLE "presence_logs" CASCADE;--> statement-breakpoint
DROP TABLE "presence_settings" CASCADE;--> statement-breakpoint
DROP TABLE "workstations" CASCADE;--> statement-breakpoint
DROP TABLE "xiaomi_accounts" CASCADE;--> statement-breakpoint
ALTER TABLE "work_sessions" DROP CONSTRAINT "work_sessions_camera_id_cameras_id_fk";
--> statement-breakpoint
DROP INDEX "work_sessions_camera_id_idx";--> statement-breakpoint
ALTER TABLE "work_sessions" DROP COLUMN "camera_id";--> statement-breakpoint
DROP TYPE "public"."camera_status";--> statement-breakpoint
DROP TYPE "public"."presence_event_type";