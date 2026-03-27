import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length === 2) {
                process.env[parts[0].trim()] = parts[1].trim().replace(/^"(.*)"$/, '$1');
            }
        });
    }
}

loadEnv();

async function debugDB() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('Connecting to:', process.env.DATABASE_URL.replace(/:[^:]+@/, ':****@'));
        await client.connect();
        
        console.log('Listing tables in public schema:');
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        if (res.rows.length === 0) {
            console.log('⚠️ No tables found in public schema!');
        } else {
            res.rows.forEach(row => console.log(' -', row.table_name));
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

debugDB();
