"use server";

import { db } from "@/lib/db";
import { loyaltyLevels, type LoyaltyLevel } from "@/lib/schema/clients/loyalty";
import { clients } from "@/lib/schema/clients/main";
import { eq, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { ActionResult, ok, okVoid, ERRORS } from "@/lib/types";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { z } from "zod";

/**
 * Получить все уровни лояльности
 */
export async function getLoyaltyLevels(): Promise<ActionResult<LoyaltyLevel[]>> {
  return withAuth(async () => {
    const data = await db.query.loyaltyLevels.findMany({
      orderBy: [asc(loyaltyLevels.priority)],
      limit: 100,
    });
    return ok(data);
  }, { errorPath: "getLoyaltyLevels" });
}

/**
 * Создать уровень лояльности
 */
export async function createLoyaltyLevel(data: Omit<LoyaltyLevel, "id" | "createdAt" | "updatedAt">): Promise<ActionResult<LoyaltyLevel>> {
  return withAuth(async () => {
    const dataToInsert = {
      ...data,
      levelKey: String(data.levelKey),
      levelName: String(data.levelName),
    };

    const [newLevel] = await db.insert(loyaltyLevels)
      .values(dataToInsert)
      .returning();

    await logAction("create_loyalty_level", "loyalty_level", newLevel.id, data);
    revalidatePath("/dashboard/clients/analytics/loyalty");
    return ok(newLevel);
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "createLoyaltyLevel" 
  });
}

/**
 * Обновить уровень лояльности
 */
export async function updateLoyaltyLevel(id: string, data: Partial<Omit<LoyaltyLevel, "id" | "createdAt" | "updatedAt">>): Promise<ActionResult<LoyaltyLevel>> {
  const validated = z.object({
    id: z.string().uuid(),
  }).safeParse({ id });

  if (!validated.success) return ERRORS.VALIDATION("Некорректный ID");

  return withAuth(async () => {
    const [updatedLevel] = await db
      .update(loyaltyLevels)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(loyaltyLevels.id, id))
      .returning();

    if (!updatedLevel) return ERRORS.NOT_FOUND("Уровень лояльности");

    await logAction("loyalty_level_updated", "loyalty_level", id, data as Record<string, unknown>);
    revalidatePath("/dashboard/clients/analytics/loyalty");
    return ok(updatedLevel);
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "updateLoyaltyLevel"
  });
}

/**
 * Переключить активность уровня лояльности
 */
export async function toggleLoyaltyLevelActive(id: string, isActive: boolean): Promise<ActionResult<LoyaltyLevel>> {
  const validated = z.object({
    id: z.string().uuid(),
    isActive: z.boolean()
  }).safeParse({ id, isActive });

  if (!validated.success) return ERRORS.VALIDATION("Некорректные входные данные");

  return withAuth(async () => {
    const [updated] = await db
      .update(loyaltyLevels)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(loyaltyLevels.id, id))
      .returning();

    if (!updated) return ERRORS.NOT_FOUND("Уровень лояльности");

    await logAction("toggle_loyalty_level_active", "loyalty_level", id, { isActive });
    revalidatePath("/dashboard/clients/analytics/loyalty");
    return ok(updated);
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "toggleLoyaltyLevelActive"
  });
}

/**
 * Удалить уровень лояльности
 */
export async function deleteLoyaltyLevel(id: string): Promise<ActionResult> {
  const validated = z.string().uuid().safeParse(id);
  if (!validated.success) return ERRORS.VALIDATION("Некорректный ID");

  return withAuth(async () => {
    await db.delete(loyaltyLevels).where(eq(loyaltyLevels.id, id));
    await logAction("loyalty_level_deleted", "loyalty_level", id);
    revalidatePath("/dashboard/clients/analytics/loyalty");
    return okVoid();
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "deleteLoyaltyLevel"
  });
}

/**
 * Изменить порядок уровней
 */
export async function reorderLoyaltyLevels(items: { id: string; priority: number }[]): Promise<ActionResult> {
  const validated = z.array(z.object({
    id: z.string().uuid(),
    priority: z.number().int()
  })).safeParse(items);

  if (!validated.success) return ERRORS.VALIDATION("Некорректные данные");

  return withAuth(async () => {
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
    return okVoid();
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "reorderLoyaltyLevels"
  });
}

/**
 * Установить уровень лояльности клиента (вручную или авто)
 */
export async function setClientLoyaltyLevel(clientId: string, levelId: string | null, setManually: boolean = false): Promise<ActionResult> {
  const validated = z.object({
    clientId: z.string().uuid(),
    levelId: z.string().uuid().nullable(),
    setManually: z.boolean().optional()
  }).safeParse({ clientId, levelId, setManually });

  if (!validated.success) return ERRORS.VALIDATION("Некорректные данные");

  return withAuth(async () => {
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
    return okVoid();
  }, { errorPath: "setClientLoyaltyLevel" });
}

/**
 * Пересчитать лояльность для всех клиентов
 */
export async function recalculateAllClientsLoyalty(): Promise<ActionResult<{ updatedCount: number }>> {
  return withAuth(async () => {
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

    return ok({ updatedCount });
  }, { 
    roles: ROLE_GROUPS.ADMINS,
    errorPath: "recalculateAllClientsLoyalty" 
  });
}
