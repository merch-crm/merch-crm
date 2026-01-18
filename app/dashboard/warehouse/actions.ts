"use server";

import { db } from "@/lib/db";
import {
    inventoryItems,
    inventoryTransactions,
    inventoryCategories,
    storageLocations,
    users,
    inventoryStocks,
    inventoryTransfers,
    notifications,
    orderItems,
    measurementUnits,
    inventoryAttributes,
    inventoryAttributeTypes
} from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, sql, inArray, and, asc, type InferInsertModel } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";
import { getSession } from "@/lib/auth";
import { comparePassword } from "@/lib/password";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// Helper to sanitize folder/file names
function sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ0-9 \-\.]/g, "_").trim();
}

// Helper: Build category hierarchy path
async function getCategoryPath(categoryId: string | null): Promise<string> {
    if (!categoryId || categoryId === "") return "Uncategorized";

    const paths: string[] = [];
    let currentId: string | null = categoryId;
    let depth = 0;

    while (currentId && currentId !== "" && depth < 10) {
        depth++;
        const category: { id: string; name: string; parentId: string | null } | undefined = await db.query.inventoryCategories.findFirst({
            where: eq(inventoryCategories.id, currentId),
            columns: { id: true, name: true, parentId: true }
        });

        if (!category) break;

        paths.unshift(sanitizeFileName(category.name));
        currentId = category.parentId;
    }

    return paths.join("/");
}

import { LOCAL_STORAGE_ROOT } from "@/lib/local-storage";

async function saveFile(file: File | null, directoryPath: string): Promise<string | null> {
    if (!file || file.size === 0) return null;

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());
    const MAX_SIZE = 700 * 1024; // 700KB
    let extension = path.extname(file.name) || ".jpg";

    // Compress if larger than 700KB or if it is an image that we want to standardize
    if (file.type.startsWith("image/") && buffer.length > MAX_SIZE) {
        try {
            buffer = await sharp(buffer)
                .rotate() // Auto-rotate based on EXIF
                .resize(1920, 1920, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80, mozjpeg: true })
                .toBuffer();

            extension = ".jpg";
        } catch (e) {
            console.error("Compression failed, saving original file:", e);
        }
    }

    const filename = `item-${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;

    // Path in local-storage (persisted)
    // Structure: local-storage/SKU/Category/Item/filename.jpg
    const relativePath = path.join("SKU", directoryPath);
    const uploadDir = path.join(LOCAL_STORAGE_ROOT, relativePath);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Return API-accessible path
    return `/api/storage/local/${relativePath}/${filename}`;
}

export async function getInventoryCategories() {
    try {
        const categories = await db.query.inventoryCategories.findMany({
            with: {
                parent: true
            },
            orderBy: [
                sql`CASE WHEN ${inventoryCategories.sortOrder} = 0 THEN 1 ELSE 0 END ASC`,
                sql`${inventoryCategories.sortOrder} ASC`,
                desc(inventoryCategories.createdAt)
            ]
        });
        return { data: categories };
    } catch (error) {
        console.error(error);
        return { error: "Failed to fetch inventory categories" };
    }
}

export async function addInventoryCategory(formData: FormData) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав для добавления категории" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const prefix = formData.get("prefix") as string;
    const icon = formData.get("icon") as string;
    const color = formData.get("color") as string;

    const parentId = formData.get("parentId") as string;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

    const gender = formData.get("gender") as string || "masculine";
    const singularName = formData.get("singularName") as string;
    const pluralName = formData.get("pluralName") as string;

    if (!name) {
        return { error: "Name is required" };
    }

    try {
        await db.transaction(async (tx) => {
            await tx.insert(inventoryCategories).values({
                name,
                description,
                prefix: prefix || null,
                icon: icon || "package",
                color: color || "indigo",
                parentId: parentId || null,
                sortOrder,
                isActive,
                gender,
                singularName,
                pluralName
            });

            // Create folder structure
            let parentPath = "";
            if (parentId) {
                // Must resolve parent path. Helper uses db, but that's fine for reading existing parents.
                parentPath = await getCategoryPath(parentId);
            }

            const categoryDir = path.join("SKU", parentPath, sanitizeFileName(name));
            const fullPath = path.join(process.cwd(), "public", categoryDir);

            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }

            await tx.insert(inventoryTransactions).values({
                type: "attribute_change",
                reason: `Создана категория: ${name}`,
                createdBy: session?.id,
            });
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch {
        return { error: "Failed to add category" };
    }
}

export async function deleteInventoryCategory(id: string, password?: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав для удаления категории" };
    }

    try {
        const category = await db.query.inventoryCategories.findFirst({
            where: eq(inventoryCategories.id, id)
        });

        if (!category) return { error: "Категория не найдена" };

        if (category.isSystem) {
            if (session.roleName !== "Администратор") {
                return { error: "Только администратор может удалять системные данные" };
            }
            if (!password) {
                return { error: "Для удаления системной категории требуется пароль администратора" };
            }

            const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
            if (!user || !(await comparePassword(password, user.passwordHash))) {
                return { error: "Неверный пароль администратора" };
            }
        }

        // Check for subcategories
        const subcategories = await db.query.inventoryCategories.findMany({
            where: eq(inventoryCategories.parentId, id),
            limit: 1
        });

        if (subcategories.length > 0) {
            return { error: "Нельзя удалить категорию, у которой есть подкатегории. Сначала удалите или переместите их." };
        }

        // First, unlink all items from this category (set categoryId to null)
        await db.update(inventoryItems)
            .set({ categoryId: null })
            .where(eq(inventoryItems.categoryId, id));

        // Then delete the category
        await db.delete(inventoryCategories).where(eq(inventoryCategories.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Удалена категория: ${category.name}`,
            createdBy: session?.id,
        });

        await logAction("Удаление категории", "inventory_category", id, { id, isSystem: category.isSystem });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to delete category" };
    }
}

export async function updateInventoryCategory(id: string, formData: FormData) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав для изменения категории" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const icon = formData.get("icon") as string;
    const color = formData.get("color") as string;
    const prefix = formData.get("prefix") as string;

    const parentId = formData.get("parentId") as string;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

    const gender = formData.get("gender") as string || "masculine";
    const singularName = formData.get("singularName") as string;
    const pluralName = formData.get("pluralName") as string;

    if (!name) {
        return { error: "Name is required" };
    }

    if (parentId === id) {
        return { error: "Категория не может быть своим собственным родителем" };
    }

    try {
        await db.update(inventoryCategories)
            .set({
                name,
                description,
                icon: icon || null,
                color: color || null,
                prefix: prefix || null,
                parentId: parentId || null,
                sortOrder,
                isActive,
                gender,
                singularName,
                pluralName
            })
            .where(eq(inventoryCategories.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Изменена категория: ${name}`,
            createdBy: session?.id,
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch {
    }
}

export async function getInventoryItems() {
    try {
        const items = await db.query.inventoryItems.findMany({
            with: {
                category: true
            },
            orderBy: desc(inventoryItems.createdAt)
        });
        return { data: items };
    } catch (error) {
        console.error("DEBUG: getInventoryItems error", error);
        return { error: "Failed to fetch inventory items" };
    }
}

export async function getInventoryItem(id: string) {
    try {
        const item = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.id, id),
            with: {
                category: {
                    with: {
                        parent: true
                    }
                },
                storageLocation: true
            }
        });
        return { data: item };
    } catch {
        return { error: "Failed to fetch item" };
    }
}

export async function addInventoryItem(formData: FormData) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав для добавления товаров" };
    }

    const itemType = formData.get("itemType") as "clothing" | "packaging" | "consumables" || "clothing";
    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const unit = formData.get("unit") as string;
    const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string) || 10;
    const criticalStockThreshold = parseInt(formData.get("criticalStockThreshold") as string) || 0;
    const categoryIdRaw = formData.get("categoryId") as string;
    const categoryId = (categoryIdRaw && categoryIdRaw !== "") ? categoryIdRaw : null;
    const description = formData.get("description") as string;
    const locationName = formData.get("location") as string;

    const storageLocationIdRaw = formData.get("storageLocationId") as string;
    const storageLocationId = (storageLocationIdRaw && storageLocationIdRaw !== "") ? storageLocationIdRaw : null;

    const qualityCodeRaw = formData.get("qualityCode") as string;
    const qualityCode = qualityCodeRaw || null;

    const materialCodeRaw = formData.get("materialCode") as string;
    const materialCode = materialCodeRaw || null;

    const attributeCodeRaw = formData.get("attributeCode") as string;
    const attributeCode = attributeCodeRaw || null;

    const sizeCodeRaw = formData.get("sizeCode") as string;
    const sizeCode = sizeCodeRaw || null;

    const brandCodeRaw = formData.get("brandCode") as string;
    const brandCode = brandCodeRaw || null;
    const imageFile = formData.get("image") as File;
    const attributesStr = formData.get("attributes") as string;
    const thumbnailSettingsStr = formData.get("thumbnailSettings") as string;
    let attributes: Record<string, unknown> = {};
    let thumbnailSettings = null;
    if (attributesStr) {
        try {
            attributes = JSON.parse(attributesStr);
        } catch (e) {
            console.error("Failed to parse attributes JSON", e);
        }
    }
    if (thumbnailSettingsStr) {
        try {
            thumbnailSettings = JSON.parse(thumbnailSettingsStr);
        } catch (e) {
            console.error("Failed to parse thumbnailSettings JSON", e);
        }
    }

    // Merge type-specific attributes
    if (itemType === "packaging") {
        attributes.width = formData.get("width");
        attributes.height = formData.get("height");
        attributes.depth = formData.get("depth");
    } else if (itemType === "consumables") {
        attributes.department = formData.get("department");
    }

    if (!name || isNaN(quantity)) {
        return { error: "Invalid data" };
    }

    try {
        console.log("Starting transaction for new item:", { name, finalSku: sku });
        const newItem = await db.transaction(async (tx) => {
            // Auto-generate SKU if components are provided
            let finalSku = sku;
            if (categoryId && (qualityCode || materialCode || attributeCode || sizeCode || brandCode)) {
                console.log("Generating SKU from codes:", { qualityCode, materialCode, attributeCode, sizeCode, brandCode });
                const [cat] = await tx.select().from(inventoryCategories).where(eq(inventoryCategories.id, categoryId)).limit(1);
                if (cat?.prefix) {
                    finalSku = [cat.prefix, brandCode, qualityCode, materialCode, attributeCode, sizeCode].filter(Boolean).join("-").toUpperCase();
                    console.log("Generated SKU:", finalSku);
                }
            }

            // Prepare folder path: CategoryPath / ItemName
            const categoryPath = await getCategoryPath(categoryId);
            const itemFolderPath = path.join(categoryPath, sanitizeFileName(name || "unnamed"));
            console.log("Item folder path:", itemFolderPath);

            const imageBackFile = formData.get("imageBack") as File;
            const imageSideFile = formData.get("imageSide") as File;
            const imageDetailsFiles = formData.getAll("imageDetails") as File[];

            console.log("Saving files...");
            const imageUrl = await saveFile(imageFile, itemFolderPath);
            const imageBackUrl = await saveFile(imageBackFile, itemFolderPath);
            const imageSideUrl = await saveFile(imageSideFile, itemFolderPath);

            const imageDetailsUrls: string[] = [];
            for (const file of imageDetailsFiles) {
                const url = await saveFile(file, itemFolderPath);
                if (url) imageDetailsUrls.push(url);
            }
            console.log("Files saved, URLs:", { imageUrl, imageDetailsCount: imageDetailsUrls.length });

            console.log("Inserting item into database...");
            const [insertedItem] = await tx.insert(inventoryItems).values({
                name,
                sku: finalSku || null,
                quantity,
                unit,
                itemType: itemType || "clothing",
                lowStockThreshold,
                criticalStockThreshold,
                description,
                location: locationName,
                storageLocationId: storageLocationId || null,

                categoryId: categoryId || null,
                qualityCode: qualityCode || null,
                materialCode: materialCode || null,
                brandCode: brandCode || null,
                attributeCode: attributeCode || null,
                sizeCode: sizeCode || null,
                attributes: attributes,
                thumbnailSettings: thumbnailSettings || attributes.thumbnailSettings || null,
                image: imageUrl,
                imageBack: imageBackUrl,
                imageSide: imageSideUrl,
                imageDetails: imageDetailsUrls,
                reservedQuantity: 0
            }).returning();
            console.log("Item inserted, ID:", insertedItem.id);

            // Create stock record if location is selected
            if (storageLocationId) {
                console.log("Creating stock record in storageLocationId:", storageLocationId);
                await tx.insert(inventoryStocks).values({
                    itemId: insertedItem.id,
                    storageLocationId,
                    quantity
                });
            }

            // Log transaction
            console.log("Logging transaction...");
            await tx.insert(inventoryTransactions).values({
                itemId: insertedItem.id,
                changeAmount: quantity,
                type: "in",
                reason: "Initial stock",
                storageLocationId: storageLocationId || null,
                createdBy: session?.id,
            });

            console.log("Audit log...");
            await logAction("Поставка", "inventory_item", insertedItem.id, {
                name,
                quantity,
                sku: finalSku,
                storageLocationId
            });

            return insertedItem;
        });

        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/${categoryId}`);
        // Return the new item ID
        // Note: We need to extract newItem from the transaction scope or query it.
        // Actually, newItem is defined inside the transaction callback. We can't access it here easily unless we return it from the transaction.
        // But the transaction is awaited.
        // Let's modify the transaction to return the newItem.
        return { success: true, id: newItem.id };
    } catch (error) {
        console.error("ADD ITEM ERROR:", error);
        await logError({
            error,
            path: "/dashboard/warehouse",
            method: "addInventoryItem",
            details: { name, sku, quantity, storageLocationId, categoryId }
        });
        return { error: error instanceof Error ? error.message : "Failed to add item" };
    }
}

export async function deleteInventoryItems(ids: string[]) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав для удаления позиций" };
    }

    try {
        // 1. Check strict dependencies (Orders)
        const itemsInOrders = await db.query.orderItems.findMany({
            where: inArray(orderItems.inventoryId, ids),
            columns: { inventoryId: true }
        });

        if (itemsInOrders.length > 0) {
            return { error: "Нельзя удалить товары, которые используются в заказах" };
        }

        // 2. Check transactions history
        const itemsWithHistory = await db.query.inventoryTransactions.findMany({
            where: inArray(inventoryTransactions.itemId, ids),
            columns: { itemId: true },
            limit: 1
        });

        if (itemsWithHistory.length > 0) {
            return { error: "Нельзя удалить товары, по которым были движения. Обнулите остаток, если товар больше не используется." };
        }

        // 3. Delete dependencies (Stocks)
        await db.delete(inventoryStocks).where(inArray(inventoryStocks.itemId, ids));

        // 4. Delete items
        await db.delete(inventoryItems).where(inArray(inventoryItems.id, ids));

        await logAction("Удаление позиций", "inventory_item_bulk", ids.join(","), { count: ids.length, ids });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse",
            method: "deleteInventoryItems",
            details: { ids }
        });
        console.error(error);
        return { error: "Не удалось удалить выбранные позиции" };
    }
}

export async function updateInventoryItem(id: string, formData: FormData) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав для изменения товаров" };
    }

    let itemType = formData.get("itemType") as "clothing" | "packaging" | "consumables";
    if (!["clothing", "packaging", "consumables"].includes(itemType)) {
        itemType = "clothing";
    }
    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const unit = formData.get("unit") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string) || 10;
    const criticalStockThreshold = parseInt(formData.get("criticalStockThreshold") as string) || 0;
    const reservedQuantity = parseInt(formData.get("reservedQuantity") as string) || 0;

    const categoryIdRaw = formData.get("categoryId") as string;
    const categoryId = (categoryIdRaw && categoryIdRaw !== "") ? categoryIdRaw : null;

    const storageLocationIdRaw = formData.get("storageLocationId") as string;
    const storageLocationId = (storageLocationIdRaw && storageLocationIdRaw !== "") ? storageLocationIdRaw : null;

    const qualityCodeRaw = formData.get("qualityCode") as string;
    const qualityCode = qualityCodeRaw || null;

    const materialCodeRaw = formData.get("materialCode") as string;
    const materialCode = materialCodeRaw || null;

    const attributeCodeRaw = formData.get("attributeCode") as string;
    const attributeCode = attributeCodeRaw || null;

    const sizeCodeRaw = formData.get("sizeCode") as string;
    const sizeCode = sizeCodeRaw || null;

    const brandCodeRaw = formData.get("brandCode") as string;
    const brandCode = brandCodeRaw || null;

    const description = formData.get("description") as string;
    const locationName = formData.get("location") as string;

    const attributesStr = formData.get("attributes") as string;
    let attributes: Record<string, unknown> = {};
    if (attributesStr) {
        try {
            attributes = JSON.parse(attributesStr);
        } catch (e) {
            console.error("Failed to parse attributes JSON", e);
        }
    }

    const thumbnailSettingsStr = formData.get("thumbnailSettings") as string;
    let thumbnailSettings = null;
    if (thumbnailSettingsStr) {
        try {
            thumbnailSettings = JSON.parse(thumbnailSettingsStr);
        } catch (e) {
            console.error("Failed to parse thumbnailSettings JSON", e);
        }
    }

    // Merge type-specific attributes
    if (itemType === "packaging") {
        attributes.width = formData.get("width");
        attributes.height = formData.get("height");
        attributes.depth = formData.get("depth");
    } else if (itemType === "consumables") {
        attributes.department = formData.get("department");
    }

    try {
        console.log("UPDATING ITEM ID:", id);

        const imageFile = formData.get("image") as File;

        // Auto-generate SKU if components are provided
        let finalSku = sku;
        if (categoryId && (qualityCode || materialCode || attributeCode || sizeCode || brandCode)) {
            const [cat] = await db.select().from(inventoryCategories).where(eq(inventoryCategories.id, categoryId)).limit(1);
            if (cat?.prefix) {
                finalSku = [cat.prefix, brandCode, qualityCode, materialCode, attributeCode, sizeCode].filter(Boolean).join("-").toUpperCase();
                console.log("REGENERATED SKU:", finalSku);
            }
        }

        const categoryPath = await getCategoryPath(categoryId);
        const itemFolderPath = path.join(categoryPath, sanitizeFileName(name || "unnamed"));

        const imageBackFile = formData.get("imageBack") as File;
        const imageSideFile = formData.get("imageSide") as File;
        const imageDetailsFiles = formData.getAll("imageDetails") as File[];

        let imageBackUrl = formData.get("currentImageBack") as string || null;
        const newImageBackUrl = await saveFile(imageBackFile, itemFolderPath);
        if (newImageBackUrl) imageBackUrl = newImageBackUrl;

        let imageSideUrl = formData.get("currentImageSide") as string || null;
        const newImageSideUrl = await saveFile(imageSideFile, itemFolderPath);
        if (newImageSideUrl) imageSideUrl = newImageSideUrl;

        let imageDetailsUrls: string[] = [];
        const currentImageDetailsStr = formData.get("currentImageDetails") as string;
        if (currentImageDetailsStr) {
            try {
                imageDetailsUrls = JSON.parse(currentImageDetailsStr);
            } catch { }
        }

        for (const file of imageDetailsFiles) {
            const url = await saveFile(file, itemFolderPath);
            if (url) imageDetailsUrls.push(url);
        }

        let imageUrl = formData.get("currentImage") as string || null;
        const newImageUrl = await saveFile(imageFile, itemFolderPath);
        if (newImageUrl) imageUrl = newImageUrl;

        console.log("EXECUTING DB UPDATE...");
        const result = await db.update(inventoryItems).set({
            name,
            sku: finalSku || null,
            unit,
            itemType: itemType || "clothing",
            quantity,
            lowStockThreshold,
            criticalStockThreshold,
            categoryId,
            description,
            location: locationName,
            storageLocationId,
            qualityCode,
            materialCode,
            brandCode,
            attributeCode,
            sizeCode,
            attributes: attributes || {},
            thumbnailSettings: thumbnailSettings,
            image: imageUrl,
            imageBack: imageBackUrl,
            imageSide: imageSideUrl,
            imageDetails: imageDetailsUrls,
            reservedQuantity
        }).where(eq(inventoryItems.id, id));

        console.log("UPDATE SUCCESSFUL. Lines affected:", result.rowCount);
        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/${categoryId}`);
        return { success: true };
    } catch (error) {
        console.error("UPDATE ITEM ERROR:", error);
        await logError({
            error,
            path: `/dashboard/warehouse/item/${id}`,
            method: "updateInventoryItem",
            details: { id, name, sku, quantity }
        });
        return { error: `Ошибка при обновлении: ${error instanceof Error ? error.message : "Неизвестная ошибка"}` };
    }
}

export async function deleteInventoryItemImage(itemId: string, type: "front" | "back" | "side" | "details", index?: number) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав для удаления изображений" };
    }

    try {
        const item = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.id, itemId)
        });

        if (!item) return { error: "Товар не найден" };

        const updateData: {
            image?: string | null;
            imageBack?: string | null;
            imageSide?: string | null;
            imageDetails?: string[] | null;
        } = {};
        if (type === "front") updateData.image = null;
        else if (type === "back") updateData.imageBack = null;
        else if (type === "side") updateData.imageSide = null;
        else if (type === "details" && typeof index === "number") {
            const currentDetails = [...(item.imageDetails as string[] || [])];
            currentDetails.splice(index, 1);
            updateData.imageDetails = currentDetails;
        }

        await db.update(inventoryItems).set(updateData).where(eq(inventoryItems.id, itemId));

        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/items/${itemId}`);
        return { success: true };
    } catch (error) {
        console.error("DEBUG: deleteInventoryItemImage error", error);
        return { error: "Ошибка при удалении изображения" };
    }
}

export async function getInventoryHistory() {
    try {
        const history = await db.query.inventoryTransactions.findMany({
            with: {
                item: {
                    with: {
                        storageLocation: true
                    }
                },
                creator: {
                    with: {
                        role: true
                    }
                },
                storageLocation: true,
                fromStorageLocation: true
            },
            orderBy: [desc(inventoryTransactions.createdAt)],
            limit: 50
        });
        return { data: history };
    } catch (error) {
        console.error("DEBUG: getInventoryHistory error", error);
        return { error: "Failed to fetch inventory history" };
    }
}

export async function adjustInventoryStock(itemId: string, amount: number, type: "in" | "out" | "set", reason: string, storageLocationId?: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        await db.transaction(async (tx) => {
            // 1. Get current item
            const [item] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, itemId)).limit(1);
            if (!item) throw new Error("Item not found");

            let netChange = 0;
            let effectiveType: "in" | "out" = "in";

            // If Type is SET, we need to calculate netChange based on target
            if (type === "set") {
                let currentQty = 0;

                if (storageLocationId) {
                    const [existingStock] = await tx
                        .select()
                        .from(inventoryStocks)
                        .where(and(
                            eq(inventoryStocks.itemId, itemId),
                            eq(inventoryStocks.storageLocationId, storageLocationId)
                        ))
                        .limit(1);
                    currentQty = existingStock?.quantity || 0;
                } else {
                    currentQty = item.quantity;
                }

                netChange = amount - currentQty;
                effectiveType = netChange >= 0 ? "in" : "out";
            } else {
                netChange = amount * (type === "in" ? 1 : -1);
                effectiveType = type;
            }

            // Skip if no change (for set)
            if (netChange === 0 && type === "set") return;

            // Update item total
            const newTotalQuantity = item.quantity + netChange;
            if (newTotalQuantity < 0) throw new Error("Insufficient total stock (result would be negative)");

            // 2. Manage per-warehouse stock
            if (storageLocationId) {
                const [existingStock] = await tx
                    .select()
                    .from(inventoryStocks)
                    .where(and(
                        eq(inventoryStocks.itemId, itemId),
                        eq(inventoryStocks.storageLocationId, storageLocationId)
                    ))
                    .limit(1);

                if (existingStock) {
                    const newStockQuantity = existingStock.quantity + netChange;
                    if (newStockQuantity < 0) throw new Error("Insufficient stock at this location");

                    await tx.update(inventoryStocks)
                        .set({ quantity: newStockQuantity, updatedAt: new Date() })
                        .where(eq(inventoryStocks.id, existingStock.id));
                } else {
                    const newStockQuantity = netChange; // Assuming starting from 0 if not exists
                    if (newStockQuantity < 0) throw new Error("Insufficient stock at this location to reduce");

                    await tx.insert(inventoryStocks).values({
                        itemId,
                        storageLocationId,
                        quantity: newStockQuantity
                    });
                }
            }

            // 3. Update global item quantity
            await tx.update(inventoryItems)
                .set({ quantity: newTotalQuantity })
                .where(eq(inventoryItems.id, itemId));

            // 4. Log transaction
            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: netChange,
                type: effectiveType,
                reason: type === "set" ? `Корректировка (Set): ${reason}` : reason,
                storageLocationId: storageLocationId || null,
                createdBy: session?.id,
            });

            // 5. Log audit
            await logAction(
                type === "set" ? "Корректировка" : (effectiveType === "in" ? "Поставка" : "Списание"),
                "inventory_item",
                itemId,
                {
                    name: item.name,
                    amount: Math.abs(netChange),
                    reason,
                    storageLocationId,
                    newTotalQuantity
                }
            );
        });

        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/items/${itemId}`);
        const [refetchedItem] = await db.select({ catId: inventoryItems.categoryId }).from(inventoryItems).where(eq(inventoryItems.id, itemId)).limit(1);
        if (refetchedItem?.catId) revalidatePath(`/dashboard/warehouse/${refetchedItem.catId}`);

        return { success: true };
    } catch (error: unknown) {
        await logError({
            error,
            path: `/dashboard/warehouse/adjust/${itemId}`,
            method: "adjustInventoryStock",
            details: { itemId, amount, type, reason, storageLocationId }
        });
        return { error: (error as Error).message || "Failed to adjust stock" };
    }
}

export async function transferInventoryStock(itemId: string, fromLocationId: string, toLocationId: string, amount: number, reason: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    if (amount <= 0) return { error: "Invalid amount" };
    if (fromLocationId === toLocationId) return { error: "Source and destination must be different" };

    try {
        await db.transaction(async (tx) => {
            // Source
            const [sourceStock] = await tx
                .select()
                .from(inventoryStocks)
                .where(and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, fromLocationId)
                ))
                .limit(1);

            if (!sourceStock || sourceStock.quantity < amount) {
                throw new Error("Недостаточно остатка на складе отправителе");
            }

            // Dest
            const [destStock] = await tx
                .select()
                .from(inventoryStocks)
                .where(and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, toLocationId)
                ))
                .limit(1);

            // Update Source
            const newSourceQty = sourceStock.quantity - amount;
            await tx.update(inventoryStocks)
                .set({ quantity: newSourceQty, updatedAt: new Date() })
                .where(eq(inventoryStocks.id, sourceStock.id));

            // Update Dest
            if (destStock) {
                await tx.update(inventoryStocks)
                    .set({ quantity: destStock.quantity + amount, updatedAt: new Date() })
                    .where(eq(inventoryStocks.id, destStock.id));
            } else {
                await tx.insert(inventoryStocks).values({
                    itemId,
                    storageLocationId: toLocationId,
                    quantity: amount
                });
            }

            // Log
            // Out from Source (using "transfer" type if DB supports, or "out")
            // Assuming "transfer" is valid logic or we just rely on reasoning.
            // Using "out" and "in" pair to be safe with existing types if unsure about enum. 
            // Better to match schema. Code used string before. 
            // Let's use "out" from source and "in" to dest with reason linking them.

            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: -amount,
                type: "transfer", // Using transfer type as intended for moves
                reason: `Перемещение в другой склад. Причина: ${reason}`,
                storageLocationId: fromLocationId,
                createdBy: session?.id,
            });

            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: amount,
                type: "transfer",
                reason: `Перемещение из другого склада. Причина: ${reason}`,
                storageLocationId: toLocationId,
                createdBy: session?.id,
            });

            await logAction("Перемещение", "inventory_item", itemId, {
                from: fromLocationId,
                to: toLocationId,
                amount,
                reason
            });
        });

        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/items/${itemId}`);
        return { success: true };
    } catch (error: unknown) {
        return { error: (error as Error).message || "Failed to transfer stock" };
    }
}

export async function getInventoryAttributes() {
    try {
        const attrs = await db.query.inventoryAttributes.findMany({
            orderBy: desc(inventoryAttributes.createdAt)
        });

        console.log("=== GET ATTRIBUTES DEBUG ===");
        console.log(`Total attributes: ${attrs.length}`);
        if (attrs.length > 0) {
            console.log("Sample attribute (first):");
            console.log("  ID:", attrs[0].id);
            console.log("  Name:", attrs[0].name);
            console.log("  Meta:", JSON.stringify(attrs[0].meta, null, 2));
        }
        console.log("============================");

        return { data: attrs };
    } catch {
        return { error: "Failed to fetch inventory attributes" };
    }
}

export async function deleteInventoryAttribute(id: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { error: "Недостаточно прав" };
    }

    try {
        // 1. Get the attribute info first
        const [attr] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.id, id));
        if (!attr) return { error: "Атрибут не найден" };

        // 2. Check if it's used in any inventory items
        // Map attribute types to column names
        // Map attribute types to column names
        const typeToColumn: Record<string, AnyPgColumn> = {
            'color': inventoryItems.attributeCode,
            'material': inventoryItems.materialCode,
            'brand': inventoryItems.brandCode,
            'size': inventoryItems.sizeCode,
            'quality': inventoryItems.qualityCode
        };

        const checkColumn = typeToColumn[attr.type.toLowerCase()];

        if (checkColumn) {
            const [usage] = await db
                .select({ id: inventoryItems.id })
                .from(inventoryItems)
                .where(eq(checkColumn, attr.value))
                .limit(1);

            if (usage) {
                return { error: "Этот атрибут используется в товарах и не может быть удален" };
            }
        }

        // 3. Delete
        await db.delete(inventoryAttributes).where(eq(inventoryAttributes.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Удален атрибут: ${attr.name} (${attr.value})`,
            createdBy: session?.id,
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Delete attribute error:", error);
        return { error: "Не удалось удалить атрибут" };
    }
}

export async function createInventoryAttribute(type: string, name: string, value: string, meta?: Record<string, unknown>) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        console.log("=== CREATE ATTRIBUTE DEBUG ===");
        console.log("Type:", type);
        console.log("Name:", name);
        console.log("Value:", value);
        console.log("Meta (received):", JSON.stringify(meta, null, 2));
        console.log("Has fem:", meta && typeof meta === 'object' && 'fem' in meta);
        console.log("Has neut:", meta && typeof meta === 'object' && 'neut' in meta);
        console.log("==============================");

        const [newAttr] = await db.insert(inventoryAttributes).values({
            type,
            name,
            value,
            meta: meta || null
        }).returning();

        revalidatePath("/dashboard/warehouse");

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Добавлен атрибут: ${name} (${value}) в раздел ${type}`,
            createdBy: session?.id,
        });

        return { success: true, data: newAttr };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create attribute" };
    }
}

export async function updateInventoryAttribute(id: string, name: string, value: string, meta?: Record<string, unknown>) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { error: "Недостаточно прав" };
    }

    try {
        // 1. Get the old attribute data
        const [oldAttr] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.id, id));
        if (!oldAttr) return { error: "Атрибут не найден" };

        console.log("=== UPDATE ATTRIBUTE DEBUG ===");
        console.log("Attribute ID:", id);
        console.log("Old meta:", JSON.stringify(oldAttr.meta, null, 2));
        console.log("New meta (received):", JSON.stringify(meta, null, 2));
        console.log("Has fem:", meta && typeof meta === 'object' && 'fem' in meta);
        console.log("Has neut:", meta && typeof meta === 'object' && 'neut' in meta);
        console.log("==============================");

        // 2. Update the attribute
        await db.update(inventoryAttributes).set({
            name,
            value,
            meta: meta || null // Ensure we pass null if meta is undefined
        }).where(eq(inventoryAttributes.id, id));

        // 3. If the code (value) OR visibility settings changed, update all items using this attribute
        const oldShowInSku = (oldAttr.meta as { showInSku?: boolean })?.showInSku ?? true;
        const newShowInSku = (meta as { showInSku?: boolean })?.showInSku ?? true;

        if (oldAttr.value !== value || oldShowInSku !== newShowInSku) {
            const typeToColumn: Record<string, AnyPgColumn> = {
                'color': inventoryItems.attributeCode,
                'material': inventoryItems.materialCode,
                'brand': inventoryItems.brandCode,
                'size': inventoryItems.sizeCode,
                'quality': inventoryItems.qualityCode
            };

            const checkColumn = typeToColumn[oldAttr.type.toLowerCase()];

            if (checkColumn) {
                // Find all items using the old code (or current code if only meta changed)
                const affectedItems = await db
                    .select()
                    .from(inventoryItems)
                    .where(eq(checkColumn, oldAttr.value));

                // Need all attributes to correctly check visibility of OTHER components during regeneration
                const allAttrs = await db.select().from(inventoryAttributes);

                const getAttrVisibility = (type: string, code: string | null) => {
                    if (!code) return false;
                    // If it's the attribute we are currently updating, use the NEW meta/value
                    if (type === oldAttr.type && code === value) {
                        return newShowInSku;
                    }
                    // Otherwise look up in DB
                    const a = allAttrs.find(attr => attr.type === type && attr.value === code);
                    return (a?.meta as { showInSku?: boolean })?.showInSku ?? true;
                };

                // Update each item with the new code and regenerate SKU
                for (const item of affectedItems) {
                    const updates: Partial<InferInsertModel<typeof inventoryItems>> = {};

                    // Update the specific code field if it changed
                    if (oldAttr.value !== value) {
                        if (oldAttr.type.toLowerCase() === 'color') updates.attributeCode = value;
                        else if (oldAttr.type.toLowerCase() === 'material') updates.materialCode = value;
                        else if (oldAttr.type.toLowerCase() === 'brand') updates.brandCode = value;
                        else if (oldAttr.type.toLowerCase() === 'size') updates.sizeCode = value;
                        else if (oldAttr.type.toLowerCase() === 'quality') updates.qualityCode = value;
                    }

                    // Regenerate SKU if this is a clothing item with category prefix
                    if (item.categoryId) {
                        const [cat] = await db.select().from(inventoryCategories).where(eq(inventoryCategories.id, item.categoryId)).limit(1);
                        if (cat?.prefix) {
                            // Use updated values
                            const brandCode = oldAttr.type.toLowerCase() === 'brand' ? value : item.brandCode;
                            const qualityCode = oldAttr.type.toLowerCase() === 'quality' ? value : item.qualityCode;
                            const materialCode = oldAttr.type.toLowerCase() === 'material' ? value : item.materialCode;
                            const attributeCode = oldAttr.type.toLowerCase() === 'color' ? value : item.attributeCode;
                            const sizeCode = oldAttr.type.toLowerCase() === 'size' ? value : item.sizeCode;

                            const skuParts: string[] = [];
                            skuParts.push(cat.prefix); // Prefix always shown

                            if (getAttrVisibility('brand', brandCode)) skuParts.push(brandCode!);
                            if (getAttrVisibility('quality', qualityCode)) skuParts.push(qualityCode!);
                            if (getAttrVisibility('material', materialCode)) skuParts.push(materialCode!);
                            if (getAttrVisibility('color', attributeCode)) skuParts.push(attributeCode!);
                            if (getAttrVisibility('size', sizeCode)) skuParts.push(sizeCode!);

                            updates.sku = skuParts.join("-").toUpperCase();
                        }
                    }

                    // Apply updates
                    await db.update(inventoryItems)
                        .set(updates)
                        .where(eq(inventoryItems.id, item.id));
                }

            }
        }

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Изменен атрибут: ${name} (${value})`,
            createdBy: session?.id,
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update attribute" };
    }
}

export async function regenerateAllItemSKUs() {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { error: "Недостаточно прав" };
    }

    try {
        // Get all data needed
        const items = await db.select().from(inventoryItems);
        const allAttributes = await db.select().from(inventoryAttributes);
        const allCategories = await db.select().from(inventoryCategories);
        const allTypes = await db.select().from(inventoryAttributeTypes).orderBy(inventoryAttributeTypes.sortOrder, inventoryAttributeTypes.createdAt);
        const customTypes = allTypes.filter(t => !["brand", "quality", "material", "size", "color"].includes(t.slug));

        let updatedCount = 0;

        for (const item of items) {
            if (!item.categoryId) continue;

            const cat = allCategories.find(c => c.id === item.categoryId);
            if (!cat) continue;

            // 1. Generate SKU
            // Only for categories with prefix
            // 1. Generate SKU
            // Only for categories with prefix
            let newSku = item.sku;
            if (cat.prefix) {
                const shouldShowInSku = (type: string, code: string | null) => {
                    if (!code) return false;
                    const attr = allAttributes.find(a => a.type === type && a.value === code);
                    return (attr?.meta as { showInSku?: boolean })?.showInSku ?? true;
                };

                const skuParts: string[] = [];
                skuParts.push(cat.prefix);

                if (shouldShowInSku('brand', item.brandCode)) skuParts.push(item.brandCode!);
                if (shouldShowInSku('quality', item.qualityCode)) skuParts.push(item.qualityCode!);
                if (shouldShowInSku('material', item.materialCode)) skuParts.push(item.materialCode!);
                if (shouldShowInSku('color', item.attributeCode)) skuParts.push(item.attributeCode!); // color
                if (shouldShowInSku('size', item.sizeCode)) skuParts.push(item.sizeCode!);

                // Custom Types SKU
                customTypes.forEach(t => {
                    const code = (item.attributes as Record<string, unknown>)?.[t.slug] as string;
                    if (code && shouldShowInSku(t.slug, code)) {
                        skuParts.push(code);
                    }
                });

                newSku = skuParts.join("-").toUpperCase();
            }

            const targetGender = cat.gender || "masculine";

            // 2. Generate Name
            const getAttrName = (type: string, code: string | null) => {
                if (!code) return null;
                const attr = allAttributes.find(a => a.type === type && a.value === code);
                // Check visibility
                if (attr && (attr.meta as { showInName?: boolean })?.showInName === false) return null;

                if (attr) {
                    const meta = attr.meta as { fem?: string; neut?: string } | null;
                    if (targetGender === "feminine" && meta?.fem) return meta.fem;
                    if (targetGender === "neuter" && meta?.neut) return meta.neut;
                    return attr.name;
                }
                return code;
            };

            const brandName = getAttrName("brand", item.brandCode);
            const colorName = getAttrName("color", item.attributeCode);
            const sizeName = getAttrName("size", item.sizeCode);
            const qualityName = getAttrName("quality", item.qualityCode);
            // Note: Material logic could be added here if we want it in name

            // Note: We deliberately INCLUDE "Base" quality in the name now (unless hidden in dictionary)
            const nameParts = [
                cat.name,
                brandName,
                qualityName,
                colorName,
                sizeName
            ].filter(Boolean);

            // Custom Types Name
            customTypes.forEach(t => {
                const code = (item.attributes as Record<string, unknown>)?.[t.slug] as string;
                const name = getAttrName(t.slug, code);
                if (name) nameParts.push(name);
            });

            const newName = nameParts.join(" ");

            // Update if SKU or Name changed
            if (newSku !== item.sku || newName !== item.name) {
                await db.update(inventoryItems)
                    .set({
                        sku: newSku,
                        name: newName
                    })
                    .where(eq(inventoryItems.id, item.id));
                updatedCount++;
            }
        }

        await logAction(
            "Массовое обновление SKU и имен",
            "inventory_items",
            "bulk",
            { updatedCount, totalItems: items.length }
        );

        revalidatePath("/dashboard/warehouse");
        return { success: true, updatedCount, totalItems: items.length };
    } catch (e) {
        console.error(e);
        return { error: "Не удалось обновить данные" };
    }
}

export async function getItemStocks(itemId: string) {
    try {
        const stocks = await db.query.inventoryStocks.findMany({
            where: eq(inventoryStocks.itemId, itemId),
            with: {
                storageLocation: true
            }
        });
        return { data: stocks };
    } catch {
        return { error: "Failed to fetch item stocks" };
    }
}

export async function getItemHistory(itemId: string) {
    try {
        const history = await db.query.inventoryTransactions.findMany({
            where: eq(inventoryTransactions.itemId, itemId),
            with: {
                creator: true,
                storageLocation: true
            },
            orderBy: [desc(inventoryTransactions.createdAt)],
            limit: 50
        });
        return { data: history };
    } catch {
        return { error: "Failed to fetch item history" };
    }
}

// Storage Locations Actions
export async function getStorageLocations() {
    try {
        // Use direct query instead of db.query to avoid potential issues
        const locations = await db
            .select({
                id: storageLocations.id,
                name: storageLocations.name,
                address: storageLocations.address,
                description: storageLocations.description,
                responsibleUserId: storageLocations.responsibleUserId,
                isSystem: storageLocations.isSystem,
                createdAt: storageLocations.createdAt,
                responsibleUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                }
            })
            .from(storageLocations)
            .leftJoin(users, eq(storageLocations.responsibleUserId, users.id))
            .orderBy(storageLocations.name);

        const locationsWithItems = await Promise.all(
            locations.map(async (loc) => {
                // 1. Get items from Stocks (New Architecture)
                const stockItems = await db
                    .select({
                        id: inventoryItems.id,
                        name: inventoryItems.name,
                        quantity: inventoryStocks.quantity,
                        unit: inventoryItems.unit,
                        sku: inventoryItems.sku,
                        categoryId: inventoryItems.categoryId,
                        categoryName: inventoryCategories.name,
                        categorySingularName: inventoryCategories.singularName,
                        categoryPluralName: inventoryCategories.pluralName
                    })
                    .from(inventoryStocks)
                    .innerJoin(inventoryItems, eq(inventoryStocks.itemId, inventoryItems.id))
                    .leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id))
                    .where(and(
                        eq(inventoryStocks.storageLocationId, loc.id),
                        sql`${inventoryStocks.quantity} > 0`
                    ));

                // 2. Get items from Legacy fields (Fallback)
                const legacyItems = await db
                    .select({
                        id: inventoryItems.id,
                        name: inventoryItems.name,
                        quantity: inventoryItems.quantity,
                        unit: inventoryItems.unit,
                        sku: inventoryItems.sku,
                        categoryName: inventoryCategories.name
                    })
                    .from(inventoryItems)
                    .leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id))
                    .where(and(
                        eq(inventoryItems.storageLocationId, loc.id),
                        sql`${inventoryItems.quantity} > 0`
                    ));

                // 3. Merge Strategies (Priority to Stocks)
                const itemsMap = new Map();
                // Add legacy first
                legacyItems.forEach(item => itemsMap.set(item.id, item));
                // Add/Overwrite with stocks (because if stock exists, it's the truth source for this location)
                stockItems.forEach(item => itemsMap.set(item.id, item));

                // Note: If an item is in both legacy (loc A) and stocks (loc A), stock wins.
                // If an item was moved to loc B (stock), but still has legacy loc A, it will show in A?
                // Yes, until we fully migrate quantity out of item table. 
                // But moveInventory creates stock on B. It doesn't clear legacy A unless we do it.
                // For now, this is acceptable for transition.

                return {
                    ...loc,
                    items: Array.from(itemsMap.values())
                };
            })
        );

        return { data: locationsWithItems };
    } catch {
        return { error: "Failed to fetch storage locations" };
    }
}

export async function addStorageLocation(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const responsibleUserId = formData.get("responsibleUserId") as string;

    if (!name || !address) {
        return { error: "Name and address are required" };
    }

    try {
        await db.insert(storageLocations).values({
            name,
            address,
            description: description || null,
            responsibleUserId: responsibleUserId || null,
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch {
        return { error: "Failed to add storage location" };
    }
}

export async function deleteStorageLocation(id: string, password?: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав для удаления места хранения" };
    }

    try {
        const location = await db.query.storageLocations.findFirst({
            where: eq(storageLocations.id, id)
        });

        if (!location) return { error: "Место хранения не найдено" };

        if (location.isSystem) {
            if (session.roleName !== "Администратор") {
                return { error: "Только администратор может удалять системные места хранения" };
            }
            if (!password) {
                return { error: "Для удаления системного места хранения требуется пароль администратора" };
            }

            const [admin] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
            if (!admin || !(await comparePassword(password, admin.passwordHash))) {
                return { error: "Неверный пароль администратора" };
            }
        }

        // 1. Check if there are any stocks with positive quantity
        const activeStocks = await db.query.inventoryStocks.findMany({
            where: and(
                eq(inventoryStocks.storageLocationId, id),
                sql`${inventoryStocks.quantity} > 0`
            ),
            limit: 1
        });

        if (activeStocks.length > 0) {
            return { error: "Нельзя удалить склад, на котором числятся товары" };
        }

        await db.transaction(async (tx) => {
            // 2. Clear Stocks (zero quantity records)
            await tx.delete(inventoryStocks).where(eq(inventoryStocks.storageLocationId, id));

            // 3. Nullify references in Transactions (History)
            await tx.update(inventoryTransactions)
                .set({ storageLocationId: null })
                .where(eq(inventoryTransactions.storageLocationId, id));

            await tx.update(inventoryTransactions)
                .set({ fromStorageLocationId: null })
                .where(eq(inventoryTransactions.fromStorageLocationId, id));

            // 4. Nullify references in Transfers
            await tx.update(inventoryTransfers)
                .set({ fromLocationId: null })
                .where(eq(inventoryTransfers.fromLocationId, id));

            await tx.update(inventoryTransfers)
                .set({ toLocationId: null })
                .where(eq(inventoryTransfers.toLocationId, id));

            // 5. Unlink items (Legacy check, primarily field update)
            await tx.update(inventoryItems)
                .set({ storageLocationId: null })
                .where(eq(inventoryItems.storageLocationId, id));

            // 6. Delete Location
            await tx.delete(storageLocations).where(eq(storageLocations.id, id));

            await logAction("Удаление склада", "storage_location", id, { id, isSystem: location.isSystem });
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to delete storage location. Ensure it is empty." };
    }
}

export async function updateStorageLocation(id: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const responsibleUserId = formData.get("responsibleUserId") as string;

    try {
        await db.update(storageLocations).set({
            name,
            address,
            description: description || null,
            responsibleUserId: responsibleUserId || null,
        }).where(eq(storageLocations.id, id));

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch {
        return { error: "Failed to update storage location" };
    }
}

export async function getAllUsers() {
    try {
        const allUsers = await db.select().from(users).orderBy(users.name);
        return { data: allUsers };
    } catch {
        return { error: "Failed to fetch users" };
    }
}

export async function seedStorageLocations() {
    const locations = [
        { name: "Производство", address: "Пушкина 71" },
        { name: "Стас", address: "Роз 355а" },
        { name: "Леня", address: "Доваторцев 67" },
        { name: "Денис", address: "Тухачевского 26/1" }
    ];

    try {
        for (const loc of locations) {
            const existing = await db.select().from(storageLocations).where(eq(storageLocations.name, loc.name)).limit(1);
            if (existing.length === 0) {
                await db.insert(storageLocations).values({
                    name: loc.name,
                    address: loc.address,
                });
            }
        }
        // Removed revalidatePath - this function is called during render
        return { success: true };
    } catch {
        return { error: "Failed to seed" };
    }
}

export async function moveInventoryItem(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Not authorized" };

    const itemId = formData.get("itemId") as string;
    const fromLocationId = formData.get("fromLocationId") as string;
    const toLocationId = formData.get("toLocationId") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const comment = formData.get("comment") as string;

    if (!itemId || !fromLocationId || !toLocationId || !quantity) {
        return { error: "Missing required fields" };
    }

    if (fromLocationId === toLocationId) {
        return { error: "Source and destination cannot be the same" };
    }

    try {
        await db.transaction(async (tx) => {
            // Fetch location names for logging
            const [fromLocation] = await tx.select({ name: storageLocations.name }).from(storageLocations).where(eq(storageLocations.id, fromLocationId));
            const [toLocation] = await tx.select({ name: storageLocations.name }).from(storageLocations).where(eq(storageLocations.id, toLocationId));

            if (!fromLocation || !toLocation) {
                throw new Error("One or both locations not found");
            }

            const fromName = fromLocation.name;
            const toName = toLocation.name;
            const logMessage = `Перемещение со склада "${fromName}" на "${toName}"${comment ? `: ${comment}` : ""}`;
            // 1. Get/Init Source Stock
            let sourceStock = await tx.query.inventoryStocks.findFirst({
                where: and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, fromLocationId)
                )
            });

            // Legacy Fallback: If no stock record, check legacy item field
            if (!sourceStock) {
                const item = await tx.query.inventoryItems.findFirst({
                    where: eq(inventoryItems.id, itemId)
                });

                if (item && item.storageLocationId === fromLocationId && item.quantity >= quantity) {
                    const [newStock] = await tx.insert(inventoryStocks).values({
                        itemId,
                        storageLocationId: fromLocationId,
                        quantity: item.quantity
                    }).returning();
                    sourceStock = newStock;
                }
            }

            if (!sourceStock || sourceStock.quantity < quantity) {
                throw new Error("Недостаточно товара на исходном складе");
            }

            // 2. Decrement Source
            await tx.update(inventoryStocks)
                .set({
                    quantity: sql`${inventoryStocks.quantity} - ${quantity}`,
                    updatedAt: new Date()
                })
                .where(eq(inventoryStocks.id, sourceStock.id));

            // 3. Increment/Create Target
            const targetStock = await tx.query.inventoryStocks.findFirst({
                where: and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, toLocationId)
                )
            });

            if (targetStock) {
                await tx.update(inventoryStocks)
                    .set({
                        quantity: sql`${inventoryStocks.quantity} + ${quantity}`,
                        updatedAt: new Date()
                    })
                    .where(eq(inventoryStocks.id, targetStock.id));
            } else {
                await tx.insert(inventoryStocks).values({
                    itemId,
                    storageLocationId: toLocationId,
                    quantity: quantity
                });
            }

            // 4. Log Transfer
            await tx.insert(inventoryTransfers).values({
                itemId,
                fromLocationId,
                toLocationId,
                quantity,
                comment,
                createdBy: session?.id
            });

            // 6. Log Transaction (Single record for transfer)
            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: quantity,
                type: "transfer",
                reason: logMessage,
                storageLocationId: toLocationId,
                fromStorageLocationId: fromLocationId,
                createdBy: session?.id
            });

            // 7. Create Notifications for responsible users
            // Get responsible users for both locations
            const [fromLoc] = await tx.select({ responsibleUserId: storageLocations.responsibleUserId, name: storageLocations.name })
                .from(storageLocations).where(eq(storageLocations.id, fromLocationId)).limit(1);
            const [toLoc] = await tx.select({ responsibleUserId: storageLocations.responsibleUserId, name: storageLocations.name })
                .from(storageLocations).where(eq(storageLocations.id, toLocationId)).limit(1);
            const [item] = await tx.select({ name: inventoryItems.name }).from(inventoryItems).where(eq(inventoryItems.id, itemId)).limit(1);

            const usersToNotify = new Set<string>();
            if (fromLoc?.responsibleUserId) usersToNotify.add(fromLoc.responsibleUserId);
            if (toLoc?.responsibleUserId) usersToNotify.add(toLoc.responsibleUserId);

            for (const userId of usersToNotify) {
                await tx.insert(notifications).values({
                    userId,
                    title: "Перемещение товара",
                    message: `Товар "${item?.name}" (${quantity} шт.) перемещен из "${fromLoc?.name}" в "${toLoc?.name}"`,
                    type: "transfer",
                });
            }
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error: unknown) {
        await logError({
            error,
            path: "/dashboard/warehouse/move",
            method: "moveInventoryItem",
            details: { itemId, fromLocationId, toLocationId, quantity }
        });
        return { error: (error as Error).message || "Failed to move inventory" };
    }
}

export async function deleteInventoryTransactions(ids: string[]) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { error: "Недостаточно прав" };
    }

    try {
        await db.delete(inventoryTransactions).where(inArray(inventoryTransactions.id, ids));

        await logAction("Удаление записей истории", "inventory_transaction_bulk", ids.join(","), { count: ids.length });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/history",
            method: "deleteInventoryTransactions",
            details: { ids }
        });
        return { error: "Ошибка при удалении записей" };
    }
}

export async function clearInventoryHistory() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { error: "Недостаточно прав" };
    }

    try {
        await db.delete(inventoryTransactions);
        await logAction("Очистка истории инвентаря", "inventory_history", "all", {});
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/history",
            method: "clearInventoryHistory"
        });
        return { error: "Ошибка при очистке истории" };
    }
}

export async function bulkMoveInventoryItems(ids: string[], toLocationId: string, comment?: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав" };
    }

    try {
        await db.transaction(async (tx) => {
            for (const id of ids) {
                const [item] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, id)).limit(1);
                if (!item) continue;

                const fromLocationId = item.storageLocationId;
                if (fromLocationId === toLocationId) continue;

                // 1. Decrement old location if exists
                if (fromLocationId) {
                    await tx.update(inventoryStocks)
                        .set({ quantity: sql`${inventoryStocks.quantity} - ${item.quantity}`, updatedAt: new Date() })
                        .where(and(eq(inventoryStocks.itemId, id), eq(inventoryStocks.storageLocationId, fromLocationId)));
                }

                // 2. Increment new location or create
                const [targetStock] = await tx.select().from(inventoryStocks).where(and(eq(inventoryStocks.itemId, id), eq(inventoryStocks.storageLocationId, toLocationId))).limit(1);
                if (targetStock) {
                    await tx.update(inventoryStocks)
                        .set({ quantity: sql`${inventoryStocks.quantity} + ${item.quantity}`, updatedAt: new Date() })
                        .where(eq(inventoryStocks.id, targetStock.id));
                } else {
                    await tx.insert(inventoryStocks).values({
                        itemId: id,
                        storageLocationId: toLocationId,
                        quantity: item.quantity
                    });
                }

                // 3. Update item main location
                await tx.update(inventoryItems).set({ storageLocationId: toLocationId }).where(eq(inventoryItems.id, id));

                // 4. Log transaction
                await tx.insert(inventoryTransactions).values({
                    itemId: id,
                    changeAmount: item.quantity,
                    type: "transfer",
                    reason: `Массовое перемещение${comment ? `: ${comment}` : ""}`,
                    storageLocationId: toLocationId,
                    fromStorageLocationId: fromLocationId,
                    createdBy: session?.id,
                });
            }
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/bulk-move",
            method: "bulkMoveInventoryItems",
            details: { count: ids.length, toLocationId }
        });
        return { error: "Ошибка при массовом перемещении" };
    }
}

export async function bulkUpdateInventoryCategory(ids: string[], toCategoryId: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { error: "Недостаточно прав" };
    }

    try {
        await db.update(inventoryItems)
            .set({ categoryId: toCategoryId })
            .where(inArray(inventoryItems.id, ids));

        await logAction("Массовая смена категории", "inventory_item_bulk", ids.join(","), { count: ids.length, toCategoryId });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/bulk-category",
            method: "bulkUpdateInventoryCategory",
            details: { count: ids.length, toCategoryId }
        });
        return { error: "Ошибка при массовой смене категории" };
    }
}

// Measurement Units Actions
export async function getMeasurementUnits() {
    try {
        const units = await db.query.measurementUnits.findMany({
            where: eq(measurementUnits.isActive, true),
            orderBy: measurementUnits.name
        });
        return { data: units };
    } catch (error) {
        console.error(error);
        return { error: "Failed to fetch measurement units" };
    }
}

export async function addMeasurementUnit(formData: FormData) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { error: "Недостаточно прав" };
    }

    const name = formData.get("name") as string;
    const fullName = formData.get("fullName") as string;
    const description = formData.get("description") as string;

    if (!name) return { error: "Name is required" };

    try {
        await db.insert(measurementUnits).values({
            name,
            fullName,
            description,
        });
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch {
        return { error: "Failed to add measurement unit" };
    }
}

export async function seedMeasurementUnits() {
    const defaultUnits = [
        { name: "шт", fullName: "Штуки" },
        { name: "м", fullName: "Метры" },
        { name: "кг", fullName: "Килограммы" },
        { name: "упак", fullName: "Упаковки" },
        { name: "л", fullName: "Литры" },
        { name: "пог.м", fullName: "Погонные метры" }
    ];

    try {
        for (const unit of defaultUnits) {
            const existing = await db.query.measurementUnits.findFirst({
                where: eq(measurementUnits.name, unit.name)
            });
            if (!existing) {
                await db.insert(measurementUnits).values(unit);
            }
        }
        return { success: true };
    } catch (error) {
        console.error("Seed error:", error);
        return { error: "Failed to seed units" };
    }
}

// Restore System Categories
export async function seedSystemCategories() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { error: "Недостаточно прав" };
    }

    try {
        // 1. Ensure Top Level Categories
        const topLevel = [
            { name: "Одежда", icon: "shirt", color: "indigo", description: "Одежда и текстильные изделия" },
            { name: "Упаковка", icon: "box", color: "amber", description: "Упаковочные материалы" },
            { name: "Расходники", icon: "scissors", color: "rose", description: "Расходные материалы для производства" },
        ];

        const topLevelMap: Record<string, string> = {};

        for (const cat of topLevel) {
            let [found] = await db.select().from(inventoryCategories).where(eq(inventoryCategories.name, cat.name)).limit(1);
            if (!found) {
                const [newCat] = await db.insert(inventoryCategories).values({
                    name: cat.name,
                    icon: cat.icon,
                    color: cat.color,
                    description: cat.description,
                    parentId: null
                }).returning();
                found = newCat;
            }
            topLevelMap[cat.name] = found.id;
        }

        const clothingId = topLevelMap["Одежда"];

        // 2. Define Subcategories with linguistic rules
        const subCategories = [
            { name: "Футболка", icon: "shirt", color: "rose", prefix: "TS", parentId: clothingId, singularName: "Футболка", pluralName: "Футболки", gender: "feminine" },
            { name: "Худи", icon: "hourglass", color: "indigo", prefix: "HD", parentId: clothingId, singularName: "Худи", pluralName: "Худи", gender: "neuter" },
            { name: "Свитшот", icon: "layers", color: "violet", prefix: "SW", parentId: clothingId, singularName: "Свитшот", pluralName: "Свитшоты", gender: "masculine" },
            { name: "Лонгслив", icon: "shirt", color: "emerald", prefix: "LS", parentId: clothingId, singularName: "Лонгслив", pluralName: "Лонгсливы", gender: "masculine" },
            { name: "Анорак", icon: "wind", color: "cyan", prefix: "AN", parentId: clothingId, singularName: "Анорак", pluralName: "Анораки", gender: "masculine" },
            { name: "Зип-худи", icon: "zap", color: "indigo", prefix: "ZH", parentId: clothingId, singularName: "Зип-худи", pluralName: "Зип-худи", gender: "neuter" },
            { name: "Штаны", icon: "package", color: "slate", prefix: "PT", parentId: clothingId, singularName: "Штаны", pluralName: "Штаны", gender: "masculine" }, // Plural only usually, but masculine adjectives fit best
            { name: "Поло", icon: "shirt", color: "cyan", prefix: "PL", parentId: clothingId, singularName: "Поло", pluralName: "Поло", gender: "neuter" },
            { name: "Кепка", icon: "box", color: "cyan", prefix: "CP", parentId: clothingId, singularName: "Кепка", pluralName: "Кепки", gender: "feminine" },
        ];

        let created = 0;
        let updated = 0;

        for (const sub of subCategories) {
            const [found] = await db.select()
                .from(inventoryCategories)
                .where(sql`${inventoryCategories.name} = ${sub.name} OR ${inventoryCategories.name} = ${sub.pluralName}`)
                .limit(1);
            if (!found) {
                await db.insert(inventoryCategories).values(sub);
                created++;
            } else {
                // Update missing linguistic fields or incorrect parent
                const needsUpdate = found.singularName !== sub.singularName || found.pluralName !== sub.pluralName || found.gender !== sub.gender || found.parentId !== sub.parentId;
                if (needsUpdate) {
                    await db.update(inventoryCategories)
                        .set({
                            singularName: sub.singularName,
                            pluralName: sub.pluralName,
                            gender: sub.gender,
                            parentId: sub.parentId
                        })
                        .where(eq(inventoryCategories.id, found.id));
                    updated++;
                }
            }
        }

        // 3. Cleanup: Delete empty plural orphans created by mistake
        const pluralDuplicates = ["Футболки", "Кепки"];
        for (const name of pluralDuplicates) {
            const [found] = await db.select().from(inventoryCategories).where(eq(inventoryCategories.name, name)).limit(1);
            if (found && !found.parentId) {
                // Check if they have items before deleting
                const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.categoryId, found.id)).limit(1);
                if (!item) {
                    await db.delete(inventoryCategories).where(eq(inventoryCategories.id, found.id));
                }
            }
        }

        revalidatePath("/dashboard/warehouse");
        return {
            success: true,
            message: `Создано: ${created}, Обновлено: ${updated}, Очищено дублей`
        };
    } catch (error) {
        console.error("Seed error:", error);
        return { error: "Failed to seed categories" };
    }
}

export async function seedSystemAttributes() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { error: "Недостаточно прав" };
    }

    const systemAttrs = [
        // Brands
        { type: "brand", name: "Muse Wear", value: "MSW" },

        // Colors
        { type: "color", name: "Белый", value: "WHT", meta: { hex: "#FFFFFF" } },
        { type: "color", name: "Черный", value: "BLK", meta: { hex: "#000000" } },
        { type: "color", name: "Молочный", value: "MILK", meta: { hex: "#F5F5DC" } },
        { type: "color", name: "Шоколад", value: "CHOC", meta: { hex: "#7B3F00" } },
        { type: "color", name: "Графит", value: "GRAF", meta: { hex: "#383838" } },
        { type: "color", name: "Баблгам", value: "BUB", meta: { hex: "#FFC1CC" } },

        // Sizes
        { type: "size", name: "Kids", value: "KDS" },
        { type: "size", name: "S", value: "S" },
        { type: "size", name: "M", value: "M" },
        { type: "size", name: "S-M", value: "SM" },
        { type: "size", name: "L", value: "L" },
        { type: "size", name: "XL", value: "XL" },

        // Materials
        { type: "material", name: "Кулирка", value: "KUL" },
        { type: "material", name: "Френч-терри", value: "FT" },

        // Quality
        { type: "quality", name: "Base", value: "BS" },
        { type: "quality", name: "Premium", value: "PRM" },
    ];

    try {
        for (const attr of systemAttrs) {
            const existing = await db.query.inventoryAttributes.findFirst({
                where: and(
                    eq(inventoryAttributes.type, attr.type),
                    eq(inventoryAttributes.value, attr.value)
                )
            });
            if (!existing) {
                await db.insert(inventoryAttributes).values(attr);
            }
        }
        return { success: true };
    } catch (error) {
        console.error("Seed attributes error:", error);
        return { error: "Failed to seed attributes" };
    }
}

// Attribute Types Management
export async function getInventoryAttributeTypes() {
    try {
        const types = await db.select().from(inventoryAttributeTypes)
            .orderBy(asc(inventoryAttributeTypes.sortOrder), asc(inventoryAttributeTypes.createdAt));
        return { data: types };
    } catch {
        return { error: "Failed to fetch attribute types" };
    }
}

export async function createInventoryAttributeType(name: string, slug: string, categoryId?: string, isSystem: boolean = false) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { error: "Недостаточно прав" };
    }

    try {
        // Slug generation/cleaning
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, "_");

        await db.insert(inventoryAttributeTypes).values({
            name,
            slug: cleanSlug,
            categoryId: categoryId || null,
            isSystem
        });
        revalidatePath("/dashboard/warehouse");

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Создан тип атрибута: ${name} (${cleanSlug})`,
            createdBy: session?.id,
        });

        return { success: true };
    } catch {
        return { error: "Не удалось создать раздел (возможно, такой код уже существует)" };
    }
}

export async function deleteInventoryAttributeType(id: string, password?: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { error: "Недостаточно прав" };
    }

    try {
        const [type] = await db.select().from(inventoryAttributeTypes).where(eq(inventoryAttributeTypes.id, id));
        if (!type) return { error: "Тип не найден" };

        const isAdmin = session.roleName === "Администратор";

        if (type.isSystem) {
            if (!isAdmin) {
                return { error: "Системные разделы может удалять только Администратор" };
            }
            if (!password) {
                return { error: "Для удаления системного раздела требуется пароль администратора" };
            }

            const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
            if (!user || !(await comparePassword(password, user.passwordHash))) {
                return { error: "Неверный пароль администратора" };
            }
        }

        // Check availability
        const [hasAttrs] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.type, type.slug)).limit(1);
        if (hasAttrs) return { error: "В этом разделе есть записи. Сначала удалите их." };

        await db.delete(inventoryAttributeTypes).where(eq(inventoryAttributeTypes.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Удален тип атрибута: ${type.name}`,
            createdBy: session?.id,
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch {
        return { error: "Не удалось удалить раздел" };
    }
}


export async function updateInventoryAttributeType(id: string, name: string, categoryId: string | null, isSystem: boolean = false) {
    const session = await getSession();
    try {
        await db.update(inventoryAttributeTypes)
            .set({ name, categoryId, isSystem })
            .where(eq(inventoryAttributeTypes.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Изменен тип атрибута: ${name}`,
            createdBy: session?.id,
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (e) {
        console.error("Update Type Error", e);
        return { error: "Не удалось обновить раздел" };
    }
}

