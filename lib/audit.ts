import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { auditLogs } from "@/lib/schema/system";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

type Transaction = NodePgDatabase<Record<string, unknown>> | Parameters<Parameters<NodePgDatabase<Record<string, unknown>>['transaction']>[0]>[0];

export async function logAction(
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>,
    tx?: Transaction,
    actionCategory?: string,
    options?: { critical?: boolean; userId?: string }
) {
    let userId = options?.userId || null;
    
    if (!userId) {
        const session = await getSession();
        userId = session?.id || null;
    }

    let dbEntityId = entityId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entityId);
    
    if (!isUuid) {
        dbEntityId = '00000000-0000-0000-0000-000000000000';
        details = { ...details, originalEntityId: entityId };
    }

    try {
        const d = tx || db;
        await d.insert(auditLogs).values({
            userId,
            action,
            actionCategory: actionCategory || null,
            entityType,
            entityId: dbEntityId,
            details: (details as Record<string, unknown>) || null,
        });
    } catch (error) {
        console.error("Failed to log action:", error);
        if (options?.critical) {
            throw new Error(`Critical audit logging failed: ${error}`);
        }
    }
}
