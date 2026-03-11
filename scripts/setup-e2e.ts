import { db } from "../lib/db";
import { users, roles, departments, clients, orders, accounts } from "../lib/schema";
import { eq, or, and } from "drizzle-orm";
import { hashPassword } from "../lib/password";

async function setup() {
    console.log("🚀 Starting E2E setup...");

    try {
        // 1. Ensure Admin Department exists
        let [dept] = await db.select({ id: departments.id, name: departments.name }).from(departments).where(eq(departments.name, "Администрация")).limit(1);
        if (!dept) {
            console.log("Creating Admin Department...");
            [dept] = await db.insert(departments).values({
                name: "Администрация",
                description: "Системный отдел для тестов",
                isSystem: true,
                color: "indigo"
            }).returning();
        }

        // 2. Ensure Administrator Role exists
        let [role] = await db.select({ id: roles.id, name: roles.name }).from(roles).where(eq(roles.name, "Администратор")).limit(1);
        if (!role) {
            console.log("Creating Administrator Role...");
            [role] = await db.insert(roles).values({
                name: "Администратор",
                isSystem: true,
                departmentId: dept.id,
                permissions: { all: true } // Simplified for tests
            }).returning();
        }

        // 3. Ensure Admin User exists
        const email = "admin@test.com";
        let [admin] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email)).limit(1);

        const passwordHash = await hashPassword("password123");

        if (!admin) {
            console.log(`Creating Admin User (${email})...`);
            [admin] = await db.insert(users).values({
                name: "E2E Administrator",
                email: email,
                roleId: role.id,
                departmentId: dept.id,
                isSystem: true
            }).returning();

            await db.insert(accounts).values({
                id: crypto.randomUUID(),
                userId: admin.id,
                providerId: "credential",
                accountId: email,
                password: passwordHash,
            });
        } else {
            console.log(`Admin User already exists. Updating password in accounts...`);
            await db.insert(accounts).values({
                id: crypto.randomUUID(),
                userId: admin.id,
                providerId: "credential",
                accountId: email,
                password: passwordHash,
            }).onConflictDoUpdate({
                target: [accounts.providerId, accounts.accountId],
                set: { password: passwordHash }
            });

            await db.update(users)
                .set({ roleId: role.id, departmentId: dept.id })
                .where(eq(users.id, admin.id));
        }

        // 4. Ensure Test Client exists
        let [testClient] = await db.select({ id: clients.id, phone: clients.phone }).from(clients).where(eq(clients.phone, "79001112233")).limit(1);
        if (!testClient) {
            console.log("Creating Test Client...");
            [testClient] = await db.insert(clients).values({
                firstName: "Тестовый",
                lastName: "Клиент",
                phone: "79001112233",
                email: "test@client.com",
                managerId: admin.id
            }).returning();
        }

        // 5. Ensure Test Order exists
        let [testOrder] = await db.select({ id: orders.id }).from(orders).where(eq(orders.clientId, testClient.id)).limit(1);
        if (!testOrder) {
            console.log("Creating Test Order...");
            await db.insert(orders).values({
                clientId: testClient.id,
                managerId: admin.id,
                status: "new",
                paymentStatus: "unpaid",
                totalAmount: "5000",
                orderNumber: `ORD-${Date.now().toString().slice(-6)}`
            });
        }

        console.log("✅ E2E setup completed successfully!");
    } catch (error) {
        console.error("❌ E2E setup failed:", error);
        process.exit(1);
    }
}

// Check if running as a script
if (require.main === module) {
    setup().then(() => process.exit(0));
}

export default setup;
