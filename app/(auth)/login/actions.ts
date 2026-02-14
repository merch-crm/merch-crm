"use server";

import { encrypt } from "@/lib/auth";
import { comparePassword } from "@/lib/password";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { logSecurityEvent } from "@/lib/security-logger";
import { logError } from "@/lib/error-logger";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit-config";

export async function loginAction(prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Заполните все поля" };
    }

    // Rate limiting — prevent brute-force via server action
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
        || headersList.get("x-real-ip")
        || "unknown";
    const rateLimitKey = `login:${ip}`;

    const limit = await rateLimit(
        rateLimitKey,
        RATE_LIMITS.login.limit,
        RATE_LIMITS.login.windowSec
    );

    if (!limit.success) {
        return { error: RATE_LIMITS.login.message };
    }

    try {
        // Use direct SQL query to avoid prepared statement issues with Drizzle
        const { pool } = await import('@/lib/db');

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 LIMIT 1',
            [email]
        );

        const user = result.rows;

        if (user.length === 0) {
            // Log to security events
            await logSecurityEvent({
                eventType: "login_failed",
                severity: "warning",
                entityType: "auth",
                details: { reason: 'user_not_found' }
            });

            return { error: "Неверный email или пароль" };
        }

        const passwordsMatch = await comparePassword(
            password,
            user[0].password_hash
        );

        if (!passwordsMatch) {
            // Log to security events
            await logSecurityEvent({
                eventType: "login_failed",
                userId: user[0].id,
                severity: "warning",
                entityType: "auth",
                entityId: user[0].id,
                details: { reason: 'password_mismatch' }
            });

            return { error: "Неверный email или пароль" };
        }

        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Fetch role name for session using direct SQL
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
            departmentName: department?.name || "",
            name: user[0].name || "",
            expires,
        };

        const session = await encrypt(sessionData);

        const cookieStore = await cookies();

        const { getSessionCookieOptions } = await import("@/lib/auth");
        cookieStore.set("session", session, getSessionCookieOptions(expires));

        // Log successful login to security events
        await logSecurityEvent({
            eventType: "login_success",
            userId: user[0].id,
            severity: "info",
            entityType: "auth",
            entityId: user[0].id,
            details: {
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
                { name: user[0].name }
            );
        } catch {
            // Audit logging is non-critical
        }

        // Reset rate limit on successful login
        await resetRateLimit(rateLimitKey);
    } catch (error) {
        await logError({
            error,
            path: "/login",
            method: "loginAction",
            details: {}
        });
        console.error("[Login] Execution error:", error);
        return { error: "Внутренняя ошибка сервера. Попробуйте позже." };
    }

    // Redirect after successful login
    redirect("/dashboard");
}
