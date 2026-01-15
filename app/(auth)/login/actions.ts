"use server";

import { db } from "@/lib/db";
import { users, roles, departments, auditLogs } from "@/lib/schema";
import { encrypt } from "@/lib/auth";
import { comparePassword } from "@/lib/password";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Заполните все поля" };
    }

    try {
        console.log(`[Login] Attempting login for email: ${email}`);
        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (user.length === 0) {
            console.log(`[Login] User not found: ${email}`);
            // Log failed login (user not found)
            await db.insert(auditLogs).values({
                action: 'login_failed',
                entityType: 'auth',
                entityId: 'system',
                details: { email, reason: 'user_not_found' }
            });
            return { error: "Неверный email или пароль" };
        }

        console.log(`[Login] User found, comparing passwords...`);
        const passwordsMatch = await comparePassword(
            password,
            user[0].passwordHash
        );

        if (!passwordsMatch) {
            console.log(`[Login] Password mismatch for user: ${email}`);
            // Log failed login (password mismatch)
            await db.insert(auditLogs).values({
                userId: user[0].id,
                action: 'login_failed',
                entityType: 'auth',
                entityId: user[0].id,
                details: { email, reason: 'password_mismatch' }
            });
            return { error: "Неверный email или пароль" };
        }


        console.log(`[Login] Password matched, creating session...`);
        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Fetch role name for session
        const role = user[0].roleId ? await db.query.roles.findFirst({
            where: eq(roles.id, user[0].roleId)
        }) : null;

        const department = user[0].departmentId ? await db.query.departments.findFirst({
            where: eq(departments.id, user[0].departmentId)
        }) : null;

        const sessionData = {
            id: user[0].id,
            email: user[0].email,
            roleId: user[0].roleId || "",
            roleName: role?.name || "User",
            departmentName: department?.name || user[0].departmentLegacy || "",
            name: user[0].name || "",
            expires,
        };

        const session = await encrypt(sessionData);

        console.log(`[Login] Session encrypted, setting cookie...`);
        (await cookies()).set("session", session, {
            expires,
            httpOnly: true,
            secure: false, // process.env.NODE_ENV === "production", // Temprary disabled for HTTP access
            sameSite: "lax",
        });
        console.log(`[Login] Cookie set, redirecting to dashboard...`);
    } catch (error) {
        console.error("[Login] Execution error:", error);
        return { error: `Ошибка сервера: ${(error as Error).message}` };
    }

    redirect("/dashboard");
}
