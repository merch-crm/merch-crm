const pg = require('pg');
const { Client } = pg;
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length === 2) {
                process.env[parts[0].trim()] = parts[1].trim().replace(/^"(.*)"$/, '$1');
            }
        });
    }
}

loadEnv();

async function debugStats() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const cats = await client.query('SELECT COUNT(*) FROM inventory_categories');
        const subCats = await client.query('SELECT COUNT(*) FROM inventory_categories WHERE parent_id IS NOT NULL');
        const items = await client.query('SELECT COUNT(*) FROM inventory_items');
        const archived = await client.query('SELECT COUNT(*) FROM inventory_items WHERE is_archived = true');
        const stock = await client.query('SELECT SUM(quantity) FROM inventory_items');

        console.log('--- DATABASE STATS ---');
        console.log('Total Categories:', cats.rows[0].count);
        console.log('Sub-Categories:', subCats.rows[0].count);
        console.log('Total Items:', items.rows[0].count);
        console.log('Archived Items:', archived.rows[0].count);
        console.log('Total Quantity (Stock):', stock.rows[0].sum || 0);
        console.log('----------------------');

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

debugStats();
