"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { BulkClientsSchema } from "../validation";
import { ActionResult } from "@/lib/types";
import { releaseReservationsForOrders } from "./utils";

const { clients, orders, users } = schema;

export async function bulkDeleteClients(clientIds: string[]): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };
    if (session.roleName !== "Администратор") return { success: false, error: "Недостаточно прав" };

    try {
        const validated = BulkClientsSchema.safeParse({ clientIds });
        if (!validated.success) return { success: false, error: validated.error.issues[0].message };

        await db.transaction(async (tx) => {
            const clientOrders = await tx.query.orders.findMany({ where: inArray(orders.clientId, clientIds), limit: 500 });
            if (clientOrders.length > 0) {
                await releaseReservationsForOrders(clientOrders.map(o => o.id), tx);
                await tx.delete(orders).where(inArray(orders.clientId, clientIds));
            }
            await tx.delete(clients).where(inArray(clients.id, clientIds));
        });

        revalidatePath("/dashboard/clients");
        await logAction("Групповое удаление клиентов", "client", "bulk", { count: clientIds.length });
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/actions", method: "bulkDeleteClients" });
        return { success: false, error: "Ошибка удаления" };
    }
}

export async function bulkUpdateClientManager(clientIds: string[], managerId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validated = BulkClientsSchema.safeParse({ clientIds });
        if (!validated.success) return { success: false, error: "Ошибка валидации" };

        await db.update(clients).set({ managerId: managerId || null, updatedAt: new Date() }).where(inArray(clients.id, clientIds));
        await logAction("Групповая смена менеджера", "client", "bulk", { count: clientIds.length, managerId });

        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/actions", method: "bulkUpdateClientManager" });
        return { success: false, error: "Ошибка обновления" };
    }
}

export async function bulkArchiveClients(clientIds: string[], isArchived: boolean = true): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validated = BulkClientsSchema.safeParse({ clientIds });
        if (!validated.success) return { success: false, error: "Ошибка валидации" };

        await db.update(clients).set({ isArchived, updatedAt: new Date() }).where(inArray(clients.id, clientIds));
        await logAction(isArchived ? "Групповая архивация" : "Групповая разархивация", "client", "bulk", { count: clientIds.length, isArchived });

        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients/actions", method: "bulkArchiveClients" });
        return { success: false, error: "Ошибка архивации" };
    }
}
