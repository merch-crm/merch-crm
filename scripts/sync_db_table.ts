import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function run() {
    const sqlFile = '/Users/leonidmolchanov/.gemini/antigravity/brain/edfa91ff-5c81-4aee-bcfa-eca19d849cad/db_sync_script.sql';
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    console.log('Connecting to database...');
    const client = new Client({
        connectionString,
        ssl: false
    });

    try {
        await client.connect();
        const content = fs.readFileSync(sqlFile, 'utf8');
        console.log('Executing sync SQL...');
        
        // Split by semicolon and filter empty
        const queries = content
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);
        
        await client.query('BEGIN');
        for (const query of queries) {
            await client.query(query);
        }
        await client.query('COMMIT');

        console.log('✅ Migration table synced successfully!');
    } catch (err) {
        console.error('❌ Error syncing migration table:', err);
        if (client) await client.query('ROLLBACK');
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
