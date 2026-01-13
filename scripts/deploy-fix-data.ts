
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
    // Dynamic imports moved inside main to avoid top-level await issues in CJS
    const { db } = await import("@/lib/db");
    const { users, roles, departments } = await import("@/lib/schema");
    const { eq } = await import("drizzle-orm");

    console.log("Starting data restoration...");

    // 1. Ensure User Departments exist
    console.log("\nChecking Departments...");
    const departmentList = [
        { name: "Руководство", color: "rose", description: "Административное управление компанией" },
        { name: "Отдел продаж", color: "emerald", description: "Работа с клиентами и заказами" },
        { name: "Дизайн", color: "purple", description: "Разработка макетов и дизайн продукции" },
        { name: "Производство", color: "amber", description: "Печать, вышивка и изготовление продукции" },
        { name: "Склад", color: "slate", description: "Учет материалов и товаров" },
    ];

    for (const dept of departmentList) {
        await db.insert(departments)
            .values(dept)
            .onConflictDoNothing();
    }
    console.log(`✓ Departments up to date`);

    // 2. Fix Admin User Links
    console.log("\nFixing Admin User...");
    const adminUser = await db.query.users.findFirst({
        where: eq(users.email, "admin@crm.local")
    });

    if (adminUser) {
        // Find Management Department
        const mgmtDept = await db.query.departments.findFirst({
            where: eq(departments.name, "Руководство")
        });

        // Find Admin Role
        const adminRole = await db.query.roles.findFirst({
            where: eq(roles.name, "Администратор")
        });

        if (mgmtDept && adminRole) {
            await db.update(users)
                .set({
                    departmentId: mgmtDept.id,
                    roleId: adminRole.id
                })
                .where(eq(users.id, adminUser.id));
            console.log(`✓ Admin user linked to Role: ${adminRole.name} and Department: ${mgmtDept.name}`);
        } else {
            console.error("❌ Critical: Could not find Admin Role or Management Department");
        }
    } else {
        console.error("❌ Critical: Admin user not found");
    }

    console.log("\n✓ Data restoration complete!");
    process.exit(0);
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
