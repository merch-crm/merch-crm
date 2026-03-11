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
    tx?: Transaction,
    actionCategory?: string
) {
    const session = await getSession();
    const userId = session?.id || null;

    // entity_id is UUID in DB. If we get "list" or "all", it's not a UUID.
    // In that case, we set entityId to a dummy NULL or skip it if allowed, 
    // but schema says it's NOT NULL.
    // So we'll try to parse it, and if it fails, we'll use a nil UUID and put the real string in details.
    
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
        // Don't throw, so we don't block the main action if logging fails
    }
}
