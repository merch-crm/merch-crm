import { db } from "@/lib/db";
import { systemErrors } from "@/lib/schema";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";

interface LogErrorParams {
    error: Error | unknown;
    severity?: "error" | "warning" | "critical";
    details?: Record<string, unknown>;
    path?: string;
    method?: string;
}

/**
 * Логирует системную ошибку в базу данных.
 * Автоматически собирает данные о сессии, IP и User-Agent.
 */
export async function logError({
    error,
    severity = "error",
    details,
    path,
    method,
}: LogErrorParams) {
    try {
        const session = await getSession();
        const headersList = await headers();

        const ipAddress = (headersList.get("x-forwarded-for") as string)?.split(",")[0] ||
            headersList.get("x-real-ip") ||
            "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        const errorObj = error instanceof Error ? error : new Error(String(error));

        await db.insert(systemErrors).values({
            userId: session?.id || null,
            message: errorObj.message,
            stack: errorObj.stack || null,
            path: path || null,
            method: method || null,
            ipAddress,
            userAgent,
            severity,
            details: details || null,
        });

        console.error(`[System Error] ${errorObj.message} - Severity: ${severity} - Path: ${path || 'N/A'}`);
    } catch (loggingError) {
        // Если само логирование упало, пишем в консоль, чтобы не зациклиться
        console.error("CRITICAL: Failed to log system error:", loggingError);
    }
}
