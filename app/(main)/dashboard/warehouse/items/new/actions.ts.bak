"use server";

import { db } from "@/lib/db";
import { storageLocations, auditLogs, inventoryAttributes } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addStorageLocation(formData: FormData) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав для добавления склада" };
    }

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;

    if (!name || !address) {
        return { error: "Название и адрес обязательны" };
    }

    try {
        const [newLocation] = await db.insert(storageLocations).values({
            name,
            address,
            description,
        }).returning();

        await db.insert(auditLogs).values({
            userId: session.id,
            action: "Создание склада",
            entityType: "storage_location",
            entityId: newLocation.id,
            details: { name, address }
        });

        revalidatePath("/dashboard/warehouse");
        revalidatePath("/dashboard/warehouse/items/new");

        return { success: true, data: newLocation };
    } catch (error) {
        console.error("Failed to add storage location", error);
        return { error: "Не удалось создать склад" };
    }
}

export async function addInventoryAttribute(type: string, name: string, value: string, meta?: Record<string, unknown>) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав" };
    }

    try {
        const [newAttr] = await db.insert(inventoryAttributes).values({
            type,
            name,
            value,
            meta
        }).returning();

        revalidatePath("/dashboard/warehouse/items/new");
        return { success: true, data: newAttr };
    } catch {
        return { error: "Failed to add attribute" };
    }
}
