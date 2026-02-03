
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const result = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables:", result.rows.map(r => r.table_name).join(", "));

        for (const table of result.rows.map(r => r.table_name)) {
            const count = await client.query(`SELECT COUNT(*) FROM "${table}"`);
            console.log(`Count in ${table}: ${count.rows[0].count}`);
        }

        await client.end();
    } catch (error) {
        console.error(error);
        if (client) await client.end();
    }
}

checkTables();
