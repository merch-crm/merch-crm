"use server";

import { db } from "@/lib/db";
import { promocodes, orders } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { ActionResult } from "@/lib/types";
import { logAction } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/error-logger";
import { z } from "zod";

const PromocodeSchema = z.object({
    name: z.string().optional().nullable(),
    code: z.string().min(3).max(50),
    discountType: z.enum(["percentage", "fixed", "free_shipping", "gift"]),
    value: z.number().min(0),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    usageLimit: z.string().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    adminComment: z.string().optional().nullable(),
});

const TogglePromocodeSchema = z.object({
    id: z.string().uuid(),
    isActive: z.boolean(),
});

const BulkCreateSchema = z.object({
    count: z.number().int().min(1).max(100),
    prefix: z.string().min(1).max(10),
    values: PromocodeSchema,
});

export interface Promocode {
    id: string;
    name: string | null;
    code: string;
    discountType: string;
    value: string;
    isActive: boolean;
    usageLimit: number | null;
    usageCount: number;
    expiresAt: Date | null;
    adminComment: string | null;
    minOrderAmount: string | null;
    createdAt: Date;
    totalSaved: number;
}

export async function getPromocodes(): Promise<ActionResult<Promocode[]>> {
    try {
        const data = await db.select({
            id: promocodes.id,
            name: promocodes.name,
            code: promocodes.code,
            discountType: promocodes.discountType,
            value: promocodes.value,
            isActive: promocodes.isActive,
            usageLimit: promocodes.usageLimit,
            usageCount: promocodes.usageCount,
            expiresAt: promocodes.expiresAt,
            adminComment: promocodes.adminComment,
            minOrderAmount: promocodes.minOrderAmount,
            createdAt: promocodes.createdAt,
            totalSaved: sql<number>`COALESCE((SELECT SUM(CAST(discount_amount AS DECIMAL)) FROM ${orders} WHERE promocode_id = ${promocodes.id}), 0)`
        })
            .from(promocodes)
            .orderBy(desc(promocodes.createdAt))
            .limit(100);

        return { success: true, data };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance/promocodes",
            method: "getPromocodes"
        });
        return { success: false, error: "Не удалось загрузить промокоды" };
    }
}




export async function createPromocode(values: z.infer<typeof PromocodeSchema>): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = PromocodeSchema.safeParse(values);
    if (!validated.success) {
        return { success: false, error: "Некорректные данные: " + validated.error.issues[0].message };
    }

    try {
        await db.transaction(async (tx) => {
            const [newPromo] = await tx.insert(promocodes).values({
                name: values.name || null,
                code: values.code.toUpperCase(),
                discountType: values.discountType,
                value: values.value.toString(),
                minOrderAmount: values.minOrderAmount?.toString() || "0",
                maxDiscountAmount: values.maxDiscountAmount?.toString() || "0",
                usageLimit: values.usageLimit ? parseInt(values.usageLimit) : null,
                expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
                adminComment: values.adminComment || null,
                isActive: true,
            }).returning();

            await logAction("Создан промокод", "promocode", newPromo.id, {
                code: values.code,
                type: values.discountType,
                value: values.value
            }, tx);
        });

        revalidatePath("/dashboard/finance");
        revalidatePath("/dashboard/finance/promocodes");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance/promocodes",
            method: "createPromocode",
            details: values
        });
        return { success: false, error: "Не удалось создать промокод" };
    }
}

export async function updatePromocode(id: string, values: z.infer<typeof PromocodeSchema>): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = PromocodeSchema.safeParse(values);
    if (!validated.success) {
        return { success: false, error: "Некорректные данные: " + validated.error.issues[0].message };
    }

    try {
        await db.transaction(async (tx) => {
            await tx.update(promocodes)
                .set({
                    name: values.name || null,
                    code: values.code.toUpperCase(),
                    discountType: values.discountType,
                    value: values.value.toString(),
                    minOrderAmount: values.minOrderAmount?.toString() || "0",
                    maxDiscountAmount: values.maxDiscountAmount?.toString() || "0",
                    usageLimit: values.usageLimit ? parseInt(values.usageLimit) : null,
                    expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
                    adminComment: values.adminComment || null,
                })
                .where(eq(promocodes.id, id));

            await logAction("Обновлен промокод", "promocode", id, {
                code: values.code,
                changes: values
            }, tx);
        });
        revalidatePath("/dashboard/finance");
        revalidatePath("/dashboard/finance/promocodes");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance/promocodes",
            method: "updatePromocode",
            details: { id, values }
        });
        return { success: false, error: "Не удалось обновить промокод" };
    }
}

export async function togglePromocodeActive(id: string, isActive: boolean): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = TogglePromocodeSchema.safeParse({ id, isActive });
    if (!validated.success) {
        return { success: false, error: "Некорректные данные: " + validated.error.issues[0].message };
    }

    try {
        await db.transaction(async (tx) => {
            await tx.update(promocodes)
                .set({ isActive })
                .where(eq(promocodes.id, id));

            await logAction(isActive ? "Активирован промокод" : "Деактивирован промокод", "promocode", id, { isActive }, tx);
        });
        revalidatePath("/dashboard/finance");
        revalidatePath("/dashboard/finance/promocodes");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance/promocodes",
            method: "togglePromocodeActive",
            details: { id, isActive }
        });
        return { success: false, error: "Не удалось изменить статус промокода" };
    }
}

export async function bulkCreatePromocodes(count: number, prefix: string, values: z.infer<typeof PromocodeSchema>): Promise<ActionResult<{ count: number }>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = BulkCreateSchema.safeParse({ count, prefix, values });
    if (!validated.success) {
        return { success: false, error: "Некорректные данные: " + validated.error.issues[0].message };
    }

    try {
        const newCodes: (typeof promocodes.$inferInsert)[] = [];
        for (let i = 0; i < count; i++) {
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            let suffix = "";
            for (let j = 0; j < 6; j++) {
                suffix += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            const finalCode = `${prefix}${suffix}`.toUpperCase();

            newCodes.push({
                name: values.name || `Массовая генерация: ${prefix}`,
                code: finalCode,
                discountType: values.discountType,
                value: values.value.toString(),
                minOrderAmount: values.minOrderAmount?.toString() || "0",
                maxDiscountAmount: values.maxDiscountAmount?.toString() || "0",
                usageLimit: values.usageLimit ? parseInt(values.usageLimit) : 1,
                expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
                adminComment: values.adminComment || `Массовая генерация: ${prefix}`,
                isActive: true,
            });
        }

        await db.transaction(async (tx) => {
            const inserted = await tx.insert(promocodes).values(newCodes).returning();
            await logAction("Массовое создание промокодов", "promocode", "bulk", {
                count: inserted.length,
                prefix
            }, tx);
        });
        revalidatePath("/dashboard/finance");
        revalidatePath("/dashboard/finance/promocodes");
        return { success: true, data: { count: newCodes.length } };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance/promocodes",
            method: "bulkCreatePromocodes",
            details: { count, prefix, values }
        });
        return { success: false, error: "Не удалось массово создать промокоды" };
    }
}

export async function deletePromocode(id: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    if (!id || typeof id !== "string") return { success: false, error: "Некорректный ID" };

    try {
        await db.transaction(async (tx) => {
            await tx.delete(promocodes).where(eq(promocodes.id, id));
            await logAction("Удален промокод", "promocode", id, undefined, tx);
        });
        revalidatePath("/dashboard/finance");
        revalidatePath("/dashboard/finance/promocodes");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/finance/promocodes",
            method: "deletePromocode",
            details: { id }
        });
        return { success: false, error: "Не удалось удалить промокод" };
    }
}
