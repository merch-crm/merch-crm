import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "@/lib/db";
import { inventoryCategories } from "@/lib/schema";
import { eq, and, isNull, not } from "drizzle-orm";

/**
 * Миграция категорий склада в трёхуровневую структуру:
 * Уровень 1 (Категории): Одежда, Упаковка, Расходники
 * Уровень 2 (Подкатегории): Футболки, Худи, Свитшот, Лонгслив, Анорак, Зип-худи, Штаны, Поло, Кепки, Упаковка, Расходники
 * Уровень 3 (Позиции): конкретные товары
 */

async function migrateCategories() {
    console.log("🔄 Начинаем миграцию категорий...");

    try {
        // 1. Очистка самоцитирования (если вдруг возникло)
        console.log("🧹 Очистка некорректных связей...");
        const allCats = await db.select().from(inventoryCategories);
        for (const cat of allCats) {
            if (cat.parentId === cat.id) {
                await db.update(inventoryCategories)
                    .set({ parentId: null })
                    .where(eq(inventoryCategories.id, cat.id));
                console.log(`♻️ Сброшен parentId для "${cat.name}" (ссылался на себя)`);
            }
        }

        // 2. Переименование существующих категорий, имена которых совпадают с новыми родителями
        const targetParents = ["Одежда", "Упаковка", "Расходники"];
        for (const name of targetParents) {
            const existing = await db.query.inventoryCategories.findFirst({
                where: eq(inventoryCategories.name, name)
            });

            if (existing && existing.parentId) {
                const newName = `${name} (общее)`;
                await db.update(inventoryCategories)
                    .set({ name: newName })
                    .where(eq(inventoryCategories.id, existing.id));
                console.log(`📝 Переименована подкатегория "${name}" → "${newName}"`);
            }
        }

        // 3. Получаем актуальный список категорий
        const existingCategories = await db.query.inventoryCategories.findMany();

        // 4. Создаём/Находим родительские категории
        const parentConfigs = [
            { name: "Одежда", icon: "👕", color: "blue", prefix: "CLO" },
            { name: "Упаковка", icon: "📦", color: "amber", prefix: "PKG" },
            { name: "Расходники", icon: "🔧", color: "rose", prefix: "SUP" },
        ];

        const createdParents: Record<string, string> = {};

        for (const config of parentConfigs) {
            let parent = existingCategories.find(c => c.name === config.name && !c.parentId);

            if (parent) {
                console.log(`✅ Родительская категория "${config.name}" найдена`);
                createdParents[config.name] = parent.id;
            } else {
                // Если есть категория с таким именем, но она чья-то дочка (хотя мы выше это пофиксили, на всякий случай)
                const anyWithSameName = existingCategories.find(c => c.name === config.name);
                if (anyWithSameName) {
                    const newName = `${config.name} (подкат.)`;
                    await db.update(inventoryCategories).set({ name: newName }).where(eq(inventoryCategories.id, anyWithSameName.id));
                    console.log(`⚠️ Дубликат имени: "${config.name}" переименован в "${newName}"`);
                }

                const [created] = await db.insert(inventoryCategories).values({
                    name: config.name,
                    icon: config.icon,
                    color: config.color,
                    prefix: config.prefix,
                    parentId: null,
                }).returning();

                createdParents[config.name] = created.id;
                console.log(`✨ Создана родительская категория: ${config.name}`);
            }
        }

        // 5. Маппинг подкатегорий
        const categoryMapping: Record<string, string> = {
            "Футболки": "Одежда",
            "Худи": "Одежда",
            "Свитшот": "Одежда",
            "Лонгслив": "Одежда",
            "Анорак": "Одежда",
            "Зип-худи": "Одежда",
            "Штаны": "Одежда",
            "Поло": "Одежда",
            "Кепки": "Одежда",
            "Упаковка": "Упаковка",
            "Расходники": "Расходники",
            "Упаковка (общее)": "Упаковка",
            "Расходники (общее)": "Расходники",
        };

        // 6. Распределение
        const freshCategories = await db.query.inventoryCategories.findMany();
        for (const cat of freshCategories) {
            const parentName = categoryMapping[cat.name];
            const parentId = parentName ? createdParents[parentName] : null;

            if (parentId && cat.id !== parentId && cat.parentId !== parentId) {
                await db.update(inventoryCategories)
                    .set({ parentId })
                    .where(eq(inventoryCategories.id, cat.id));
                console.log(`🔗 "${cat.name}" → подкатегория "${parentName}"`);
            }
        }

        console.log("\n✅ Миграция завершена успешно!");

    } catch (error) {
        console.error("❌ Ошибка при миграции:", error);
        throw error;
    }
}

migrateCategories()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
