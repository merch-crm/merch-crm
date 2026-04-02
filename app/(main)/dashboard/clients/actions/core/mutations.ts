"use server";


import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis";
import { ClientSchema, ClientUpdateSchema, UpdateClientFieldSchema } from "../../validation";
import { ActionResult } from "@/lib/types";
import { createSafeAction } from "@/lib/safe-action";
import { ClientService } from "@/lib/services/client.service";

// Импортируем типы возврата из схемы Drizzle для совместимости с UI
import { ROLE_SLUGS } from "@/lib/roles";
import { clients } from "@/lib/schema/clients/main";
import { z } from "zod";
type ClientEntity = typeof clients.$inferSelect;

export async function addClient(formData: FormData): Promise<ActionResult<{ duplicates?: ClientEntity[] } | void>> {
    const action = createSafeAction<z.infer<typeof ClientSchema>, { duplicates?: ClientEntity[] } | void>({
        schema: ClientSchema as z.ZodType<z.infer<typeof ClientSchema>>,
        roles: [ROLE_SLUGS.ADMIN, ROLE_SLUGS.MANAGEMENT, ROLE_SLUGS.SALES],
        handler: async (data, _ctx) => {
            const res = await ClientService.createClient({
                ...data,
                ignoreDuplicates: data.ignoreDuplicates === true
            } as Parameters<typeof ClientService.createClient>[0], _ctx.userId);
            
            if ("duplicates" in res && res.duplicates) {
                return { success: true, data: { duplicates: res.duplicates as ClientEntity[] } };
            }
            revalidatePath("/dashboard/clients");
            revalidatePath("/dashboard/orders");
            await invalidateCache("clients:*");
            return { success: true, data: undefined };
        }
    });
    return action(formData);
}

export async function updateClient(clientId: string, formData: FormData): Promise<ActionResult> {
    const action = createSafeAction<z.infer<typeof ClientUpdateSchema>, void>({
        schema: ClientUpdateSchema as z.ZodType<z.infer<typeof ClientUpdateSchema>>,
        roles: [ROLE_SLUGS.ADMIN, ROLE_SLUGS.MANAGEMENT, ROLE_SLUGS.SALES],
        handler: async (data, _ctx) => {
            await ClientService.updateClient(clientId, data as Parameters<typeof ClientService.updateClient>[1]);
            revalidatePath("/dashboard/clients");
            await invalidateCache("clients:*");
            return { success: true, data: undefined };
        }
    });
    return action(formData);
}

export async function deleteClient(clientId: string): Promise<ActionResult> {
    const action = createSafeAction<void, void>({
        roles: [ROLE_SLUGS.ADMIN], // Только администратор
        handler: async () => {
            await ClientService.deleteClient(clientId);
            revalidatePath("/dashboard/clients");
            return { success: true, data: undefined };
        }
    });
    return action();
}

export async function updateClientField(clientId: string, field: string, value: unknown): Promise<ActionResult> {
    const action = createSafeAction<z.infer<typeof UpdateClientFieldSchema>, void>({
        schema: UpdateClientFieldSchema,
        roles: [ROLE_SLUGS.ADMIN, ROLE_SLUGS.MANAGEMENT, ROLE_SLUGS.SALES],
        handler: async (data) => {
            await ClientService.updateField(data.clientId, data.field, data.value);
            revalidatePath("/dashboard/clients");
            return { success: true, data: undefined };
        }
    });
    // Передаем как объект для Zod
    return action({ clientId, field, value });
}

export async function toggleClientArchived(clientId: string, isArchived: boolean): Promise<ActionResult> {
    const action = createSafeAction<void, void>({
        roles: [ROLE_SLUGS.ADMIN, ROLE_SLUGS.MANAGEMENT, ROLE_SLUGS.SALES],
        handler: async () => {
            await ClientService.updateField(clientId, "isArchived", isArchived);
            revalidatePath("/dashboard/clients");
            return { success: true, data: undefined };
        }
    });
    return action();
}

export async function updateClientComments(clientId: string, comments: string): Promise<ActionResult> {
    const action = createSafeAction<void, void>({
        roles: [ROLE_SLUGS.ADMIN, ROLE_SLUGS.MANAGEMENT, ROLE_SLUGS.SALES],
        handler: async () => {
            await ClientService.updateField(clientId, "comments", comments);
            revalidatePath("/dashboard/clients");
            return { success: true, data: undefined };
        }
    });
    return action();
}
