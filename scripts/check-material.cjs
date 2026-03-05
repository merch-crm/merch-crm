const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres?sslmode=disable",
});

async function run() {
    const result = await pool.query("SELECT id, name, type FROM inventory_attributes WHERE type = 'material'");
    console.log(result.rows);
    process.exit(0);
}

run();
