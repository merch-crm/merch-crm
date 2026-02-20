"use server";

import { db } from "@/lib/db";
import { auditLogs, clients, inventoryItems, orders } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/error-logger";
import { ActionResult } from "@/lib/types";
import { z } from "zod";

interface LogDetails {
    previousState?: unknown;
    [key: string]: unknown;
}

const undoSchema = z.void();

export async function undoLastAction(): Promise<ActionResult> {
    undoSchema.parse(undefined); // Validation check
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

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

        await db.transaction(async (tx) => {
            if (entityType === "client") {
                // Revert client update
                await tx.update(clients)
                    .set(details.previousState as Partial<typeof clients.$inferInsert>)
                    .where(eq(clients.id, entityId));
            } else if (entityType === "inventory_item") {
                // Revert inventory update
                await tx.update(inventoryItems)
                    .set(details.previousState as Partial<typeof inventoryItems.$inferInsert>)
                    .where(eq(inventoryItems.id, entityId));
            } else if (entityType === "order") {
                // Revert order status update
                const prevState = details.previousState as { status?: string; cancelReason?: string | null };
                await tx.update(orders)
                    .set({
                        status: prevState.status as "new" | "design" | "production" | "done" | "shipped" | "cancelled",
                        cancelReason: prevState.cancelReason || null
                    })
                    .where(eq(orders.id, entityId));
            } else {
                throw new Error("Тип данных не поддерживает авто-отмену");
            }

            // Add an "undo" log entry
            await tx.insert(auditLogs).values({
                userId: session.id,
                action: `Отмена: ${lastLog.action}`,
                entityType,
                entityId,
                details: { undidLogId: lastLog.id }
            });
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/undo",
            method: "undoLastAction"
        });
        return { success: false, error: "Ошибка при отмене действия" };
    }
}
