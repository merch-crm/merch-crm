const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkData() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const categories = await pool.query('SELECT count(*) FROM inventory_categories');
        const items = await pool.query('SELECT count(*) FROM inventory_items');
        const transactions = await pool.query('SELECT count(*) FROM inventory_transactions');

        console.log('--- Database Stats ---');
        console.log('Categories:', categories.rows[0].count);
        console.log('Items:', items.rows[0].count);
        console.log('Transactions:', transactions.rows[0].count);

        if (items.rows[0].count > 0) {
            const firstItem = await pool.query('SELECT name, sku, quantity FROM inventory_items LIMIT 1');
            console.log('First Item:', firstItem.rows[0]);
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkData();
