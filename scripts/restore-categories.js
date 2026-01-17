const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function restoreCategories() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('🔗 Подключено к базе данных');

        // 1. Создаем основные категории
        console.log('\n📦 Создание основных категорий...');

        const mainCategories = [
            {
                name: 'Одежда',
                description: 'Текстильные изделия и одежда',
                icon: 'shirt',
                color: 'indigo',
                prefix: 'CLT',
                sortOrder: 1
            },
            {
                name: 'Упаковка',
                description: 'Упаковочные материалы',
                icon: 'package',
                color: 'amber',
                prefix: 'PK',
                sortOrder: 2
            },
            {
                name: 'Расходники',
                description: 'Расходные материалы для производства',
                icon: 'tool',
                color: 'rose',
                prefix: 'CM',
                sortOrder: 3
            },
            {
                name: 'Без категории',
                description: 'Товары без категории',
                icon: 'box',
                color: 'slate',
                prefix: 'NC',
                sortOrder: 4
            }
        ];

        const categoryIds = {};

        for (const cat of mainCategories) {
            const result = await client.query(`
                INSERT INTO inventory_categories (name, description, icon, color, prefix, sort_order, is_active, parent_id)
                VALUES ($1, $2, $3, $4, $5, $6, true, NULL)
                ON CONFLICT (name) DO UPDATE SET
                    description = EXCLUDED.description,
                    icon = EXCLUDED.icon,
                    color = EXCLUDED.color,
                    prefix = EXCLUDED.prefix,
                    sort_order = EXCLUDED.sort_order
                RETURNING id
            `, [cat.name, cat.description, cat.icon, cat.color, cat.prefix, cat.sortOrder]);

            categoryIds[cat.name] = result.rows[0].id;
            console.log(`  ✅ ${cat.name} (${cat.prefix})`);
        }

        // 2. Создаем подкатегории для "Одежда"
        console.log('\n👕 Создание подкатегорий одежды...');

        const clothingSubcategories = [
            { name: 'Футболки', icon: 'shirt', color: 'blue', prefix: 'FT', sortOrder: 1 },
            { name: 'Худи', icon: 'shirt', color: 'indigo', prefix: 'HD', sortOrder: 2 },
            { name: 'Свитшот', icon: 'shirt', color: 'violet', prefix: 'SW', sortOrder: 3 },
            { name: 'Лонгслив', icon: 'shirt', color: 'purple', prefix: 'LS', sortOrder: 4 },
            { name: 'Зип-худи', icon: 'shirt', color: 'sky', prefix: 'ZH', sortOrder: 5 },
            { name: 'Анорак', icon: 'zap', color: 'emerald', prefix: 'AN', sortOrder: 6 },
            { name: 'Поло', icon: 'shirt', color: 'cyan', prefix: 'PL', sortOrder: 7 },
            { name: 'Штаны', icon: 'columns', color: 'slate', prefix: 'PT', sortOrder: 8 },
            { name: 'Кепки', icon: 'box', color: 'sky', prefix: 'C', sortOrder: 9 }
        ];

        const clothingParentId = categoryIds['Одежда'];

        for (const subcat of clothingSubcategories) {
            await client.query(`
                INSERT INTO inventory_categories (name, description, icon, color, prefix, sort_order, is_active, parent_id)
                VALUES ($1, NULL, $2, $3, $4, $5, true, $6)
                ON CONFLICT (name) DO UPDATE SET
                    icon = EXCLUDED.icon,
                    color = EXCLUDED.color,
                    prefix = EXCLUDED.prefix,
                    sort_order = EXCLUDED.sort_order,
                    parent_id = EXCLUDED.parent_id
            `, [subcat.name, subcat.icon, subcat.color, subcat.prefix, subcat.sortOrder, clothingParentId]);

            console.log(`  ✅ ${subcat.name} (${subcat.prefix})`);
        }

        console.log('\n✨ Категории успешно восстановлены!');

        // Показываем итоговую статистику
        const stats = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE parent_id IS NULL) as main_categories,
                COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as subcategories,
                COUNT(*) as total
            FROM inventory_categories
            WHERE is_active = true
        `);

        console.log('\n📊 Статистика:');
        console.log(`  Основных категорий: ${stats.rows[0].main_categories}`);
        console.log(`  Подкатегорий: ${stats.rows[0].subcategories}`);
        console.log(`  Всего: ${stats.rows[0].total}`);

        await client.end();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Ошибка:', error.message);
        if (client) await client.end();
        process.exit(1);
    }
}

restoreCategories();
