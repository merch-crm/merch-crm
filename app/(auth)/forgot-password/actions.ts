"use server";

import { okVoid } from "@/lib/types";

import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-logger";
import { logError } from "@/lib/error-logger";
import { auth } from "@/lib/auth";

import { z } from "zod";

export interface ForgotPasswordResult {
    success: boolean;
    error?: string;
    retryAfter?: number;
}

const ForgotPasswordSchema = z.object({
    email: z.string().email("Некорректный email адрес"),
});

export async function forgotPasswordAction(
    email: string
): Promise<ForgotPasswordResult> {
    // audit-ignore: Public action (auth not required for forgot password)
    // audit-ignore: Handled by better-auth
    const validated = ForgotPasswordSchema.safeParse({ email });
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const headersList = await headers();

    const ip =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        "unknown";

    const userAgent = headersList.get("user-agent") || "unknown";

    // ─── Лимит по IP: 3 запроса / час ────────────────────────────────
    const ipKey = `password-reset:ip:${ip}`;
    const ipLimit = await rateLimit(
        ipKey,
        3,
        3600,
        true
    );

    if (!ipLimit.success) {
        await logSecurityEvent({
            eventType: "rate_limit_exceeded",
            severity: "warning",
            entityType: "auth",
            details: {
                action: "password_reset",
                ip,
                reason: "ip_limit",
            },
        });

        return {
            success: false,
            error: "Слишком много попыток сброса пароля. Попробуйте позже.",
            retryAfter: ipLimit.resetIn,
        };
    }

    // ─── Лимит по Email: 3 запроса / час ─────────────────────────────
    const emailKey = `password-reset:email:${email.toLowerCase()}`;
    const emailLimit = await rateLimit(
        emailKey,
        3,
        3600,
        true
    );

    if (!emailLimit.success) {
        await logSecurityEvent({
            eventType: "rate_limit_exceeded",
            severity: "warning",
            entityType: "auth",
            details: {
                action: "password_reset",
                ip,
                email,
                reason: "email_limit",
            },
        });

        return {
            success: false,
            // Не раскрываем, что лимит по email — anti-enumeration
            error: "Слишком много попыток сброса пароля. Попробуйте позже.",
            retryAfter: emailLimit.resetIn,
        };
    }

    // ─── Вызов Better Auth requestPasswordReset ───────────────────────
    try {
        await auth.api.requestPasswordReset({
            body: {
                email,
                redirectTo: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/reset-password`,
            },
        });

        await logSecurityEvent({
            eventType: "password_reset_requested",
            severity: "info",
            entityType: "auth",
            details: { ip, email, userAgent },
        });

        return okVoid();
    } catch (error) {
        await logError({
            error,
            path: "/forgot-password",
            method: "forgotPasswordAction",
            details: { ip, email },
        });

        // Всегда возвращаем успех — не раскрываем внутренние ошибки
        return okVoid();
    }
}
