const { Pool } = require('pg');
const fs = require('fs');

// Read env for connection
const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.+)/);
const connectionString = dbUrlMatch ? dbUrlMatch[1].trim() : "postgres://postgres:5738870192e24949b02a700547743048@127.0.0.1:5432/postgres";

const pool = new Pool({
    connectionString,
    ssl: false
});

async function run() {
    try {
        const client = await pool.connect();
        console.log('--- Управление партициями (аналог pg_partman) ---');

        // Configuration
        const tables = ['audit_logs', 'inventory_transactions', 'security_events', 'system_errors'];
        const startYear = new Date().getFullYear();
        const yearsForward = 2; // Create for current year + 2 future years

        for (const tableName of tables) {
            console.log(`\nChecking partitions for table: ${tableName}`);
            for (let i = 0; i <= yearsForward; i++) {
                const year = startYear + i;
                const partitionName = `${tableName}_${year}`;
                const startToken = `${year}-01-01`;
                const endToken = `${year + 1}-01-01`;

                // Check if partition exists
                const checkRes = await client.query(`
                    SELECT to_regclass($1::text) as exists
                `, [partitionName]);

                if (checkRes.rows[0].exists) {
                    console.log(`  [OK] Партиция ${partitionName} уже существует.`);
                } else {
                    console.log(`  [NEW] Создание партиции ${partitionName} (${startToken} - ${endToken})...`);
                    await client.query(`
                        CREATE TABLE IF NOT EXISTS ${partitionName} 
                        PARTITION OF ${tableName} 
                        FOR VALUES FROM ('${startToken}') TO ('${endToken}');
                    `);
                    console.log(`  [SUCCESS] Партиция создана.`);
                }
            }
        }

        console.log('\nПроверка завершена. Все необходимые партиции созданы.');
        client.release();
    } catch (err) {
        console.error('Ошибка:', err);
    } finally {
        await pool.end();
    }
}

run();
