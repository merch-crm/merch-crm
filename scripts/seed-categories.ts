import * as dotenv from "dotenv";
import { db } from "../lib/db";
import { inventoryCategories } from "../lib/schema";

dotenv.config();

async function main() {
    const categories = [
        { name: "Футболки", prefix: "FT", icon: "shirt", color: "blue" },
        { name: "Худи", prefix: "HD", icon: "shirt", color: "indigo" },
        { name: "Свитшот", prefix: "SW", icon: "shirt", color: "violet" },
        { name: "Лонгслив", prefix: "LS", icon: "shirt", color: "purple" },
        { name: "Анорак", prefix: "AN", icon: "zap", color: "emerald" },
        { name: "Зип-худи", prefix: "ZH", icon: "shirt", color: "sky" },
        { name: "Штаны", prefix: "PT", icon: "columns", color: "slate" },
        { name: "Поло", prefix: "PL", icon: "shirt", color: "cyan" },
        { name: "Упаковка", prefix: "PK", icon: "package", color: "amber" },
        { name: "Расходники", prefix: "CM", icon: "tool", color: "rose" }
    ];

    console.log("Seeding categories...");

    // Fetch all existing categories once (instead of N queries)
    const existingCategories = await db.select({ name: inventoryCategories.name }).from(inventoryCategories);
    const existingNames = new Set(existingCategories.map(c => c.name));

    const categoriesToInsert = categories.filter(cat => {
        if (existingNames.has(cat.name)) {
            console.log(`- Category already exists: ${cat.name}`);
            return false;
        }
        return true;
    });

    if (categoriesToInsert.length > 0) {
        await db.insert(inventoryCategories).values(categoriesToInsert);
        categoriesToInsert.forEach(cat => console.log(`✓ Created category: ${cat.name}`));
    }

    console.log("Seeding storage locations cleanup...");
    // Optional: Cleanup duplicates if needed, but primary goal is categories.

    console.log("Done!");
    process.exit(0);
}

main().catch(console.error);
