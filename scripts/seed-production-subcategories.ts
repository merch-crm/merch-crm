import { db } from "@/lib/db";
import { inventoryCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { generateCategoryPrefix } from "@/app/(main)/dashboard/warehouse/category/naming";

async function main() {
    const rootCategoryName = "Производство";

    console.log(`Searching for category: ${rootCategoryName}...`);

    // 1. Find the root category
    const rootCategory = await db.query.inventoryCategories.findFirst({
        where: eq(inventoryCategories.name, rootCategoryName),
    });

    if (!rootCategory) {
        console.error(`Category "${rootCategoryName}" not found in database.`);
        process.exit(1);
    }

    console.log(`Found "${rootCategoryName}" with ID: ${rootCategory.id}`);

    // 2. Sample subcategories
    const subcategories = [
        "Печать на футболках",
        "Вышивка логотипов",
        "Термотрансфер",
        "Шелкография",
        "Сублимация",
        "Пошив мерча",
        "Упаковка и фасовка",
        "Брендирование аксессуаров",
        "Лазерная гравировка",
        "Тампопечать"
    ];

    console.log(`Starting creation of 10 subcategories...`);

    for (let i = 0; i < subcategories.length; i++) {
        const name = subcategories[i];
        const prefix = generateCategoryPrefix(name);

        try {
            await db.insert(inventoryCategories).values({
                name,
                parentId: rootCategory.id,
                icon: "package",
                color: "blue",
                prefix,
                fullPath: rootCategory.fullPath ? `${rootCategory.fullPath}/${name}` : name,
                gender: "masculine",
                isActive: true,
                sortOrder: i + 1,
                level: (rootCategory.level || 0) + 1
            });
            console.log(`[${i + 1}/10] Created: ${name} (${prefix})`);
        } catch (err) {
            console.error(`Failed to create ${name}:`, err);
        }
    }

    console.log("\nSuccess! All test subcategories created.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
