"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { ClientSchema, ClientUpdateSchema, UpdateClientFieldSchema } from "../../validation";
import { ActionResult } from "@/lib/types";
import { releaseReservationsForOrders } from "../utils";
import { checkClientDuplicates } from "./duplicates";

const { clients, orders } = schema;

export async function addClient(formData: FormData): Promise<ActionResult<{ duplicates?: (typeof clients.$inferSelect)[] } | void>> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для управления клиентами" };
    }

    const validation = ClientSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) return { success: false, error: validation.error.issues[0].message };

    const { lastName, firstName, patronymic, phone, email, ignoreDuplicates } = validation.data;

    try {
        if (!ignoreDuplicates) {
            const dupRes = await checkClientDuplicates({ phone, email: email || undefined, lastName, firstName });
            if (dupRes.success && (dupRes.data?.length || 0) > 0) return { success: true, data: { duplicates: dupRes.data } };
        }

        const fullName = [lastName, firstName, patronymic].filter(Boolean).join(" ");
        await db.transaction(async (tx) => {
            const [newClient] = await tx.insert(clients).values({ ...validation.data, name: fullName, managerId: validation.data.managerId || null }).returning();
            await logAction("Создан клиент", "client", newClient.id, { name: fullName }, tx);
        });

        revalidatePath("/dashboard/clients");
        revalidatePath("/dashboard/orders");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients", method: "addClient", details: { lastName, firstName, phone } });
        return { success: false, error: "Не удалось добавить клиент" };
    }
}

export async function updateClient(clientId: string, formData: FormData): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для управления клиентами" };
    }

    const validation = ClientUpdateSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) return { success: false, error: validation.error.issues[0].message };

    try {
        const fullName = [validation.data.lastName, validation.data.firstName, validation.data.patronymic].filter(Boolean).join(" ");
        await db.transaction(async (tx) => {
            await tx.update(clients).set({ ...validation.data, name: fullName, managerId: validation.data.managerId || null, updatedAt: new Date() }).where(eq(clients.id, clientId));
            await logAction("Обновлен клиент", "client", clientId, { name: fullName }, tx);
        });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: `/dashboard/clients/${clientId}`, method: "updateClient" });
        return { success: false, error: "Не удалось обновить клиент" };
    }
}

export async function deleteClient(clientId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };
    if (session.roleName !== "Администратор") return { success: false, error: "Только администратор может удалять клиентов" };

    try {
        await db.transaction(async (tx) => {
            const client = await tx.query.clients.findFirst({ where: eq(clients.id, clientId), with: { orders: true } });
            if (client?.orders && client.orders.length > 0) {
                await releaseReservationsForOrders(client.orders.map(o => o.id), tx);
                await tx.delete(orders).where(eq(orders.clientId, clientId));
            }
            await tx.delete(clients).where(eq(clients.id, clientId));
        });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: `/dashboard/clients/${clientId}`, method: "deleteClient" });
        return { success: false, error: "Не удалось удалить клиент" };
    }
}

export async function updateClientField(clientId: string, field: string, value: unknown): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для управления клиентами" };
    }

    try {
        const validated = UpdateClientFieldSchema.parse({ clientId, field, value });
        await db.update(clients).set({ [validated.field]: validated.value || null, updatedAt: new Date() }).where(eq(clients.id, clientId));
        await logAction(`Изменение поля клиента: ${field}`, "client", clientId, { field, value });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients", method: "updateClientField" });
        return { success: false, error: "Ошибка обновления" };
    }
}

export async function toggleClientArchived(clientId: string, isArchived: boolean): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для управления клиентами" };
    }

    try {
        await db.update(clients).set({ isArchived, updatedAt: new Date() }).where(eq(clients.id, clientId));
        await logAction(isArchived ? "Архивация клиента" : "Разархивация клиента", "client", clientId, { isArchived });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients", method: "toggleClientArchived" });
        return { success: false, error: "Ошибка" };
    }
}

export async function updateClientComments(clientId: string, comments: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для управления клиентами" };
    }

    try {
        await db.update(clients).set({ comments, updatedAt: new Date() }).where(eq(clients.id, clientId));
        await logAction("Обновлен комментарий клиента", "client", clientId, { comments });
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/clients", method: "updateClientComments" });
        return { success: false, error: "Ошибка" };
    }
}
