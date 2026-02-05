const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

const userId = '224a7641-2940-4ba0-91fe-e07cf7cec6e1';

async function run() {
    try {
        await client.connect();
        console.log("Connected to DB");

        // Check if user exists
        const res = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        console.log(`User found: ${res.rows.length > 0}`);
        if (res.rows.length > 0) {
            console.log('User data:', res.rows[0]);
        }

        // Try to update manually
        console.log("Attempting manual update...");
        const updateRes = await client.query('UPDATE users SET last_active_at = NOW() WHERE id = $1', [userId]);
        console.log(`Update result: ${updateRes.rowCount} rows affected.`);

    } catch (err) {
        console.error("Error during manual check/update:", err);
    } finally {
        await client.end();
    }
}
run();
