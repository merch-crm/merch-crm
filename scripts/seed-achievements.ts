import { db } from "../lib/db.ts";
import * as schema from "../lib/schema/achievements.ts";

async function main() {
    console.log("Seeding achievements...");
    
    const achievementsToSeed = [
        {
            name: "Первый шаг",
            description: "Выполнил первую производственную задачу",
            code: "first_task_completed",
            icon: "Zap",
            points: 10,
        },
        {
            name: "Мастер упаковки",
            description: "Упаковал 100 единиц продукции за смену",
            code: "packaging_master_100",
            icon: "Package",
            points: 50,
        },
        {
            name: "Скороход",
            description: "Выполнил задачу на 30% быстрее плана",
            code: "speedster",
            icon: "Flame",
            points: 30,
        },
        {
            name: "Безупречность",
            description: "Выполнил 10 задач без брака",
            code: "perfectionist",
            icon: "CheckCircle",
            points: 100,
        }
    ];

    for (const data of achievementsToSeed) {
        await db.insert(schema.achievements).values(data).onConflictDoNothing();
    }

    console.log("Achievements seeded successfully.");
}

main().catch(console.error);
