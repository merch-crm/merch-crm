import { Navbar } from "@/components/layout/navbar";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    // Fetch full user data with role and department info
    let userData;
    try {
        userData = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: {
                role: true,
                department: true
            }
        });
    } catch (e) {
        console.error("DashboardLayout: DB Error detected, attempting auto-fix...", e);
        // If it fails, maybe departments or orders are missing.
        // Let's at least try to fix 'departments' and 'users.department_id'
        try {
            const { sql } = await import("drizzle-orm");
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
            await db.execute(sql`
                ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "department_id" uuid REFERENCES "departments"("id");
            `);

            // Also check for 'orders'
            try {
                await db.execute(sql`CREATE TYPE "order_status" AS ENUM ('new', 'design', 'production', 'done', 'shipped');`);
            } catch (err) { }
            try {
                await db.execute(sql`CREATE TYPE "order_category" AS ENUM ('print', 'embroidery', 'merch', 'other');`);
            } catch (err) { }

            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "orders" (
                    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                    "client_id" uuid NOT NULL REFERENCES "clients"("id"),
                    "status" "order_status" DEFAULT 'new' NOT NULL,
                    "category" "order_category" DEFAULT 'other' NOT NULL,
                    "total_amount" decimal(10, 2) DEFAULT 0,
                    "priority" text DEFAULT 'normal',
                    "deadline" timestamp,
                    "created_by" uuid REFERENCES "users"("id"),
                    "created_at" timestamp DEFAULT now() NOT NULL
                );
            `);

            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "order_items" (
                    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                    "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
                    "description" text NOT NULL,
                    "quantity" integer NOT NULL,
                    "price" decimal(10, 2) NOT NULL
                );
            `);

            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "order_attachments" (
                    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                    "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
                    "file_name" text NOT NULL,
                    "file_key" text NOT NULL,
                    "file_url" text NOT NULL,
                    "file_size" integer,
                    "content_type" text,
                    "created_by" uuid NOT NULL REFERENCES "users"("id"),
                    "created_at" timestamp DEFAULT now() NOT NULL
                );
            `);

            // Re-try fetching
            userData = await db.query.users.findFirst({
                where: eq(users.id, session.id),
                with: {
                    role: true,
                    department: true
                }
            });
        } catch (fixError) {
            console.error("Auto-fix failed:", fixError);
            throw e; // Throw original error if fix failed
        }
    }

    if (!userData) {
        redirect("/login");
    }

    const user = {
        name: userData.name,
        email: userData.email,
        roleName: userData.role?.name || "Пользователь",
        departmentName: userData.department?.name || ""
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <Navbar user={user} />
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
