"use server";

import { db } from "@/lib/db";
import { productionStaff, productionTasks } from "@/lib/schema/production";
import { users } from "@/lib/schema/users";
import { eq, asc, and, count, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { z } from "zod";

type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

const StaffSchema = z.object({
    userId: z.string().uuid().optional().nullable(),
    name: z.string().min(1, "Имя обязательно").max(255),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    position: z.string().optional().nullable(),
    specializationIds: z.array(z.string().uuid()).optional(),
    lineIds: z.array(z.string().uuid()).optional(),
    hourlyRate: z.number().int().min(0).optional().nullable(),
    isActive: z.boolean().optional(),
    avatarPath: z.string().optional().nullable(),
});

// Получить всех сотрудников
export async function getProductionStaff(options?: {
    search?: string;
    activeOnly?: boolean;
    lineId?: string;
}): Promise<ActionResult<ProductionStaffWithStats[]>> {
    try {
        const conditions = [];

        if (options?.search) {
            conditions.push(ilike(productionStaff.name, `%${options.search}%`));
        }

        if (options?.activeOnly) {
            conditions.push(eq(productionStaff.isActive, true));
        }

        const staff = await db.query.productionStaff.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [asc(productionStaff.name)],
            with: {
                user: {
                    columns: { id: true, name: true, email: true, avatar: true },
                },
            },
        });

        // Фильтруем по lineId если указан
        let filteredStaff = staff;
        if (options?.lineId) {
            filteredStaff = staff.filter((s) =>
                (s.lineIds as string[] || []).includes(options.lineId!)
            );
        }

        // Подсчитываем задачи для каждого сотрудника
        const staffWithStats = await Promise.all(
            filteredStaff.map(async (member) => {
                const taskCounts = await db
                    .select({
                        status: productionTasks.status,
                        count: count(),
                    })
                    .from(productionTasks)
                    .where(eq(productionTasks.assigneeId, member.id))
                    .groupBy(productionTasks.status);

                const stats = {
                    active: 0,
                    completed: 0,
                    total: 0,
                };

                for (const row of taskCounts) {
                    stats.total += Number(row.count);
                    if (row.status === "in_progress") stats.active = Number(row.count);
                    if (row.status === "completed") stats.completed = Number(row.count);
                }

                return { ...member, stats };
            })
        );

        return { success: true, data: staffWithStats as ProductionStaffWithStats[] };
    } catch (error) {
        console.error("Error fetching staff:", error);
        return { success: false, error: "Не удалось загрузить сотрудников" };
    }
}

// Получить сотрудника по ID
export async function getProductionStaffById(id: string): Promise<ActionResult<ProductionStaffFull>> {
    try {
        const member = await db.query.productionStaff.findFirst({
            where: eq(productionStaff.id, id),
            with: {
                user: true,
            },
        });

        if (!member) {
            return { success: false, error: "Сотрудник не найден" };
        }

        // Получаем текущие задачи
        const tasks = await db.query.productionTasks.findMany({
            where: eq(productionTasks.assigneeId, id),
            orderBy: [asc(productionTasks.sortOrder)],
            limit: 20,
            with: {
                order: {
                    columns: { id: true, orderNumber: true },
                },
                line: {
                    columns: { id: true, name: true, color: true },
                },
            },
        });

        // Статистика по завершённым задачам
        const completedStats = await db
            .select({
                count: count(),
            })
            .from(productionTasks)
            .where(and(
                eq(productionTasks.assigneeId, id),
                eq(productionTasks.status, "completed")
            ));

        return {
            success: true,
            data: {
                ...member,
                tasks,
                completedCount: Number(completedStats[0].count),
            } as ProductionStaffFull,
        };
    } catch (error) {
        console.error("Error fetching staff member:", error);
        return { success: false, error: "Не удалось загрузить сотрудника" };
    }
}

// Создать сотрудника
export async function createProductionStaff(
    data: z.infer<typeof StaffSchema>
): Promise<ActionResult<ProductionStaffMember>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validated = StaffSchema.parse(data);

        const [result] = await db
            .insert(productionStaff)
            .values(validated)
            .returning();

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/production/staff");

        return { success: true, data: result as ProductionStaffMember };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Error creating staff:", error);
        return { success: false, error: "Не удалось создать сотрудника" };
    }
}

// Обновить сотрудника
export async function updateProductionStaff(
    id: string,
    data: Partial<z.infer<typeof StaffSchema>>
): Promise<ActionResult<ProductionStaffMember>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const [result] = await db
            .update(productionStaff)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(productionStaff.id, id))
            .returning();

        if (!result) {
            return { success: false, error: "Сотрудник не найден" };
        }

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/production/staff");

        return { success: true, data: result as ProductionStaffMember };
    } catch (error) {
        console.error("Error updating staff:", error);
        return { success: false, error: "Не удалось обновить сотрудника" };
    }
}

// Удалить сотрудника
export async function deleteProductionStaff(id: string): Promise<ActionResult> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        // Проверяем наличие активных задач
        const activeTasks = await db
            .select({ count: count() })
            .from(productionTasks)
            .where(and(
                eq(productionTasks.assigneeId, id),
                eq(productionTasks.status, "in_progress")
            ));

        if (activeTasks[0].count > 0) {
            return { success: false, error: "Невозможно удалить: есть активные задачи" };
        }

        await db.delete(productionStaff).where(eq(productionStaff.id, id));

        revalidatePath("/dashboard/production");
        revalidatePath("/dashboard/production/staff");

        return { success: true };
    } catch (error) {
        console.error("Error deleting staff:", error);
        return { success: false, error: "Не удалось удалить сотрудника" };
    }
}

// Получить доступных сотрудников для назначения
export async function getAvailableStaff(options?: {
    lineId?: string;
    applicationTypeId?: string;
}): Promise<ActionResult<ProductionStaffMember[]>> {
    try {
        const staff = await db.query.productionStaff.findMany({
            where: eq(productionStaff.isActive, true),
            orderBy: [asc(productionStaff.name)],
            limit: 100,
        });

        let filtered = staff;

        // Фильтруем по линии
        if (options?.lineId) {
            filtered = filtered.filter((s) =>
                (s.lineIds as string[] || []).includes(options.lineId!)
            );
        }

        // Фильтруем по специализации
        if (options?.applicationTypeId) {
            filtered = filtered.filter((s) =>
                (s.specializationIds as string[] || []).includes(options.applicationTypeId!)
            );
        }

        return { success: true, data: filtered as ProductionStaffMember[] };
    } catch (error) {
        console.error("Error fetching available staff:", error);
        return { success: false, error: "Не удалось загрузить сотрудников" };
    }
}

// Типы
export type ProductionStaffMember = typeof productionStaff.$inferSelect;
export type ProductionStaffWithStats = ProductionStaffMember & {
    user?: { id: string; name: string; email: string; avatar: string | null } | null;
    stats: {
        active: number;
        completed: number;
        total: number;
    };
};
export type ProductionStaffFull = ProductionStaffMember & {
    user?: typeof users.$inferSelect | null;
    tasks: typeof productionTasks.$inferSelect[];
    completedCount: number;
};
