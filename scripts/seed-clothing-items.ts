import * as dotenv from "dotenv";
import { db } from "../lib/db";
import { inventoryCategories, inventoryItems } from "../lib/schema";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

async function main() {
    console.log("🔄 Добавление тестовых позиций одежды...\n");

    // Получаем все подкатегории одежды
    const clothingParent = await db
        .select()
        .from(inventoryCategories)
        .where(eq(inventoryCategories.name, "Одежда"))
        .limit(1);

    if (clothingParent.length === 0) {
        console.error("❌ Родительская категория 'Одежда' не найдена!");
        process.exit(1);
    }

    const subcategories = await db
        .select()
        .from(inventoryCategories)
        .where(eq(inventoryCategories.parentId, clothingParent[0].id));

    console.log(`📦 Найдено ${subcategories.length} подкатегорий одежды\n`);

    // Данные для создания позиций
    const itemsData: Record<string, {
        name: string;
        sku: string;
        description: string;
        quantity: number;
        unit: string;
        attributes: any;
    }> = {
        "Футболки": {
            name: "Футболка базовая хлопок",
            sku: "FT-001",
            description: "Классическая футболка из 100% хлопка, плотность 160 г/м²",
            quantity: 50,
            unit: "pcs",
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
            unit: "pcs",
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
            unit: "pcs",
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
            unit: "pcs",
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
            unit: "pcs",
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
            unit: "pcs",
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
            unit: "pcs",
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
            unit: "pcs",
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
            unit: "pcs",
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

    for (const category of subcategories) {
        const itemData = itemsData[category.name];

        if (!itemData) {
            console.log(`⚠️  Нет данных для категории: ${category.name}`);
            skipped++;
            continue;
        }

        // Проверяем, существует ли уже позиция в этой категории
        const existing = await db
            .select()
            .from(inventoryItems)
            .where(eq(inventoryItems.categoryId, category.id))
            .limit(1);

        if (existing.length > 0) {
            console.log(`⏭️  ${category.name}: позиция уже существует (${existing[0].name})`);
            skipped++;
            continue;
        }

        // Создаем новую позицию
        await db.insert(inventoryItems).values({
            name: itemData.name,
            sku: itemData.sku,
            categoryId: category.id,
            itemType: "clothing",
            quantity: itemData.quantity,
            unit: itemData.unit,
            description: itemData.description,
            attributes: itemData.attributes,
            lowStockThreshold: 10,
            criticalStockThreshold: 5,
        });

        console.log(`✅ ${category.name}: создана позиция "${itemData.name}" (${itemData.sku})`);
        created++;
    }

    console.log(`\n📊 Итого:`);
    console.log(`   ✅ Создано: ${created}`);
    console.log(`   ⏭️  Пропущено: ${skipped}`);
    console.log(`\n✨ Готово!`);

    process.exit(0);
}

main().catch((error) => {
    console.error("❌ Ошибка:", error);
    process.exit(1);
});
