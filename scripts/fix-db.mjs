import pg from 'pg';
const { Client } = pg;
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function fixDb() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres';
    const client = new Client({
        connectionString,
    });

    try {
        console.log('⏳ Соединение с базой данных...');
        await client.connect();

        console.log('🛠 Добавление колонки data_type в inventory_attribute_types...');
        // First check if it exists to avoid error
        const checkRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='inventory_attribute_types' AND column_name='data_type';
        `);

        if (checkRes.rows.length === 0) {
            await client.query('ALTER TABLE inventory_attribute_types ADD COLUMN data_type text DEFAULT \'text\' NOT NULL;');
            console.log('✅ Колонка data_type успешно добавлена!');
        } else {
            console.log('ℹ️ Колонка data_type уже существует.');
        }

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Ошибка при обновлении БД:', err.message);
        process.exit(1);
    }
}

fixDb();
