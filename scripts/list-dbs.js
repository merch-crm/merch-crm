const { Client } = require('pg');

const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // Connect to default DB to list others
};

const client = new Client(config);

async function listDbs() {
    try {
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
        console.log('Databases found:', res.rows.map(r => r.datname));
    } catch (err) {
        console.error('Error listing DBs:', err);
    } finally {
        await client.end();
    }
}

listDbs();
