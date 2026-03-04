import 'dotenv/config';
import { db } from './lib/db';
import { inventoryAttributeTypes, inventoryAttributes } from './lib/schema';
import { eq } from 'drizzle-orm';

const cleanupMap: Record<string, { full: string, short: string }> = {
  // Единица измерения
  "мм": { full: "миллиметры", short: "мм" },
  "миллиметры": { full: "миллиметры", short: "мм" },
  "миллиметр": { full: "миллиметры", short: "мм" },

  "см": { full: "сантиметры", short: "см" },
  "сантиметры": { full: "сантиметры", short: "см" },
  "сантиметр": { full: "сантиметры", short: "см" },

  "м": { full: "метры", short: "м" },
  "метры": { full: "метры", short: "м" },
  "метр": { full: "метры", short: "м" },

  // Количество
  "шт": { full: "штука", short: "шт." },
  "штука": { full: "штука", short: "шт." },
  "штуки": { full: "штука", short: "шт." },

  "пар": { full: "пара", short: "пар." },
  "пара": { full: "пара", short: "пар." },

  "компл": { full: "комплект", short: "компл." },
  "комплект": { full: "комплект", short: "компл." },

  "уп": { full: "упаковка", short: "уп." },
  "упаковка": { full: "упаковка", short: "уп." },

  "рул": { full: "рулон", short: "рул." },
  "рулон": { full: "рулон", short: "рул." },

  "л": { full: "литры", short: "л" },
  "литр": { full: "литры", short: "л" },
  "литры": { full: "литры", short: "л" },

  // Вес
  "г": { full: "граммы", short: "г" },
  "грамм": { full: "граммы", short: "г" },
  "граммы": { full: "граммы", short: "г" },

  "кг": { full: "килограммы", short: "кг" },
  "киллограммы": { full: "килограммы", short: "кг" },
  "килограммы": { full: "килограммы", short: "кг" },
  "килограмм": { full: "килограммы", short: "кг" },

  // Объем
  "мл": { full: "миллилитры", short: "мл" },
  "миллилитры": { full: "миллилитры", short: "мл" },
  "миллилитр": { full: "миллилитры", short: "мл" },

  // Упаковка
  "коробка": { full: "коробка", short: "кор." },
  "кор": { full: "коробка", short: "кор." },

  "шопер": { full: "шопер", short: "шоп." },
  "шоп": { full: "шопер", short: "шоп." },

  "зип-пакет": { full: "зип-пакет", short: "зип." },
  "пакет": { full: "зип-пакет", short: "зип." },
};

async function main() {
  const attributes = await db.select().from(inventoryAttributes);
  let updatedCount = 0;

  for (const a of attributes) {
    let rawName = (a.name || "").toLowerCase().trim();
    let meta = a.meta as Record<string, any> || {};
    let rawFullName = (meta.fullName || "").toLowerCase().trim();

    let matched = cleanupMap[rawName] || cleanupMap[rawFullName];

    if (!matched) {
      // Fallbacks for standardizing what we don't know exactly
      // if it's "кг", maybe they typed it uppercase or exactly:
      if (["weight", "volume", "unit", "package", "quantity"].includes(a.type || "")) {
        // We only attempt to clean known abbreviations safely
      }
    }

    if (matched) {
      const newMeta = { ...meta, fullName: matched.full };

      // Prevent useless updates
      if (a.name !== matched.short || meta.fullName !== matched.full) {
        await db.update(inventoryAttributes).set({
          name: matched.short,
          meta: newMeta,
        }).where(eq(inventoryAttributes.id, a.id));
        console.log(`Updated [${a.type}]: ${rawName} -> ${matched.full} (${matched.short})`);
        updatedCount++;
      }
    }
  }

  console.log(`Successfully updated ${updatedCount} properties.`);
  process.exit(0);
}

main().catch(console.error);
