ALTER TABLE "orders" DROP CONSTRAINT "orders_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_id_created_at_pk";--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "product_line_id" SET DATA TYPE uuid USING "product_line_id"::uuid;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "base_item_id" SET DATA TYPE uuid USING "base_item_id"::uuid;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "print_design_id" SET DATA TYPE uuid USING "print_design_id"::uuid;--> statement-breakpoint
ALTER TABLE "inventory_items" ALTER COLUMN "print_version_id" SET DATA TYPE uuid USING "print_version_id"::uuid;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_line_id_product_lines_id_fk" FOREIGN KEY ("product_line_id") REFERENCES "public"."product_lines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_base_item_id_inventory_items_id_fk" FOREIGN KEY ("base_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_print_design_id_print_designs_id_fk" FOREIGN KEY ("print_design_id") REFERENCES "public"."print_designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_print_version_id_print_design_versions_id_fk" FOREIGN KEY ("print_version_id") REFERENCES "public"."print_design_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE cascade;