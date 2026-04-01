CREATE TYPE "public"."delivery_status" AS ENUM('not_started', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'partial', 'paid', 'refunded');--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "advance_amount" TO "paid_amount";--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_order_id_orders_id_fk";
--> statement-breakpoint
DROP INDEX "inv_transfers_date_idx";--> statement-breakpoint
DROP INDEX "orders_promo_idx";--> statement-breakpoint
DROP INDEX "orders_archived_idx";--> statement-breakpoint
DROP INDEX "storage_loc_active_type_idx";--> statement-breakpoint
DROP INDEX "tasks_order_idx";--> statement-breakpoint
DROP INDEX "tasks_created_by_idx";--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "order_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "client_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "total_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "priority" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "storage_locations" ALTER COLUMN "address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_attributes" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_item_attributes" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transfers" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "order_attachments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "item_details" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_status" "delivery_status" DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_method" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_tracking_number" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "estimated_delivery_date" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "actual_delivery_date" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "comments" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "manager_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "external_order_number" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "archived_by" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "status" text DEFAULT 'completed' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "reference_number" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "storage_locations" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "task_attachments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "task_checklists" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "task_comments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "task_history" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "task_type" "task_type" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "deadline" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_archived_by_users_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clients_phone_idx" ON "clients" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "clients_company_idx" ON "clients" USING btree ("company");--> statement-breakpoint
CREATE INDEX "expenses_created_idx" ON "expenses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inv_attr_created_idx" ON "inventory_attributes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inv_cats_active_idx" ON "inventory_categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "inv_cats_created_idx" ON "inventory_categories" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inv_cats_slug_idx" ON "inventory_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "inv_item_attr_created_idx" ON "inventory_item_attributes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inv_items_type_idx" ON "inventory_items" USING btree ("item_type");--> statement-breakpoint
CREATE INDEX "inv_items_created_idx" ON "inventory_items" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inv_tx_order_idx" ON "inventory_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "inv_transfers_created_idx" ON "inventory_transfers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_attachments_created_idx" ON "order_attachments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_manager_idx" ON "orders" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_deadline_idx" ON "orders" USING btree ("deadline");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "promocodes_created_idx" ON "promocodes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "roles_created_idx" ON "roles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "storage_loc_type_idx" ON "storage_locations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "storage_loc_active_idx" ON "storage_locations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "task_attachments_created_idx" ON "task_attachments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_checklists_created_idx" ON "task_checklists" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_comments_user_idx" ON "task_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_comments_created_idx" ON "task_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_history_created_idx" ON "task_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tasks_order_id_idx" ON "tasks" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "tasks_created_idx" ON "tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "type";