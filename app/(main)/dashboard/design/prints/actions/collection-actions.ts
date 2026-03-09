"use server";

import { revalidatePath } from "next/cache";
import { eq, sql, asc, ilike, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    printCollections,
    printDesigns,
    productLines,
    printDesignVersions,
} from "@/lib/schema";

import { invalidateCache } from "@/lib/redis";
import { logAction } from "@/lib/audit";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { generateId, slugify } from "@/lib/utils";
import {
    CollectionWithStats,
    CollectionWithFullStats,
    ActionResult
} from "@/lib/types";
import { inventoryCategories } from "@/lib/schema";

type PrintCollection = InferSelectModel<typeof printCollections>;

const CollectionSchema = z.object({
    name: z.string().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
    description: z.string().max(500, "Максимум 500 символов").optional().nullable(),
    coverImage: z.string().url("Некорректный URL").optional().nullable(),
});

export async function getCollections(search?: string): Promise<ActionResult<CollectionWithStats[]>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const designsSq = db
            .select({
                collectionId: printDesigns.collectionId,
                designsCount: sql<number>`count(*)::int`.as("sq_designs_count"),
            })
            .from(printDesigns)
            .groupBy(printDesigns.collectionId)
            .as("designs_sq");

        const linesSq = db
            .select({
                printCollectionId: productLines.printCollectionId,
                linesCount: sql<number>`count(*)::int`.as("sq_lines_count"),
            })
            .from(productLines)
            .groupBy(productLines.printCollectionId)
            .as("lines_sq");

        const baseQuery = db
            .select({
                id: printCollections.id,
                name: printCollections.name,
                description: printCollections.description,
                coverImage: printCollections.coverImage,
                isActive: printCollections.isActive,
                sortOrder: printCollections.sortOrder,
                createdBy: printCollections.createdBy,
                createdAt: printCollections.createdAt,
                updatedAt: printCollections.updatedAt,
                slug: printCollections.slug,
                designsCount: sql<number>`coalesce(${designsSq.designsCount}, 0)`,
                linkedLinesCount: sql<number>`coalesce(${linesSq.linesCount}, 0)`,
            })
            .from(printCollections)
            .leftJoin(designsSq, eq(printCollections.id, designsSq.collectionId))
            .leftJoin(linesSq, eq(printCollections.id, linesSq.printCollectionId));

        const collections = search
            ? await baseQuery
                .where(ilike(printCollections.name, `%${search}%`))
                .orderBy(asc(printCollections.sortOrder), asc(printCollections.name))
            : await baseQuery
                .orderBy(asc(printCollections.sortOrder), asc(printCollections.name));

        return { success: true, data: collections };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/design/prints/actions/collection-actions",
            method: "getCollections",
        });
        return { success: false, error: "Не удалось загрузить коллекции" };
    }
}

export async function createCollection(data: {
    name: string;
    description?: string | null;
    coverImage?: string | null;
}): Promise<ActionResult<PrintCollection>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = CollectionSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        const [collection] = await db
            .insert(printCollections)
            .values({
                id: generateId(),
                name: validated.data.name,
                slug: slugify(validated.data.name),
                description: validated.data.description || null,
                coverImage: validated.data.coverImage || null,
                createdBy: session.id,
                isActive: true,
                sortOrder: 0,
            })
            .returning();

        await logAction("Создана коллекция дизайнов", "print_collection", collection.id, {
            name: collection.name
        });

        invalidateCache("design:collections");
        revalidatePath("/dashboard/design/prints");

        return { success: true, data: collection };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/design/prints/actions/collection-actions",
            method: "createCollection",
        });
        return { success: false, error: "Не удалось создать коллекцию" };
    }
}

export async function updateCollection(
    id: string,
    data: {
        name?: string;
        description?: string | null;
        coverImage?: string | null;
        isActive?: boolean;
        sortOrder?: number;
    }
): Promise<ActionResult<PrintCollection>> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID коллекции" };
    }

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const [collection] = await db
            .update(printCollections)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(printCollections.id, id))
            .returning();

        if (!collection) {
            return { success: false, error: "Коллекция не найдена" };
        }

        await logAction("Обновлена коллекция дизайнов", "print_collection", id, {
            name: collection.name
        });

        invalidateCache("design:collections");
        revalidatePath("/dashboard/design/prints");
        revalidatePath(`/dashboard/design/prints/${id}`);

        return { success: true, data: collection };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/design/prints/actions/collection-actions",
            method: "updateCollection",
            details: { id },
        });
        return { success: false, error: "Не удалось обновить коллекцию" };
    }
}

export async function deleteCollection(id: string): Promise<ActionResult> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID коллекции" };
    }

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const [collection] = await db.select().from(printCollections).where(eq(printCollections.id, id)).limit(1);
        if (!collection) return { success: false, error: "Коллекция не найдена" };

        const isAdmin = session.roleName === "Администратор" || session.roleName === "Руководство";
        if (!isAdmin && collection.createdBy !== session.id) {
            return { success: false, error: "Недостаточно прав для удаления" }
        }
        const [linesCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(productLines)
            .where(eq(productLines.printCollectionId, id));

        if (linesCount.count > 0) {
            return {
                success: false,
                error: `Нельзя удалить коллекцию: она используется в ${linesCount.count} линейках`
            };
        }

        await db.delete(printCollections).where(eq(printCollections.id, id));

        await logAction("Удалена коллекция дизайнов", "print_collection", id);

        invalidateCache("design:collections");
        revalidatePath("/dashboard/design/prints");

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/design/prints/actions/collection-actions",
            method: "deleteCollection",
            details: { id },
        });
        return { success: false, error: "Не удалось удалить коллекцию" };
    }
}

/**
 * Получить коллекцию по ID с расширенной статистикой и макетами
 */
export async function getCollectionById(id: string): Promise<ActionResult<CollectionWithFullStats>> {
    const idValidation = z.string().uuid().safeParse(id);
    if (!idValidation.success) {
        return { success: false, error: "Некорректный ID коллекции" };
    }

    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        // 1. Получаем базовую информацию о коллекции
        const [collection] = await db
            .select()
            .from(printCollections)
            .where(eq(printCollections.id, id))
            .limit(1);

        if (!collection) {
            return { success: false, error: "Коллекция не найдена" };
        }

        // 2. Получаем детальную статистику (макеты, версии, файлы)
        const [designsCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(printDesigns)
            .where(eq(printDesigns.collectionId, id));

        const [versionsCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(printDesignVersions)
            .innerJoin(printDesigns, eq(printDesignVersions.designId, printDesigns.id))
            .where(eq(printDesigns.collectionId, id));

        // 3. Получаем связанные линейки продуктов (базовые и готовые)
        const linkedLines = await db
            .select({
                id: productLines.id,
                name: productLines.name,
                type: productLines.type,
                categoryName: inventoryCategories.name,
            })
            .from(productLines)
            .leftJoin(inventoryCategories, eq(productLines.categoryId, inventoryCategories.id))
            .where(eq(productLines.printCollectionId, id))
            .orderBy(asc(productLines.name));

        return {
            success: true,
            data: {
                ...collection,
                stats: {
                    designs: designsCount.count,
                    versions: versionsCount.count,
                    files: 0, // Можно добавить позже если нужно
                },
                linkedLines: linkedLines.map(line => ({
                    ...line,
                    categoryName: line.categoryName || "Без категории"
                })),
            }
        };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/design/prints/actions/collection-actions",
            method: "getCollectionById",
            details: { id },
        });
        return { success: false, error: "Не удалось загрузить данные коллекции" };
    }
}

export async function updateCollectionsOrder(
    items: { id: string; sortOrder: number }[]
): Promise<ActionResult<void>> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        await db.transaction(async (tx) => {
            for (const item of items) {
                await tx
                    .update(printCollections)
                    .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
                    .where(eq(printCollections.id, item.id));
            }
        });

        invalidateCache("design:collections");
        revalidatePath("/dashboard/design/prints");

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/dashboard/design/prints/actions/collection-actions",
            method: "updateCollectionsOrder",
        });
        return { success: false, error: "Не удалось обновить порядок коллекций" };
    }
}
