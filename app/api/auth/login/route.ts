
import { encrypt } from "@/lib/auth";
import { comparePassword } from "@/lib/password";
import { logSecurityEvent } from "@/lib/security-logger";
import { logError } from "@/lib/error-logger";
import { NextResponse } from "next/server";
import { rateLimit, getClientIP, resetRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit-config";

export async function POST(request: Request) {
    const ip = getClientIP(request);
    const rateLimitKey = `login:${ip}`;

    // Проверка лимита
    const limit = await rateLimit(
        rateLimitKey,
        RATE_LIMITS.login.limit,
        RATE_LIMITS.login.windowSec
    );

    if (!limit.success) {
        return NextResponse.json(
            {
                error: RATE_LIMITS.login.message,
                retryAfter: limit.resetIn,
            },
            {
                status: 429,
                headers: { "Retry-After": String(limit.resetIn) },
            }
        );
    }

    try {
        const formData = await request.formData();
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
        }

        // console.log(`[API Login] Attempting login for email: '${email}'`);

        const { db } = await import('@/lib/db');
        const { users } = await import('@/lib/schema');
        const { eq } = await import('drizzle-orm');

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
            with: {
                role: true,
                department: true
            }
        });

        if (!user) {
            await logSecurityEvent({
                eventType: "login_failed",
                severity: "warning",
                entityType: "auth",
                details: { email, reason: 'user_not_found' }
            });
            return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
        }

        const passwordsMatch = await comparePassword(
            password,
            user.passwordHash
        );

        if (!passwordsMatch) {
            await logSecurityEvent({
                eventType: "login_failed",
                userId: user.id,
                severity: "warning",
                entityType: "auth",
                entityId: user.id,
                details: { email, reason: 'password_mismatch' }
            });
            return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
        }

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const sessionData = {
            id: user.id,
            email: user.email,
            roleId: user.roleId || "",
            roleName: user.role?.name || "User",
            departmentName: user.department?.name || "",
            name: user.name || "",
            expires,
        };

        const session = await encrypt(sessionData);

        // Create response with redirect
        const response = NextResponse.json({ success: true });

        // Set cookies directly on response
        response.cookies.set("session", session, {
            expires,
            httpOnly: true, // Secure cookie
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        // Log success
        await logSecurityEvent({
            eventType: "login_success",
            userId: user.id,
            severity: "info",
            entityType: "auth",
            entityId: user.id,
            details: {
                email: user.email,
                name: user.name,
                role: user.role?.name
            }
        });

        // Успешный логин — сбросить счётчик
        await resetRateLimit(rateLimitKey);

        console.log(`[API Login] Cookie set, returning success`);
        return response;

    } catch (error) {
        await logError({
            error,
            path: "/api/auth/login",
            method: "POST",
            details: {}
        });
        console.error("[API Login] Execution error:", error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера. Попробуйте позже." }, { status: 500 });
    }
}
