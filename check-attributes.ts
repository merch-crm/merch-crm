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

        const types = await client.query('SELECT slug FROM inventory_attribute_types');
        console.log("Types:", types.rows.map(r => r.slug));

        const attrs = await client.query('SELECT type, name, value, category_id FROM inventory_attributes');
        console.log("Attributes count:", attrs.rowCount);

        if ((attrs.rowCount ?? 0) > 0) {
            console.log("Sample attributes:", attrs.rows.slice(0, 5));
            const typeCounts = attrs.rows.reduce((acc, curr) => {
                acc[curr.type] = (acc[curr.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            console.log("Attributes per type:", typeCounts);
        }

        await client.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
