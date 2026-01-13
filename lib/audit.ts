import { db } from "@/lib/db";
import { auditLogs } from "@/lib/schema";
import { getSession } from "@/lib/auth";

export async function logAction(
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>
) {
    const session = await getSession();

    // Allow logging even if no session (e.g. system actions), but for now mostly user actions
    const userId = session?.id || null;

    try {
        await db.insert(auditLogs).values({
            userId,
            action,
            entityType,
            entityId,
            details,
        });
    } catch (error) {
        console.error("Failed to log action:", error);
        // Don't throw, so we don't block the main action if logging fails
    }
}
