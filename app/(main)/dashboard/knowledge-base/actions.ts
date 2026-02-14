"use server";

import { db } from "@/lib/db";
import { wikiFolders, wikiPages } from "@/lib/schema";
import { eq, asc, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/lib/types";

// --- Folders ---

export async function getWikiFolders() {
    try {
        const folders = await db.query.wikiFolders.findMany({
            orderBy: [asc(wikiFolders.sortOrder), asc(wikiFolders.name)],
        });
        return folders;
    } catch (error) {
        console.error("Error fetching wiki folders:", error);
        return [];
    }
}

export async function createWikiFolder(name: string, parentId: string | null = null): Promise<ActionResult<typeof wikiFolders.$inferSelect>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const [newFolder] = await db.insert(wikiFolders).values({
            name,
            parentId,
        }).returning();

        revalidatePath("/dashboard/knowledge-base");
        return { success: true, data: newFolder };
    } catch (error) {
        console.error("Error creating wiki folder:", error);
        return { success: false, error: error instanceof Error ? error.message : "Ошибка" };
    }
}

// --- Pages ---

export async function getWikiPages(folderId?: string) {
    try {
        const where = folderId ? eq(wikiPages.folderId, folderId) : undefined;
        const pages = await db.query.wikiPages.findMany({
            where,
            orderBy: [desc(wikiPages.updatedAt)],
            with: {
                author: true,
            }
        });
        return pages;
    } catch (error) {
        console.error("Error fetching wiki pages:", error);
        return [];
    }
}

export async function getWikiPageDetail(id: string) {
    try {
        const page = await db.query.wikiPages.findFirst({
            where: eq(wikiPages.id, id),
            with: {
                author: true,
                folder: true,
            }
        });
        return page;
    } catch (error) {
        console.error("Error fetching wiki page detail:", error);
        return null;
    }
}

export async function createWikiPage(data: { title: string, content: string, folderId: string | null }): Promise<ActionResult<typeof wikiPages.$inferSelect>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const [newPage] = await db.insert(wikiPages).values({
            ...data,
            createdBy: session.id,
        }).returning();

        revalidatePath("/dashboard/knowledge-base");
        return { success: true, data: newPage };
    } catch (error) {
        console.error("Error creating wiki page:", error);
        return { success: false, error: error instanceof Error ? error.message : "Ошибка" };
    }
}

export async function updateWikiPage(id: string, data: { title?: string, content?: string, folderId?: string | null }): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await db.update(wikiPages)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(wikiPages.id, id));

        revalidatePath("/dashboard/knowledge-base");
        revalidatePath(`/dashboard/knowledge-base/${id}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating wiki page:", error);
        return { success: false, error: error instanceof Error ? error.message : "Ошибка" };
    }
}

export async function deleteWikiPage(id: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await db.delete(wikiPages).where(eq(wikiPages.id, id));
        revalidatePath("/dashboard/knowledge-base");
        return { success: true };
    } catch (error) {
        console.error("Error deleting wiki page:", error);
        return { success: false, error: error instanceof Error ? error.message : "Ошибка" };
    }
}
