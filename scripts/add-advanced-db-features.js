const { Pool } = require('pg');
const fs = require('fs');

// Read standard env
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.+)/);
const connectionString = dbUrlMatch ? dbUrlMatch[1].trim() : "postgres://postgres:5738870192e24949b02a700547743048@127.0.0.1:5432/postgres";

const pool = new Pool({
    connectionString,
    ssl: false
});

async function run() {
    try {
        console.log('Adding advanced DB features (indexes, constraints, triggers)...');

        // 1. GIN Index for Name Search
        console.log('- Adding GIN index for inventory_items(name)...');
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_inventory_items_name_gin 
            ON inventory_items 
            USING gin(to_tsvector('russian', name));
        `);

        // 2. CHECK Constraints
        console.log('- Adding CHECK constraints for prices...');
        // Need to clean bad data first? Assuming current data is valid or 0.
        await pool.query(`
            ALTER TABLE inventory_items 
            ADD CONSTRAINT positive_prices_check 
            CHECK (cost_price >= 0 AND selling_price >= 0);
        `).catch(e => console.log('  Constraint positive_prices_check might already exist or data invalid:', e.message));

        console.log('- Adding CHECK constraint for Email...');
        await pool.query(`
            ALTER TABLE users 
            ADD CONSTRAINT valid_email_check 
            CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');
        `).catch(e => console.log('  Constraint valid_email_check might already exist or data invalid:', e.message));

        // 3. Trigger for updated_at
        console.log('- Adding updated_at trigger function...');
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_modified_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        console.log('- Attaching trigger to inventory_items...');
        // Drop first to avoid duplicate error if exists
        await pool.query(`DROP TRIGGER IF EXISTS update_inventory_items_modtime ON inventory_items`);
        await pool.query(`
            CREATE TRIGGER update_inventory_items_modtime
            BEFORE UPDATE ON inventory_items
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
        `);

        console.log('Successfully completed custom DB updates.');

    } catch (err) {
        console.error('Error applying custom DB updates:', err);
    } finally {
        await pool.end();
    }
}

run();
