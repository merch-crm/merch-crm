const { Client } = require('pg');

const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'merch_crm',
};

const client = new Client(config);

async function checkUsers() {
    try {
        await client.connect();
        const res = await client.query('SELECT * FROM users WHERE email = $1', ['admin@crm.com']);
        console.log('User count for admin@crm.com:', res.rowCount);
        if (res.rowCount > 0) {
            console.log('User found:', res.rows[0]);
        } else {
            console.log('User NOT found.');
        }
    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        await client.end();
    }
}

checkUsers();
