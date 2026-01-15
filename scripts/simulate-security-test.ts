import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../lib/db";
import { auditLogs, users } from "../lib/schema";
import { eq } from "drizzle-orm";

async function simulateSecurityTest() {
    console.log("🚀 Запуск теста безопасности на проде...");

    // 1. Находим админа для привязки логов (или создаем анонимный лог)
    const admin = await db.query.users.findFirst();
    if (!admin) {
        console.error("❌ Пользователи не найдены");
        return;
    }

    const testEntityId = "00000000-0000-0000-0000-000000000000" as any;

    try {
        // 2. Симуляция неудачного входа
        console.log("📝 Добавляем неудачную попытку входа...");
        await db.insert(auditLogs).values({
            userId: null,
            action: 'login_failed',
            entityType: 'auth',
            entityId: testEntityId,
            details: { email: 'hacker@example.com', reason: 'password_mismatch', ip: '192.168.1.101' }
        });

        // 3. Симуляция критического изменения профиля
        console.log("📝 Добавляем изменение профиля...");
        await db.insert(auditLogs).values({
            userId: admin.id,
            action: 'profile_update',
            entityType: 'user',
            entityId: admin.id,
            details: { changes: ['phone', 'telegram'], old: { phone: '123' }, new: { phone: '456' } }
        });

        // 4. Симуляция системной ошибки
        console.log("📝 Добавляем системную ошибку...");
        await db.insert(auditLogs).values({
            userId: null,
            action: 'system_error',
            entityType: 'system',
            entityId: testEntityId,
            details: { message: 'Failed to connect to S3 storage bucket "merch-crm-storage"', stack: 'Error: Connection timeout at ...' }
        });

        console.log("✅ Тестовые данные успешно добавлены!");
        console.log("Теперь обновите вкладку 'Безопасность' в панели администратора.");
    } catch (error) {
        console.error("❌ Ошибка при выполнении теста:", error);
    }
}

simulateSecurityTest();
