-- Migration: Add missing database indexes (Audit Phase 8)
-- Only adds new indexes that don't already exist

CREATE INDEX IF NOT EXISTS "inv_attr_types_created_idx" ON "inventory_attribute_types" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "departments_created_idx" ON "departments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_created_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clients_email_idx" ON "clients" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clients_created_idx" ON "clients" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_checklists_task_idx" ON "task_checklists" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "storage_loc_created_idx" ON "storage_locations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "system_settings_created_idx" ON "system_settings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_attachments_created_by_idx" ON "order_attachments" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wiki_folders_created_idx" ON "wiki_folders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wiki_pages_created_idx" ON "wiki_pages" USING btree ("created_at");