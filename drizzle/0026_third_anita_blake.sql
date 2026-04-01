CREATE INDEX "product_lines_created_by_idx" ON "product_lines" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "inv_items_archived_by_idx" ON "inventory_items" USING btree ("archived_by");--> statement-breakpoint
CREATE INDEX "orders_archived_by_idx" ON "orders" USING btree ("archived_by");--> statement-breakpoint
CREATE INDEX "orders_promocode_idx" ON "orders" USING btree ("promocode_id");--> statement-breakpoint
CREATE INDEX "payments_created_by_idx" ON "payments" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "task_attachments_created_by_idx" ON "task_attachments" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "tasks_created_by_idx" ON "tasks" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "xiaomi_accounts_created_by_idx" ON "xiaomi_accounts" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "employee_faces_created_by_idx" ON "employee_faces" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "presence_settings_updated_by_idx" ON "presence_settings" USING btree ("updated_by_id");