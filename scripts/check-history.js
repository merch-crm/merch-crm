
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkHistory() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const result = await client.query('SELECT type, reason, created_at FROM inventory_transactions ORDER BY created_at DESC LIMIT 20');
        console.log("Recent Transactions:", JSON.stringify(result.rows, null, 2));
        await client.end();
    } catch (error) {
        console.error(error);
        if (client) await client.end();
    }
}

checkHistory();
