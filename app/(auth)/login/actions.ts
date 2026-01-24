"use server";

import { encrypt } from "@/lib/auth";
import { comparePassword } from "@/lib/password";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logSecurityEvent } from "@/lib/security-logger";
import { logError } from "@/lib/error-logger";

export async function loginAction(prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Заполните все поля" };
    }

    try {
        console.log(`[Login] Attempting login for email: ${email}`);

        // Use direct SQL query to avoid prepared statement issues with Drizzle
        const { pool } = await import('@/lib/db');

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 LIMIT 1',
            [email]
        );

        const user = result.rows;

        if (user.length === 0) {
            console.log(`[Login] User not found: ${email}`);

            // Log to security events
            await logSecurityEvent({
                eventType: "login_failed",
                severity: "warning",
                entityType: "auth",
                details: { email, reason: 'user_not_found' }
            });

            return { error: "Неверный email или пароль" };
        }

        console.log(`[Login] User found, comparing passwords...`);
        const passwordsMatch = await comparePassword(
            password,
            user[0].password_hash
        );

        if (!passwordsMatch) {
            console.log(`[Login] Password mismatch for user: ${email}`);

            // Log to security events
            await logSecurityEvent({
                eventType: "login_failed",
                userId: user[0].id,
                severity: "warning",
                entityType: "auth",
                entityId: user[0].id,
                details: { email, reason: 'password_mismatch' }
            });

            return { error: "Неверный email или пароль" };
        }


        console.log(`[Login] Password matched, creating session...`);
        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Fetch role name for session using direct SQL (pool already imported above)

        let role = null;
        if (user[0].role_id) {
            const roleResult = await pool.query(
                'SELECT * FROM roles WHERE id = $1 LIMIT 1',
                [user[0].role_id]
            );
            role = roleResult.rows[0] || null;
        }

        let department = null;
        if (user[0].department_id) {
            const deptResult = await pool.query(
                'SELECT * FROM departments WHERE id = $1 LIMIT 1',
                [user[0].department_id]
            );
            department = deptResult.rows[0] || null;
        }

        const sessionData = {
            id: user[0].id,
            email: user[0].email,
            roleId: user[0].role_id || "",
            roleName: role?.name || "User",
            departmentName: department?.name || user[0].department_legacy || "",
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

        // Log successful login to security events
        await logSecurityEvent({
            eventType: "login_success",
            userId: user[0].id,
            severity: "info",
            entityType: "auth",
            entityId: user[0].id,
            details: {
                email: user[0].email,
                name: user[0].name,
                role: role?.name
            }
        });

        // Log to general audit logs as well
        try {
            const { logAction } = await import('@/lib/audit');
            await logAction(
                "Вход в систему",
                "auth",
                user[0].id,
                { email: user[0].email, name: user[0].name }
            );
        } catch (auditError) {
            console.error("Audit logging failed:", auditError);
        }

        console.log(`[Login] Cookie set, redirecting to dashboard...`);
    } catch (error) {
        await logError({
            error,
            path: "/login",
            method: "loginAction",
            details: { email }
        });
        console.error("[Login] Execution error:", error);
        return { error: `Ошибка сервера: ${(error as Error).message}` };
    }

    redirect("/dashboard");
}
