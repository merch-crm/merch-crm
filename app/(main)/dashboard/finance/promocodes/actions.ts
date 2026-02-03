"use server";

import { db } from "@/lib/db";
import { promocodes } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { orders } from "@/lib/schema";

export async function getPromocodes() {
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
            .orderBy(desc(promocodes.createdAt));

        return { data };
    } catch (error) {
        console.error("Error fetching promocodes:", error);
        return { error: "Failed to fetch promocodes" };
    }
}

interface PromocodeValues {
    name?: string;
    code: string;
    discountType: "percentage" | "fixed" | "free_shipping" | "gift";
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: string;
    expiresAt?: string | null;
    adminComment?: string;
}

export async function createPromocode(values: PromocodeValues) {
    try {
        await db.insert(promocodes).values({
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
        });
        revalidatePath("/dashboard/finance");
        return { success: true };
    } catch (error) {
        console.error("Error creating promocode:", error);
        return { error: "Failed to create promocode" };
    }
}

export async function updatePromocode(id: string, values: PromocodeValues) {
    try {
        await db.update(promocodes)
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
        revalidatePath("/dashboard/finance");
        return { success: true };
    } catch (error) {
        console.error("Error updating promocode:", error);
        return { error: "Failed to update promocode" };
    }
}

export async function togglePromocodeActive(id: string, isActive: boolean) {
    try {
        await db.update(promocodes)
            .set({ isActive })
            .where(eq(promocodes.id, id));
        revalidatePath("/dashboard/finance");
        return { success: true };
    } catch (error) {
        console.error("Error toggling promocode:", error);
        return { error: "Failed to update promocode" };
    }
}

export async function bulkCreatePromocodes(count: number, prefix: string, values: PromocodeValues) {
    try {
        const newCodes = [];
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

        await db.insert(promocodes).values(newCodes);
        revalidatePath("/dashboard/finance");
        return { success: true, count: newCodes.length };
    } catch (error) {
        console.error("Error bulk creating promocodes:", error);
        return { error: "Failed to bulk create promocodes" };
    }
}

export async function deletePromocode(id: string) {
    try {
        await db.delete(promocodes)
            .where(eq(promocodes.id, id));
        revalidatePath("/dashboard/finance");
        return { success: true };
    } catch (error) {
        console.error("Error deleting promocode:", error);
        return { error: "Failed to delete promocode" };
    }
}
