"use server";

import { db } from "@/lib/db";
import { promocodes } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPromocodes() {
    try {
        const data = await db.query.promocodes.findMany({
            orderBy: [desc(promocodes.createdAt)]
        });
        return { data };
    } catch (error) {
        console.error("Error fetching promocodes:", error);
        return { error: "Failed to fetch promocodes" };
    }
}


interface PromocodeValues {
    code: string;
    discountType: "percentage" | "fixed";
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: string;
    expiresAt?: string | null;
}

export async function createPromocode(values: PromocodeValues) {
    try {
        await db.insert(promocodes).values({
            code: values.code.toUpperCase(),
            discountType: values.discountType,
            value: values.value.toString(),
            minOrderAmount: values.minOrderAmount?.toString() || "0",
            maxDiscountAmount: values.maxDiscountAmount?.toString() || "0",
            usageLimit: values.usageLimit ? parseInt(values.usageLimit) : null,
            expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
            isActive: true,
        });
        revalidatePath("/dashboard/admin/promocodes");
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
                code: values.code.toUpperCase(),
                discountType: values.discountType,
                value: values.value.toString(),
                minOrderAmount: values.minOrderAmount?.toString() || "0",
                maxDiscountAmount: values.maxDiscountAmount?.toString() || "0",
                usageLimit: values.usageLimit ? parseInt(values.usageLimit) : null,
                expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
            })
            .where(eq(promocodes.id, id));
        revalidatePath("/dashboard/admin/promocodes");
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
        revalidatePath("/dashboard/admin/promocodes");
        return { success: true };
    } catch (error) {
        console.error("Error toggling promocode:", error);
        return { error: "Failed to update promocode" };
    }
}

export async function deletePromocode(id: string) {
    try {
        await db.delete(promocodes)
            .where(eq(promocodes.id, id));
        revalidatePath("/dashboard/admin/promocodes");
        return { success: true };
    } catch (error) {
        console.error("Error deleting promocode:", error);
        return { error: "Failed to delete promocode" };
    }
}
