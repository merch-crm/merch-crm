import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// Load environment variables
dotenv.config();

async function main() {
    console.log("🔌 Connecting to database...");

    // Dynamic imports to handle path aliases
    const { db } = await import("../lib/db");
    const { auditLogs, users } = await import("../lib/schema");
    const { eq } = await import("drizzle-orm");

    console.log("🚀 Simulating production events for security audit...");

    try {
        // 1. Get a valid user to attach events to
        const user = await db.query.users.findFirst();
        const userId = user?.id; // If no user, we might fail on userId constraint if not nullable?
        // auditLogs.userId is nullable: userId: uuid("user_id").references(() => users.id),

        const validUserId = userId || null;
        const fakeUuid = randomUUID();

        console.log(`👤 Using User ID: ${validUserId ?? "Anonymous"}`);

        // 2. Insert Failed Logins
        console.log("🔓 Injecting failed login attempts...");
        await db.insert(auditLogs).values({
            action: 'login_failed',
            entityType: 'auth',
            entityId: validUserId || fakeUuid, // must be uuid
            details: {
                email: 'hacker@bruteforce.com',
                reason: 'user_not_found',
                user_agent: 'Mozilla/5.0 (Kali Linux)',
                ip: '45.33.22.11'
            },
            createdAt: new Date() // Now
        });

        // 3. Insert Sensitive Actions
        console.log("⚠️  Injecting sensitive actions (Profile Update)...");
        if (validUserId) {
            await db.insert(auditLogs).values({
                userId: validUserId,
                action: 'profile_update',
                entityType: 'user',
                entityId: validUserId,
                details: { field: 'avatar', method: 'user_update' },
                createdAt: new Date()
            });

            await db.insert(auditLogs).values({
                userId: validUserId,
                action: 'password_change',
                entityType: 'user',
                entityId: validUserId,
                details: { initiated_by: 'user' },
                createdAt: new Date()
            });
        }

        // 4. Insert System Error
        console.log("🚨 Injecting system error...");
        await db.insert(auditLogs).values({
            action: 'system_error',
            entityType: 'system',
            entityId: fakeUuid,
            details: {
                error: 'PaymentGatewayTimeout',
                message: 'Connection timed out after 3000ms',
                service: 'stripe-integration'
            },
            createdAt: new Date()
        });

        console.log("✅ Simulation complete! Verify the data in the Admin Dashboard > Backups/Security.");

    } catch (error) {
        console.error("❌ Error simulating events:", error);
    }

    process.exit(0);
}

main();
