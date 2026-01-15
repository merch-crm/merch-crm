const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

async function check() {
    try {
        console.log("--- DB Connection Test ---");
        const res = await pool.query('SELECT NOW()');
        console.log("Connection successful:", res.rows[0]);

        console.log("\n--- Checking inventory_items columns ---");
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'inventory_items'
        `);
        console.log("Columns:");
        columns.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type}`);
        });

        console.log("\n--- Checking clients table ---");
        const clientsRes = await pool.query('SELECT COUNT(*) FROM clients');
        console.log("Total clients:", clientsRes.rows[0].count);

        const sampleClient = await pool.query('SELECT id, "first_name", "last_name" FROM clients LIMIT 1');
        console.log("Sample client:", sampleClient.rows[0]);

        if (sampleClient.rows[0]) {
            const clientId = sampleClient.rows[0].id;
            console.log(`\n--- Deep Dive for Client ${clientId} ---`);

            // Check orders
            const ordersRes = await pool.query('SELECT id, status, total_amount FROM orders WHERE client_id = $1 LIMIT 5', [clientId]);
            console.log("Orders count:", ordersRes.rows.length);
            ordersRes.rows.forEach(order => {
                console.log(`- Order: ${order.id}, Status: ${order.status}, Amount: ${order.total_amount}`);
            });

            // Check audit logs
            const logsRes = await pool.query('SELECT action, created_at FROM audit_logs WHERE entity_id = $1 AND entity_type = $2 LIMIT 5', [clientId, 'client']);
            console.log("Audit Logs count:", logsRes.rows.length);
            logsRes.rows.forEach(log => {
                console.log(`- Action: ${log.action}, Created: ${log.created_at}`);
            });
        }

    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await pool.end();
    }
}

check();
