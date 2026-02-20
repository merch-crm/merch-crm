import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/lib/schema";
import { db } from "@/lib/db";
const { auditLogs } = schema;
import { getSession } from "@/lib/auth";

type Transaction = NodePgDatabase<typeof schema> | Parameters<Parameters<NodePgDatabase<typeof schema>['transaction']>[0]>[0];

export async function logAction(
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>,
    tx?: Transaction
) {
    const session = await getSession();

    // Allow logging even if no session (e.g. system actions), but for now mostly user actions
    const userId = session?.id || null;

    try {
        const d = tx || db;
        await d.insert(auditLogs).values({
            userId,
            action,
            entityType,
            entityId,
            details: details || null,
        });
    } catch (error) {
        console.error("Failed to log action:", error);
        // Don't throw, so we don't block the main action if logging fails
    }
}
