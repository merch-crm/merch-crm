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
            const parts = line.split('=');
            if (parts.length === 2) {
                process.env[parts[0].trim()] = parts[1].trim().replace(/^"(.*)"$/, '$1');
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
        
        console.log('🔍 Проверка таблицы system_settings...');
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'system_settings'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log('✅ Таблица system_settings существует.');
            
            const brandingCheck = await client.query("SELECT * FROM system_settings WHERE key = 'branding'");
            if (brandingCheck.rows.length > 0) {
                console.log('✅ Ключ "branding" найден в system_settings.');
                console.log('📄 Значение:', JSON.stringify(brandingCheck.rows[0].value, null, 2));
            } else {
                console.warn('⚠️ Ключ "branding" НЕ найден в system_settings.');
            }
        } else {
            console.error('❌ Таблица system_settings НЕ найдена!');
        }

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Ошибка:', err.message);
        process.exit(1);
    }
}

checkConnection();
