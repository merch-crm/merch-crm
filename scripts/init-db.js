const { Client } = require('pg');

// Try to grab credentials from env vars if possible, or fallback to defaults seen in docker-compose
const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // Connect to default maintenance DB
};

console.log('Connecting with config:', { ...config, password: '***' });

const client = new Client(config);

async function createDb() {
    try {
        await client.connect();
        console.log('Connected to postgres server');

        // Check if db exists
        const checkRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'merch_crm'");
        if (checkRes.rowCount === 0) {
            console.log('Database "merch_crm" does not exist. Creating...');
            // CREATE DATABASE cannot run in a transaction block, so we run it directly.
            await client.query('CREATE DATABASE merch_crm');
            console.log('Database "merch_crm" created successfully!');
        } else {
            console.log('Database "merch_crm" already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createDb();
