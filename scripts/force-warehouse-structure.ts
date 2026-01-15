import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "@/lib/db";
import { inventoryCategories } from "@/lib/schema";
import { eq, or, notInArray } from "drizzle-orm";

async function forceStructure() {
    console.log("🛠 Принудительная настройка структуры: 3 главных категории...");

    try {
        const rootNames = ["Одежда", "Упаковка", "Расходники"];

        // 1. Убеждаемся, что у нас есть эти 3 категории как корневые
        const currentCategories = await db.query.inventoryCategories.findMany();
        const rootMap: Record<string, string> = {};

        for (const name of rootNames) {
            let cat = currentCategories.find(c => c.name === name);
            if (!cat) {
                const [newCat] = await db.insert(inventoryCategories).values({
                    name,
                    icon: name === "Одежда" ? "shirt" : name === "Упаковка" ? "package" : "scissors",
                    color: name === "Одежда" ? "blue" : name === "Упаковка" ? "amber" : "rose",
                    parentId: null
                }).returning();
                rootMap[name] = newCat.id;
                console.log(`✨ Создана корневая категория: ${name}`);
            } else {
                if (cat.parentId !== null) {
                    await db.update(inventoryCategories).set({ parentId: null }).where(eq(inventoryCategories.id, cat.id));
                    console.log(`✅ ${name} теперь корневая`);
                }
                rootMap[name] = cat.id;
            }
        }

        // 2. Маппинг всех остальных ВНУТРЬ этих трёх
        const mapping: Record<string, string> = {
            "Футболки": "Одежда",
            "Худи": "Одежда",
            "Свитшот": "Одежда",
            "Лонгслив": "Одежда",
            "Анорак": "Одежда",
            "Зип-худи": "Одежда",
            "Штаны": "Одежда",
            "Поло": "Одежда",
            "Кепки": "Одежда"
        };

        const updatedCategories = await db.query.inventoryCategories.findMany();
        for (const cat of updatedCategories) {
            // Если категория - это одна из наших корневых, пропускаем
            if (rootNames.includes(cat.name) && cat.parentId === null) continue;

            // Если категория есть в маппинге - переносим в Одежду
            const parentName = mapping[cat.name];
            if (parentName) {
                const parentId = rootMap[parentName];
                if (cat.parentId !== parentId) {
                    await db.update(inventoryCategories).set({ parentId }).where(eq(inventoryCategories.id, cat.id));
                    console.log(`🔗 ${cat.name} перенесена в ${parentName}`);
                }
            } else if (!cat.parentId && cat.name !== "Без категории") {
                // Если какая-то другая категория оказалась в корне (кроме Без категории) - по умолчанию в Одежду
                await db.update(inventoryCategories).set({ parentId: rootMap["Одежда"] }).where(eq(inventoryCategories.id, cat.id));
                console.log(`📦 Неизвестная категория ${cat.name} перенесена в Одежду`);
            }
        }

        console.log("🚀 Готово! Теперь на главной будет только 3 категории.");
    } catch (e) {
        console.error("❌ Ошибка:", e);
    }
}

forceStructure().then(() => process.exit(0));
