import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { auditLogs, users } from "../lib/schema";
import { eq, desc } from "drizzle-orm";
import * as schema from "../lib/schema";

async function run() {
    const pool = new Pool({
        connectionString: "postgres://postgres:postgres@127.0.0.1:5432/merch_crm",
        ssl: false
    });

    const db = drizzle(pool, { schema });

    console.log("🚀 Запуск прямого SQL теста...");

    const admin = await db.query.users.findFirst();
    const testEntityId = "00000000-0000-0000-0000-000000000000";

    await db.insert(auditLogs).values({
        userId: null,
        action: 'login_failed',
        entityType: 'auth',
        entityId: testEntityId,
        details: { email: 'test_security@example.com', reason: 'password_mismatch', ip: '8.8.8.8' }
    });

    await db.insert(auditLogs).values({
        userId: admin?.id,
        action: 'profile_update',
        entityType: 'user',
        entityId: admin?.id || testEntityId,
        details: { changes: ['security_test'], info: 'Manual security check' }
    });

    await db.insert(auditLogs).values({
        userId: null,
        action: 'system_error',
        entityType: 'system',
        entityId: testEntityId,
        details: { message: 'SIMULATED ERROR: Security monitor heartbeat failed', status: 500 }
    });

    console.log("✅ Тестовые логи созданы.");
    await pool.end();
}

run();
