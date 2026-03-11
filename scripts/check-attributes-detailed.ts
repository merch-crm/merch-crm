import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
    const envPath = path.join(__dirname, '.env.local');
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

        console.log("--- ATTRIBUTE TYPES ---");
        const types = await client.query('SELECT id, slug, name, category_id, is_system FROM inventory_attribute_types ORDER BY name');
        console.table(types.rows);

        console.log("\n--- ATTRIBUTES ---");
        const attrs = await client.query('SELECT type, COUNT(*) as count FROM inventory_attributes GROUP BY type');
        console.table(attrs.rows);

        await client.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
