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

        console.log("\n--- ATTRIBUTES WITH CATEGORY INFO ---");
        const attrs = await client.query(`
            SELECT 
                a.type, 
                a.category_id, 
                c.name as category_name,
                COUNT(*) as count 
            FROM inventory_attributes a
            LEFT JOIN inventory_categories c ON a.category_id = c.id
            GROUP BY a.type, a.category_id, c.name
            ORDER BY a.type
        `);
        console.table(attrs.rows);

        await client.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
