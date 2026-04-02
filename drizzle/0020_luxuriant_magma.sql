ALTER TABLE "inventory_items" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inv_items_created_by_idx" ON "inventory_items" USING btree ("created_by");