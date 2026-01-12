import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    // Dynamic imports to ensure env vars are loaded first
    const { db } = await import("@/lib/db");
    const { users, roles } = await import("@/lib/schema");
    const { hashPassword } = await import("@/lib/auth");
    const { eq } = await import("drizzle-orm");

    console.log("Seeding roles and migrating users...");

    try {
        // 1. Create default roles
        const defaultRoles = [
            {
                name: "Администратор",
                permissions: {
                    orders: { view: true, create: true, edit: true, delete: true },
                    clients: { view: true, create: true, edit: true, delete: true },
                    inventory: { view: true, create: true, edit: true, delete: true },
                    users: { view: true, create: true, edit: true, delete: true },
                    roles: { view: true, create: true, edit: true, delete: true },
                    tasks: { view: true, create: true, edit: true, delete: true },
                    reports: { view: true },
                    categories: ["print", "embroidery", "merch", "other"]
                },
                isSystem: true
            },
            {
                name: "Отдел продаж",
                permissions: {
                    orders: { view: true, create: true, edit: true, delete: false },
                    clients: { view: true, create: true, edit: true, delete: false },
                    inventory: { view: true, create: false, edit: true, delete: false },
                    users: { view: false, create: false, edit: false, delete: false },
                    roles: { view: false, create: false, edit: false, delete: false },
                    tasks: { view: true, create: true, edit: true, delete: false },
                    reports: { view: true },
                    categories: ["print", "embroidery", "merch", "other"]
                },
                isSystem: true
            },
            {
                name: "Дизайнер",
                permissions: {
                    orders: { view: true, create: false, edit: true, delete: false },
                    clients: { view: true, create: false, edit: false, delete: false },
                    inventory: { view: false, create: false, edit: false, delete: false },
                    users: { view: false, create: false, edit: false, delete: false },
                    roles: { view: false, create: false, edit: false, delete: false },
                    tasks: { view: true, create: false, edit: true, delete: false },
                    reports: { view: false },
                    categories: ["print", "embroidery", "merch", "other"]
                },
                isSystem: true
            },
            {
                name: "Печать",
                permissions: {
                    orders: { view: true, create: false, edit: true, delete: false },
                    clients: { view: true, create: false, edit: false, delete: false },
                    inventory: { view: false, create: false, edit: false, delete: false },
                    users: { view: false, create: false, edit: false, delete: false },
                    roles: { view: false, create: false, edit: false, delete: false },
                    tasks: { view: true, create: false, edit: true, delete: false },
                    reports: { view: false },
                    categories: ["print"]
                },
                isSystem: true
            },
            {
                name: "Вышивка",
                permissions: {
                    orders: { view: true, create: false, edit: true, delete: false },
                    clients: { view: true, create: false, edit: false, delete: false },
                    inventory: { view: false, create: false, edit: false, delete: false },
                    users: { view: false, create: false, edit: false, delete: false },
                    roles: { view: false, create: false, edit: false, delete: false },
                    tasks: { view: true, create: false, edit: true, delete: false },
                    reports: { view: false },
                    categories: ["embroidery"]
                },
                isSystem: true
            },
            {
                name: "Склад",
                permissions: {
                    orders: { view: false, create: false, edit: false, delete: false },
                    clients: { view: false, create: false, edit: false, delete: false },
                    inventory: { view: true, create: true, edit: true, delete: false },
                    users: { view: false, create: false, edit: false, delete: false },
                    roles: { view: false, create: false, edit: false, delete: false },
                    tasks: { view: true, create: false, edit: true, delete: false },
                    reports: { view: false },
                    categories: []
                },
                isSystem: true
            }
        ];

        console.log("Creating default roles...");
        const createdRoles = await db.insert(roles).values(defaultRoles).returning();
        console.log(`✓ Created ${createdRoles.length} roles`);

        // 2. Create admin user if no users exist
        const existingUsers = await db.select().from(users);

        if (existingUsers.length === 0) {
            const adminRole = createdRoles.find(r => r.name === "Администратор");
            if (adminRole) {
                const passwordHash = await hashPassword("admin123");
                await db.insert(users).values({
                    name: "Администратор",
                    email: "admin@crm.local",
                    passwordHash,
                    roleId: adminRole.id,
                });
                console.log("✓ Created admin user: admin@crm.local / admin123");
            }
        } else {
            console.log(`Found ${existingUsers.length} existing users - skipping admin creation`);
        }

        console.log("\n✓ Seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }

    process.exit(0);
}

main();
