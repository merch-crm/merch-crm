import "dotenv/config";
import { db } from "@/lib/db";
import { inventoryItems, inventoryStock, storageLocations } from "@/lib/schema";
import { eq } from "drizzle-orm";

async function addTestItems() {
    // Find "Леонид" warehouse
    const leonidWarehouse = await db
        .select()
        .from(storageLocations)
        .where(eq(storageLocations.name, "Леонид"))
        .limit(1);

    if (leonidWarehouse.length === 0) {
        console.error("Склад 'Леонид' не найден");
        process.exit(1);
    }

    const warehouseId = leonidWarehouse[0].id;
    console.log(`Найден склад "Леонид" с ID: ${warehouseId}`);

    // Create 20 test items
    const testItems = [];
    for (let i = 1; i <= 20; i++) {
        testItems.push({
            name: `Тестовый товар №${i}`,
            sku: `TEST-${i.toString().padStart(3, "0")}`,
            categoryId: leonidWarehouse[0].categoryId || null,
            unit: "шт",
            minStockLevel: 5,
            description: `Тестовая позиция для проверки пагинации ${i}`,
        });
    }

    console.log("Создаём 20 тестовых товаров...");
    const createdItems = await db.insert(inventoryItems).values(testItems).returning();
    console.log(`Создано ${createdItems.length} товаров`);

    // Add stock for each item
    const stockEntries = createdItems.map((item) => ({
        itemId: item.id,
        storageLocationId: warehouseId,
        quantity: Math.floor(Math.random() * 50) + 10, // Random quantity 10-60
    }));

    console.log("Добавляем остатки на склад...");
    await db.insert(inventoryStock).values(stockEntries);
    console.log("✅ Готово! 20 позиций добавлено на склад 'Леонид'");
}

addTestItems()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Ошибка:", err);
        process.exit(1);
    });
