-- Add prefix to inventory_categories
ALTER TABLE "inventory_categories" ADD COLUMN IF NOT EXISTS "prefix" text;

-- Add SKU parts to inventory_items
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "quality_code" text;
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "attribute_code" text;
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "size_code" text;
