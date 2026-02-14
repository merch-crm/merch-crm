"use server";

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { desc, eq, sql, inArray, and, asc, isNotNull, isNull, lte, lt, gte, ne, type InferInsertModel } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";
import Fuse from "fuse.js";

import { db } from "@/lib/db";
import {
    inventoryItems,
    inventoryTransactions,
    inventoryCategories,
    storageLocations,
    users,
    inventoryStocks,
    inventoryTransfers,
    orderItems,
    inventoryAttributes,
    inventoryAttributeTypes
} from "@/lib/schema";
import { getOrSetCache, invalidateCache } from "@/lib/redis";
import { getSession as getAuthSession } from "@/lib/auth";
import { comparePassword } from "@/lib/password";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { slugify } from "@/lib/utils";
import { checkItemStockAlerts } from "@/lib/notifications";
import { LOCAL_STORAGE_ROOT } from "@/lib/local-storage";
import { InventoryItem } from "./types";
import { InventoryCategorySchema, InventoryItemSchema, AdjustStockSchema } from "./validation";



export async function getSession() {
    return await getAuthSession();
}

export async function getWarehouseStats() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const [stockRes, archivedRes, criticalRes, activityRes] = await Promise.all([
            db.select({
                totalStock: sql<number>`COALESCE(SUM(${inventoryItems.quantity}), 0)`,
                totalReserved: sql<number>`COALESCE(SUM(${inventoryItems.reservedQuantity}), 0)`,
            }).from(inventoryItems).where(eq(inventoryItems.isArchived, false)),

            db.select({ count: sql<number>`count(*)` })
                .from(inventoryItems)
                .where(eq(inventoryItems.isArchived, true)),

            db.select({
                id: inventoryItems.id,
                name: inventoryItems.name,
                quantity: inventoryItems.quantity,
                unit: inventoryItems.unit
            })
                .from(inventoryItems)
                .where(and(
                    eq(inventoryItems.isArchived, false),
                    sql`${inventoryItems.quantity} <= ${inventoryItems.lowStockThreshold}`
                ))
                .limit(20),

            db.select({
                type: inventoryTransactions.type,
                reason: inventoryTransactions.reason,
                count: sql<number>`count(*)`
            })
                .from(inventoryTransactions)
                .where(gte(inventoryTransactions.createdAt, thirtyDaysAgo))
                .groupBy(inventoryTransactions.type, inventoryTransactions.reason)
        ]);

        const stock = stockRes[0];
        const activity = { ins: 0, usage: 0, waste: 0, transfers: 0 };
        activityRes.forEach(row => {
            if (row.type === 'in') activity.ins += Number(row.count);
            else if (row.type === 'transfer') activity.transfers += Number(row.count);
            else if (row.type === 'out') {
                const isWaste = row.reason?.toLowerCase().includes('брак') || row.reason?.toLowerCase().includes('списание');
                if (isWaste) activity.waste += Number(row.count);
                else activity.usage += Number(row.count);
            }
        });

        return {
            success: true,
            data: {
                totalStock: Number(stock?.totalStock || 0),
                totalReserved: Number(stock?.totalReserved || 0),
                archivedCount: Number(archivedRes[0]?.count || 0),
                criticalItems: criticalRes,
                activity
            }
        };
    } catch (error) {
        console.error("DEBUG: getWarehouseStats error", error);
        return { success: false, error: "Не удалось загрузить warehouse статистика" };
    }
}

export async function findItemBySKU(sku: string) {
    const item = await db.query.inventoryItems.findFirst({
        where: eq(inventoryItems.sku, sku),
        columns: { id: true }
    });
    return item?.id || null;
}

// Helper to sanitize folder/file names
function sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ0-9 \-\.]/g, "_").trim();
}

// Helper to refresh all warehouse related pages
function refreshWarehouse() {
    revalidatePath("/dashboard/warehouse", "layout");
    revalidatePath("/dashboard/orders", "layout");
}

// Helper: Build category hierarchy path (text format for display/search)
async function getCategoryFullPath(categoryId: string | null): Promise<string> {
    if (!categoryId || categoryId === "") return "";

    const paths: string[] = [];
    let currentId: string | null = categoryId;
    let depth = 0;

    while (currentId && currentId !== "" && depth < 5) {
        depth++;
        const category: { id: string; name: string; parentId: string | null } | undefined = await db.query.inventoryCategories.findFirst({
            where: eq(inventoryCategories.id, currentId),
            columns: { id: true, name: true, parentId: true }
        });

        if (!category) break;

        paths.unshift(category.name);
        currentId = category.parentId;
    }

    return paths.join(" > ");
}

// Helper: Build category directory path (sanitized)
async function getCategoryPath(categoryId: string | null): Promise<string> {
    if (!categoryId || categoryId === "") return "Uncategorized";

    const paths: string[] = [];
    let currentId: string | null = categoryId;
    let depth = 0;

    while (currentId && currentId !== "" && depth < 5) {
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

// Helper: Check if possibleAncestorId is an ancestor of nodeId
async function isDescendant(nodeId: string, possibleAncestorId: string): Promise<boolean> {
    if (!nodeId || !possibleAncestorId || nodeId === possibleAncestorId) return true;

    let currentId: string | null = nodeId;
    // Safety break to prevent infinite loops if cycle already exists (though we try to prevent them)
    let depth = 0;
    while (currentId && depth < 20) {
        if (currentId === possibleAncestorId) return true;

        const node: { parentId: string | null } | undefined = await db.query.inventoryCategories.findFirst({
            where: eq(inventoryCategories.id, currentId),
            columns: { parentId: true }
        });

        if (!node || !node.parentId) break;
        currentId = node.parentId;
        depth++;
    }

    return false;
}

// Helper: Recursively update fullPath for all descendants
async function updateChildrenPaths(parentId: string) {
    const children = await db.query.inventoryCategories.findMany({
        where: eq(inventoryCategories.parentId, parentId)
    });

    for (const child of children) {
        // Re-calculate path. Since parent (parentId) is already updated in DB, 
        // getCategoryFullPath(child.id) will fetch the new correct path.
        const fullPath = await getCategoryFullPath(child.id);

        await db.update(inventoryCategories)
            .set({ fullPath })
            .where(eq(inventoryCategories.id, child.id));

        // Recurse to grandchildren
        await updateChildrenPaths(child.id);
    }
}


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
        return await getOrSetCache("inventory:categories:all", async () => {
            const categories = await db.select({
                id: inventoryCategories.id,
                name: inventoryCategories.name,
                description: inventoryCategories.description,
                icon: inventoryCategories.icon,
                color: inventoryCategories.color,
                parentId: inventoryCategories.parentId,
                sortOrder: inventoryCategories.sortOrder,
                itemCount: sql<number>`(
                SELECT count(*)::int 
                FROM ${inventoryItems} 
                WHERE ${inventoryItems.categoryId} = ${inventoryCategories.id} 
                AND ${inventoryItems.isArchived} = false
            )`
            })
                .from(inventoryCategories)
                .orderBy(
                    sql`CASE WHEN ${inventoryCategories.sortOrder} = 0 THEN 1 ELSE 0 END ASC`,
                    sql`${inventoryCategories.sortOrder} ASC`,
                    desc(inventoryCategories.createdAt)
                );

            return { success: true, data: categories };
        }, 3600); // 1 hour cache
    } catch (error) {
        console.error(error);
        return { success: false, error: "Не удалось загрузить инвентарь категории" };
    }
}

export async function addInventoryCategory(formData: FormData) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для добавления категории" };
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
    const showInSku = formData.get("showInSku") === "on" || formData.get("showInSku") === "true";
    const showInName = formData.get("showInName") === "on" || formData.get("showInName") === "true";

    if (!name) {
        return { success: false, error: "Имя обязательно" };
    }

    try {
        const slug = slugify(name);
        const fullPathText = await getCategoryFullPath(parentId);
        const finalFullPath = fullPathText ? `${fullPathText} > ${name}` : name;

        await db.transaction(async (tx) => {
            await tx.insert(inventoryCategories).values({
                name,
                description,
                prefix: prefix || null,
                icon: icon || "package",
                color: color || "primary",
                parentId: parentId || null,
                sortOrder,
                isActive,
                gender,
                singularName,
                pluralName,
                slug,
                showInSku: formData.has("showInSku") ? showInSku : true,
                showInName: formData.has("showInName") ? showInName : true,
                fullPath: finalFullPath
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



        await invalidateCache("inventory:categories:all");
        refreshWarehouse();
        return { success: true };
    } catch {
        return { success: false, error: "Не удалось добавить категория" };
    }
}

export async function deleteInventoryCategory(id: string, password?: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для удаления категории" };
    }

    try {
        const category = await db.query.inventoryCategories.findFirst({
            where: eq(inventoryCategories.id, id)
        });

        if (!category) return { success: false, error: "Категория не найдена" };

        if (category.isSystem) {
            if (session.roleName !== "Администратор") {
                return { success: false, error: "Только администратор может удалять системные данные" };
            }
            if (!password) {
                return { success: false, error: "Для удаления системной категории требуется пароль от вашей учетной записи" };
            }

            const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
            if (!user || !(await comparePassword(password, user.passwordHash))) {
                return { success: false, error: "Неверный пароль" };
            }
        }

        // Check for subcategories
        const subcategories = await db.query.inventoryCategories.findMany({
            where: eq(inventoryCategories.parentId, id),
            limit: 1
        });

        if (subcategories.length > 0) {
            return { success: false, error: "Нельзя удалить категорию, у которой есть подкатегории. Сначала удалите или переместите их." };
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



        await invalidateCache("inventory:categories:all");
        refreshWarehouse();
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Не удалось удалить категория" };
    }
}

export async function updateStorageLocationsOrder(items: { id: string; sortOrder: number }[]) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для изменения порядка складов" };
    }

    try {
        await db.transaction(async (tx) => {
            for (const item of items) {
                await tx.update(storageLocations)
                    .set({ sortOrder: item.sortOrder })
                    .where(eq(storageLocations.id, item.id));
            }

            await tx.insert(inventoryTransactions).values({
                type: "attribute_change",
                reason: `Обновлен порядок складов (${items.length} шт.)`,
                createdBy: session?.id,
            });
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Order update error:", error);
        return { success: false, error: "Не удалось сохранить порядок складов" };
    }
}


export async function updateInventoryCategory(id: string, formData: FormData) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для изменения категории" };
    }

    const validation = InventoryCategorySchema.safeParse(Object.fromEntries(formData));

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const {
        name,
        description,
        parentId,
        color,
        singularName,
        pluralName,
        gender,
        sortOrder,
        isActive,

        showInSku,
        showInName,
        prefix,
        icon
    } = validation.data;

    if (parentId === id) {
        return { success: false, error: "Категория не может быть своим собственным родителем" };
    }

    // Check for cyclic reference
    if (parentId) {
        const isCycle = await isDescendant(parentId, id); // usage: isDescendant(child, parent) -> checks if parent is actually inside child
        // Wait, logic: if I set B as parent of A, I must check if A is an ancestor of B.
        // If A is ancestor of B, then B is descendant of A.
        // So I check isDescendant(parentId, id). 
        // If parentId (B) is a descendant of id (A), then making B parent of A creates cycle.

        if (isCycle) {
            return { success: false, error: "Невозможно переместить категорию в её собственную подкатегорию" };
        }
    }

    try {
        const slug = slugify(name);
        const fullPathText = await getCategoryFullPath(parentId || null);
        const finalFullPath = fullPathText ? `${fullPathText} > ${name}` : name;

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
                pluralName,
                slug,
                showInSku: formData.has("showInSku") ? showInSku : true,
                showInName: formData.has("showInName") ? showInName : true,
                fullPath: finalFullPath
            })
            .where(eq(inventoryCategories.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Изменена категория: ${name}`,
            createdBy: session?.id,
        });

        // Recursively update full paths for children
        await updateChildrenPaths(id);



        await invalidateCache("inventory:categories:all");
        refreshWarehouse();
        return { success: true };
    } catch {
        return { success: false, error: "Не удалось обновить категория" };
    }
}

export async function updateInventoryCategoriesOrder(items: { id: string; sortOrder: number }[]) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для изменения порядка категорий" };
    }

    try {
        await db.transaction(async (tx) => {
            for (const item of items) {
                await tx.update(inventoryCategories)
                    .set({ sortOrder: item.sortOrder })
                    .where(eq(inventoryCategories.id, item.id));
            }

            await tx.insert(inventoryTransactions).values({
                type: "attribute_change",
                reason: `Обновлен порядок категорий (${items.length} шт.)`,
                createdBy: session?.id,
            });
        });



        await invalidateCache("inventory:categories:all");
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Order update error:", error);
        return { success: false, error: "Не удалось сохранить порядок категорий" };
    }
}

export async function migrateCategories() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { success: false, error: "Доступ запрещен" };
    }

    try {
        const categories = await db.query.inventoryCategories.findMany();
        let updatedCount = 0;


        // Track used slugs to prevent duplicates
        const usedSlugs = new Set<string>();
        // Pre-populate with existing unique slugs if we were partial, but here we regen all. 
        // Better safe:
        // Actually, since we update all, we just track what we assign in THIS transaction.
        // Wait, if we don't clear existing slugs first, we might conflict with existing ones in DB if they are unique constraint?
        // But we are updating them.
        // Let's iterate all, calculate desired slugs. Resolving conflicts.

        // Sort categories by creation time to stable order (older gets priority on clean slug)
        categories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        for (const cat of categories) {
            let slug = slugify(cat.name);
            const originalSlug = slug;
            let counter = 1;

            while (usedSlugs.has(slug)) {
                slug = `${originalSlug}-${counter}`;
                counter++;
            }
            usedSlugs.add(slug);

            const fullPath = await getCategoryFullPath(cat.id);

            if (cat.slug !== slug || cat.fullPath !== fullPath) {
                await db.update(inventoryCategories)
                    .set({
                        slug,
                        fullPath
                    })
                    .where(eq(inventoryCategories.id, cat.id));
                updatedCount++;
            }
        }

        revalidatePath("/dashboard/warehouse");
        return { success: true, message: `Миграция завершена. Обновлено категорий: ${updatedCount}` };
    } catch (error) {
        console.error(error);
        return { success: false, error: `Migration failed: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
}

export async function getInventoryItems() {
    try {
        const items = await db.query.inventoryItems.findMany({
            where: eq(inventoryItems.isArchived, false),
            with: {
                category: true,
                stocks: {
                    with: {
                        storageLocation: true
                    }
                }
            },
            orderBy: desc(inventoryItems.createdAt)
        });
        return { success: true, data: items as unknown as InventoryItem[] };
    } catch (error) {
        console.error("DEBUG: getInventoryItems error", error);
        return { success: false, error: "Не удалось загрузить инвентарь товары" };
    }
}

export async function getArchivedItems() {
    try {
        const items = await db.query.inventoryItems.findMany({
            where: eq(inventoryItems.isArchived, true),
            with: {
                category: true
            },
            orderBy: desc(inventoryItems.archivedAt)
        });
        return { success: true, data: items as unknown as InventoryItem[] };
    } catch (error) {
        console.error("DEBUG: getArchivedItems error", error);
        return { success: false, error: "Не удалось загрузить archived товары" };
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
                stocks: true
            }
        });
        return { success: true, data: item };
    } catch (error) {
        console.error("DEBUG: getInventoryItem error", error);
        return { success: false, error: "Не удалось загрузить товар" };
    }
}

export async function checkDuplicateItem(name: string, sku?: string, currentItemId?: string) {
    try {
        const allItems = await db.query.inventoryItems.findMany({
            columns: { id: true, name: true, sku: true }
        });

        const otherItems = currentItemId ? allItems.filter(i => i.id !== currentItemId) : allItems;

        // 1. SKU coincidence (highest priority)
        if (sku && sku !== "") {
            const exactSku = otherItems.find(i => i.sku?.toUpperCase() === sku.toUpperCase());
            if (exactSku) {
                // If the duplicate is archived, we still warn but with a different message
                const res = await db.query.inventoryItems.findFirst({
                    where: eq(inventoryItems.id, exactSku.id),
                    columns: { isArchived: true }
                });
                return {
                    duplicate: exactSku,
                    type: "sku_exact",
                    isArchived: res?.isArchived || false
                };
            }
        }

        // 2. Name fuzzy match
        const fuse = new Fuse(otherItems, {
            keys: ["name"],
            threshold: 0.3, // Lower is stricter
            includeScore: true
        });

        const results = fuse.search(name);
        if (results.length > 0 && results[0].score! < 0.2) {
            return { duplicate: results[0].item, type: "name_fuzzy", score: results[0].score };
        }

        return { duplicate: null };
    } catch (error) {
        console.error("Duplicate check error:", error);
        return { duplicate: null };
    }
}

export async function autoArchiveStaleItems() {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const staleItems = await db.query.inventoryItems.findMany({
            where: and(
                eq(inventoryItems.isArchived, false),
                eq(inventoryItems.quantity, 0),
                lt(inventoryItems.updatedAt, threeMonthsAgo)
            )
        });

        if (staleItems.length === 0) {
            return { success: true, archivedCount: 0 };
        }

        const ids = staleItems.map(i => i.id);
        const res = await archiveInventoryItems(ids, "Автоматическая архивация (остаток 0 более 3 месяцев)");

        return {
            success: res.success,
            archivedCount: staleItems.length,
            error: res.error
        };
    } catch (error) {
        console.error("Auto-archive error:", error);
        return { success: false, error: "Не удалось run auto-archive" };
    }
}

export async function addInventoryItem(formData: FormData) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для добавления товаров" };
    }

    const validation = InventoryItemSchema.safeParse(Object.fromEntries(formData));
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const {
        itemType, name, sku, quantity, unit, lowStockThreshold, criticalStockThreshold,
        categoryId, description, storageLocationId,
        qualityCode, materialCode, attributeCode, sizeCode, brandCode,
        costPrice, sellingPrice,
        attributes: baseAttributes, thumbnailSettings,
        width, height, depth, weight, packagingType: pkgType, supplierName, supplierLink, minBatch, features,
        department
    } = validation.data;

    const attributes: Record<string, unknown> = { ...baseAttributes };

    if (itemType === "packaging") {
        Object.assign(attributes, {
            width, height, depth, weight,
            packagingType: pkgType,
            supplierName, supplierLink, minBatch,
            features
        });
    } else if (itemType === "consumables") {
        Object.assign(attributes, { department });
    }

    const imageFile = formData.get("image") as File;


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
            const categoryPath = await getCategoryPath(categoryId || null);
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

            // Task 2.1: Enforce units for specific types
            let finalUnit = unit;
            if (itemType === "clothing") {
                finalUnit = "шт.";
            }

            const [insertedItem] = await tx.insert(inventoryItems).values({
                name,
                sku: finalSku || null,
                quantity,
                unit: finalUnit as "шт." | "л" | "м" | "кг",
                itemType: itemType || "clothing",
                lowStockThreshold,
                criticalStockThreshold,
                description,
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
                costPrice: costPrice?.toString() || null,
                sellingPrice: sellingPrice?.toString() || null,
                materialComposition: attributes.materialComposition || {},
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
                reason: "Начальный остаток",
                storageLocationId: storageLocationId || null,
                costPrice: costPrice?.toString() || null,
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

        // Trigger stock check
        if (newItem.id) {
            await checkItemStockAlerts(newItem.id);
        }

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
        return { success: false, error: error instanceof Error ? error.message : "Failed to add item" };
    }
}

export async function archiveInventoryItems(ids: string[], reason: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для архивации" };
    }

    try {
        await db.transaction(async (tx) => {
            for (const id of ids) {
                const [item] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, id)).limit(1);
                if (!item) throw new Error(`Товар ${id} не найден`);

                // 1. Check quantity
                if (item.quantity > 0) {
                    throw new Error(`Товар «${item.name}» имеет остаток > 0. Сначала обнулите его.`);
                }

                // 2. Check active orders
                const activeOrders = await tx.query.orderItems.findMany({
                    where: eq(orderItems.inventoryId, id),
                    with: {
                        order: true
                    }
                });

                const ordersInProgress = activeOrders.filter(oi =>
                    oi.order && !["done", "shipped", "cancelled"].includes(oi.order.status)
                );

                if (ordersInProgress.length > 0) {
                    throw new Error(`Товар «${item.name}» используется в активных заказах (${ordersInProgress.length} шт.).`);
                }

                // 3. Mark as archived
                await tx.update(inventoryItems)
                    .set({
                        isArchived: true,
                        archivedAt: new Date(),
                        archivedBy: session.id,
                        archiveReason: reason,
                        updatedAt: new Date()
                    })
                    .where(eq(inventoryItems.id, id));

                // 4. Log transaction
                await tx.insert(inventoryTransactions).values({
                    itemId: id,
                    type: "archive",
                    reason: `Архивировано. Причина: ${reason}`,
                    createdBy: session.id,
                });
            }
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Archive error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Ошибка при архивации" };
    }
}

export async function restoreInventoryItems(ids: string[], reason: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для восстановления" };
    }

    try {
        await db.transaction(async (tx) => {
            for (const id of ids) {
                await tx.update(inventoryItems)
                    .set({
                        isArchived: false,
                        archivedAt: null,
                        archivedBy: null,
                        archiveReason: null,
                        zeroStockSince: new Date(), // Reset zero stock tracker since we start fresh
                        updatedAt: new Date()
                    })
                    .where(eq(inventoryItems.id, id));

                await tx.insert(inventoryTransactions).values({
                    itemId: id,
                    type: "restore",
                    reason: `Восстановлено из архива. Комментарий: ${reason}`,
                    createdBy: session.id,
                });
            }
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Restore error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Ошибка при восстановлении" };
    }
}

export async function deleteInventoryItems(ids: string[], password?: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для удаления позиций" };
    }

    try {
        // 1. Check strict dependencies (Orders)
        const itemsInOrders = await db.query.orderItems.findMany({
            where: inArray(orderItems.inventoryId, ids),
            columns: { inventoryId: true }
        });

        if (itemsInOrders.length > 0) {
            return { success: false, error: "Нельзя удалить товары, которые используются в заказах" };
        }

        // 2. Check transactions history
        const itemsWithHistory = await db.query.inventoryTransactions.findMany({
            where: inArray(inventoryTransactions.itemId, ids),
            columns: { itemId: true },
            limit: 1
        });

        if (itemsWithHistory.length > 0) {
            // Check if items are archived and we have a password
            const archivedItems = await db.query.inventoryItems.findMany({
                where: and(inArray(inventoryItems.id, ids), eq(inventoryItems.isArchived, true))
            });

            if (archivedItems.length !== ids.length) {
                return { success: false, error: "Нельзя удалить активные товары, по которым были движения. Сначала перенесите их в архив." };
            }

            if (!password) {
                return { success: false, error: "Для удаления архивных позиций с историей требуется пароль" };
            }

            const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
            if (!user || !(await comparePassword(password, user.passwordHash))) {
                return { success: false, error: "Неверный пароль подтверждения" };
            }
        }

        // 3. Delete dependencies (Stocks, Transactions)
        await db.delete(inventoryTransactions).where(inArray(inventoryTransactions.itemId, ids));
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
        return { success: false, error: "Не удалось удалить выбранные позиции" };
    }
}

export async function updateInventoryItem(id: string, formData: FormData) {
    try {
        const session = await getSession();
        if (!session || !["Администратор", "Руководство", "Склад", "Отдел продаж"].includes(session.roleName)) {
            return { success: false, error: "Недостаточно прав для изменения товаров" };
        }

        const sanitize = (str: string) => (str || "").replace(/<[^>]*>/g, '').trim();

        const validation = InventoryItemSchema.safeParse(Object.fromEntries(formData));
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        const {
            itemType,
            sku,
            quantity,
            lowStockThreshold,
            criticalStockThreshold,
            reservedQuantity,
            categoryId,
            storageLocationId,
            qualityCode,
            materialCode,
            attributeCode,
            sizeCode,
            brandCode,
            attributes: baseAttributes,
            thumbnailSettings,
            width, height, depth, weight, packagingType: pkgType, supplierName, supplierLink, minBatch, features,
            department,
            costPrice,
            sellingPrice,
            materialComposition
        } = validation.data;

        const name = sanitize(validation.data.name);
        const description = validation.data.description ? sanitize(validation.data.description) : "";
        let unit = validation.data.unit;

        const attributes: Record<string, unknown> = { ...baseAttributes };

        if (itemType === "packaging") {
            Object.assign(attributes, {
                width, height, depth, weight,
                packagingType: pkgType,
                supplierName, supplierLink, minBatch,
                features
            });
        } else if (itemType === "consumables") {
            Object.assign(attributes, { department });
        }

        const [existingItem] = await db.select({
            itemType: inventoryItems.itemType,
            costPrice: inventoryItems.costPrice,
            categoryId: inventoryItems.categoryId,
            image: inventoryItems.image,
            imageBack: inventoryItems.imageBack,
            imageSide: inventoryItems.imageSide,
            imageDetails: inventoryItems.imageDetails
        }).from(inventoryItems).where(eq(inventoryItems.id, id));

        if (existingItem) {
            if (existingItem.itemType === "clothing") {
                unit = "шт.";
            }
        }

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


        const categoryPath = await getCategoryPath(categoryId || null);
        const itemFolderPath = path.join(categoryPath, sanitizeFileName(name || "unnamed"));

        const imageBackFile = formData.get("imageBack") as File;
        const imageSideFile = formData.get("imageSide") as File;
        const imageDetailsFiles = formData.getAll("imageDetails") as File[];

        let imageBackUrl = formData.get("currentImageBack") as string | null;
        if (imageBackUrl === "") imageBackUrl = null;
        else if (imageBackUrl === null) imageBackUrl = existingItem?.imageBack ?? null;

        const newImageBackUrl = await saveFile(imageBackFile, itemFolderPath);
        if (newImageBackUrl) imageBackUrl = newImageBackUrl;

        let imageSideUrl = formData.get("currentImageSide") as string | null;
        if (imageSideUrl === "") imageSideUrl = null;
        else if (imageSideUrl === null) imageSideUrl = existingItem?.imageSide ?? null;

        const newImageSideUrl = await saveFile(imageSideFile, itemFolderPath);
        if (newImageSideUrl) imageSideUrl = newImageSideUrl;

        let imageDetailsUrls: string[] = [];
        const currentImageDetailsStr = formData.get("currentImageDetails") as string;
        if (currentImageDetailsStr) {
            try {
                imageDetailsUrls = JSON.parse(currentImageDetailsStr);
            } catch {
                imageDetailsUrls = (existingItem?.imageDetails as string[]) || [];
            }
        }

        for (const file of imageDetailsFiles) {
            const url = await saveFile(file, itemFolderPath);
            if (url) imageDetailsUrls.push(url);
        }

        let imageUrl = formData.get("currentImage") as string | null;
        if (imageUrl === "") imageUrl = null;
        else if (imageUrl === null) imageUrl = existingItem?.image ?? null;

        const newImageUrl = await saveFile(imageFile, itemFolderPath);
        if (newImageUrl) imageUrl = newImageUrl;



        const isArchived = formData.get("isArchived") === "true";

        console.log("EXECUTING DB UPDATE...");
        await db.update(inventoryItems).set({
            name,
            sku: finalSku || null,
            itemType: itemType || "clothing",
            quantity,
            lowStockThreshold,
            criticalStockThreshold,
            categoryId: categoryId || null,
            description,
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
            reservedQuantity: reservedQuantity ?? 0,
            unit: unit as "шт." | "л" | "м" | "кг",
            costPrice: costPrice?.toString() || null,
            sellingPrice: sellingPrice?.toString() || null,
            materialComposition: materialComposition || {},
            isArchived,
            updatedAt: new Date()
        }).where(eq(inventoryItems.id, id));

        // Create transaction log if price or quantity changed
        const existingCostPrice = existingItem?.costPrice ? String(existingItem.costPrice) : null;

        const normalizePrice = (val: string | number | null | undefined) => {
            if (val === null || val === undefined || val === "") return 0;
            const num = parseFloat(String(val));
            return isNaN(num) ? 0 : num;
        };

        const oldPrice = normalizePrice(existingCostPrice);
        const newPrice = normalizePrice(costPrice);

        if (Math.abs(oldPrice - newPrice) > 0.01) {
            await db.insert(inventoryTransactions).values({
                itemId: id,
                changeAmount: 0,
                type: "in",
                reason: "Корректировка цены (редактирование)",
                storageLocationId: storageLocationId || null,
                costPrice: costPrice?.toString() || null,
                createdBy: session?.id,
            });
        }

        await checkItemStockAlerts(id);

        revalidatePath("/dashboard/warehouse");
        if (categoryId) revalidatePath(`/dashboard/warehouse/${categoryId}`);
        return { success: true };
    } catch (error) {
        console.error("UPDATE ITEM ERROR:", error);
        await logError({
            error,
            path: `/dashboard/warehouse/item/${id}`,
            method: "updateInventoryItem",
            details: { id }
        });
        return { success: false, error: `Ошибка при обновлении: ${error instanceof Error ? error.message : "Неизвестная ошибка"}` };
    }
}

export async function deleteInventoryItemImage(itemId: string, type: "front" | "back" | "side" | "details", index?: number) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад", "Отдел продаж"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав для удаления изображений" };
    }

    try {
        const item = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.id, itemId)
        });

        if (!item) return { success: false, error: "Товар не найден" };

        const updateData: {
            image?: string | null;
            imageBack?: string | null;
            imageSide?: string | null;
            imageDetails?: string[] | null;
            updatedAt?: Date;
        } = {};
        if (type === "front") updateData.image = null;
        else if (type === "back") updateData.imageBack = null;
        else if (type === "side") updateData.imageSide = null;
        else if (type === "details" && typeof index === "number") {
            const currentDetails = [...(item.imageDetails as string[] || [])];
            currentDetails.splice(index, 1);
            updateData.imageDetails = currentDetails;
        }

        updateData.updatedAt = new Date();
        await db.update(inventoryItems).set(updateData).where(eq(inventoryItems.id, itemId));

        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/items/${itemId}`);
        return { success: true };
    } catch (error) {
        console.error("DEBUG: deleteInventoryItemImage error", error);
        return { success: false, error: "Ошибка при удалении изображения" };
    }
}

export async function getInventoryHistory() {
    try {
        const history = await db.query.inventoryTransactions.findMany({
            with: {
                item: {
                    with: {
                        category: true
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
        return { success: true, data: history };
    } catch (error) {
        console.error("DEBUG: getInventoryHistory error", error);
        return { success: false, error: "Не удалось загрузить инвентарь history" };
    }
}

export async function adjustInventoryStock(
    itemId: string,
    amount: number,
    type: "in" | "out" | "set",
    reason: string,
    storageLocationId?: string,
    costPrice?: number
) {
    const validation = AdjustStockSchema.safeParse({
        itemId, amount, type, reason, storageLocationId, costPrice
    });

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

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
                    if (newStockQuantity < 0) {
                        // Allow negative stock implicitly or just log it? 
                        // User asked to remove password, assuming negative stock is allowed.
                    }

                    await tx.update(inventoryStocks)
                        .set({ quantity: newStockQuantity, updatedAt: new Date() })
                        .where(eq(inventoryStocks.id, existingStock.id));
                } else {
                    const newStockQuantity = netChange; // Assuming starting from 0 if not exists
                    if (newStockQuantity < 0) {
                        // Allow negative, no check
                    }

                    await tx.insert(inventoryStocks).values({
                        itemId,
                        storageLocationId,
                        quantity: newStockQuantity
                    });
                }
            }

            // 3. CRITICAL: Sync total quantity in inventoryItems from ALL stocks
            const stocksForThisItem = await tx.query.inventoryStocks.findMany({
                where: eq(inventoryStocks.itemId, itemId)
            });
            const totalStockQuantity = stocksForThisItem.reduce((sum, s) => sum + s.quantity, 0);

            const updateValues: Record<string, unknown> = {
                quantity: totalStockQuantity,
                updatedAt: new Date()
            };

            if (costPrice !== undefined) {
                updateValues.costPrice = costPrice.toString();
            }

            // Handle zeroStockSince
            if (totalStockQuantity <= 0) {
                if (!item.zeroStockSince) {
                    updateValues.zeroStockSince = new Date();
                }
            } else {
                updateValues.zeroStockSince = null;
            }

            await tx.update(inventoryItems)
                .set(updateValues)
                .where(eq(inventoryItems.id, itemId));

            // 4. Log transaction
            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: netChange,
                type: effectiveType,
                reason: type === "set" ? `Корректировка остатка: ${reason}` : reason,
                storageLocationId: storageLocationId || null,
                costPrice: costPrice !== undefined ? costPrice.toString() : null,
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

        // Check for alerts (low stock, etc)
        await checkItemStockAlerts(itemId);

        return { success: true };
    } catch (error: unknown) {
        await logError({
            error,
            path: `/dashboard/warehouse/adjust/${itemId}`,
            method: "adjustInventoryStock",
            details: { itemId, amount, type, reason, storageLocationId }
        });
        return { success: false, error: (error as Error).message || "Failed to adjust stock" };
    }
}

export async function transferInventoryStock(itemId: string, fromLocationId: string, toLocationId: string, amount: number, reason: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    if (amount <= 0) return { success: false, error: "Некорректная сумма" };
    if (fromLocationId === toLocationId) return { success: false, error: "Точка отправления и назначения должны быть разными" };

    try {
        await db.transaction(async (tx) => {
            // Fetch location names for better logging
            const [fromLoc, toLoc] = await Promise.all([
                tx.select().from(storageLocations).where(eq(storageLocations.id, fromLocationId)).limit(1),
                tx.select().from(storageLocations).where(eq(storageLocations.id, toLocationId)).limit(1)
            ]);

            const fromName = fromLoc[0]?.name || "Неизвестный склад";
            const toName = toLoc[0]?.name || "Неизвестный склад";

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

            // Log Transaction (Single record for transfer)
            await tx.insert(inventoryTransactions).values({
                itemId,
                changeAmount: amount,
                type: "transfer",
                reason: `Перемещение со склада «${fromName}» на «${toName}». Причина: ${reason}`,
                storageLocationId: toLocationId,
                fromStorageLocationId: fromLocationId,
                createdBy: session?.id,
            });

            await logAction("Перемещение", "inventory_item", itemId, {
                from: fromLocationId,
                to: toLocationId,
                amount,
                reason
            });

            // CRITICAL: Sync total quantity in inventoryItems
            const stocksForThisItem = await tx.query.inventoryStocks.findMany({
                where: eq(inventoryStocks.itemId, itemId)
            });
            const totalQuantity = stocksForThisItem.reduce((sum, s) => sum + s.quantity, 0);

            await tx.update(inventoryItems)
                .set({
                    quantity: totalQuantity,
                    updatedAt: new Date()
                })
                .where(eq(inventoryItems.id, itemId));
        });

        revalidatePath("/dashboard/warehouse");
        revalidatePath(`/dashboard/warehouse/items/${itemId}`);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: (error as Error).message || "Failed to adjust stock" };
    }
}

export async function autoArchiveItems() {
    const session = await getSession();
    // System action, but let's restrict to Admin/Management for manual trigger
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        const thresholdDate = new Date();
        thresholdDate.setMonth(thresholdDate.getMonth() - 3);

        const itemsToArchive = await db.query.inventoryItems.findMany({
            where: and(
                eq(inventoryItems.isArchived, false),
                eq(inventoryItems.quantity, 0),
                isNotNull(inventoryItems.zeroStockSince),
                lte(inventoryItems.zeroStockSince, thresholdDate)
            )
        });

        if (itemsToArchive.length === 0) {
            return { success: true, count: 0 };
        }

        const ids = itemsToArchive.map(i => i.id);
        const res = await archiveInventoryItems(ids, "Автоматическая архивация (0 остаток более 3 месяцев)");

        return res;
    } catch (error) {
        console.error("Auto-archive error:", error);
        return { success: false, error: "Ошибка при автоматической архивации" };
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

        return { success: true, data: attrs };
    } catch {
        return { success: false, error: "Не удалось загрузить инвентарь атрибуты" };
    }
}

export async function deleteInventoryAttribute(id: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        // 1. Get the attribute info first
        const [attr] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.id, id));
        if (!attr) return { success: false, error: "Атрибут не найден" };

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
                return { success: false, error: "Этот атрибут используется в товарах и не может быть удален" };
            }
        }

        // 3. Delete
        await db.delete(inventoryAttributes).where(eq(inventoryAttributes.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Удален атрибут: ${attr.name} (${attr.value})`,
            createdBy: session?.id,
        });

        refreshWarehouse();
        return { success: true };
    } catch (error) {
        console.error("Delete attribute error:", error);
        return { success: false, error: "Не удалось удалить атрибут" };
    }
}

export async function createInventoryAttribute(type: string, name: string, value: string, meta?: Record<string, unknown>) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

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

        refreshWarehouse();

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Добавлен атрибут: ${name} (${value}) в раздел ${type}`,
            createdBy: session?.id,
        });

        return { success: true, data: newAttr };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Не удалось создать атрибут" };
    }
}

export async function updateInventoryAttribute(id: string, name: string, value: string, meta?: Record<string, unknown>) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        // 1. Get the old attribute data
        const [oldAttr] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.id, id));
        if (!oldAttr) return { success: false, error: "Атрибут не найден" };

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
                        .set({ ...updates, updatedAt: new Date() })
                        .where(eq(inventoryItems.id, item.id));
                }

            }
        }

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Изменен атрибут: ${name} (${value})`,
            createdBy: session?.id,
        });

        refreshWarehouse();
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Не удалось обновить атрибут" };
    }
}

export async function regenerateAllItemSKUs() {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
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

            // Note: We deliberately INCLUDE "Base" quality in the name now (unless hidden in characteristics)
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
                        name: newName,
                        updatedAt: new Date()
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

        refreshWarehouse();
        return { success: true, updatedCount, totalItems: items.length };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Не удалось обновить данные" };
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
        return { success: true, data: stocks };
    } catch {
        return { success: false, error: "Не удалось загрузить товар stocks" };
    }
}

export async function getItemHistory(itemId: string) {
    try {
        const history = await db.query.inventoryTransactions.findMany({
            where: eq(inventoryTransactions.itemId, itemId),
            with: {
                creator: {
                    with: {
                        role: true
                    }
                },
                storageLocation: true
            },
            orderBy: [desc(inventoryTransactions.createdAt)],
            limit: 1000
        });
        return { success: true, data: history };
    } catch {
        return { success: false, error: "Не удалось загрузить товар history" };
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
                isDefault: storageLocations.isDefault,
                isActive: storageLocations.isActive,
                type: storageLocations.type,
                sortOrder: storageLocations.sortOrder,
                createdAt: storageLocations.createdAt,
                responsibleUser: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                }
            })
            .from(storageLocations)
            .leftJoin(users, eq(storageLocations.responsibleUserId, users.id))
            .orderBy(
                sql`CASE WHEN ${storageLocations.sortOrder} = 0 THEN 1 ELSE 0 END ASC`,
                asc(storageLocations.sortOrder),
                asc(storageLocations.name)
            );

        console.log(`[getStorageLocations] Found ${locations.length} locations`);
        if (locations.length === 0) {
            console.log('[getStorageLocations] WARNING: No locations found in DB');
        }

        const locationIds = locations.map(l => l.id);

        type StockItem = {
            id: string;
            name: string;
            quantity: number;
            unit: string;
            sku: string | null;
            categoryId: string | null;
            categoryName: string | null;
            categorySingularName: string | null;
            categoryPluralName: string | null;
            storageLocationId: string;
        };

        let stockItems: StockItem[] = [];

        if (locationIds.length > 0) {
            // Batch fetch stocks for all locations
            stockItems = await db
                .select({
                    id: inventoryItems.id,
                    name: inventoryItems.name,
                    quantity: inventoryStocks.quantity,
                    unit: inventoryItems.unit,
                    sku: inventoryItems.sku,
                    categoryId: inventoryItems.categoryId,
                    categoryName: inventoryCategories.name,
                    categorySingularName: inventoryCategories.singularName,
                    categoryPluralName: inventoryCategories.pluralName,
                    storageLocationId: inventoryStocks.storageLocationId
                })
                .from(inventoryStocks)
                .innerJoin(inventoryItems, eq(inventoryStocks.itemId, inventoryItems.id))
                .leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id))
                .where(and(
                    inArray(inventoryStocks.storageLocationId, locationIds),
                    sql`${inventoryStocks.quantity} > 0`
                ));
        }

        const locationsWithItems = locations.map(loc => {
            const locStockItems = stockItems.filter(i => i.storageLocationId === loc.id);

            return {
                ...loc,
                items: locStockItems
            };
        });

        return { success: true, data: locationsWithItems };
    } catch {
        return { success: false, error: "Не удалось загрузить места хранения" };
    }
}

export async function addStorageLocation(formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const responsibleUserId = formData.get("responsibleUserId") as string;
    const type = (formData.get("type") as "warehouse" | "production" | "office") || "warehouse";

    const isDefault = formData.get("isDefault") === "on";

    if (!name || !address) {
        return { success: false, error: "Имя и адрес обязательны" };
    }

    try {
        await db.transaction(async (tx) => {
            // If setting as default, first unset all other defaults
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
            });
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch {
        return { success: false, error: "Не удалось добавить место хранения" };
    }
}

export async function deleteStorageLocation(id: string, password?: string) {
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

        // 1. Check if there are any stocks with positive quantity
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

            // 5. Delete Location
            await tx.delete(storageLocations).where(eq(storageLocations.id, id));

            await logAction("Удаление склада", "storage_location", id, { id, isSystem: location.isSystem });
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Не удалось удалить место хранения. Ensure it is empty." };
    }
}

export async function updateStorageLocation(id: string, formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const responsibleUserId = formData.get("responsibleUserId") as string;
    const type = (formData.get("type") as "warehouse" | "production" | "office") || "warehouse";
    const isDefault = formData.get("isDefault") === "on";
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

    try {
        // If setting as default, first unset all other defaults
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
        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch {
        return { success: false, error: "Не удалось обновить место хранения" };
    }
}

export async function getAllUsers() {
    try {
        const allUsers = await db.query.users.findMany({
            orderBy: (u, { asc }) => [asc(u.name)]
        });
        return { success: true, data: allUsers };
    } catch (error) {
        console.error("DEBUG: getAllUsers error", error);
        return { success: false, error: "Не удалось загрузить пользователи" };
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
        return { success: false, error: "Не удалось seed" };
    }
}

export async function moveInventoryItem(formData: FormData) {
    const session = await getSession();
    if (!session) return { success: false, error: "Нет авторизации" };

    const itemId = formData.get("itemId") as string;
    const fromLocationId = formData.get("fromLocationId") as string;
    const toLocationId = formData.get("toLocationId") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const comment = formData.get("comment") as string;

    if (!itemId || !fromLocationId || !toLocationId || !quantity) {
        return { success: false, error: "Отсутствуют необходимые данные" };
    }

    if (fromLocationId === toLocationId) {
        return { success: false, error: "Точка отправления и назначения не могут совпадать" };
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
            const logMessage = `Перемещение со склада «${fromName}» на «${toName}»${comment ? `. Причина: ${comment}` : ""}`;
            // 1. Get/Init Source Stock
            const sourceStock = await tx.query.inventoryStocks.findFirst({
                where: and(
                    eq(inventoryStocks.itemId, itemId),
                    eq(inventoryStocks.storageLocationId, fromLocationId)
                )
            });

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

            // Ensure activity is updated
            await tx.update(inventoryItems)
                .set({ updatedAt: new Date() })
                .where(eq(inventoryItems.id, itemId));

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
                    quantity: quantity,
                    updatedAt: new Date()
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

            // 8. CRITICAL: Sync total quantity in inventoryItems
            const stocksForThisItem = await tx.query.inventoryStocks.findMany({
                where: eq(inventoryStocks.itemId, itemId)
            });
            const totalQuantity = stocksForThisItem.reduce((sum, s) => sum + s.quantity, 0);

            await tx.update(inventoryItems)
                .set({
                    quantity: totalQuantity,
                    updatedAt: new Date()
                })
                .where(eq(inventoryItems.id, itemId));
        });

        revalidatePath("/dashboard/warehouse", "layout");
        await checkItemStockAlerts(itemId);
        return { success: true };
    } catch (error: unknown) {
        await logError({
            error,
            path: "/dashboard/warehouse/move",
            method: "moveInventoryItem",
            details: { itemId, fromLocationId, toLocationId, quantity }
        });
        return { success: false, error: (error as Error).message || "Failed to move inventory" };
    }
}

export async function deleteInventoryTransactions(ids: string[]) {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { success: false, error: "Недостаточно прав" };
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
        return { success: false, error: "Ошибка при удалении записей" };
    }
}

export async function clearInventoryHistory() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { success: false, error: "Недостаточно прав" };
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
        return { success: false, error: "Ошибка при очистке истории" };
    }
}

export async function bulkMoveInventoryItems(ids: string[], toLocationId: string, comment?: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        await db.transaction(async (tx) => {
            for (const id of ids) {
                const [item] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, id)).limit(1);
                if (!item) continue;

                const stocks = await tx.query.inventoryStocks.findMany({
                    where: eq(inventoryStocks.itemId, id)
                });

                const totalToMove = stocks.reduce((sum, s) => sum + s.quantity, 0);
                if (totalToMove <= 0) continue;

                // 1. Clear all current stocks for this item
                await tx.delete(inventoryStocks).where(eq(inventoryStocks.itemId, id));

                // 2. Create single stock at target location
                await tx.insert(inventoryStocks).values({
                    itemId: id,
                    storageLocationId: toLocationId,
                    quantity: totalToMove
                });

                // 3. Update item 
                await tx.update(inventoryItems).set({
                    quantity: totalToMove,
                    updatedAt: new Date()
                }).where(eq(inventoryItems.id, id));

                // 4. Log transaction
                await tx.insert(inventoryTransactions).values({
                    itemId: id,
                    changeAmount: totalToMove,
                    type: "transfer",
                    reason: `Массовое перемещение (консолидация): ${comment || "Без причины"}`,
                    storageLocationId: toLocationId,
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
        return { success: false, error: "Ошибка при массовом перемещении" };
    }
}

export async function bulkUpdateInventoryCategory(ids: string[], toCategoryId: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство", "Склад"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        await db.update(inventoryItems)
            .set({ categoryId: toCategoryId, updatedAt: new Date() })
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
        return { success: false, error: "Ошибка при массовой смене категории" };
    }
}

// Measurement Units are now a static list based on measurementUnitEnum
export async function getMeasurementUnits() {
    return {
        success: true,
        data: [
            { id: "шт.", name: "шт." },
            { id: "л", name: "л" },
            { id: "м", name: "м" },
            { id: "кг", name: "кг" }
        ]
    };
}

export async function seedMeasurementUnits() {
    // Единицы измерения зашиты в Enum в БД, поэтому здесь просто подтверждаем готовность
    return { success: true };
}

// Restore System Categories
export async function seedSystemCategories() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        // 1. Ensure Top Level Categories
        const topLevel = [
            { name: "Одежда", icon: "shirt", color: "primary", description: "Одежда и текстильные изделия", isSystem: true },
            { name: "Упаковка", icon: "box", color: "amber", description: "Упаковочные материалы", isSystem: true },
            { name: "Расходники", icon: "scissors", color: "rose", description: "Расходные материалы для производства", isSystem: true },
            { name: "Без категории", icon: "help-circle", color: "slate", description: "Позиции без привязки к категории", isSystem: true },
        ];

        const topLevelMap: Record<string, string> = {};

        for (const cat of topLevel) {
            const found = await db.select().from(inventoryCategories).where(eq(inventoryCategories.name, cat.name)).limit(1);
            let categoryId = found[0]?.id;

            if (!categoryId) {
                const [newCat] = await db.insert(inventoryCategories).values({
                    name: cat.name,
                    icon: cat.icon,
                    color: cat.color,
                    description: cat.description,
                    isSystem: true,
                    parentId: null
                }).returning();
                categoryId = newCat.id;
            } else {
                // Ensure isSystem is true even for existing top-level categories
                if (!found[0].isSystem) {
                    await db.update(inventoryCategories).set({ isSystem: true }).where(eq(inventoryCategories.id, categoryId));
                }
            }
            topLevelMap[cat.name] = categoryId;
        }

        const clothingId = topLevelMap["Одежда"];

        // 2. Define Subcategories with linguistic rules
        const subCategories = [
            { name: "Футболка", icon: "shirt", color: "primary", prefix: "TS", parentId: clothingId, singularName: "Футболка", pluralName: "Футболки", gender: "feminine", isSystem: true },
            { name: "Худи", icon: "hourglass", color: "primary", prefix: "HD", parentId: clothingId, singularName: "Худи", pluralName: "Худи", gender: "neuter", isSystem: true },
            { name: "Свитшот", icon: "layers", color: "violet", prefix: "SW", parentId: clothingId, singularName: "Свитшот", pluralName: "Свитшоты", gender: "masculine", isSystem: true },
            { name: "Лонгслив", icon: "shirt", color: "emerald", prefix: "LS", parentId: clothingId, singularName: "Лонгслив", pluralName: "Лонгсливы", gender: "masculine", isSystem: true },
            { name: "Анорак", icon: "wind", color: "cyan", prefix: "AN", parentId: clothingId, singularName: "Анорак", pluralName: "Анораки", gender: "masculine", isSystem: true },
            { name: "Зип-худи", icon: "zap", color: "primary", prefix: "ZH", parentId: clothingId, singularName: "Зип-худи", pluralName: "Зип-худи", gender: "neuter", isSystem: true },
            { name: "Штаны", icon: "package", color: "slate", prefix: "PT", parentId: clothingId, singularName: "Штаны", pluralName: "Штаны", gender: "masculine", isSystem: true },
            { name: "Поло", icon: "shirt", color: "cyan", prefix: "PL", parentId: clothingId, singularName: "Поло", pluralName: "Поло", gender: "neuter", isSystem: true },
            { name: "Кепка", icon: "box", color: "cyan", prefix: "CP", parentId: clothingId, singularName: "Кепка", pluralName: "Кепки", gender: "feminine", isSystem: true },
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
                const needsUpdate = found.singularName !== sub.singularName || found.pluralName !== sub.pluralName || found.gender !== sub.gender || found.parentId !== sub.parentId || !found.isSystem;
                if (needsUpdate) {
                    await db.update(inventoryCategories)
                        .set({
                            singularName: sub.singularName,
                            pluralName: sub.pluralName,
                            gender: sub.gender,
                            parentId: sub.parentId,
                            isSystem: true
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

        // revalidatePath removed to allow calling during render
        // revalidatePath("/dashboard/warehouse");
        return {
            success: true,
            message: `Создано: ${created}, Обновлено: ${updated}, Очищено дублей`
        };
    } catch (error) {
        console.error("Seed error:", error);
        return { success: false, error: "Не удалось seed категории" };
    }
}

export async function seedSystemAttributes() {
    const session = await getSession();
    if (!session || session.roleName !== "Администратор") {
        return { success: false, error: "Недостаточно прав" };
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
        return { success: false, error: "Не удалось seed атрибуты" };
    }
}


// Attribute Types Management
export async function getInventoryAttributeTypes() {
    try {
        const types = await db.select().from(inventoryAttributeTypes)
            .orderBy(asc(inventoryAttributeTypes.sortOrder), asc(inventoryAttributeTypes.createdAt));
        return { success: true, data: types };
    } catch {
        return { success: false, error: "Не удалось загрузить атрибут types" };
    }
}

export async function createInventoryAttributeType(
    name: string,
    slug: string,
    categoryId?: string,
    isSystem: boolean = false,
    showInSku: boolean = true,
    showInName: boolean = true
) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        // Slug generation/cleaning
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, "_");

        await db.insert(inventoryAttributeTypes).values({
            name,
            slug: cleanSlug,
            categoryId: categoryId || null,
            isSystem,
            showInSku,
            showInName
        });
        refreshWarehouse();

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Создан тип атрибута: ${name} (${cleanSlug})`,
            createdBy: session?.id,
        });

        return { success: true };
    } catch {
        return { success: false, error: "Не удалось создать раздел (возможно, такой код уже существует)" };
    }
}

export async function deleteInventoryAttributeType(id: string, password?: string) {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        const [type] = await db.select().from(inventoryAttributeTypes).where(eq(inventoryAttributeTypes.id, id));
        if (!type) return { success: false, error: "Тип не найден" };

        const isAdmin = session.roleName === "Администратор";

        if (type.isSystem) {
            if (!isAdmin) {
                return { success: false, error: "Системные разделы может удалять только Администратор" };
            }
            if (!password) {
                return { success: false, error: "Для удаления системного раздела требуется пароль от вашей учетной записи" };
            }

            const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
            if (!user || !(await comparePassword(password, user.passwordHash))) {
                return { success: false, error: "Неверный пароль" };
            }
        }

        // Check availability
        const [hasAttrs] = await db.select().from(inventoryAttributes).where(eq(inventoryAttributes.type, type.slug)).limit(1);
        if (hasAttrs) return { success: false, error: "В этом разделе есть записи. Сначала удалите их." };

        await db.delete(inventoryAttributeTypes).where(eq(inventoryAttributeTypes.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Удален тип атрибута: ${type.name}`,
            createdBy: session?.id,
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch {
        return { success: false, error: "Не удалось удалить раздел" };
    }
}


export async function updateInventoryAttributeType(
    id: string,
    name: string,
    categoryId: string | null,
    isSystem: boolean = false,
    showInSku: boolean = true,
    showInName: boolean = true
) {
    const session = await getSession();
    try {
        await db.update(inventoryAttributeTypes)
            .set({ name, categoryId, isSystem, showInSku, showInName })
            .where(eq(inventoryAttributeTypes.id, id));

        await db.insert(inventoryTransactions).values({
            type: "attribute_change",
            reason: `Изменен тип атрибута: ${name}`,
            createdBy: session?.id,
        });

        refreshWarehouse();
        return { success: true };
    } catch (e) {
        console.error("Update Type Error", e);
        return { success: false, error: "Не удалось обновить раздел" };
    }
}

export async function getItemActiveOrders(itemId: string) {
    try {
        const activeOrders = await db.query.orderItems.findMany({
            where: eq(orderItems.inventoryId, itemId),
            with: {
                order: {
                    with: {
                        client: true
                    }
                }
            }
        });

        // Filter for truly active orders (Status check)
        // Adjust these statuses based on what you consider "active/reservable"
        const filtered = activeOrders.filter(oi =>
            oi.order &&
            !["cancelled", "shipped"].includes(oi.order.status)
        );

        return { success: true, data: filtered };
    } catch (error) {
        console.error("DEBUG: getItemActiveOrders error", error);
        return { success: false, error: "Не удалось загрузить товар заказы" };
    }
}


export async function syncAllInventoryQuantities() {
    const session = await getSession();
    if (!session || !["Администратор", "Руководство"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    try {
        await db.transaction(async (tx) => {
            const items = await tx.query.inventoryItems.findMany();

            for (const item of items) {
                const stocks = await tx.query.inventoryStocks.findMany({
                    where: eq(inventoryStocks.itemId, item.id)
                });

                const totalFromStocks = stocks.reduce((sum, s) => sum + s.quantity, 0);

                // Update total quantity
                await tx.update(inventoryItems)
                    .set({
                        quantity: totalFromStocks,
                        updatedAt: new Date()
                    })
                    .where(eq(inventoryItems.id, item.id));

                // Update zeroStockSince tracker
                if (totalFromStocks <= 0 && !item.zeroStockSince) {
                    await tx.update(inventoryItems).set({ zeroStockSince: new Date() }).where(eq(inventoryItems.id, item.id));
                } else if (totalFromStocks > 0 && item.zeroStockSince) {
                    await tx.update(inventoryItems).set({ zeroStockSince: null }).where(eq(inventoryItems.id, item.id));
                }
            }
        });

        revalidatePath("/dashboard/warehouse");
        return { success: true };
    } catch (error) {
        console.error("Sync error:", error);
        return { success: false, error: "Ошибка при синхронизации остатков" };
    }
}

export async function getOrphanedItemCount() {
    try {
        const result = await db.select({ count: sql<number>`count(*)` })
            .from(inventoryItems)
            .where(and(
                isNull(inventoryItems.categoryId),
                eq(inventoryItems.isArchived, false)
            ));
        return { success: true, data: Number(result[0]?.count || 0) };
    } catch (error) {
        console.error("Error getting orphaned item count:", error);
        return { success: false, error: "Ошибка получения количества потерянных записей", data: 0 };
    }
}
