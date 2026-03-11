
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
    const { db } = await import("../lib/db");
    const { users, roles, departments, clients, orders, accounts } = await import("../lib/schema");
    const { hashPassword } = await import("../lib/password");
    const { eq } = await import("drizzle-orm");
    const crypto = await import("crypto");

    console.log("Creating test employees...");

    try {
        const allRoles = await db.select().from(roles);
        const allDepts = await db.select().from(departments);

        console.log(`Found ${allRoles.length} roles and ${allDepts.length} departments`);

        const passwordHash = await hashPassword("test123");

        for (const role of allRoles) {
            const email = `test_${role.name.toLowerCase().replace(/\s+/g, '_')}@example.com`;

            // Check if user already exists
            const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
            if (existing.length > 0) {
                console.log(`User ${email} already exists, skipping.`);
                continue;
            }

            // Find matching department for role if possible
            const dept = allDepts.find(d => d.id === role.departmentId) || allDepts[0];

            const [newUser] = await db.insert(users).values({
                name: `Тест ${role.name}`,
                email,
                roleId: role.id,
                departmentId: dept?.id,
            }).returning();

            await db.insert(accounts).values({
                id: crypto.randomUUID(),
                userId: newUser.id,
                providerId: "credential",
                accountId: email,
                password: passwordHash,
            });

            console.log(`✓ Created user: ${email} (Role: ${role.name})`);
        }

        console.log("\n✓ All test employees created successfully!");
    } catch (error) {
        console.error("Error creating test employees:", error);
    }

    process.exit(0);
}

main();
