import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

async function main() {
    const { db } = await import("@/lib/db");
    const { users, roles } = await import("@/lib/schema");
    const { eq } = await import("drizzle-orm");

    console.log("Starting data migration...");

    try {
        // 1. Get all existing users with old 'role' column
        const existingUsers = await db.execute(sql`SELECT id, role FROM users WHERE role IS NOT NULL`);

        if (existingUsers.rows.length === 0) {
            console.log("No users to migrate");
            return;
        }

        console.log(`Found ${existingUsers.rows.length} users to migrate`);

        // 2. Get all roles
        const allRoles = await db.select().from(roles);

        // Map old role names to new role names
        const roleMapping: Record<string, string> = {
            'admin': 'Администратор',
            'sales': 'Отдел продаж',
            'designer': 'Дизайнер',
            'printer': 'Печать',
            'warehouse': 'Склад'
        };

        // 3. Update each user with the new role_id
        for (const user of existingUsers.rows) {
            const oldRole = user.role as string;
            const newRoleName = roleMapping[oldRole] || 'Отдел продаж'; // Default to sales
            const newRole = allRoles.find(r => r.name === newRoleName);

            if (newRole) {
                await db.execute(
                    sql`UPDATE users SET role_id = ${newRole.id} WHERE id = ${user.id}`
                );
                console.log(`✓ Migrated user ${user.id}: ${oldRole} → ${newRoleName}`);
            }
        }

        console.log("\n✓ Data migration completed successfully!");
        console.log("You can now safely apply the schema migration to drop the old 'role' column");
    } catch (error) {
        console.error("Error during migration:", error);
        throw error;
    }

    process.exit(0);
}

main();
