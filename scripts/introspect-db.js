
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

async function introspect() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres',
    });

    try {
        await client.connect();
        console.log('Connected to DB. Checking "tasks" table...');
        
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'tasks'
            ORDER BY column_name;
        `);
        
        console.table(res.rows);
        await client.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

introspect();
