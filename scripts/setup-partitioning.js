const { Pool } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = env.match(/DATABASE_URL=(.+)/);
const connectionString = dbUrlMatch[1].trim();

const pool = new Pool({
    connectionString,
    ssl: false
});

async function run() {
    console.log('--- Повторная попытка миграции audit_logs ---');
    try {
        await pool.query('BEGIN');

        // Check state first
        // If audit_logs_old exists AND audit_logs exists (but partitions not created fully?), 
        // we might be in weird state if previous run failed inside transaction but commited? 
        // No, `wait Ms` might have timed out but transaction could have rolled back.
        // Actually, the previous error was "relation audit_logs_user_idx already exists".
        // This means RENAME TABLE audit_logs TO audit_logs_old RETAINS indexes on audit_logs_old.
        // So when we try to create index "audit_logs_user_idx" on NEW table, it clashes with index name on OLD table.

        // Fix: Rename indexes on old table or use different names for new indexes.
        // Let's rename indexes on old table.

        // 1. Check if audit_logs_old exists
        const oldExists = await pool.query("SELECT to_regclass('audit_logs_old')");
        if (!oldExists.rows[0].to_regclass) {
            console.log('- Переименование audit_logs -> audit_logs_old');
            await pool.query('ALTER TABLE audit_logs RENAME TO audit_logs_old');
        } else {
            console.log('! audit_logs_old уже существует. Пропускаем переименование.');
        }

        // 2. Rename old indexes to avoid collision
        console.log('- Переименование старых индексов...');
        const oldIndexes = await pool.query(`
            SELECT indexname FROM pg_indexes WHERE tablename = 'audit_logs_old'
        `);
        for (const row of oldIndexes.rows) {
            const idx = row.indexname;
            if (!idx.endsWith('_old')) {
                const newIdxName = idx + '_old';
                console.log(`  Renaming ${idx} -> ${newIdxName}`);
                await pool.query(`ALTER INDEX "${idx}" RENAME TO "${newIdxName}"`);
            }
        }

        // 3. Check if new partitioned table exists
        const newExists = await pool.query("SELECT to_regclass('audit_logs')");
        if (!newExists.rows[0].to_regclass) {
            console.log('- Создание новой партиционированной таблицы audit_logs...');
            await pool.query(`
                CREATE TABLE audit_logs (
                    id uuid DEFAULT gen_random_uuid() NOT NULL,
                    user_id uuid,
                    action text NOT NULL,
                    action_category text,
                    entity_type text NOT NULL,
                    entity_id uuid NOT NULL,
                    details jsonb,
                    created_at timestamp DEFAULT now() NOT NULL,
                    PRIMARY KEY (id, created_at)
                ) PARTITION BY RANGE (created_at);
            `);
        }

        // 4. Create Indexes (IF NOT EXISTS)
        console.log('- Создание индексов (IF NOT EXISTS)...');
        await pool.query(`CREATE INDEX IF NOT EXISTS audit_logs_user_idx ON audit_logs(user_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_type, entity_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS audit_logs_category_idx ON audit_logs(action_category)`);
        // PK already covers id+createdAt, but createdAt index is useful for range queries
        await pool.query(`CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs(created_at)`);

        // 5. Create Partitions (IF NOT EXISTS)
        console.log('- Создание партиций...');
        await pool.query(`CREATE TABLE IF NOT EXISTS audit_logs_default PARTITION OF audit_logs DEFAULT`);
        await pool.query(`CREATE TABLE IF NOT EXISTS audit_logs_2025 PARTITION OF audit_logs FOR VALUES FROM ('2025-01-01') TO ('2026-01-01')`);
        await pool.query(`CREATE TABLE IF NOT EXISTS audit_logs_2026 PARTITION OF audit_logs FOR VALUES FROM ('2026-01-01') TO ('2027-01-01')`);

        // 6. Migrate Data
        console.log('- Проверка и перенос данных...');
        const countNew = await pool.query('SELECT count(*) FROM audit_logs');
        if (parseInt(countNew.rows[0].count) === 0) {
            console.log('  Перенос данных из audit_logs_old...');
            await pool.query(`
                INSERT INTO audit_logs (id, user_id, action, action_category, entity_type, entity_id, details, created_at)
                SELECT id, user_id, action, action_category, entity_type, entity_id, details, created_at
                FROM audit_logs_old
            `);
        } else {
            console.log('  Новая таблица не пуста, пропускаем перенос.');
        }

        await pool.query('COMMIT');
        console.log('Успешно завершено!');
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Ошибка:', err);
    } finally {
        await pool.end();
    }
}

run();
