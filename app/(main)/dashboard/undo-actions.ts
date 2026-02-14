"use server";

import { db } from "@/lib/db";
import { auditLogs, clients, inventoryItems, orders } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface LogDetails {
    previousState?: unknown;
    [key: string]: unknown;
}

import { ActionResult } from "@/lib/types";

export async function undoLastAction(): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        // Find last reversible action for this user
        const lastLog = await db.query.auditLogs.findFirst({
            where: eq(auditLogs.userId, session.id),
            orderBy: [desc(auditLogs.createdAt)],
        });

        if (!lastLog) return { success: false, error: "Нет действий для отмены" };

        const details = lastLog.details as LogDetails;
        if (!details || !details.previousState) {
            return { success: false, error: "Это действие нельзя отменить автоматически" };
        }

        const { entityType, entityId } = lastLog;

        if (entityType === "client") {
            // Revert client update
            await db.update(clients)
                .set(details.previousState as Partial<typeof clients.$inferInsert>)
                .where(eq(clients.id, entityId));
        } else if (entityType === "inventory_item") {
            // Revert inventory update
            await db.update(inventoryItems)
                .set(details.previousState as Partial<typeof inventoryItems.$inferInsert>)
                .where(eq(inventoryItems.id, entityId));
        } else if (entityType === "order") {
            // Revert order status update
            const prevState = details.previousState as { status?: string; cancelReason?: string | null };
            await db.update(orders)
                .set({
                    status: prevState.status as typeof orders.$inferInsert.status,
                    cancelReason: prevState.cancelReason || null
                })
                .where(eq(orders.id, entityId));
        } else {
            return { success: false, error: "Тип данных не поддерживает авто-отмену" };
        }

        // Delete the audit log entry for the action we just undid to prevent double-undo
        // Wait, better to ADD an "undo" log entry
        await db.insert(auditLogs).values({
            userId: session.id,
            action: `Отмена: ${lastLog.action}`,
            entityType,
            entityId,
            details: { undidLogId: lastLog.id }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Undo failed:", error);
        return { success: false, error: "Ошибка при отмене действия" };
    }
}
