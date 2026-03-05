"use server";

import { db } from "@/lib/db";
import { loyaltyLevels, type LoyaltyLevel } from "@/lib/schema/loyalty-levels";
import { clients } from "@/lib/schema/clients";
import { eq, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";
import { z } from "zod";

/**
 * Получить все уровни лояльности
 */
export async function getLoyaltyLevels(): Promise<ActionResult<LoyaltyLevel[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const data = await db.query.loyaltyLevels.findMany({
            orderBy: [asc(loyaltyLevels.priority)],
            limit: 100,
        });
        return { success: true, data };
    } catch (error) {
        await logError({ error, details: { context: "getLoyaltyLevels" } });
        return { success: false, error: "Не удалось загрузить уровни лояльности" };
    }
}

/**
 * Создать уровень лояльности
 */
export async function createLoyaltyLevel(data: Omit<LoyaltyLevel, "id" | "createdAt" | "updatedAt">): Promise<ActionResult<LoyaltyLevel>> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) return { success: false, error: "Доступ запрещен" };

    try {
        const dataToInsert = {
            ...data,
            levelKey: data.levelKey as string,
            levelName: data.levelName as string,
        };

        const [newLevel] = await db.insert(loyaltyLevels)
            .values(dataToInsert)
            .returning();
        await logAction("create_loyalty_level", "loyalty_level", newLevel.id, data);
        revalidatePath("/dashboard/clients/analytics/loyalty");
        return { success: true, data: newLevel };
    } catch (error) {
        await logError({ error, details: { context: "createLoyaltyLevel", data } });
        return { success: false, error: "Ошибка создания уровня" };
    }
}

/**
 * Обновить уровень лояльности
 */
export async function updateLoyaltyLevel(id: string, data: Partial<Omit<LoyaltyLevel, "id" | "createdAt" | "updatedAt">>): Promise<ActionResult<LoyaltyLevel>> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) return { success: false, error: "Доступ запрещен" };

    const validated = z.object({
        id: z.string().uuid(),
        data: z.record(z.string(), z.any())
    }).safeParse({ id, data });

    if (!validated.success) return { success: false, error: "Invalid input" };

    try {
        const [updatedLevel] = await db
            .update(loyaltyLevels)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(loyaltyLevels.id, id))
            .returning();

        await logAction("loyalty_level_updated", "loyalty_level", id, data);
        revalidatePath("/dashboard/clients/analytics/loyalty");
        return { success: true, data: updatedLevel };
    } catch (error) {
        await logError({ error, details: { context: "updateLoyaltyLevel", id, data } });
        return { success: false, error: "Ошибка обновления уровня" };
    }
}

/**
 * Переключить активность уровня лояльности
 */
export async function toggleLoyaltyLevelActive(id: string, isActive: boolean): Promise<ActionResult<LoyaltyLevel>> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) return { success: false, error: "Доступ запрещен" };

    const validated = z.object({
        id: z.string().uuid(),
        isActive: z.boolean()
    }).safeParse({ id, isActive });

    if (!validated.success) return { success: false, error: "Invalid input" };

    try {
        const [updated] = await db
            .update(loyaltyLevels)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(loyaltyLevels.id, id))
            .returning();

        await logAction("toggle_loyalty_level_active", "loyalty_level", id, { isActive });
        revalidatePath("/dashboard/clients/analytics/loyalty");
        return { success: true, data: updated };
    } catch (error) {
        await logError({ error, details: { context: "toggleLoyaltyLevelActive", id, isActive } });
        return { success: false, error: "Ошибка изменения статуса уровня" };
    }
}

/**
 * Удалить уровень лояльности
 */
export async function deleteLoyaltyLevel(id: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) return { success: false, error: "Доступ запрещен" };

    const validated = z.string().uuid().safeParse(id);
    if (!validated.success) return { success: false, error: "Invalid ID" };

    try {
        await db.delete(loyaltyLevels).where(eq(loyaltyLevels.id, id));
        await logAction("loyalty_level_deleted", "loyalty_level", id);
        revalidatePath("/dashboard/clients/analytics/loyalty");
        return { success: true };
    } catch (error) {
        await logError({ error, details: { context: "deleteLoyaltyLevel", id } });
        return { success: false, error: "Ошибка удаления уровня" };
    }
}

/**
 * Изменить порядок уровней
 */
export async function reorderLoyaltyLevels(items: { id: string; priority: number }[]): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) return { success: false, error: "Доступ запрещен" };

    const validated = z.array(z.object({
        id: z.string().uuid(),
        priority: z.number().int()
    })).safeParse(items);

    if (!validated.success) return { success: false, error: "Invalid input data" };

    try {
        await db.transaction(async (tx) => {
            for (const item of items) {
                await tx
                    .update(loyaltyLevels)
                    .set({ priority: item.priority })
                    .where(eq(loyaltyLevels.id, item.id));
            }
        });

        await logAction("reorder_loyalty_levels", "loyalty_level", "system", { items });
        revalidatePath("/dashboard/clients/analytics/loyalty");
        return { success: true };
    } catch (error) {
        await logError({ error, details: { context: "reorderLoyaltyLevels" } });
        return { success: false, error: "Ошибка изменения порядка" };
    }
}

/**
 * Установить уровень лояльности клиента (вручную или авто)
 */
export async function setClientLoyaltyLevel(clientId: string, levelId: string | null, setManually: boolean = false): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = z.object({
        clientId: z.string().uuid(),
        levelId: z.string().uuid().nullable(),
        setManually: z.boolean().optional()
    }).safeParse({ clientId, levelId, setManually });

    if (!validated.success) return { success: false, error: "Invalid input data" };

    try {
        await db
            .update(clients)
            .set({
                loyaltyLevelId: levelId,
                loyaltyLevelSetManually: setManually,
                loyaltyLevelChangedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(clients.id, clientId));

        await logAction("client_loyalty_changed", "client", clientId, { levelId });
        revalidatePath("/dashboard/clients");
        revalidatePath(`/dashboard/clients/${clientId}`);
        return { success: true };
    } catch (error) {
        await logError({ error, details: { context: "setClientLoyaltyLevel", clientId, levelId } });
        return { success: false, error: "Ошибка смены уровня лояльности" };
    }
}

/**
 * Пересчитать лояльность для всех клиентов
 */
export async function recalculateAllClientsLoyalty(): Promise<ActionResult<{ updatedCount: number }>> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) return { success: false, error: "Доступ запрещен" };

    try {
        const levels = await db.query.loyaltyLevels.findMany({
            where: eq(loyaltyLevels.isActive, true),
            orderBy: [desc(loyaltyLevels.priority)],
            limit: 100,
        });

        let updatedCount = 0;

        const allClients = await db.query.clients.findMany({
            where: eq(clients.loyaltyLevelSetManually, false),
            limit: 10000,
        });

        for (const client of allClients) {
            const amount = Number(client.totalOrdersAmount) || 0;
            const count = client.totalOrdersCount || 0;

            const targetLevel = levels.find(l =>
                amount >= (Number(l.minOrdersAmount) || 0) &&
                count >= (l.minOrdersCount || 0)
            );

            const targetLevelId = targetLevel?.id || null;

            if (client.loyaltyLevelId !== targetLevelId) {
                await db
                    .update(clients)
                    .set({
                        loyaltyLevelId: targetLevelId,
                        loyaltyLevelChangedAt: new Date(),
                        updatedAt: new Date()
                    })
                    .where(eq(clients.id, client.id));
                updatedCount++;
            }
        }

        await logAction("recalculate_loyalty_all", "client", "system", { updatedCount });
        revalidatePath("/dashboard/clients");

        return { success: true, data: { updatedCount } };
    } catch (error) {
        await logError({ error, details: { context: "recalculateAllClientsLoyalty" } });
        return { success: false, error: "Ошибка пересчета лояльности" };
    }
}
