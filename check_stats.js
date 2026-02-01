
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function check() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const activeRes = await pool.query('SELECT SUM(quantity) as units, SUM(reserved_quantity) as reserved, COUNT(*) as skus FROM inventory_items WHERE is_archived = false');
        const archivedRes = await pool.query('SELECT COUNT(*) as count FROM inventory_items WHERE is_archived = true');

        console.log('--- ACTUAL DATABASE STATS ---');
        console.log('Active Units (quantity):', activeRes.rows[0].units || 0);
        console.log('Active Reserved (reserved_quantity):', activeRes.rows[0].reserved || 0);
        console.log('Active SKUs (count):', activeRes.rows[0].skus);
        console.log('Archived Items:', archivedRes.rows[0].count);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
