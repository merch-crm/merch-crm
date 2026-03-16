"use server";

import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis";
import { ClientSchema, ClientUpdateSchema, UpdateClientFieldSchema } from "../../validation";
import { ActionResult } from "@/lib/types";
import { createSafeAction } from "@/lib/safe-action";
import { ClientService } from "@/lib/services/client.service";

// Импортируем типы возврата из схемы Drizzle для совместимости с UI
import * as schema from "@/lib/schema";
type ClientEntity = typeof schema.clients.$inferSelect;

export async function addClient(formData: FormData): Promise<ActionResult<{ duplicates?: ClientEntity[] } | void>> {
    const action = createSafeAction<any, { duplicates?: ClientEntity[] } | void>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema: ClientSchema as any,
        roles: ["Администратор", "Руководство", "Отдел продаж"],
        handler: async (data, _ctx) => {
            const res = await ClientService.createClient({
                ...data,
                ignoreDuplicates: data.ignoreDuplicates === "true" || data.ignoreDuplicates === true
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any, _ctx.userId);
            if ("duplicates" in res && res.duplicates) {
                return { success: true, data: { duplicates: res.duplicates as ClientEntity[] } };
            }
            revalidatePath("/dashboard/clients");
            revalidatePath("/dashboard/orders");
            await invalidateCache("clients:*");
            return { success: true, data: undefined as void };
        }
    });
    return action(formData);
}

export async function updateClient(clientId: string, formData: FormData): Promise<ActionResult> {
    const action = createSafeAction({
        schema: ClientUpdateSchema,
        roles: ["Администратор", "Руководство", "Отдел продаж"],
        handler: async (data, _ctx) => {
            await ClientService.updateClient(clientId, data);
            revalidatePath("/dashboard/clients");
            await invalidateCache("clients:*");
            return { success: true, data: undefined as void };
        }
    });
    return action(formData);
}

export async function deleteClient(clientId: string): Promise<ActionResult> {
    const action = createSafeAction({
        roles: ["Администратор"], // Только администратор
        handler:        async () => {
            await ClientService.deleteClient(clientId);
            revalidatePath("/dashboard/clients");
            return { success: true, data: undefined as void };
        }
    });
    return action();
}

export async function updateClientField(clientId: string, field: string, value: unknown): Promise<ActionResult> {
    const action = createSafeAction({
        schema: UpdateClientFieldSchema,
        roles: ["Администратор", "Руководство", "Отдел продаж"],
        handler: async (data) => {
            await ClientService.updateField(data.clientId, data.field, data.value);
            revalidatePath("/dashboard/clients");
            return { success: true, data: undefined as void };
        }
    });
    // Передаем как объект для Zod
    return action({ clientId, field, value });
}

export async function toggleClientArchived(clientId: string, isArchived: boolean): Promise<ActionResult> {
    const action = createSafeAction({
        roles: ["Администратор", "Руководство", "Отдел продаж"],
        handler: async () => {
            await ClientService.updateField(clientId, "isArchived", isArchived);
            revalidatePath("/dashboard/clients");
            return { success: true, data: undefined as void };
        }
    });
    return action();
}

export async function updateClientComments(clientId: string, comments: string): Promise<ActionResult> {
    const action = createSafeAction({
        roles: ["Администратор", "Руководство", "Отдел продаж"],
        handler:        async () => {
            await ClientService.updateField(clientId, "comments", comments);
            revalidatePath("/dashboard/clients");
            return { success: true, data: undefined as void };
        }
    });
    return action();
}
