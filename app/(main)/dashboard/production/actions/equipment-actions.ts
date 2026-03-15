"use server";

import { db } from "@/lib/db";
import { equipment } from "@/lib/schema/production";
import { eq, asc, ilike, and, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/audit";
import { z } from "zod";

type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

const EquipmentSchema = z.object({
    name: z.string().min(1, "Название обязательно").max(255),
    code: z.string().min(1, "Код обязателен").max(50),
    description: z.string().optional().nullable(),
    category: z.string().min(1, "Категория обязательна"),
    brand: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    serialNumber: z.string().optional().nullable(),
    printWidth: z.string().or(z.number()).transform(v => v ? Number(v) : null).optional().nullable(),
    printHeight: z.string().or(z.number()).transform(v => v ? Number(v) : null).optional().nullable(),
    printSpeed: z.string().or(z.number()).transform(v => v ? Number(v) : null).optional().nullable(),
    applicationTypeIds: z.array(z.string().uuid()).optional(),
    status: z.enum(["active", "maintenance", "repair", "inactive"]).optional(),
    location: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    imagePath: z.string().optional().nullable(),
});

// Получить всё оборудование
export async function getEquipment(options?: {
    search?: string;
    category?: string;
    status?: string;
}): Promise<ActionResult<Equipment[]>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const conditions = [];

        if (options?.search) {
            conditions.push(
                ilike(equipment.name, `%${options.search}%`)
            );
        }

        if (options?.category) {
            conditions.push(eq(equipment.category, options.category));
        }

        if (options?.status) {
            conditions.push(eq(equipment.status, options.status as typeof equipment.$inferSelect.status));
        }

        const result = await db
            .select()
            .from(equipment)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(asc(equipment.sortOrder), asc(equipment.name));

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching equipment:", error);
        return { success: false, error: "Не удалось загрузить оборудование" };
    }
}

// Получить по ID
export async function getEquipmentById(id: string): Promise<ActionResult<Equipment>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const result = await db.query.equipment.findFirst({
            where: eq(equipment.id, id),
        });

        if (!result) {
            return { success: false, error: "Оборудование не найдено" };
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching equipment:", error);
        return { success: false, error: "Не удалось загрузить оборудование" };
    }
}

// Создать
export async function createEquipment(
    data: z.infer<typeof EquipmentSchema>
): Promise<ActionResult<Equipment>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validated = EquipmentSchema.parse(data);

        // Проверяем уникальность кода
        const existing = await db.query.equipment.findFirst({
            where: eq(equipment.code, validated.code),
        });

        if (existing) {
            return { success: false, error: "Оборудование с таким кодом уже существует" };
        }

        const [result] = await db
            .insert(equipment)
            .values(validated)
            .returning();

        revalidatePath("/dashboard/production/equipment");

        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Error creating equipment:", error);
        return { success: false, error: "Не удалось создать оборудование" };
    }
}

// Обновить
export async function updateEquipment(
    id: string,
    data: Partial<z.infer<typeof EquipmentSchema>>
): Promise<ActionResult<Equipment>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const existing = await db.query.equipment.findFirst({
            where: eq(equipment.id, id),
        });

        if (!existing) {
            return { success: false, error: "Оборудование не найдено" };
        }

        // Проверяем уникальность кода если меняется
        if (data.code && data.code !== existing.code) {
            const codeExists = await db.query.equipment.findFirst({
                where: eq(equipment.code, data.code),
            });
            if (codeExists) {
                return { success: false, error: "Оборудование с таким кодом уже существует" };
            }
        }

        const [result] = await db
            .update(equipment)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(equipment.id, id))
            .returning();

        revalidatePath("/dashboard/production/equipment");

        return { success: true, data: result };
    } catch (error) {
        console.error("Error updating equipment:", error);
        return { success: false, error: "Не удалось обновить оборудование" };
    }
}

// Удалить
export async function deleteEquipment(id: string): Promise<ActionResult> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        // RBAC: Только Администратор или Руководство могут удалять
        if (session.roleName !== "Администратор" && session.roleName !== "Руководство") {
            return { success: false, error: "Недостаточно прав для удаления" };
        }

        await db.delete(equipment).where(eq(equipment.id, id));

        // Логируем критическое действие
        await logAction("Удалено оборудование", "equipment", id, { 
            equipmentId: id 
        });

        revalidatePath("/dashboard/production/equipment");

        return { success: true };
    } catch (error) {
        console.error("Error deleting equipment:", error);
        return { success: false, error: "Не удалось удалить оборудование" };
    }
}

// Обновить статус
export async function updateEquipmentStatus(
    id: string,
    status: "active" | "maintenance" | "repair" | "inactive"
): Promise<ActionResult<Equipment>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const [result] = await db
            .update(equipment)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(equipment.id, id))
            .returning();

        revalidatePath("/dashboard/production/equipment");

        return { success: true, data: result };
    } catch (error) {
        console.error("Error updating status:", error);
        return { success: false, error: "Не удалось обновить статус" };
    }
}

// Обновить статус обслуживания
export async function updateEquipmentMaintenance(
    id: string,
    data: {
        status: "active" | "maintenance" | "repair";
        notes?: string;
        nextMaintenanceAt?: Date;
    }
): Promise<ActionResult<Equipment>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const updateData: Partial<typeof equipment.$inferInsert> = {
            status: data.status,
            updatedAt: new Date(),
        } as Partial<typeof equipment.$inferInsert>;

        if (data.status === "active") {
            updateData.lastMaintenanceAt = new Date();
        }

        if (data.notes) {
            updateData.maintenanceNotes = data.notes;
        }

        if (data.nextMaintenanceAt) {
            updateData.nextMaintenanceAt = data.nextMaintenanceAt;
        }

        const [result] = await db
            .update(equipment)
            .set(updateData)
            .where(eq(equipment.id, id))
            .returning();

        revalidatePath("/dashboard/production/equipment");

        return { success: true, data: result };
    } catch (error) {
        console.error("Error updating maintenance:", error);
        return { success: false, error: "Не удалось обновить статус" };
    }
}

// Статистика
export async function getEquipmentStats(): Promise<ActionResult<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    needsMaintenance: number;
}>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Не авторизован" };
        }

        const statusCounts = await db
            .select({
                status: equipment.status,
                count: count(),
            })
            .from(equipment)
            .groupBy(equipment.status);

        const categoryCounts = await db
            .select({
                category: equipment.category,
                count: count(),
            })
            .from(equipment)
            .groupBy(equipment.category);

        const needsMaintenanceCount = await db
            .select({ count: count() })
            .from(equipment)
            .where(sql`${equipment.nextMaintenanceAt} <= ${new Date()}`);

        const stats = {
            total: statusCounts.reduce((acc, curr) => acc + Number(curr.count), 0),
            byStatus: statusCounts.reduce((acc, curr) => {
                acc[curr.status] = Number(curr.count);
                return acc;
            }, {} as Record<string, number>),
            byCategory: categoryCounts.reduce((acc, curr) => {
                acc[curr.category] = Number(curr.count);
                return acc;
            }, {} as Record<string, number>),
            needsMaintenance: Number(needsMaintenanceCount[0]?.count || 0),
        };

        return { success: true, data: stats };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { success: false, error: "Не удалось загрузить статистику" };
    }
}

type Equipment = typeof equipment.$inferSelect;
