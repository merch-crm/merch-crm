const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkSystemData() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        console.log('🔍 Checking Departments...');
        const depts = await client.query('SELECT id, name, is_active FROM departments');
        console.table(depts.rows);

        console.log('\n🔍 Checking Roles...');
        const roles = await client.query('SELECT id, name, is_system FROM roles');
        console.table(roles.rows);

        await client.end();
    } catch (error) {
        console.error('❌ Error:', error);
        if (client) await client.end();
    }
}

checkSystemData();
