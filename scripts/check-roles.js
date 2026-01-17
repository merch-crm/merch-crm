const { Client } = require('pg');

const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'merch_crm',
};

const client = new Client(config);

async function checkRoles() {
    try {
        await client.connect();
        const res = await client.query('SELECT * FROM roles');
        console.log('Roles found:', res.rows.length);
        res.rows.forEach(r => console.log(r.name));
    } catch (err) {
        console.error('Error checking roles:', err);
    } finally {
        await client.end();
    }
}

checkRoles();
