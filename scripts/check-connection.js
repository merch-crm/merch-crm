import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';

// Basic env parser for .env.local
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const index = line.indexOf('=');
            if (index !== -1) {
                const key = line.substring(0, index).trim();
                const value = line.substring(index + 1).trim().replace(/^"(.*)"$/, '$1');
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

async function checkConnection() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres',
    });

    try {
        console.log('⏳ Проверка подключения к базе данных...');
        await client.connect();
        console.log('✅ Подключение к базе данных успешно установлено!');
        const res = await client.query('SELECT NOW()');
        console.log('🕒 Время на сервере:', res.rows[0].now);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Ошибка подключения к БД:', err.message);
        process.exit(1);
    }
}

checkConnection();
