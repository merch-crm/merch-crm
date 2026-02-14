const { Pool } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.+)/);
const connectionString = dbUrlMatch[1].trim();

const pool = new Pool({
    connectionString,
    ssl: false
});

const tablesToPartition = [
    {
        name: 'inventory_transactions',
        createSql: `
            CREATE TABLE inventory_transactions (
                id uuid DEFAULT gen_random_uuid() NOT NULL,
                item_id uuid,
                order_id uuid,
                change_amount integer DEFAULT 0 NOT NULL,
                type transaction_type NOT NULL,
                reason text,
                storage_location_id uuid,
                from_storage_location_id uuid,
                cost_price numeric(10, 2),
                created_by uuid,
                created_at timestamp DEFAULT now() NOT NULL,
                PRIMARY KEY (id, created_at)
            ) PARTITION BY RANGE (created_at);
        `,
        indexes: [
            `CREATE INDEX IF NOT EXISTS inv_tx_item_idx ON inventory_transactions(item_id)`,
            `CREATE INDEX IF NOT EXISTS inv_tx_storage_idx ON inventory_transactions(storage_location_id)`,
            `CREATE INDEX IF NOT EXISTS inv_tx_from_storage_idx ON inventory_transactions(from_storage_location_id)`,
            `CREATE INDEX IF NOT EXISTS inv_tx_created_by_idx ON inventory_transactions(created_by)`,
            `CREATE INDEX IF NOT EXISTS inv_tx_type_idx ON inventory_transactions(type)`,
            `CREATE INDEX IF NOT EXISTS inv_tx_date_idx ON inventory_transactions(created_at)`
        ],
        columns: `id, item_id, order_id, change_amount, type, reason, storage_location_id, from_storage_location_id, cost_price, created_by, created_at`
    },
    {
        name: 'security_events',
        createSql: `
            CREATE TABLE security_events (
                id uuid DEFAULT gen_random_uuid() NOT NULL,
                user_id uuid,
                event_type security_event_type NOT NULL,
                severity text DEFAULT 'info' NOT NULL,
                ip_address text,
                user_agent text,
                entity_type text,
                entity_id uuid,
                details jsonb,
                created_at timestamp DEFAULT now() NOT NULL,
                PRIMARY KEY (id, created_at)
            ) PARTITION BY RANGE (created_at);
        `,
        indexes: [
            `CREATE INDEX IF NOT EXISTS security_events_user_idx ON security_events(user_id)`,
            `CREATE INDEX IF NOT EXISTS security_events_type_idx ON security_events(event_type)`,
            `CREATE INDEX IF NOT EXISTS security_events_entity_idx ON security_events(entity_type, entity_id)`,
            `CREATE INDEX IF NOT EXISTS security_events_created_idx ON security_events(created_at)`
        ],
        columns: `id, user_id, event_type, severity, ip_address, user_agent, entity_type, entity_id, details, created_at`
    },
    {
        name: 'system_errors',
        createSql: `
            CREATE TABLE system_errors (
                id uuid DEFAULT gen_random_uuid() NOT NULL,
                user_id uuid,
                message text NOT NULL,
                stack text,
                path text,
                method text,
                ip_address text,
                user_agent text,
                severity text DEFAULT 'error' NOT NULL,
                details jsonb,
                created_at timestamp DEFAULT now() NOT NULL,
                PRIMARY KEY (id, created_at)
            ) PARTITION BY RANGE (created_at);
        `,
        indexes: [
            `CREATE INDEX IF NOT EXISTS system_errors_user_idx ON system_errors(user_id)`,
            `CREATE INDEX IF NOT EXISTS system_errors_created_idx ON system_errors(created_at)`
        ],
        columns: `id, user_id, message, stack, path, method, ip_address, user_agent, severity, details, created_at`
    }
];

async function run() {
    console.log('--- Mass Partitioning: inventory_transactions, security_events, system_errors ---');

    for (const table of tablesToPartition) {
        console.log(`\nProcessing table: ${table.name}...`);
        try {
            await pool.query('BEGIN');

            const oldTable = `${table.name}_old`;

            // 1. Rename table if old one doesn't exist
            const oldExists = await pool.query(`SELECT to_regclass('${oldTable}')`);
            if (!oldExists.rows[0].to_regclass) {
                // Determine actual current table name. It should be table.name
                // Check if current table exists and is not partitioned?
                const relKindRes = await pool.query(`SELECT relkind FROM pg_class WHERE relname = '${table.name}'`);

                if (relKindRes.rows.length > 0 && relKindRes.rows[0].relkind === 'r') {
                    // It is a regular table, proceed to rename
                    console.log(`- Renaming ${table.name} -> ${oldTable}`);
                    await pool.query(`ALTER TABLE "${table.name}" RENAME TO "${oldTable}"`);
                } else if (relKindRes.rows.length > 0 && relKindRes.rows[0].relkind === 'p') {
                    console.log(`! Table ${table.name} is already partitioned. Skipping rename.`);
                } else {
                    console.log(`! Table ${table.name} not found. Will try to create new.`);
                }
            } else {
                console.log(`! ${oldTable} already exists. Skipping rename.`);
            }

            // 2. Rename old indexes to prevent conflicts
            console.log('- Renaming old indexes...');
            const oldIndexes = await pool.query(`
                SELECT indexname FROM pg_indexes WHERE tablename = '${oldTable}'
            `);
            for (const row of oldIndexes.rows) {
                const idx = row.indexname;
                if (!idx.endsWith('_old')) {
                    const newIdxName = idx + '_old';
                    console.log(`  Renaming ${idx} -> ${newIdxName}`);
                    await pool.query(`ALTER INDEX "${idx}" RENAME TO "${newIdxName}"`);
                }
            }

            // 3. Create new partitioned table
            console.log('- Creating new partitioned table...');
            await pool.query(table.createSql);

            // 4. Create Indexes
            console.log('- Creating indexes...');
            for (const indexSql of table.indexes) {
                await pool.query(indexSql);
            }

            // 5. Create Partitions
            console.log('- Creating partitions...');
            await pool.query(`CREATE TABLE IF NOT EXISTS ${table.name}_default PARTITION OF ${table.name} DEFAULT`);
            await pool.query(`CREATE TABLE IF NOT EXISTS ${table.name}_2025 PARTITION OF ${table.name} FOR VALUES FROM ('2025-01-01') TO ('2026-01-01')`);
            await pool.query(`CREATE TABLE IF NOT EXISTS ${table.name}_2026 PARTITION OF ${table.name} FOR VALUES FROM ('2026-01-01') TO ('2027-01-01')`);
            await pool.query(`CREATE TABLE IF NOT EXISTS ${table.name}_2027 PARTITION OF ${table.name} FOR VALUES FROM ('2027-01-01') TO ('2028-01-01')`);

            // 6. Migrate Data
            console.log('- Migrating data...');
            // Only migrate if we have an old table and new table is empty
            const checkOld = await pool.query(`SELECT to_regclass('${oldTable}')`);
            if (checkOld.rows[0].to_regclass) {
                const countNew = await pool.query(`SELECT count(*) FROM ${table.name}`);
                if (parseInt(countNew.rows[0].count) === 0) {
                    console.log(`  Target table empty. Copying from ${oldTable}...`);
                    // Make sure columns match. 'order_id' was added recently to inventory_transactions.
                    // If old table doesn't have order_id, we need to handle it.
                    // Simple INSERT INTO ... SELECT * might fail if column count mismatch.

                    // Helper to get columns of old table
                    const oldColsRes = await pool.query(`
                        SELECT column_name FROM information_schema.columns 
                        WHERE table_name = '${oldTable}' AND table_schema = 'public'
                     `);
                    const oldCols = oldColsRes.rows.map(r => r.column_name);

                    // We need to construct SELECT statement based on intersection of columns
                    const newCols = table.columns.split(', ').map(c => c.trim());
                    const commonCols = newCols.filter(c => oldCols.includes(c));

                    if (commonCols.length > 0) {
                        const colsStr = commonCols.join(', ');
                        await pool.query(`
                            INSERT INTO ${table.name} (${colsStr})
                            SELECT ${colsStr}
                            FROM ${oldTable}
                        `);
                        console.log('  Data migrated successfully.');
                    } else {
                        console.log('  No common columns found? Something is wrong.');
                    }
                } else {
                    console.log('  Target table not empty. Skipping migration.');
                }
            }

            await pool.query('COMMIT');
            console.log(`Finished processing ${table.name}.`);

        } catch (err) {
            await pool.query('ROLLBACK');
            console.error(`Error processing ${table.name}:`, err);
        }
    }

    console.log('\nAll done.');
    await pool.end();
}

run();
