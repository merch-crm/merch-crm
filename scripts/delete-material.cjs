const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres?sslmode=disable",
});

async function run() {
    console.log("Deleting orphaned 'material' attributes...");
    const result = await pool.query("DELETE FROM inventory_attributes WHERE type = 'material'");
    console.log(`Deleted ${result.rowCount} rows.`);
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
