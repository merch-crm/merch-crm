import 'dotenv/config';
import { db } from './lib/db';
import { inventoryAttributeTypes, inventoryAttributes, inventoryCategories } from './lib/schema/warehouse'; // Use the actual path from finding
import * as fs from 'fs';

async function main() {
  const types = await db.select().from(inventoryAttributeTypes);
  const attributes = await db.select().from(inventoryAttributes);
  const categories = await db.select().from(inventoryCategories);

  // Group types by category
  const grouped: Record<string, typeof types> = {};
  for (const t of types) {
    const cat = categories.find(c => c.id === t.categoryId);
    const catName = cat ? cat.name : 'Без категории';
    if (!grouped[catName]) grouped[catName] = [];
    grouped[catName].push(t);
  }

  let md = `# Таблица характеристик (сгруппированная по категориям)\n\n`;

  for (const catName in grouped) {
    md += `## Категория: ${catName}\n\n`;
    md += `| Название характеристики | Полное название | Короткое название (Артикул) | Какие пункты туда входят |\n`;
    md += `|---|---|---|---|\n`;

    const catTypes = grouped[catName].sort((a, b) => a.sortOrder - b.sortOrder);

    for (const t of catTypes) {
      const attrs = attributes.filter(a => a.type === t.slug);

      if (attrs.length === 0) {
        md += `| ${t.name} | ❌ | ❌ | ❌ |\n`;
        continue;
      }

      for (let i = 0; i < attrs.length; i++) {
        const a = attrs[i];
        const meta = a.meta as any || {};
        const fullName = meta.fullName || a.name;
        const shortName = a.name;
        const hasShortName = (fullName.toLowerCase() !== shortName.toLowerCase() && shortName) ? shortName : "❌";

        if (i === 0) {
          md += `| **${t.name}** | ${fullName} | ${hasShortName} | ${attrs.map(v => (v.meta as any)?.fullName || v.name).join(', ')} |\n`;
        } else {
          md += `| | ${fullName} | ${hasShortName} | |\n`;
        }
      }
    }
    md += `\n`;
  }

  fs.writeFileSync('./characteristics_table.md', md);
  console.log('Markdown generated');
  process.exit(0);
}

main().catch(console.error);
