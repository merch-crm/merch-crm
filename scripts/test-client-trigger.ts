// Set SKIP_ENV_VALIDATION before importing any internal modules that use lib/env.ts
process.env.SKIP_ENV_VALIDATION = "true";

import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

// Now we can safe-import the database
import { db } from "../lib/db";
import { sql } from "drizzle-orm";


async function main() {
    console.log("🛠️ Testing trg_sync_client_stats trigger...");

    try {
        // 1. Создаем тестового клиента
        const [client] = await db.execute(sql`
            INSERT INTO clients (first_name, last_name, phone)
            VALUES ('Test', 'Trigger', '+79991234567')
            RETURNING id, total_orders_count, total_orders_amount
        `).then(res => res.rows);

        console.log(`👤 Создан клиент: ID ${client.id}, Заказов: ${client.total_orders_count}, Сумма: ${client.total_orders_amount}`);

        // 2. Создаем заказ для этого клиента
        console.log("📦 Создаем заказ на 1500...");
        const [order1] = await db.execute(sql`
            INSERT INTO orders (client_id, total_amount, status)
            VALUES (${client.id}, 1500, 'new')
            RETURNING id
        `).then(res => res.rows);

        // 3. Проверяем статистику клиента
        let [updatedClient] = await db.execute(sql`
            SELECT total_orders_count, total_orders_amount, average_check, rfm_score, rfm_segment
            FROM clients WHERE id = ${client.id}
        `).then(res => res.rows);

        console.log(`📊 После заказа 1: Заказов: ${updatedClient.total_orders_count}, Сумма: ${updatedClient.total_orders_amount}, Ср.чек: ${updatedClient.average_check}`);
        console.log(`🎯 RFM Score: ${updatedClient.rfm_score}, Segment: ${updatedClient.rfm_segment}`);

        // 4. Создаем второй заказ
        console.log("📦 Создаем второй заказ на 3000...");
        const [order2] = await db.execute(sql`
            INSERT INTO orders (client_id, total_amount, status)
            VALUES (${client.id}, 3000, 'new')
            RETURNING id
        `).then(res => res.rows);

        [updatedClient] = await db.execute(sql`
            SELECT total_orders_count, total_orders_amount, average_check, rfm_score, rfm_segment
            FROM clients WHERE id = ${client.id}
        `).then(res => res.rows);

        console.log(`📊 После заказа 2: Заказов: ${updatedClient.total_orders_count}, Сумма: ${updatedClient.total_orders_amount}, Ср.чек: ${updatedClient.average_check}`);
        console.log(`🎯 RFM Score: ${updatedClient.rfm_score}, Segment: ${updatedClient.rfm_segment}`);

        // 5. Удаляем один заказ
        console.log("🗑️ Удаляем первый заказ...");
        await db.execute(sql`DELETE FROM orders WHERE id = ${order1.id}`);

        [updatedClient] = await db.execute(sql`
            SELECT total_orders_count, total_orders_amount, average_check, rfm_score, rfm_segment
            FROM clients WHERE id = ${client.id}
        `).then(res => res.rows);

        console.log(`📊 После удаления: Заказов: ${updatedClient.total_orders_count}, Сумма: ${updatedClient.total_orders_amount}, Ср.чек: ${updatedClient.average_check}`);
        console.log(`🎯 RFM Score: ${updatedClient.rfm_score}, Segment: ${updatedClient.rfm_segment}`);


        // Очистка
        await db.execute(sql`DELETE FROM orders WHERE id = ${order2.id}`);
        await db.execute(sql`DELETE FROM clients WHERE id = ${client.id}`);
        console.log("🧹 Тестовые данные удалены.");

    } catch (error) {
        console.error("❌ Ошибка теста:", error);
    }
    
    process.exit(0);
}

main();
