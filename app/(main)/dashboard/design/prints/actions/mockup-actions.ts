"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { printDesignMockups } from "@/lib/schema";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/audit";
import { z } from "zod";

const CreateMockupSchema = z.object({
    designId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    preview: z.string().optional().nullable(),
});

const UpdateMockupSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional().nullable(),
    preview: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
});

// === MOCKUPS ===

export async function createMockup(rawData: z.infer<typeof CreateMockupSchema>) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validated = CreateMockupSchema.safeParse(rawData);
    if (!validated.success) return { success: false, error: "Неверные данные: " + validated.error.message };
    const data = validated.data;

    try {
        const [mockup] = await db
            .insert(printDesignMockups)
            .values({
                designId: data.designId,
                name: data.name,
                description: data.description || null,
                preview: data.preview || null,
            })
            .returning();

        revalidatePath(`/dashboard/design/prints/${data.designId}`);

        return { success: true, data: mockup };
    } catch (error) {
        await logError({ error, path: "/dashboard/design/prints/actions/mockup-actions", method: "createMockup" });
        return { success: false, error: "Не удалось создать мокап" };
    }
}

export async function updateMockup(id: string, rawData: z.infer<typeof UpdateMockupSchema>) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validatedId = z.string().uuid().safeParse(id);
    if (!validatedId.success) return { success: false, error: "Неверный ID мокапа" };

    const validatedData = UpdateMockupSchema.safeParse(rawData);
    if (!validatedData.success) return { success: false, error: "Неверные данные: " + validatedData.error.message };
    const data = validatedData.data;

    try {
        const existing = await db.query.printDesignMockups.findFirst({
            where: eq(printDesignMockups.id, validatedId.data),
            with: { design: true }
        });

        if (!existing) return { success: false, error: "Мокап не найден" };

        // RBAC/IDOR: Admin, Management, or Owner
        const canUpdate = session.roleName === "Администратор" || session.roleName === "Руководство" || (existing.design as unknown as { createdBy: string }).createdBy === session.id;
        if (!canUpdate) return { success: false, error: "Нет прав для изменения этого мокапа" };

        const [mockup] = await db
            .update(printDesignMockups)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(printDesignMockups.id, validatedId.data))
            .returning();

        if (mockup) {
            revalidatePath(`/dashboard/design/prints/${mockup.designId}`);
        }

        return { success: true, data: mockup };
    } catch (error) {
        await logError({ error, path: "/dashboard/design/prints/actions/mockup-actions", method: "updateMockup" });
        return { success: false, error: "Не удалось обновить мокап" };
    }
}

export async function deleteMockup(id: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const validatedId = z.string().uuid().safeParse(id);
    if (!validatedId.success) return { success: false, error: "Неверный ID мокапа" };

    try {
        const existing = await db.query.printDesignMockups.findFirst({
            where: eq(printDesignMockups.id, validatedId.data),
            with: { design: true }
        });

        if (!existing) return { success: false, error: "Мокап не найден" };

        // RBAC/IDOR: Admin, Management, or Owner
        const canDelete = session.roleName === "Администратор" || session.roleName === "Руководство" || (existing.design as unknown as { createdBy: string }).createdBy === session.id;
        if (!canDelete) return { success: false, error: "Нет прав для удаления этого мокапа" };

        const [mockup] = await db
            .delete(printDesignMockups)
            .where(eq(printDesignMockups.id, validatedId.data))
            .returning();

        if (mockup) {
            await logAction("Удален мокап дизайна", "print_design_mockup", id, {
                name: existing.name,
                designId: existing.designId
            });
            revalidatePath(`/dashboard/design/prints/${mockup.designId}`);
        }

        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/design/prints/actions/mockup-actions", method: "deleteMockup" });
        return { success: false, error: "Не удалось удалить мокап" };
    }
}

export async function updateMockupsOrder(designId: string, items: { id: string; sortOrder: number }[]) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const design = await db.query.printDesigns.findFirst({
            where: eq(printDesignMockups.designId, designId),
        });

        if (!design) return { success: false, error: "Дизайн не найден" };

        // RBAC/IDOR: Admin, Management, or Owner
        const canUpdate = session.roleName === "Администратор" || session.roleName === "Руководство" || (design as unknown as { createdBy: string }).createdBy === session.id;
        if (!canUpdate) return { success: false, error: "Нет прав для изменения порядка мокапов" };

        await db.transaction(async (tx) => {
            for (const item of items) {
                await tx
                    .update(printDesignMockups)
                    .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
                    .where(eq(printDesignMockups.id, item.id));
            }
        });

        revalidatePath(`/dashboard/design/prints/${designId}`);

        return { success: true };
    } catch (error) {
        await logError({ error, path: "/dashboard/design/prints/actions/mockup-actions", method: "updateMockupsOrder" });
        return { success: false, error: "Не удалось обновить порядок мокапов" };
    }
}
