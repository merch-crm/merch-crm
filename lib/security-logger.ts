import { db } from "@/lib/db";
import { securityEvents } from "@/lib/schema";
import { headers } from "next/headers";

type SecurityEventType =
    | "login_success"
    | "login_failed"
    | "logout"
    | "password_change"
    | "email_change"
    | "profile_update"
    | "role_change"
    | "permission_change"
    | "data_export"
    | "record_delete"
    | "settings_change"
    | "maintenance_mode_toggle"
    | "system_error"
    | "admin_impersonation_start"
    | "admin_impersonation_stop";

type SecurityEventSeverity = "info" | "warning" | "critical";

interface LogSecurityEventParams {
    eventType: SecurityEventType;
    userId?: string;
    severity?: SecurityEventSeverity;
    entityType?: string;
    entityId?: string;
    details?: Record<string, unknown>;
}

/**
 * Log a security event to the database
 * Automatically captures IP address and user agent from request headers
 */
export async function logSecurityEvent({
    eventType,
    userId,
    severity = "info",
    entityType,
    entityId,
    details,
}: LogSecurityEventParams) {
    try {
        // Get request headers
        const headersList = await headers();
        const ipAddress = (headersList.get("x-forwarded-for") as string)?.split(",")[0] ||
            headersList.get("x-real-ip") ||
            "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        // Insert security event
        await db.insert(securityEvents).values({
            userId: userId || null,
            eventType,
            severity,
            ipAddress,
            userAgent,
            entityType: entityType || null,
            entityId: entityId || null,
            details: details || null,
        });

        console.log(`[Security Event] ${eventType} - User: ${userId || "anonymous"} - Severity: ${severity}`);
    } catch (error) {
        console.error("Failed to log security event:", error);
        // Don't throw - we don't want to break the main flow if logging fails
    }
}

/**
 * Helper function to determine severity based on event type
 */
export function getEventSeverity(eventType: SecurityEventType): SecurityEventSeverity {
    const criticalEvents: SecurityEventType[] = [
        "role_change",
        "permission_change",
        "maintenance_mode_toggle",
        "system_error",
    ];

    const warningEvents: SecurityEventType[] = [
        "login_failed",
        "data_export",
        "record_delete",
        "settings_change",
    ];

    if (criticalEvents.includes(eventType)) return "critical";
    if (warningEvents.includes(eventType)) return "warning";
    return "info";
}
