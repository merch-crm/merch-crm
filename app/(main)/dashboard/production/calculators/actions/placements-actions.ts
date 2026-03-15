"use server";

import { db } from "@/lib/db";
import { printPlacements } from "@/lib/schema/calculators";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { slugify } from "@/lib/utils";
import {
    createPlacementSchema,
    updatePlacementSchema,
    deletePlacementSchema,
} from "./schemas";
import type { ApplicationType, PlacementData } from "../types";

const REVALIDATE_PATH = "/dashboard/production/calculators";

// ============================================================================
// GET - Получение нанесений
// ============================================================================

export async function getPlacements(
    applicationType: ApplicationType,
    includeInactive = false
): Promise<{ success: true; data: PlacementData[] } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const conditions = [eq(printPlacements.applicationType, applicationType)];

        if (!includeInactive) {
            conditions.push(eq(printPlacements.isActive, true));
        }

        const result = await db
            .select()
            .from(printPlacements)
            .where(and(...conditions))
            .orderBy(asc(printPlacements.sortOrder));

        const data: PlacementData[] = result.map((row) => ({
            id: row.id,
            applicationType: row.applicationType as ApplicationType,
            name: row.name,
            slug: row.slug,
            description: row.description,
            widthMm: row.widthMm,
            heightMm: row.heightMm,
            workPrice: Number(row.workPrice),
            isActive: row.isActive,
            sortOrder: row.sortOrder,
        }));

        return { success: true, data };
    } catch (error) {
        logError({ error, details: { context: "getPlacements", applicationType } });
        return { success: false, error: "Ошибка загрузки нанесений" };
    }
}

// Получение одного нанесения по ID
export async function getPlacementById(
    id: string
): Promise<{ success: true; data: PlacementData } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const [result] = await db
            .select()
            .from(printPlacements)
            .where(eq(printPlacements.id, id))
            .limit(1);

        if (!result) {
            return { success: false, error: "Нанесение не найдено" };
        }

        return {
            success: true,
            data: {
                id: result.id,
                applicationType: result.applicationType as ApplicationType,
                name: result.name,
                slug: result.slug,
                description: result.description,
                widthMm: result.widthMm,
                heightMm: result.heightMm,
                workPrice: Number(result.workPrice),
                isActive: result.isActive,
                sortOrder: result.sortOrder,
            },
        };
    } catch (error) {
        logError({ error, details: { context: "getPlacementById", id } });
        return { success: false, error: "Ошибка загрузки нанесения" };
    }
}

// ============================================================================
// CREATE - Создание нанесения
// ============================================================================

export async function createPlacement(
    input: unknown
): Promise<{ success: true; data: PlacementData } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        // RBAC: Only management and admin can modify placements
        if (session.roleName !== "Администратор" && session.roleName !== "Руководство") {
            return { success: false, error: "У вас нет прав на изменение нанесений" };
        }

        const validated = createPlacementSchema.safeParse(input);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { applicationType, name, slug, description, widthMm, heightMm, workPrice, sortOrder, isActive } = validated.data;

        // Генерируем slug если не передан
        const finalSlug = slug || slugify(name);

        // Проверяем уникальность slug
        const existing = await db
            .select({ id: printPlacements.id })
            .from(printPlacements)
            .where(
                and(
                    eq(printPlacements.applicationType, applicationType),
                    eq(printPlacements.slug, finalSlug)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            return { success: false, error: "Нанесение с таким slug уже существует" };
        }

        const [result] = await db
            .insert(printPlacements)
            .values({
                applicationType,
                name,
                slug: finalSlug,
                description: description || null,
                widthMm,
                heightMm,
                workPrice: String(workPrice),
                sortOrder,
                isActive,
            })
            .returning();

        await logAction("Создано нанесение", "print_placement", result.id, {
            applicationType,
            name,
            finalSlug,
            widthMm,
            heightMm,
            workPrice
        });

        revalidatePath(REVALIDATE_PATH);

        return {
            success: true,
            data: {
                id: result.id,
                applicationType: result.applicationType as ApplicationType,
                name: result.name,
                slug: result.slug,
                description: result.description,
                widthMm: result.widthMm,
                heightMm: result.heightMm,
                workPrice: Number(result.workPrice),
                isActive: result.isActive,
                sortOrder: result.sortOrder,
            },
        };
    } catch (error) {
        logError({ error, details: { context: "createPlacement", input } });
        return { success: false, error: "Ошибка создания нанесения" };
    }
}

// ============================================================================
// UPDATE - Обновление нанесения
// ============================================================================

export async function updatePlacement(
    input: unknown
): Promise<{ success: true; data: PlacementData } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        // RBAC: Only management and admin can modify placements
        if (session.roleName !== "Администратор" && session.roleName !== "Руководство") {
            return { success: false, error: "У вас нет прав на изменение нанесений" };
        }

        const validated = updatePlacementSchema.safeParse(input);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { id, ...updates } = validated.data;

        const updateData: Record<string, unknown> = {};
        if (updates.applicationType !== undefined) updateData.applicationType = updates.applicationType;
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.slug !== undefined) updateData.slug = updates.slug;
        if (updates.description !== undefined) updateData.description = updates.description || null;
        if (updates.widthMm !== undefined) updateData.widthMm = updates.widthMm;
        if (updates.heightMm !== undefined) updateData.heightMm = updates.heightMm;
        if (updates.workPrice !== undefined) updateData.workPrice = String(updates.workPrice);
        if (updates.sortOrder !== undefined) updateData.sortOrder = updates.sortOrder;
        if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

        const [result] = await db
            .update(printPlacements)
            .set(updateData)
            .where(eq(printPlacements.id, id))
            .returning();

        if (!result) {
            return { success: false, error: "Нанесение не найдено" };
        }

        await logAction("Обновлено нанесение", "print_placement", id, updates);

        revalidatePath(REVALIDATE_PATH);

        return {
            success: true,
            data: {
                id: result.id,
                applicationType: result.applicationType as ApplicationType,
                name: result.name,
                slug: result.slug,
                description: result.description,
                widthMm: result.widthMm,
                heightMm: result.heightMm,
                workPrice: Number(result.workPrice),
                isActive: result.isActive,
                sortOrder: result.sortOrder,
            },
        };
    } catch (error) {
        logError({ error, details: { context: "updatePlacement", input } });
        return { success: false, error: "Ошибка обновления нанесения" };
    }
}

// ============================================================================
// DELETE - Удаление нанесения
// ============================================================================

export async function deletePlacement(
    input: unknown
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        // RBAC: Only management and admin can modify placements
        if (session.roleName !== "Администратор" && session.roleName !== "Руководство") {
            return { success: false, error: "У вас нет прав на удаление нанесений" };
        }

        const validated = deletePlacementSchema.safeParse(input);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { id } = validated.data;

        await db.delete(printPlacements).where(eq(printPlacements.id, id));

        await logAction("Удалено нанесение", "print_placement", id, { id });

        revalidatePath(REVALIDATE_PATH);

        return { success: true };
    } catch (error) {
        logError({ error, details: { context: "deletePlacement", input } });
        return { success: false, error: "Ошибка удаления нанесения" };
    }
}

// ============================================================================
// BULK UPDATE - Массовое обновление цен нанесений
// ============================================================================

export async function bulkUpdatePlacementPrices(
    updates: Array<{ id: string; workPrice: number }>
): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        // RBAC: Only management and admin can modify placements
        if (session.roleName !== "Администратор" && session.roleName !== "Руководство") {
            return { success: false, error: "У вас нет прав на изменение цен" };
        }

        await db.transaction(async (tx) => {
            for (const { id, workPrice } of updates) {
                await tx
                    .update(printPlacements)
                    .set({ workPrice: String(workPrice) })
                    .where(eq(printPlacements.id, id));
            }
        });

        await logAction("Массовое обновление цен нанесений", "print_placement", "bulk", {
            count: updates.length
        });

        revalidatePath(REVALIDATE_PATH);

        return { success: true };
    } catch (error) {
        logError({ error, details: { context: "bulkUpdatePlacementPrices", updates } });
        return { success: false, error: "Ошибка сохранения цен" };
    }
}
