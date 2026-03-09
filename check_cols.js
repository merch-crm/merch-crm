/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });
    try {
        await client.connect();
        const tables = ['product_lines', 'print_collections', 'inventory_items', 'print_designs'];
        for (const table of tables) {
            const res = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}'
      `);
            console.log(`Columns in ${table}:`);
            console.log(res.rows.map(r => r.column_name).join(", "));
            console.log("-------------------");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}
check();
