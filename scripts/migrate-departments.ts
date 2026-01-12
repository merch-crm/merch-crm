import { db } from "../lib/db";
import { departments } from "../lib/schema";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    console.log("Creating departments table if not exists...");

    // Create the table using raw SQL as a simple way to apply the change without full drizzle-kit setup for this step
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "departments" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "name" text NOT NULL UNIQUE,
            "description" text,
            "color" text DEFAULT 'indigo',
            "is_active" boolean DEFAULT true NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
        );
    `);

    console.log("Adding department_id to users table...");
    try {
        await db.execute(sql`
            ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department_id" uuid REFERENCES "departments"("id");
        `);
    } catch (e) {
        console.log("department_id column might already exist");
    }

    console.log("Seeding initial departments...");
    const initialDepartments = [
        { name: "Руководство", color: "rose", description: "Административное управление компанией" },
        { name: "Дизайн", color: "purple", description: "Разработка макетов и дизайн продукции" },
        { name: "Производство", color: "amber", description: "Печать, вышивка и изготовление продукции" }
    ];

    for (const dept of initialDepartments) {
        try {
            await db.insert(departments).values(dept).onConflictDoNothing();
            console.log(`- Created department: ${dept.name}`);
        } catch (e) {
            console.error(`Error creating department ${dept.name}:`, e);
        }
    }

    console.log("Migration and seeding completed successfully!");
    process.exit(0);
}

main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
