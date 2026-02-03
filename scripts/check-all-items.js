
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkItems() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const result = await client.query('SELECT name, image, is_archived FROM inventory_items');
        console.log(JSON.stringify(result.rows, null, 2));
        await client.end();
    } catch (error) {
        console.error(error);
        if (client) await client.end();
    }
}

checkItems();
