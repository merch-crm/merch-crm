import 'dotenv/config';
import { db } from './lib/db';
import { inventoryAttributeTypes, inventoryAttributes } from './lib/schema';
import { eq } from 'drizzle-orm';

const namingMap: Record<string, string> = {
    // Единицы измерения
    "мм": "миллиметры",
    "см": "сантиметры",
    "м": "метры",

    // Вес
    "г": "граммы",
    "кг": "килограммы",
    "гр": "граммы",

    // Объем
    "мл": "миллилитры",
    "л": "литры",

    // Количество
    "шт.": "штука",
    "шт": "штука",
    "пар.": "пара",
    "пар": "пара",
    "компл.": "комплект",
    "компл": "комплект",
    "уп.": "упаковка",
    "уп": "упаковка",
    "рул.": "рулон",
    "рул": "рулон",

    // Упаковка
    "кор.": "коробка",
    "кор": "коробка",
    "шоп.": "шопер",
    "зип.": "зип-пакет",
};

async function main() {
    const attributes = await db.select().from(inventoryAttributes);
    let updatedCount = 0;

    for (const a of attributes) {
        let meta = a.meta as Record<string, any> || {};
        let currentFullName = (meta.fullName || "").toLowerCase().trim();
        let currentShortName = (a.name || "").toLowerCase().trim();

        // Strategy: 
        // If fullName is an abbreviation, swap it for the full word.
        // Ensure name (shortName) is actually the abbreviation.

        let targetFullName = namingMap[currentFullName] || namingMap[currentShortName] || meta.fullName;
        let targetShortName = currentShortName;

        // Fix specific cases where short name was the full word
        if (Object.values(namingMap).includes(currentShortName)) {
            // Find abbreviation for this full word
            const abbr = Object.keys(namingMap).find(key => namingMap[key] === currentShortName && !key.includes("."));
            if (abbr) targetShortName = abbr;
        }

        // Dots check for short names
        if (["шт", "пар", "компл", "уп", "рул", "кор", "шоп", "зип"].includes(targetShortName)) {
            targetShortName += ".";
        }

        if (targetFullName && (meta.fullName !== targetFullName || a.name !== targetShortName)) {
            await db.update(inventoryAttributes).set({
                name: targetShortName,
                meta: { ...meta, fullName: targetFullName }
            }).where(eq(inventoryAttributes.id, a.id));
            console.log(`Fixed [${a.type}]: ${a.name} -> Name: "${targetShortName}", Full: "${targetFullName}"`);
            updatedCount++;
        }
    }

    console.log(`Successfully fixed ${updatedCount} entries.`);
    process.exit(0);
}

main().catch(console.error);
