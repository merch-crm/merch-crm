-- Add description and location columns to inventory_items table
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add unique constraint to inventory_categories name if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_categories_name_unique'
    ) THEN
        ALTER TABLE inventory_categories 
        ADD CONSTRAINT inventory_categories_name_unique UNIQUE (name);
    END IF;
END $$;

-- Rename department column to departmentLegacy in users table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'department'
    ) THEN
        ALTER TABLE users RENAME COLUMN department TO "departmentLegacy";
    END IF;
END $$;
