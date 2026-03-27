import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
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

// Define local schema for test
const systemSettings = pgTable("system_settings", {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at"),
    createdAt: timestamp("created_at"),
});

async function test() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres',
    });

    const db = drizzle(pool);

    try {
        console.log('⏳ Тестирование Drizzle-запроса к system_settings...');
        const result = await db.select().from(systemSettings).where(eq(systemSettings.key, "branding")).limit(1);
        console.log('✅ Запрос выполнен успешно. Результат:', result);
    } catch (err) {
        console.error('❌ Ошибка Drizzle:', err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        await pool.end();
    }
}

test();
