"use server";

import { db } from "@/lib/db";
import { storageLocations, inventoryAttributes } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { logAction } from "@/lib/audit";

import { z } from "zod";

const StorageLocationSchema = z.object({
    name: z.string().min(1, "Название обязательно"),
    address: z.string().min(1, "Адрес обязателен"),
    description: z.string().optional(),
});

const InventoryAttributeSchema = z.object({
    type: z.string().min(1),
    name: z.string().min(1),
    value: z.string().min(1),
    meta: z.record(z.string(), z.unknown()).optional(),
});

export async function addStorageLocation(formData: FormData) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для добавления склада" };
    }

    const validation = StorageLocationSchema.safeParse({
        name: formData.get("name"),
        address: formData.get("address"),
        description: formData.get("description"),
    });

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const { name, address, description } = validation.data;

    try {
        const [newLocation] = await db.transaction(async (tx) => {
            const [location] = await tx.insert(storageLocations).values({
                name,
                address,
                description: description || "",
            }).returning();

            await logAction("Создание склада", "storage_location", location.id, { name, address }, tx);
            return [location];
        });

        revalidatePath("/dashboard/warehouse");
        revalidatePath("/dashboard/warehouse/items/new");

        return { success: true, data: newLocation };
    } catch (error) {
        console.error("Failed to add storage location", error);
        return { success: false, error: "Не удалось создать склад" };
    }
}

export async function addInventoryAttribute(type: string, name: string, value: string, meta?: Record<string, unknown>) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = InventoryAttributeSchema.safeParse({ type, name, value, meta });
    if (!validation.success) {
        return { success: false, error: "Некорректные данные: " + validation.error.issues[0].message };
    }

    try {
        const newAttr = await db.transaction(async (tx) => {
            const [attr] = await tx.insert(inventoryAttributes).values({
                type,
                name,
                value,
                meta
            }).returning();

            await logAction("Создан атрибут", "inventory_attribute", attr.id, { type, name, value }, tx);
            return attr;
        });

        revalidatePath("/dashboard/warehouse/items/new");
        return { success: true, data: newAttr };
    } catch {
        return { success: false, error: "Не удалось добавить атрибут" };
    }
}
