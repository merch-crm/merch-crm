import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function main() {
    console.log("🔄 Очистка дублирующихся дополнительных фотографий...\n");

    try {
        // Получаем все позиции с дополнительными фотографиями
        const result = await pool.query(
            `SELECT id, name, image_details 
             FROM inventory_items 
             WHERE image_details IS NOT NULL 
             AND jsonb_array_length(image_details) > 1`
        );

        console.log(`📦 Найдено ${result.rows.length} позиций с несколькими дополнительными фото\n`);

        for (const item of result.rows) {
            const details = item.image_details;

            if (details && Array.isArray(details) && details.length > 1) {
                console.log(`\n📸 ${item.name}:`);
                console.log(`   Текущее количество фото: ${details.length}`);
                console.log(`   Все фото:`);
                details.forEach((photo, i) => console.log(`     ${i + 1}. ${photo}`));

                // Оставляем только первую фотографию
                const firstPhoto = [details[0]];

                await pool.query(
                    "UPDATE inventory_items SET image_details = $1::jsonb WHERE id = $2",
                    [JSON.stringify(firstPhoto), item.id]
                );

                console.log(`   ✅ Оставлена только первая фотография`);
                console.log(`   📁 ${details[0]}`);
            }
        }

        console.log(`\n✨ Готово!`);

    } catch (error) {
        console.error("❌ Ошибка:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
