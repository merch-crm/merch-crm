
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../lib/schema";
import { inventoryAttributeTypes, inventoryAttributes, inventoryCategories } from "../lib/schema";
import { eq } from "drizzle-orm";

console.log("DEBUG: DATABASE_URL is", process.env.DATABASE_URL ? "Set" : "Unset");
if (process.env.DATABASE_URL) {
    const masked = process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@");
    console.log("DEBUG: Connection string:", masked);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Explicitly disable SSL
});

const db = drizzle(pool, { schema });

async function main() {
    console.log("🔄 Starting characteristics restoration...");

    // 1. Ensure Categories exist (we need them for linking)
    // We will link to "uncategorized" (null) if specific category not found, 
    // or try to find "Одежда" for Size/Material.

    const clothingCat = await db.query.inventoryCategories.findFirst({
        where: eq(inventoryCategories.name, "Одежда")
    });

    const clothingCatId = clothingCat?.id || null;

    // Define standard types
    const typesToRestore = [
        {
            name: "Размер",
            slug: "size",
            categoryId: clothingCatId,
            isSystem: true,
            sortOrder: 1,
            values: [
                { name: "XS", value: "XS", meta: { showInName: true, showInSku: true } },
                { name: "S", value: "S", meta: { showInName: true, showInSku: true } },
                { name: "M", value: "M", meta: { showInName: true, showInSku: true } },
                { name: "L", value: "L", meta: { showInName: true, showInSku: true } },
                { name: "XL", value: "XL", meta: { showInName: true, showInSku: true } },
                { name: "XXL", value: "2XL", meta: { showInName: true, showInSku: true } },
                { name: "3XL", value: "3XL", meta: { showInName: true, showInSku: true } },
                { name: "4XL", value: "4XL", meta: { showInName: true, showInSku: true } }
            ]
        },
        {
            name: "Цвет",
            slug: "color",
            categoryId: null, // Global
            isSystem: true,
            sortOrder: 0,
            values: [
                { name: "Черный", value: "BLK", meta: { hex: "#000000", showInName: true, showInSku: true, fem: "Черная", neut: "Черное" } },
                { name: "Белый", value: "WHT", meta: { hex: "#ffffff", showInName: true, showInSku: true, fem: "Белая", neut: "Белое" } },
                { name: "Серый", value: "GRY", meta: { hex: "#808080", showInName: true, showInSku: true, fem: "Серая", neut: "Серое" } },
                { name: "Красный", value: "RED", meta: { hex: "#ff0000", showInName: true, showInSku: true, fem: "Красная", neut: "Красное" } },
                { name: "Синий", value: "BLU", meta: { hex: "#0000ff", showInName: true, showInSku: true, fem: "Синяя", neut: "Синее" } },
                { name: "Зеленый", value: "GRN", meta: { hex: "#008000", showInName: true, showInSku: true, fem: "Зеленая", neut: "Зеленое" } },
                { name: "Желтый", value: "YLW", meta: { hex: "#ffff00", showInName: true, showInSku: true, fem: "Желтая", neut: "Желтое" } },
                { name: "Оранжевый", value: "ORG", meta: { hex: "#ffa500", showInName: true, showInSku: true, fem: "Оранжевая", neut: "Оранжевое" } },
                { name: "Фиолетовый", value: "PRP", meta: { hex: "#800080", showInName: true, showInSku: true, fem: "Фиолетовая", neut: "Фиолетовое" } },
                { name: "Бежевый", value: "BGE", meta: { hex: "#f5f5dc", showInName: true, showInSku: true, fem: "Бежевая", neut: "Бежевое" } },
                { name: "Хаки", value: "KHK", meta: { hex: "#f0e68c", showInName: true, showInSku: true, fem: "Хаки", neut: "Хаки" } },
                { name: "Темно-синий", value: "NVY", meta: { hex: "#000080", showInName: true, showInSku: true, fem: "Темно-синяя", neut: "Темно-синее" } }
            ]
        },
        {
            name: "Материал",
            slug: "material",
            categoryId: clothingCatId,
            isSystem: true,
            sortOrder: 2,
            values: [
                { name: "Хлопок 100%", value: "CO", meta: { showInName: true, showInSku: true } },
                { name: "Хлопок 95% / Лайкра 5%", value: "COL", meta: { showInName: true, showInSku: true } },
                { name: "Полиэстер 100%", value: "PE", meta: { showInName: true, showInSku: true } },
                { name: "Смесовая (50/50)", value: "MIX", meta: { showInName: true, showInSku: true } },
                { name: "Флис", value: "FLS", meta: { showInName: true, showInSku: true } },
                { name: "Футер 3-х нитка", value: "F3N", meta: { showInName: true, showInSku: true } },
                { name: "Футер 2-х нитка", value: "F2N", meta: { showInName: true, showInSku: true } },
                { name: "Кулирная гладь", value: "KUL", meta: { showInName: true, showInSku: true } }
            ]
        },
        {
            name: "Бренд",
            slug: "brand",
            categoryId: null,
            isSystem: true,
            sortOrder: 3,
            values: [
                { name: "Stan", value: "STN", meta: { showInName: false, showInSku: true } },
                { name: "Happy Gifts", value: "HG", meta: { showInName: false, showInSku: true } },
                { name: "Portobello", value: "PRT", meta: { showInName: false, showInSku: true } },
                { name: "Fruit of the Loom", value: "FTL", meta: { showInName: false, showInSku: true } },
                { name: "Собственное производство", value: "OWN", meta: { showInName: false, showInSku: true } }
            ]
        }
    ];

    for (const typeData of typesToRestore) {
        // Check if type exists
        let type = await db.query.inventoryAttributeTypes.findFirst({
            where: eq(inventoryAttributeTypes.slug, typeData.slug)
        });

        if (!type) {
            console.log(`➕ Creating type: ${typeData.name} (${typeData.slug})`);
            const [newType] = await db.insert(inventoryAttributeTypes).values({
                name: typeData.name,
                slug: typeData.slug,
                categoryId: typeData.categoryId,
                isSystem: typeData.isSystem,
                sortOrder: typeData.sortOrder
            }).returning();
            type = newType;
        } else {
            console.log(`✓ Type exists: ${type.name} (${type.slug})`);
            // Update category if needed (optional, maybe unsafe if user moved it)
            // But for restoration, let's ensure it has correct system flag
            if (!type.isSystem) {
                await db.update(inventoryAttributeTypes)
                    .set({ isSystem: true })
                    .where(eq(inventoryAttributeTypes.id, type.id));
            }
        }

        // Restore values
        for (const valChoice of typeData.values) {
            // Check if value exists for this type AND value code (unique constraint usually relies on ID, but logically unique by type+value)
            // The schema doesn't enforce unique type+value, but we should check to avoid dups.
            const existingVal = await db.query.inventoryAttributes.findFirst({
                where: (attrs, { eq, and }) => and(
                    eq(attrs.type, type!.slug),
                    eq(attrs.value, valChoice.value)
                )
            });

            if (!existingVal) {
                console.log(`  ➕ Creating value: ${valChoice.name} [${valChoice.value}]`);
                await db.insert(inventoryAttributes).values({
                    type: type.slug,
                    name: valChoice.name,
                    value: valChoice.value,
                    meta: valChoice.meta
                });
            } else {
                // console.log(`  ✓ Value exists: ${valChoice.name}`);
            }
        }
    }

    console.log("✅ Restoration completed.");
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
