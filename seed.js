import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config(); // Загружаем обычный .env если есть

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:<DB_PASSWORD>@localhost:5432/postgres"
});

const subcategories = [
    { name: "Печать на футболках", prefix: "ПНФ" },
    { name: "Вышивка логотипов", prefix: "ВЛ" },
    { name: "Термотрансфер", prefix: "ТРМ" },
    { name: "Шелкография", prefix: "ШЛК" },
    { name: "Сублимация", prefix: "СБЛ" },
    { name: "Пошив мерча", prefix: "ПШМ" },
    { name: "Упаковка и фасовка", prefix: "УПФ" },
    { name: "Брендирование аксессуаров", prefix: "БРА" },
    { name: "Лазерная гравировка", prefix: "ЛЗГ" },
    { name: "Тампопечать", prefix: "ТМП" }
];

async function main() {
    console.log("Connecting to database...");

    try {
        const rootResult = await pool.query("SELECT id, name, level, full_path FROM inventory_categories WHERE name = $1 LIMIT 1", ["Производство"]);

        if (rootResult.rows.length === 0) {
            console.error("Root category 'Производство' not found!");
            process.exit(1);
        }

        const root = rootResult.rows[0];
        console.log(`Found root category: ${root.name} (ID: ${root.id})`);

        const insertQuery = `
            INSERT INTO inventory_categories (
                name,
                parent_id,
                icon,
                color,
                prefix,
                full_path,
                gender,
                is_active,
                sort_order,
                level,
                slug,
                is_system,
                show_in_sku,
                show_in_name
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, true, true
            ) ON CONFLICT (name) DO NOTHING
        `;

        for (let i = 0; i < subcategories.length; i++) {
            const cat = subcategories[i];
            const fullPath = root.full_path ? `${root.full_path}/${cat.name}` : cat.name;
            const slug = "prod-" + Date.now() + "-" + i;

            await pool.query(insertQuery, [
                cat.name,
                root.id,
                "package",
                "blue",
                cat.prefix,
                fullPath,
                "masculine",
                true,
                i + 1,
                (root.level || 0) + 1,
                slug
            ]);

            console.log(`[${i + 1}/10] Inserted: ${cat.name}`);
        }

        console.log("Success! Subcategories added.");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

main();
