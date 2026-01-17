const { Client } = require('pg');

const config = {
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'readme_to_recover',
};

const client = new Client(config);

async function checkRecoverDb() {
    try {
        await client.connect();
        // Check if users table exists here
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'users'");
        if (res.rowCount > 0) {
            console.log('Found "users" table in readme_to_recover. Inspecting data...');
            const users = await client.query('SELECT * FROM users');
            console.log('Users found:', users.rows.length);
            users.rows.forEach(u => console.log(`- ${u.email} (${u.name})`));
        } else {
            console.log('No "users" table in readme_to_recover.');
        }
    } catch (err) {
        console.error('Error checking readme_to_recover:', err.message);
    } finally {
        await client.end();
    }
}

checkRecoverDb();
