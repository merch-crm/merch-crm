
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkItemData() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    const itemId = '839586a4-ad81-467f-ada7-a40b5213d665';

    try {
        console.log('--- ITEM ---');
        const itemRes = await pool.query('SELECT * FROM inventory_items WHERE id = $1', [itemId]);
        console.log(JSON.stringify(itemRes.rows[0], null, 2));

        console.log('\n--- HISTORY (First 5) ---');
        const historyRes = await pool.query('SELECT * FROM inventory_transactions WHERE item_id = $1 ORDER BY created_at DESC LIMIT 5', [itemId]);
        console.log(JSON.stringify(historyRes.rows, null, 2));
    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await pool.end();
    }
}

checkItemData();
