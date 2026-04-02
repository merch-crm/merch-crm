ALTER TABLE "inventory_attribute_types" ADD COLUMN "data_type" text DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_attribute_types" ADD COLUMN "has_color" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_attribute_types" ADD COLUMN "has_units" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_attribute_types" ADD COLUMN "has_composition" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_attribute_types" ADD COLUMN "meta" jsonb;--> statement-breakpoint
CREATE INDEX "inv_attr_type_idx" ON "inventory_attributes" USING btree ("type");--> statement-breakpoint
CREATE INDEX "inv_attr_value_idx" ON "inventory_attributes" USING btree ("value");--> statement-breakpoint
CREATE INDEX "inv_cats_path_idx" ON "inventory_categories" USING btree ("full_path");--> statement-breakpoint
CREATE INDEX "inv_items_name_idx" ON "inventory_items" USING btree ("name");