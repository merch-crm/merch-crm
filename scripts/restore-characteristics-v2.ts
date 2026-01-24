
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { inventoryAttributeTypes, inventoryAttributes, inventoryCategories } from "../lib/schema";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import * as schema from "../lib/schema";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

const db = drizzle(pool, { schema });

async function main() {
    console.log("🔄 Starting restoration of extended characteristics (V2)...");

    // 1. Get 'Clothing' category ID for linking types
    const clothingCat = await db.query.inventoryCategories.findFirst({
        where: eq(schema.inventoryCategories.name, "Одежда")
    });
    const clothingCatId = clothingCat?.id;
    console.log("Found Clothing Category ID:", clothingCatId);

    // 2. Define Types and Values to Restore
    const typesToRestore = [
        // --- 1. QUALITY (Качество) ---
        {
            name: "Качество",
            slug: "quality",
            categoryId: clothingCatId,
            isSystem: true,
            sortOrder: 1,
            values: [
                { name: "Base", value: "BS", meta: { desc: "Стандартное качество" } }, // From category-utils
                { name: "Premium", value: "PRM", meta: { desc: "Премиум качество (ранее Пенье)" } }, // From category-utils
                { name: "Пенье", value: "PEN", meta: { legacy: true } }, // Legacy fallback
                { name: "Карде", value: "CRD", meta: { legacy: true } },
                { name: "Опен енд", value: "OE", meta: { legacy: true } }
            ]
        },
        // --- 2. MATERIAL (Материал - Fabric Type) ---
        {
            name: "Материал",
            slug: "material",
            categoryId: clothingCatId,
            isSystem: true,
            sortOrder: 2,
            values: [
                { name: "Кулирка", value: "KUL" }, // From category-utils
                { name: "Френч-терри", value: "FT" }, // From category-utils
                { name: "Футер 3-х нитка", value: "F3" },
                { name: "Футер 2-х нитка", value: "F2" },
                { name: "Пике", value: "PIQ" },
                { name: "Начес", value: "FLC" }
            ]
        },
        // --- 3. COMPOSITION (Состав) ---
        {
            name: "Состав",
            slug: "composition",
            categoryId: clothingCatId,
            isSystem: false, // Custom attribute
            sortOrder: 3,
            values: [
                { name: "100% Хлопок", value: "100CO" },
                { name: "95% Хлопок, 5% Эластан", value: "95CO5EL" },
                { name: "80% Хлопок, 20% Полиэстер", value: "80CO20PE" },
                { name: "70% Хлопок, 30% Полиэстер", value: "70CO30PE" },
                { name: "100% Полиэстер", value: "100PE" }
            ]
        },
        // --- 4. BRAND (Бренд) ---
        {
            name: "Бренд",
            slug: "brand",
            categoryId: clothingCatId, // Brand usually tied to clothing here
            isSystem: true,
            sortOrder: 0,
            values: [
                { name: "No Brand", value: "NB" },
                { name: "Gildan", value: "GLD" },
                { name: "Fruit of the Loom", value: "FOTL" },
                { name: "Stan", value: "STN" }
            ]
        },
        // --- 5. COLOR (Цвет) ---
        {
            name: "Цвет",
            slug: "color",
            categoryId: null, // Global
            isSystem: true,
            sortOrder: 5,
            values: [
                { name: "Белый", value: "WHT", meta: { hex: "#FFFFFF" } },
                { name: "Черный", value: "BLK", meta: { hex: "#000000" } },
                { name: "Молочный", value: "MILK", meta: { hex: "#F5F5DC" } },
                { name: "Шоколад", value: "CHOC", meta: { hex: "#7B3F00" } },
                { name: "Графит", value: "GRAF", meta: { hex: "#383838" } },
                { name: "Баблгам", value: "BUB", meta: { hex: "#FFC1CC" } },
                { name: "Синий", value: "BLU", meta: { hex: "#0000FF" } },
                { name: "Красный", value: "RED", meta: { hex: "#FF0000" } },
                { name: "Серый", value: "GRY", meta: { hex: "#808080" } },
                { name: "Бежевый", value: "BGE", meta: { hex: "#F5F5DC" } },
                { name: "Хаки", value: "KHK", meta: { hex: "#F0E68C" } }
            ]
        },
        // --- 6. SIZE (Размер) ---
        {
            name: "Размер",
            slug: "size",
            categoryId: clothingCatId,
            isSystem: true,
            sortOrder: 6,
            values: [
                { name: "Kids", value: "KDS", meta: { sort: 0 } },
                { name: "XS", value: "XS", meta: { sort: 1 } },
                { name: "S", value: "S", meta: { sort: 2 } },
                { name: "S-M", value: "SM", meta: { sort: 3 } },
                { name: "M", value: "M", meta: { sort: 4 } },
                { name: "L", value: "L", meta: { sort: 5 } },
                { name: "XL", value: "XL", meta: { sort: 6 } },
                { name: "XXL", value: "XXL", meta: { sort: 7 } },
                { name: "3XL", value: "3XL", meta: { sort: 8 } },
                { name: "Универсальный", value: "UNI", meta: { sort: 9 } }
            ]
        }
    ];

    for (const typeData of typesToRestore) {
        console.log(`Processing Type: ${typeData.name} (${typeData.slug})...`);

        // 1. Ensure Type Exists
        let typeId;
        const existingType = await db.select().from(inventoryAttributeTypes)
            .where(eq(inventoryAttributeTypes.slug, typeData.slug))
            .limit(1);

        if (existingType.length > 0) {
            typeId = existingType[0].id;
            console.log(`  - Type exists: ${typeId}`);
        } else {
            console.log(`  - Creating type...`);
            const inserted = await db.insert(inventoryAttributeTypes).values({
                slug: typeData.slug,
                name: typeData.name,
                categoryId: typeData.categoryId,
                isSystem: typeData.isSystem,
                sortOrder: typeData.sortOrder
            }).returning({ id: inventoryAttributeTypes.id });
            typeId = inserted[0].id;
            console.log(`  - Created type: ${typeId}`);
        }

        // 2. Ensure Values Exist
        let addedCount = 0;
        for (const val of typeData.values) {
            const existingAttr = await db.select().from(inventoryAttributes)
                .where(and(
                    eq(inventoryAttributes.type, typeData.slug),
                    eq(inventoryAttributes.value, val.value)
                ))
                .limit(1);

            if (existingAttr.length === 0) {
                await db.insert(inventoryAttributes).values({
                    type: typeData.slug,
                    name: val.name,
                    value: val.value,
                    meta: val.meta || {}
                });
                addedCount++;
            }
        }
        console.log(`  - Added ${addedCount} new values.`);
    }

    console.log("\n✅ Restoration V2 Completed Successfully!");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
