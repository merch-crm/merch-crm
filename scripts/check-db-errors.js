
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function checkErrors() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        const result = await pool.query('SELECT * FROM system_errors ORDER BY created_at DESC LIMIT 5');
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await pool.end();
    }
}

checkErrors();
