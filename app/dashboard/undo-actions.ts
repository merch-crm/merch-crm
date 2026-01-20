"use server";

import { db } from "@/lib/db";
import { auditLogs, clients, inventoryItems, orders } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function undoLastAction() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        // Find last reversible action for this user
        const lastLog = await db.query.auditLogs.findFirst({
            where: eq(auditLogs.userId, session.id),
            orderBy: [desc(auditLogs.createdAt)],
        });

        if (!lastLog) return { error: "Нет действий для отмены" };

        const details = lastLog.details as any;
        if (!details || !details.previousState) {
            return { error: "Это действие нельзя отменить автоматически" };
        }

        const { entityType, entityId } = lastLog;

        if (entityType === "client") {
            // Revert client update
            await db.update(clients)
                .set(details.previousState)
                .where(eq(clients.id, entityId));
        } else if (entityType === "inventory_item") {
            // Revert inventory update
            await db.update(inventoryItems)
                .set(details.previousState)
                .where(eq(inventoryItems.id, entityId));
        } else if (entityType === "order") {
            // Revert order status update
            await db.update(orders)
                .set({
                    status: details.previousState.status,
                    cancelReason: details.previousState.cancelReason || null
                })
                .where(eq(orders.id, entityId));
        } else {
            return { error: "Тип данных не поддерживает авто-отмену" };
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
        return { error: "Ошибка при отмене действия" };
    }
}
