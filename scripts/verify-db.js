const { Client } = require('pg');

const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'merch_crm', // Checking the specific DB
};

console.log('Verifying connection to:', { ...config, password: '***' });

const client = new Client(config);

async function verifyDb() {
    try {
        await client.connect();
        console.log('Successfully connected to database "merch_crm"');

        // List tables to ensure schema push worked
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log('Found tables:', res.rows.map(r => r.table_name));

        if (res.rows.length === 0) {
            console.warn('WARNING: No tables found in public schema. Did migration/push fail?');
        } else {
            console.log('Schema verification passed.');
        }

    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

verifyDb();
