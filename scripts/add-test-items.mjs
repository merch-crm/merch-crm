import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function addTestItems() {
    try {
        // Find "Леонид" warehouse
        const warehouseResult = await pool.query(
            "SELECT id FROM storage_locations WHERE name = $1",
            ["Леонид"]
        );

        if (warehouseResult.rows.length === 0) {
            console.error("Склад 'Леонид' не найден");
            process.exit(1);
        }

        const warehouse = warehouseResult.rows[0];
        console.log(`Найден склад "Леонид" с ID: ${warehouse.id}`);

        // Create 20 test items
        for (let i = 1; i <= 20; i++) {
            const itemResult = await pool.query(
                `INSERT INTO inventory_items (name, sku, unit, low_stock_threshold, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
                [
                    `Тестовый товар №${i}`,
                    `PAGTEST-${i.toString().padStart(3, "0")}`,
                    "шт",
                    5,
                    `Тестовая позиция для проверки пагинации ${i}`,
                ]
            );

            const itemId = itemResult.rows[0].id;
            const quantity = Math.floor(Math.random() * 50) + 10;

            // Add stock
            await pool.query(
                `INSERT INTO inventory_stocks (item_id, storage_location_id, quantity)
         VALUES ($1, $2, $3)`,
                [itemId, warehouse.id, quantity]
            );

            console.log(`✓ Создан товар ${i}/20`);
        }

        console.log("✅ Готово! 20 позиций добавлено на склад 'Леонид'");
    } catch (err) {
        console.error("Ошибка:", err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

addTestItems();
