import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';

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

async function checkColumns() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres',
    });

    try {
        await client.connect();
        
        console.log('🔍 Проверка колонок таблицы system_settings...');
        const columnCheck = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'system_settings'
            ORDER BY ordinal_position;
        `);
        
        console.log('📊 Колонки:');
        columnCheck.rows.forEach(col => {
            console.log(`- ${col.column_name} (${col.data_type})`);
        });

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Ошибка:', err.message);
        process.exit(1);
    }
}

checkColumns();
