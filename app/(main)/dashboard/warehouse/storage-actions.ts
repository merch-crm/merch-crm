"use server";

import { z } from "zod";

import { revalidatePath } from "next/cache";
import { eq, and, sql, ne, inArray, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    storageLocations,
    inventoryStocks,
    inventoryTransactions,
    inventoryTransfers,
    users,
} from "@/lib/schema";
import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/auth";
import { comparePassword } from "@/lib/password";
import { StorageLocationSchema } from "./validation";


import { type ActionResult } from "@/lib/types";

/**
 * Get all storage locations
 */
type StorageLocation = InferSelectModel<typeof storageLocations> & {
    responsibleUser: { name: string; email: string; id: string } | null;
    items?: Array<{
        id: string;
        name: string;
        quantity: number;
        unit: string;
        sku?: string | null;
        categoryId?: string | null;
        categoryName?: string | null;
    }>;
};

export async function getStorageLocations(): Promise<ActionResult<StorageLocation[]>> {
    try {
        const locationsRaw = await db.query.storageLocations.findMany({
            with: {
                responsibleUser: true,
                stocks: {
                    where: sql`${inventoryStocks.quantity} > 0`,
                    with: {
                        item: {
                            with: {
                                category: true
                            }
                        }
                    }
                }
            },
            orderBy: (locations, { asc }) => [asc(locations.name)],
            limit: 100
        });

        // Map stocks to items for UI
        const locations = locationsRaw.map(loc => ({
            ...loc,
            items: loc.stocks.map(stock => ({
                id: stock.item.id,
                name: stock.item.name,
                quantity: stock.quantity,
                unit: stock.item.unit,
                sku: stock.item.sku,
                categoryId: stock.item.categoryId,
                categoryName: stock.item.category?.name
            }))
        }));

        return { success: true, data: locations };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/storage-actions",
            method: "getStorageLocations"
        });
        return { success: false, error: "Не удалось загрузить места хранения" };
    }
}

/**
 * Add new storage location (accepts FormData for form submissions)
 */
export async function addStorageLocation(formData: FormData): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = StorageLocationSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, address, description, responsibleUserId, type, isDefault } = validation.data;

    try {
        await db.transaction(async (tx) => {
            if (isDefault) {
                await tx.update(storageLocations)
                    .set({ isDefault: false });
            }

            await tx.insert(storageLocations).values({
                name,
                address,
                description: description || null,
                responsibleUserId: responsibleUserId || null,
                isDefault,
                type,
                isActive: true,
                isSystem: false,
            });
        });

        invalidateCache("warehouse:locations");
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/storage-actions",
            method: "addStorageLocation",
        });
        return { success: false, error: "Не удалось создать место хранения" };
    }
}

/**
 * Update a storage location
 */
export async function updateStorageLocation(id: string, formData: FormData): Promise<ActionResult> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID места хранения" };
    }

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validation = StorageLocationSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, address, description, responsibleUserId, type, isDefault, isActive } = validation.data;

    try {
        if (isDefault) {
            await db.update(storageLocations)
                .set({ isDefault: false })
                .where(ne(storageLocations.id, id));
        }

        await db.update(storageLocations).set({
            name,
            address,
            description: description || null,
            responsibleUserId: responsibleUserId || null,
            type,
            isDefault,
            isActive,
        }).where(eq(storageLocations.id, id));

        await logAction("Обновление склада", "storage_location", id, { name, isDefault, isActive });
        invalidateCache("warehouse:locations");
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/storage-actions",
            method: "updateStorageLocation",
            details: { id }
        });
        return { success: false, error: "Не удалось обновить место хранения" };
    }
}

/**
 * Delete a storage location
 */
export async function deleteStorageLocation(id: string, password?: string): Promise<ActionResult> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID места хранения" };
    }

    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для удаления места хранения" };
    }

    try {
        const location = await db.query.storageLocations.findFirst({
            where: eq(storageLocations.id, id)
        });

        if (!location) return { success: false, error: "Место хранения не найдено" };

        if (location.isSystem) {
            if (session.roleName !== "Администратор") {
                return { success: false, error: "Только администратор может удалять системные места хранения" };
            }
            if (!password) {
                return { success: false, error: "Для удаления системного места хранения требуется пароль от вашей учетной записи" };
            }

            const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
            if (!user || !(await comparePassword(password, user.passwordHash))) {
                return { success: false, error: "Неверный пароль" };
            }
        }

        const activeStocks = await db.query.inventoryStocks.findMany({
            where: and(
                eq(inventoryStocks.storageLocationId, id),
                sql`${inventoryStocks.quantity} > 0`
            ),
            limit: 1
        });

        if (activeStocks.length > 0) {
            return { success: false, error: "Нельзя удалить склад, на котором числятся товары" };
        }

        await db.transaction(async (tx) => {
            await tx.delete(inventoryStocks).where(eq(inventoryStocks.storageLocationId, id));

            await tx.update(inventoryTransactions)
                .set({ storageLocationId: null })
                .where(eq(inventoryTransactions.storageLocationId, id));

            await tx.update(inventoryTransactions)
                .set({ fromStorageLocationId: null })
                .where(eq(inventoryTransactions.fromStorageLocationId, id));

            await tx.update(inventoryTransfers)
                .set({ fromLocationId: null })
                .where(eq(inventoryTransfers.fromLocationId, id));

            await tx.update(inventoryTransfers)
                .set({ toLocationId: null })
                .where(eq(inventoryTransfers.toLocationId, id));

            await tx.delete(storageLocations).where(eq(storageLocations.id, id));

            await logAction("Удаление склада", "storage_location", id, { id, isSystem: location.isSystem });
        });

        invalidateCache("warehouse:locations");
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/storage-actions",
            method: "deleteStorageLocation",
            details: { id }
        });
        return { success: false, error: "Не удалось удалить место хранения" };
    }
}

/**
 * Update order of storage locations
 */
export async function updateStorageLocationsOrder(items: unknown[]): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = z.array(z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int()
    })).safeParse(items);

    if (!validation.success) {
        return { success: false, error: "Неверный формат данных" };
    }

    const validatedItems = validation.data;
    try {
        await db.transaction(async (tx) => {
            for (const item of validatedItems) {
                await tx.update(storageLocations)
                    .set({ sortOrder: item.sortOrder })
                    .where(eq(storageLocations.id, item.id));
            }
        });

        invalidateCache("warehouse:locations");
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/storage-actions",
            method: "updateStorageLocationsOrder",
            details: { itemsCount: items?.length }
        });
        return { success: false, error: "Не удалось обновить порядок мест хранения" };
    }
}

export async function seedStorageLocations(): Promise<ActionResult> {
    const locations = [
        { name: "Производство", address: "Пушкина 71" },
        { name: "Стас", address: "Роз 355а" },
        { name: "Леня", address: "Доваторцев 67" },
        { name: "Денис", address: "Тухачевского 26/1" }
    ];

    try {
        const locationNames = locations.map(l => l.name);
        const existing = await db.select({ name: storageLocations.name })
            .from(storageLocations)
            .where(inArray(storageLocations.name, locationNames))
            .limit(10);
        const existingNames = new Set(existing.map(e => e.name));

        const toInsert = locations.filter(loc => !existingNames.has(loc.name));
        if (toInsert.length > 0) {
            await db.insert(storageLocations).values(
                toInsert.map(loc => ({
                    name: loc.name,
                    address: loc.address,
                    type: "warehouse" as const,
                    isDefault: false,
                    isSystem: false,
                    isActive: true
                }))
            );
        }
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/storage-actions",
            method: "seedStorageLocations"
        });
        return { success: false, error: "Failed to seed" };
    }
}
