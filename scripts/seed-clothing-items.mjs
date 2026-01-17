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
    console.log("🔄 Добавление тестовых позиций одежды...\n");

    try {
        // Получаем родительскую категорию "Одежда"
        const clothingResult = await pool.query(
            "SELECT id FROM inventory_categories WHERE name = $1",
            ["Одежда"]
        );

        if (clothingResult.rows.length === 0) {
            console.error("❌ Родительская категория 'Одежда' не найдена!");
            process.exit(1);
        }

        const clothingId = clothingResult.rows[0].id;

        // Получаем все подкатегории одежды
        const subcategoriesResult = await pool.query(
            "SELECT id, name FROM inventory_categories WHERE parent_id = $1",
            [clothingId]
        );

        console.log(`📦 Найдено ${subcategoriesResult.rows.length} подкатегорий одежды\n`);

        // Данные для создания позиций
        const itemsData = {
            "Футболки": {
                name: "Футболка базовая хлопок",
                sku: "FT-001",
                description: "Классическая футболка из 100% хлопка, плотность 160 г/м²",
                quantity: 50,
                unit: "шт",
                attributes: {
                    material: "100% хлопок",
                    density: "160 г/м²",
                    colors: ["Белый", "Черный", "Серый"],
                    sizes: ["S", "M", "L", "XL", "XXL"]
                }
            },
            "Худи": {
                name: "Худи классическое",
                sku: "HD-001",
                description: "Худи с капюшоном и карманом-кенгуру, плотность 320 г/м²",
                quantity: 30,
                unit: "шт",
                attributes: {
                    material: "80% хлопок, 20% полиэстер",
                    density: "320 г/м²",
                    colors: ["Черный", "Серый", "Синий"],
                    sizes: ["S", "M", "L", "XL", "XXL"]
                }
            },
            "Свитшот": {
                name: "Свитшот оверсайз",
                sku: "SW-001",
                description: "Свободный свитшот без капюшона, плотность 280 г/м²",
                quantity: 25,
                unit: "шт",
                attributes: {
                    material: "80% хлопок, 20% полиэстер",
                    density: "280 г/м²",
                    colors: ["Бежевый", "Черный", "Белый"],
                    sizes: ["S", "M", "L", "XL"]
                }
            },
            "Лонгслив": {
                name: "Лонгслив базовый",
                sku: "LS-001",
                description: "Лонгслив с длинным рукавом, плотность 180 г/м²",
                quantity: 40,
                unit: "шт",
                attributes: {
                    material: "100% хлопок",
                    density: "180 г/м²",
                    colors: ["Белый", "Черный", "Серый", "Синий"],
                    sizes: ["S", "M", "L", "XL", "XXL"]
                }
            },
            "Зип-худи": {
                name: "Зип-худи на молнии",
                sku: "ZH-001",
                description: "Худи с полной молнией и двумя карманами, плотность 340 г/м²",
                quantity: 20,
                unit: "шт",
                attributes: {
                    material: "80% хлопок, 20% полиэстер",
                    density: "340 г/м²",
                    colors: ["Черный", "Серый", "Темно-синий"],
                    sizes: ["S", "M", "L", "XL", "XXL"]
                }
            },
            "Анорак": {
                name: "Анорак ветрозащитный",
                sku: "AN-001",
                description: "Анорак с капюшоном и передним карманом, водоотталкивающая ткань",
                quantity: 15,
                unit: "шт",
                attributes: {
                    material: "100% нейлон",
                    features: ["Водоотталкивающая ткань", "Ветрозащита"],
                    colors: ["Черный", "Хаки", "Синий"],
                    sizes: ["M", "L", "XL"]
                }
            },
            "Поло": {
                name: "Поло классическое",
                sku: "PL-001",
                description: "Рубашка поло с воротником и планкой на пуговицах, плотность 200 г/м²",
                quantity: 35,
                unit: "шт",
                attributes: {
                    material: "100% хлопок пике",
                    density: "200 г/м²",
                    colors: ["Белый", "Черный", "Синий", "Красный"],
                    sizes: ["S", "M", "L", "XL", "XXL"]
                }
            },
            "Штаны": {
                name: "Спортивные штаны",
                sku: "PT-001",
                description: "Спортивные штаны с резинкой и карманами, плотность 280 г/м²",
                quantity: 28,
                unit: "шт",
                attributes: {
                    material: "80% хлопок, 20% полиэстер",
                    density: "280 г/м²",
                    colors: ["Черный", "Серый", "Синий"],
                    sizes: ["S", "M", "L", "XL", "XXL"]
                }
            },
            "Кепки": {
                name: "Бейсболка классическая",
                sku: "CP-001",
                description: "Бейсболка с регулируемым ремешком, 6 панелей",
                quantity: 60,
                unit: "шт",
                attributes: {
                    material: "100% хлопок",
                    type: "6 панелей",
                    colors: ["Черный", "Белый", "Синий", "Красный"],
                    sizes: ["Универсальный"]
                }
            }
        };

        let created = 0;
        let skipped = 0;

        for (const category of subcategoriesResult.rows) {
            const itemData = itemsData[category.name];

            if (!itemData) {
                console.log(`⚠️  Нет данных для категории: ${category.name}`);
                skipped++;
                continue;
            }

            // Проверяем, существует ли уже позиция в этой категории
            const existingResult = await pool.query(
                "SELECT id, name FROM inventory_items WHERE category_id = $1 LIMIT 1",
                [category.id]
            );

            if (existingResult.rows.length > 0) {
                console.log(`⏭️  ${category.name}: позиция уже существует (${existingResult.rows[0].name})`);
                skipped++;
                continue;
            }

            // Создаем новую позицию
            await pool.query(
                `INSERT INTO inventory_items (
                    name, sku, category_id, item_type, quantity, unit, 
                    description, attributes, low_stock_threshold, critical_stock_threshold
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    itemData.name,
                    itemData.sku,
                    category.id,
                    'clothing',
                    itemData.quantity,
                    itemData.unit,
                    itemData.description,
                    JSON.stringify(itemData.attributes),
                    10,
                    5
                ]
            );

            console.log(`✅ ${category.name}: создана позиция "${itemData.name}" (${itemData.sku})`);
            created++;
        }

        console.log(`\n📊 Итого:`);
        console.log(`   ✅ Создано: ${created}`);
        console.log(`   ⏭️  Пропущено: ${skipped}`);
        console.log(`\n✨ Готово!`);

    } catch (error) {
        console.error("❌ Ошибка:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
