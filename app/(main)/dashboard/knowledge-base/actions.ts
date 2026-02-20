"use server";

import { db } from "@/lib/db";
import { wikiFolders, wikiPages } from "@/lib/schema";
import { eq, asc, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/lib/types";
import { logAction } from "@/lib/audit";
import { WikiFolderSchema, WikiPageSchema, WikiPageUpdateSchema } from "./validation";
import { logError } from "@/lib/error-logger";

// --- Folders ---

type WikiFolder = typeof wikiFolders.$inferSelect;
type WikiPage = typeof wikiPages.$inferSelect & { author: { name: string } | null };

export async function getWikiFolders(): Promise<ActionResult<WikiFolder[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const folders = await db.query.wikiFolders.findMany({
            orderBy: [asc(wikiFolders.sortOrder), asc(wikiFolders.name)],
            limit: 1000,
        });
        return { success: true, data: folders };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/knowledge-base",
            method: "getWikiFolders"
        });
        return { success: false, error: "Не удалось загрузить папки" };
    }
}

export async function createWikiFolder(name: string, parentId: string | null = null): Promise<ActionResult<WikiFolder>> {
    const session = await getSession();
    if (!session || !["Администратор", "Управляющий", "Дизайнер"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = WikiFolderSchema.safeParse({ name, parentId });
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    try {
        const [newFolder] = await db.transaction(async (tx) => {
            const [folder] = await tx.insert(wikiFolders).values({
                name: validation.data.name,
                parentId: validation.data.parentId || null,
            }).returning();

            await logAction("Создана папка базы знаний", "wiki_folder", folder.id, { name, parentId }, tx);
            return [folder];
        });

        revalidatePath("/dashboard/knowledge-base");
        return { success: true, data: newFolder };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/knowledge-base",
            method: "createWikiFolder",
            details: { name, parentId }
        });
        return { success: false, error: "Не удалось создать папку" };
    }
}

// --- Pages ---

export async function getWikiPages(folderId?: string): Promise<ActionResult<WikiPage[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const where = folderId ? eq(wikiPages.folderId, folderId) : undefined;
        const pages = await db.query.wikiPages.findMany({
            where,
            orderBy: [desc(wikiPages.updatedAt)],
            limit: 500,
            with: {
                author: {
                    columns: { name: true }
                },
            }
        });
        return { success: true, data: pages };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/knowledge-base",
            method: "getWikiPages",
            details: { folderId }
        });
        return { success: false, error: "Не удалось загрузить статьи" };
    }
}

export async function getWikiPageDetail(id: string): Promise<ActionResult<WikiPage & { folder: WikiFolder | null }>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const page = await db.query.wikiPages.findFirst({
            where: eq(wikiPages.id, id),
            with: {
                author: {
                    columns: { name: true }
                },
                folder: true,
            }
        });
        return { success: true, data: page };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/knowledge-base",
            method: "getWikiPageDetail",
            details: { id }
        });
        return { success: false, error: "Не удалось загрузить статью" };
    }
}

export async function createWikiPage(data: { title: string, content: string, folderId: string | null }): Promise<ActionResult<typeof wikiPages.$inferSelect>> {
    const session = await getSession();
    if (!session || !["Администратор", "Управляющий", "Дизайнер"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = WikiPageSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    try {
        const [newPage] = await db.transaction(async (tx) => {
            const [page] = await tx.insert(wikiPages).values({
                ...validation.data,
                createdBy: session.id,
                content: validation.data.content || "",
                folderId: validation.data.folderId || null
            }).returning();

            await logAction("Создана страница базы знаний", "wiki_page", page.id, { title: data.title, folderId: data.folderId }, tx);
            return [page];
        });

        revalidatePath("/dashboard/knowledge-base");
        return { success: true, data: newPage };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/knowledge-base",
            method: "createWikiPage",
            details: data
        });
        return { success: false, error: "Не удалось создать статью" };
    }
}

export async function updateWikiPage(id: string, data: { title?: string, content?: string, folderId?: string | null }): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Управляющий", "Дизайнер"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    const validation = WikiPageUpdateSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    try {
        await db.transaction(async (tx) => {
            await tx.update(wikiPages)
                .set({
                    ...validation.data,
                    updatedAt: new Date()
                })
                .where(eq(wikiPages.id, id));

            await logAction("Обновлена страница базы знаний", "wiki_page", id, { changes: data }, tx);
        });

        revalidatePath("/dashboard/knowledge-base");
        revalidatePath(`/dashboard/knowledge-base/${id}`);

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: `/dashboard/knowledge-base/${id}`,
            method: "updateWikiPage",
            details: { id, ...data }
        });
        return { success: false, error: "Не удалось обновить статью" };
    }
}

export async function deleteWikiPage(id: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session || !["Администратор", "Управляющий", "Дизайнер"].includes(session.roleName)) {
        return { success: false, error: "Недостаточно прав" };
    }

    if (!id || typeof id !== "string") return { success: false, error: "Невалидный ID" };

    try {
        await db.transaction(async (tx) => {
            await tx.delete(wikiPages).where(eq(wikiPages.id, id));
            await logAction("Удалена страница базы знаний", "wiki_page", id, undefined, tx);
        });
        revalidatePath("/dashboard/knowledge-base");
        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/knowledge-base",
            method: "deleteWikiPage",
            details: { id }
        });
        return { success: false, error: "Не удалось удалить статью" };
    }
}
