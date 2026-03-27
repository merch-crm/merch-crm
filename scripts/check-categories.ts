import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres',
    });

    try {
        await client.connect();

        const res = await client.query("SELECT id, name, parent_id FROM inventory_categories WHERE id IN ('0189442d-66f6-44c6-be47-21d5c38096cf', 'cf96f355-340d-4977-86c5-64f805b70183')");
        console.table(res.rows);

        await client.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
