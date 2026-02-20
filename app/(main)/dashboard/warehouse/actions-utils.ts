
"use server";

import { z } from "zod";

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryCategories } from "@/lib/schema";
import { logError } from "@/lib/error-logger";
import { LOCAL_STORAGE_ROOT } from "@/lib/local-storage";
import { sanitizeFileName } from "./shared-utils";

/**
 * Builds a category hierarchy path (text format for display/search, e.g., "Category > Subcategory").
 */
export async function getCategoryFullPath(categoryId: string | null): Promise<string> {
    const validation = z.string().uuid().nullable().optional().or(z.literal("")).safeParse(categoryId);
    if (!validation.success) return "";
    const cleanId = validation.data || null;

    try {
        if (!cleanId) return "";

        const paths: string[] = [];
        let currentId: string | null = cleanId;
        let depth = 0;

        while (currentId && depth < 5) {
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
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/actions-utils",
            method: "getCategoryFullPath",
            details: { categoryId }
        });
        return "";
    }
}

/**
 * Builds a category directory path (sanitized for filesystem usage).
 */
export async function getCategoryPath(categoryId: string | null): Promise<string> {
    const validation = z.string().uuid().nullable().optional().or(z.literal("")).safeParse(categoryId);
    if (!validation.success) return "Uncategorized";
    const cleanId = validation.data || null;

    try {
        if (!cleanId) return "Uncategorized";

        const paths: string[] = [];
        let currentId: string | null = cleanId;
        let depth = 0;

        while (currentId && depth < 5) {
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
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/actions-utils",
            method: "getCategoryPath",
            details: { categoryId }
        });
        return "Uncategorized";
    }
}

/**
 * Checks if possibleAncestorId is an ancestor of nodeId in the category hierarchy.
 */
export async function isDescendant(nodeId: string, possibleAncestorId: string): Promise<boolean> {
    const v1 = z.string().uuid().safeParse(nodeId);
    const v2 = z.string().uuid().safeParse(possibleAncestorId);
    if (!v1.success || !v2.success) return false;

    try {
        if (nodeId === possibleAncestorId) return true;

        let currentId: string | null = nodeId;
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
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/actions-utils",
            method: "isDescendant",
            details: { nodeId, possibleAncestorId }
        });
        return false;
    }
}

/**
 * Recursively updates fullPath for all descendant categories when a parent is moved or renamed.
 * Optimized to use in-memory path building to avoid N+1 queries.
 */
export async function updateChildrenPaths(parentId: string) {
    const validation = z.string().uuid().safeParse(parentId);
    if (!validation.success) return;

    try {
        const allCategories = await db.query.inventoryCategories.findMany({
            columns: { id: true, name: true, parentId: true, fullPath: true },
            limit: 1000
        });

        const updateBatch = async (pId: string, currentPath: string) => {
            const children = allCategories.filter(c => c.parentId === pId);

            for (const child of children) {
                const newPath = currentPath ? `${currentPath} > ${child.name}` : child.name;

                if (child.fullPath !== newPath) {
                    await db.update(inventoryCategories)
                        .set({ fullPath: newPath })
                        .where(eq(inventoryCategories.id, child.id));
                }

                await updateBatch(child.id, newPath);
            }
        };

        const parent = allCategories.find(c => c.id === parentId);
        if (parent) {
            await updateBatch(parentId, parent.fullPath || "");
        }
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/actions-utils",
            method: "updateChildrenPaths",
            details: { parentId }
        });
    }
}

/**
 * Saves a file to the local storage, with optional compression for images.
 */
export async function saveFile(file: File | null, directoryPath: string): Promise<string | null> {
    if (!file || file.size === 0) return null;

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());
    const MAX_SIZE = 700 * 1024; // 700KB
    let extension = path.extname(file.name) || ".jpg";

    if (file.type.startsWith("image/") && buffer.length > MAX_SIZE) {
        try {
            buffer = await sharp(buffer)
                .rotate()
                .resize(1920, 1920, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 80 })
                .toBuffer();

            extension = ".webp";
        } catch (e) {
            await logError({
                error: e,
                path: "/dashboard/warehouse/actions-utils",
                method: "saveFile",
                details: { filename: file.name }
            });
        }
    }

    try {
        const filename = `item-${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;
        const relativePath = path.join("SKU", directoryPath);
        const uploadDir = path.join(LOCAL_STORAGE_ROOT, relativePath);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);

        return `/api/storage/local/${relativePath}/${filename}`;
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/warehouse/actions-utils",
            method: "saveFile",
            details: { directoryPath }
        });
        return null;
    }
}


