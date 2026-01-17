const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function seedTestData() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('🔗 Подключено к базе данных');

        // Получаем ID категорий
        const categoriesResult = await client.query('SELECT id, name FROM inventory_categories');
        const categories = {};
        categoriesResult.rows.forEach(cat => {
            categories[cat.name] = cat.id;
        });

        // 1. Создаем 10 клиентов
        console.log('\n👥 Создание клиентов...');
        const clients = [
            { lastName: 'Иванов', firstName: 'Иван', patronymic: 'Иванович', company: 'ООО "ТехноМир"', phone: '+7 900 123-45-01', city: 'Москва', email: 'ivanov@example.com' },
            { lastName: 'Петрова', firstName: 'Мария', patronymic: 'Сергеевна', company: 'ИП Петрова', phone: '+7 900 123-45-02', city: 'Санкт-Петербург', email: 'petrova@example.com' },
            { lastName: 'Сидоров', firstName: 'Алексей', patronymic: 'Александрович', company: 'АО "ГазПромСтрой"', phone: '+7 900 123-45-03', city: 'Новосибирск', email: 'sidorov@example.com' },
            { lastName: 'Кузнецова', firstName: 'Елена', patronymic: 'Дмитриевна', company: 'Студия Дизайна "Арт"', phone: '+7 900 123-45-04', city: 'Екатеринбург', email: 'kuznetsova@example.com' },
            { lastName: 'Попов', firstName: 'Дмитрий', patronymic: 'Николаевич', company: 'Магазин "МерчИкс"', phone: '+7 900 123-45-05', city: 'Казань', email: 'popov@example.com' },
            { lastName: 'Васильева', firstName: 'Ольга', patronymic: 'Андреевна', company: null, phone: '+7 900 123-45-06', city: 'Ростов-на-Дону', email: 'vasilieva@example.com' },
            { lastName: 'Соколов', firstName: 'Сергей', patronymic: 'Викторович', company: 'ООО "Альянс"', phone: '+7 900 123-45-07', city: 'Уфа', email: 'sokolov@example.com' },
            { lastName: 'Михайлова', firstName: 'Анна', patronymic: 'Павловна', company: 'ИП Михайлова', phone: '+7 900 123-45-08', city: 'Волгоград', email: 'mikhailova@example.com' },
            { lastName: 'Новиков', firstName: 'Петр', patronymic: 'Артемович', company: 'АО "Вектор"', phone: '+7 900 123-45-09', city: 'Пермь', email: 'novikov@example.com' },
            { lastName: 'Федорова', firstName: 'Татьяна', patronymic: 'Игоревна', company: 'Студия "Креатив"', phone: '+7 900 123-45-10', city: 'Воронеж', email: 'fedorova@example.com' }
        ];

        const clientIds = [];
        for (const clientData of clients) {
            const name = `${clientData.lastName} ${clientData.firstName}`;
            const result = await client.query(`
                INSERT INTO clients (last_name, first_name, patronymic, name, company, phone, city, email)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, [clientData.lastName, clientData.firstName, clientData.patronymic, name, clientData.company, clientData.phone, clientData.city, clientData.email]);

            clientIds.push(result.rows[0].id);
            console.log(`  ✅ ${name} (${clientData.company || 'Физ. лицо'})`);
        }

        // 2. Создаем товары в разных категориях
        console.log('\n📦 Создание товаров...');

        const items = [
            // Футболки
            { name: 'Футболка базовая черная', sku: 'FT-BLK-001', categoryId: categories['Футболки'], quantity: 50, price: 500 },
            { name: 'Футболка базовая белая', sku: 'FT-WHT-001', categoryId: categories['Футболки'], quantity: 45, price: 500 },
            { name: 'Футболка оверсайз серая', sku: 'FT-GRY-002', categoryId: categories['Футболки'], quantity: 30, price: 650 },

            // Худи
            { name: 'Худи черное классика', sku: 'HD-BLK-001', categoryId: categories['Худи'], quantity: 25, price: 1500 },
            { name: 'Худи серое оверсайз', sku: 'HD-GRY-002', categoryId: categories['Худи'], quantity: 20, price: 1700 },

            // Свитшоты
            { name: 'Свитшот базовый синий', sku: 'SW-BLU-001', categoryId: categories['Свитшот'], quantity: 15, price: 1200 },
            { name: 'Свитшот оверсайз бежевый', sku: 'SW-BGE-002', categoryId: categories['Свитшот'], quantity: 12, price: 1400 },

            // Лонгсливы
            { name: 'Лонгслив базовый черный', sku: 'LS-BLK-001', categoryId: categories['Лонгслив'], quantity: 18, price: 800 },

            // Зип-худи
            { name: 'Зип-худи черное', sku: 'ZH-BLK-001', categoryId: categories['Зип-худи'], quantity: 10, price: 1800 },

            // Анораки
            { name: 'Анорак зеленый', sku: 'AN-GRN-001', categoryId: categories['Анорак'], quantity: 8, price: 2200 },

            // Поло
            { name: 'Поло белое классика', sku: 'PL-WHT-001', categoryId: categories['Поло'], quantity: 22, price: 900 },

            // Штаны
            { name: 'Штаны спортивные черные', sku: 'PT-BLK-001', categoryId: categories['Штаны'], quantity: 16, price: 1300 },

            // Кепки
            { name: 'Кепка черная с прямым козырьком', sku: 'C-BLK-001', categoryId: categories['Кепки'], quantity: 35, price: 600 },
            { name: 'Кепка белая классика', sku: 'C-WHT-001', categoryId: categories['Кепки'], quantity: 28, price: 600 },

            // Упаковка
            { name: 'Коробка картонная 30x20x10', sku: 'PK-BOX-001', categoryId: categories['Упаковка'], quantity: 200, price: 50 },
            { name: 'Пакет крафт с ручками', sku: 'PK-BAG-001', categoryId: categories['Упаковка'], quantity: 500, price: 15 },

            // Расходники
            { name: 'Нитки GUTERMANN черные', sku: 'CM-THR-BLK', categoryId: categories['Расходники'], quantity: 100, price: 120 },
            { name: 'Пленка термотрансферная A4', sku: 'CM-FLM-A4', categoryId: categories['Расходники'], quantity: 250, price: 80 },

            // Без категории
            { name: 'Образцы ткани', sku: 'NC-SMP-001', categoryId: categories['Без категории'], quantity: 50, price: 0 },
            { name: 'Тестовый товар', sku: 'NC-TST-001', categoryId: categories['Без категории'], quantity: 10, price: 100 }
        ];

        const itemIds = [];
        for (const item of items) {
            const result = await client.query(`
                INSERT INTO inventory_items (name, sku, category_id, quantity, unit, low_stock_threshold, description)
                VALUES ($1, $2, $3, $4, 'шт', 5, $5)
                RETURNING id
            `, [item.name, item.sku, item.categoryId, item.quantity, `Товар ${item.name}`]);

            itemIds.push({ id: result.rows[0].id, price: item.price, name: item.name });
            console.log(`  ✅ ${item.name} (${item.sku})`);
        }

        // 3. Создаем 10 заказов
        console.log('\n📋 Создание заказов...');

        const statuses = ['new', 'design', 'production', 'done', 'shipped'];
        const orderCategories = ['print', 'embroidery', 'merch', 'other'];

        for (let i = 0; i < 10; i++) {
            const clientId = clientIds[i];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const category = orderCategories[Math.floor(Math.random() * orderCategories.length)];

            // Создаем заказ
            const orderResult = await client.query(`
                INSERT INTO orders (client_id, status, category, total_amount, priority, deadline)
                VALUES ($1, $2, $3, 0, 'normal', NOW() + INTERVAL '7 days')
                RETURNING id
            `, [clientId, status, category]);

            const orderId = orderResult.rows[0].id;

            // Добавляем 2-4 товара в заказ
            const itemCount = 2 + Math.floor(Math.random() * 3);
            let totalAmount = 0;

            for (let j = 0; j < itemCount; j++) {
                const randomItem = itemIds[Math.floor(Math.random() * itemIds.length)];
                const quantity = 5 + Math.floor(Math.random() * 20);
                const price = randomItem.price;

                await client.query(`
                    INSERT INTO order_items (order_id, description, quantity, price, inventory_id)
                    VALUES ($1, $2, $3, $4, $5)
                `, [orderId, randomItem.name, quantity, price, randomItem.id]);

                totalAmount += quantity * price;
            }

            // Обновляем общую сумму заказа
            await client.query(`
                UPDATE orders SET total_amount = $1 WHERE id = $2
            `, [totalAmount, orderId]);

            console.log(`  ✅ Заказ #${i + 1} для ${clients[i].lastName} (${status}, ${totalAmount}₽)`);
        }

        console.log('\n✨ Тестовые данные успешно созданы!');

        // Статистика
        const stats = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM clients) as clients,
                (SELECT COUNT(*) FROM orders) as orders,
                (SELECT COUNT(*) FROM inventory_items) as items,
                (SELECT COUNT(*) FROM order_items) as order_items
        `);

        console.log('\n📊 Итоговая статистика:');
        console.log(`  Клиентов: ${stats.rows[0].clients}`);
        console.log(`  Заказов: ${stats.rows[0].orders}`);
        console.log(`  Товаров на складе: ${stats.rows[0].items}`);
        console.log(`  Позиций в заказах: ${stats.rows[0].order_items}`);

        await client.end();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Ошибка:', error.message);
        console.error(error);
        if (client) await client.end();
        process.exit(1);
    }
}

seedTestData();
