import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('Starting migration...');

        // Add description and location columns
        await client.query(`
            ALTER TABLE inventory_items 
            ADD COLUMN IF NOT EXISTS description TEXT,
            ADD COLUMN IF NOT EXISTS location TEXT;
        `);
        console.log('✓ Added description and location columns to inventory_items');

        // Add unique constraint to inventory_categories
        await client.query(`
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
        `);
        console.log('✓ Added unique constraint to inventory_categories.name');

        // Rename department column if it exists
        await client.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'department'
                ) THEN
                    ALTER TABLE users RENAME COLUMN department TO "departmentLegacy";
                END IF;
            END $$;
        `);
        console.log('✓ Renamed department column to departmentLegacy in users table');

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(console.error);
