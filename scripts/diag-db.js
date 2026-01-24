const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkTable() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        console.log('--- Tables in database ---');
        const tables = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log(tables.rows.map(r => r.tablename).join(', '));

        console.log('\n--- system_settings structure ---');
        const columns = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'system_settings'");
        console.log(columns.rows);

        console.log('\n--- system_settings data ---');
        const data = await client.query("SELECT * FROM system_settings");
        console.log(data.rows);

        await client.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (client) await client.end();
    }
}

checkTable();
