const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to DB");
        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
        console.log("Columns in 'users' table:");
        res.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}
run();
