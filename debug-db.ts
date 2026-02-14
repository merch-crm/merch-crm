
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debug() {
    try {
        console.log("Connecting to:", process.env.DATABASE_URL?.split('@')[1]);
        const res = await pool.query('SELECT * FROM system_settings LIMIT 1');
        console.log("Success! Columns:", Object.keys(res.rows[0] || {}));
        console.log("First row:", res.rows[0]);
    } catch (err) {
        console.error("Query Failed!");
        console.error(err);
    } finally {
        await pool.end();
    }
}

debug();
