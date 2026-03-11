"use server";

import { db } from "@/lib/db";
import { productionLines, productionTasks, applicationTypes } from "@/lib/schema/production";
import { eq, asc, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { z } from "zod";

type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

const LineSchema = z.object({
    name: z.string().min(1, "Название обязательно").max(255),
    code: z.string().min(1, "Код обязателен").max(50),
    description: z.string().optional().nullable(),
    applicationTypeId: z.string().uuid().optional().nullable(),
    equipmentIds: z.array(z.string().uuid()).optional(),
    capacity: z.number().int().min(1).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
    isActive: z.boolean().optional(),
});

// Получить все линии
export async function getProductionLines(options?: {
    activeOnly?: boolean;
}): Promise<ActionResult<ProductionLineWithStats[]>> {
    try {
        const conditions = [];

        if (options?.activeOnly) {
            conditions.push(eq(productionLines.isActive, true));
        }

        const lines = await db.query.productionLines.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [asc(productionLines.sortOrder), asc(productionLines.name)],
            with: {
                applicationType: {
                    columns: { id: true, name: true, color: true },
                },
            },
        });

        // Подсчитываем задачи для каждой линии
        const linesWithStats = await Promise.all(
            lines.map(async (line) => {
                const taskCounts = await db
                    .select({
                        status: productionTasks.status,
                        count: count(),
                    })
                    .from(productionTasks)
                    .where(eq(productionTasks.lineId, line.id))
                    .groupBy(productionTasks.status);

                const stats = {
                    pending: 0,
                    inProgress: 0,
                    completed: 0,
                    total: 0,
                };

                for (const row of taskCounts) {
                    stats.total += Number(row.count);
                    if (row.status === "pending") stats.pending = Number(row.count);
                    if (row.status === "in_progress") stats.inProgress = Number(row.count);
                    if (row.status === "completed") stats.completed = Number(row.count);
                }

                return { ...line, stats };
            })
        );

        return { success: true, data: linesWithStats as ProductionLineWithStats[] };
    } catch (error) {
        console.error("Error fetching lines:", error);
        return { success: false, error: "Не удалось загрузить линии" };
    }
}

// Получить линию по ID
export async function getProductionLineById(id: string): Promise<ActionResult<ProductionLineFull>> {
    try {
        const line = await db.query.productionLines.findFirst({
            where: eq(productionLines.id, id),
            with: {
                applicationType: true,
            },
        });

        if (!line) {
            return { success: false, error: "Линия не найдена" };
        }

        // Получаем активные задачи
        const tasks = await db.query.productionTasks.findMany({
            where: and(
                eq(productionTasks.lineId, id),
                eq(productionTasks.status, "in_progress")
            ),
            limit: 10,
            with: {
                assignee: {
                    columns: { id: true, name: true, avatarPath: true },
                },
            },
        });

        return { success: true, data: { ...line, activeTasks: tasks } as ProductionLineFull };
    } catch (error) {
        console.error("Error fetching line:", error);
        return { success: false, error: "Не удалось загрузить линию" };
    }
}

// Создать линию
export async function createProductionLine(
    data: z.infer<typeof LineSchema>
): Promise<ActionResult<ProductionLine>> {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validated = LineSchema.parse(data);

        // Проверяем уникальность кода
        const existing = await db.query.productionLines.findFirst({
            where: eq(productionLines.code, validated.code),
        });

        if (existing) {
            return { success: false, error: "Линия с таким кодом уже существует" };
        }

        const [result] = await db
            .insert(productionLines)
            .values(validated)
            .returning();

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/production/lines");

        return { success: true, data: result as ProductionLine };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Error creating line:", error);
        return { success: false, error: "Не удалось создать линию" };
    }
}

// Обновить линию
export async function updateProductionLine(
    id: string,
    data: Partial<z.infer<typeof LineSchema>>
): Promise<ActionResult<ProductionLine>> {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "Необходима авторизация" };
        }

        const existing = await db.query.productionLines.findFirst({
            where: eq(productionLines.id, id),
        });

        if (!existing) {
            return { success: false, error: "Линия не найдена" };
        }

        if (data.code && data.code !== existing.code) {
            const codeExists = await db.query.productionLines.findFirst({
                where: eq(productionLines.code, data.code),
            });
            if (codeExists) {
                return { success: false, error: "Линия с таким кодом уже существует" };
            }
        }

        const [result] = await db
            .update(productionLines)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(productionLines.id, id))
            .returning();

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/production/lines");

        return { success: true, data: result as ProductionLine };
    } catch (error) {
        console.error("Error updating line:", error);
        return { success: false, error: "Не удалось обновить линию" };
    }
}

// Удалить линию
export async function deleteProductionLine(id: string): Promise<ActionResult> {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "Необходима авторизация" };
        }

        // Проверяем наличие активных задач
        const activeTasks = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(and(
                eq(productionTasks.lineId, id),
                eq(productionTasks.status, "in_progress")
            ));

        if (activeTasks[0].count > 0) {
            return { success: false, error: "Невозможно удалить: есть активные задачи" };
        }

        await db.delete(productionLines).where(eq(productionLines.id, id));

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/production/lines");

        return { success: true };
    } catch (error) {
        console.error("Error deleting line:", error);
        return { success: false, error: "Не удалось удалить линию" };
    }
}

// Обновить порядок линий
export async function updateLinesOrder(
    items: { id: string; sortOrder: number }[]
): Promise<ActionResult> {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: "Необходима авторизация" };
        }

        await db.transaction(async (tx) => {
            for (const item of items) {
                await tx
                    .update(productionLines)
                    .set({ sortOrder: item.sortOrder })
                    .where(eq(productionLines.id, item.id));
            }
        });

        revalidatePath("/dashboard/production/lines");

        return { success: true };
    } catch (error) {
        console.error("Error updating order:", error);
        return { success: false, error: "Не удалось обновить порядок" };
    }
}

// Типы
export type ProductionLine = typeof productionLines.$inferSelect;
export type ProductionLineWithStats = ProductionLine & {
    applicationType?: { id: string; name: string; color: string | null } | null;
    stats: {
        pending: number;
        inProgress: number;
        completed: number;
        total: number;
    };
};
export type ProductionLineFull = ProductionLine & {
    applicationType?: typeof applicationTypes.$inferSelect | null;
    activeTasks: unknown[];
};
