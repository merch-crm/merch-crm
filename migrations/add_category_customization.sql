-- Add customization fields to inventory_categories
ALTER TABLE "inventory_categories" ADD COLUMN "icon" text;
ALTER TABLE "inventory_categories" ADD COLUMN "color" text;
