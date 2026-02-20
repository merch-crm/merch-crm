"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { BulkOrdersSchema, UpdateOrderPrioritySchema } from "../validation";
import { ActionResult } from "@/lib/types";
import { updateOrderStatus } from "./status.actions";
import { releaseOrderReservation } from "./utils";

const { orders, users } = schema;

export async function bulkUpdateOrderStatus(orderIds: string[], newStatus: (typeof orders.$inferInsert)["status"]): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validatedIds = BulkOrdersSchema.safeParse({ orderIds });
        if (!validatedIds.success) return { success: false, error: validatedIds.error.issues[0].message };

        for (const orderId of validatedIds.data.orderIds) {
            const res = await updateOrderStatus(orderId, newStatus as string);
            if (!res.success) {
                await logError({ error: new Error(res.error), path: "/dashboard/orders/bulk", method: "bulkUpdateOrderStatus_single" });
            }
        }
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/orders/bulk", method: "bulkUpdateOrderStatus" });
        return { success: false, error: "Ошибка" };
    }
}

export async function bulkUpdateOrderPriority(orderIds: string[], newPriority: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validatedIds = BulkOrdersSchema.safeParse({ orderIds });
        const validatedPriority = UpdateOrderPrioritySchema.safeParse({ priority: newPriority });
        if (!validatedIds.success || !validatedPriority.success) return { success: false, error: "Ошибка валидации" };

        await db.transaction(async (tx) => {
            await tx.update(orders).set({ priority: validatedPriority.data.priority, updatedAt: new Date() }).where(inArray(orders.id, validatedIds.data.orderIds));
            for (const orderId of validatedIds.data.orderIds) {
                await logAction("Обновлен приоритет (массово)", "order", orderId, { priority: newPriority }, tx);
            }
        });
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/orders/bulk", method: "bulkUpdateOrderPriority" });
        return { success: false, error: "Ошибка" };
    }
}

export async function bulkArchiveOrders(orderIds: string[], archive: boolean = true): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const user = await db.query.users.findFirst({ where: eq(users.id, session.id), with: { role: true, department: true } });
        const canArchive = user?.role?.name === "Администратор" || user?.department?.name === "Руководство" || user?.department?.name === "Отдел продаж";
        if (!canArchive) return { success: false, error: "Недостаточно прав" };

        await db.transaction(async (tx) => {
            await tx.update(orders).set({ isArchived: archive, updatedAt: new Date() }).where(inArray(orders.id, orderIds));
            for (const orderId of orderIds) {
                await logAction(archive ? "Архивирован заказ (массово)" : "Восстановлен заказ (массово)", "order", orderId, undefined, tx);
            }
        });
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/orders/bulk", method: "bulkArchiveOrders" });
        return { success: false, error: "Ошибка" };
    }
}

export async function bulkDeleteOrders(orderIds: string[]): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const user = await db.query.users.findFirst({ where: eq(users.id, session.id), with: { role: true, department: true } });
        if (user?.role?.name !== "Администратор" && user?.department?.name !== "Руководство") return { success: false, error: "Недостаточно прав" };

        await db.transaction(async (tx) => {
            const ordersToDelete = await tx.query.orders.findMany({ where: inArray(orders.id, orderIds), limit: 100 });
            for (const order of ordersToDelete) {
                if (["new", "design", "production"].includes(order.status)) {
                    await releaseOrderReservation(order.id, tx);
                }
                await logAction("Удален заказ (массово)", "order", order.id, undefined, tx);
            }
            await tx.delete(orders).where(inArray(orders.id, orderIds));
        });
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/orders/bulk", method: "bulkDeleteOrders" });
        return { success: false, error: "Ошибка" };
    }
}
