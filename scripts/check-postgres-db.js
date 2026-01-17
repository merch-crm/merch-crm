const { Client } = require('pg');

const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres',
};

const client = new Client(config);

async function checkPostgresDb() {
    try {
        await client.connect();
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'users'");
        if (res.rowCount > 0) {
            console.log('Found "users" table in postgres DB. Inspecting...');
            const users = await client.query('SELECT * FROM users');
            console.log('Users found:', users.rows.length);
            users.rows.forEach(u => console.log(`- ${u.email}`));
        } else {
            console.log('No "users" table in postgres DB.');
        }
    } catch (err) {
        console.error('Error checking postgres DB:', err.message);
    } finally {
        await client.end();
    }
}

checkPostgresDb();
