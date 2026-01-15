import { db } from "../lib/db";
import { inventoryCategories } from "../lib/schema";
import { eq } from "drizzle-orm";

const systemCategories = [
    { name: "Футболки", description: null, icon: "shirt", color: "rose", prefix: "TS" },
    { name: "Худи", description: null, icon: "hourglass", color: "indigo", prefix: "HD" },
    { name: "Свитшот", description: null, icon: "layers", color: "violet", prefix: "SW" },
    { name: "Лонгслив", description: null, icon: "shirt", color: "emerald", prefix: "LS" },
    { name: "Анорак", description: null, icon: "wind", color: "cyan", prefix: "AN" },
    { name: "Зип-худи", description: null, icon: "zap", color: "indigo", prefix: "ZH" },
    { name: "Штаны", description: null, icon: "package", color: "slate", prefix: "PT" },
    { name: "Поло", description: null, icon: "shirt", color: "cyan", prefix: "PL" },
    { name: "Кепки", description: "Системная категория для кепок", icon: "box", color: "cyan", prefix: "CP" },
    { name: "Упаковка", description: null, icon: "box", color: "amber", prefix: "PK" },
    { name: "Расходники", description: null, icon: "scissors", color: "rose", prefix: "SP" },
];

async function restoreCategories() {
    console.log("🔄 Восстановление системных категорий...\n");

    for (const category of systemCategories) {
        try {
            // Проверяем, существует ли категория
            const existing = await db
                .select()
                .from(inventoryCategories)
                .where(eq(inventoryCategories.name, category.name))
                .limit(1);

            if (existing.length > 0) {
                console.log(`✓ Категория "${category.name}" уже существует`);
            } else {
                // Создаем категорию
                await db.insert(inventoryCategories).values({
                    name: category.name,
                    description: category.description,
                    icon: category.icon,
                    color: category.color,
                    prefix: category.prefix,
                    parentId: null, // Все категории верхнего уровня
                });
                console.log(`✓ Создана категория "${category.name}" (${category.prefix})`);
            }
        } catch (error) {
            console.error(`✗ Ошибка при создании категории "${category.name}":`, error);
        }
    }

    console.log("\n✅ Восстановление завершено!");
    process.exit(0);
}

restoreCategories().catch((error) => {
    console.error("❌ Критическая ошибка:", error);
    process.exit(1);
});
