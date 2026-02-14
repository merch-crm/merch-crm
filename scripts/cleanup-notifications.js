const { Pool } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const connectionString = env.match(/DATABASE_URL=(.+)/)[1].trim();

const pool = new Pool({ connectionString, ssl: false });

async function run() {
    try {
        console.log('--- Очистка старых уведомлений ---');

        // 1. Delete read notifications older than 30 days
        const res = await pool.query(`
            DELETE FROM notifications 
            WHERE is_read = true 
            AND created_at < NOW() - INTERVAL '30 days'
        `);

        console.log(`Удалено ${res.rowCount} старых прочитанных уведомлений.`);

        // 2. Mark all unread older than 90 days as read (optional, user didn't ask but good practice)
        // const res2 = await pool.query(`UPDATE notifications SET is_read = true WHERE is_read = false AND created_at < NOW() - INTERVAL '90 days'`);
        // console.log(`Отмечено ${res2.rowCount} очень старых уведомлений как прочитанные.`);

    } catch (err) {
        console.error('Ошибка при очистке:', err);
    } finally {
        await pool.end();
    }
}

run();
