const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkHierarchy() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const cats = await pool.query('SELECT id, name, parent_id FROM inventory_categories');
        console.log('--- Categories ---');
        cats.rows.forEach(r => console.log(`${r.id}: ${r.name} (Parent: ${r.parent_id || 'None'})`));

        const itemCatCounts = await pool.query(`
            SELECT 
                COALESCE(c.name, 'Без категории') as cat_name, 
                count(i.id) as item_count 
            FROM inventory_items i 
            LEFT JOIN inventory_categories c ON i.category_id = c.id 
            GROUP BY c.name
        `);
        console.log('--- Item Distribution ---');
        itemCatCounts.rows.forEach(r => console.log(`${r.cat_name}: ${r.item_count}`));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkHierarchy();
