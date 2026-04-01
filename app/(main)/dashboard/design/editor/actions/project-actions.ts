"use server";

import { okVoid } from "@/lib/types";

import { db } from "@/lib/db";
import { editorProjects, editorExports } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { auditLogs } from "@/lib/schema/system";
import { z } from "zod";

// Типы
type ActionResult<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Схемы валидации
const CreateProjectSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    width: z.number().int().min(100).max(4096).default(800),
    height: z.number().int().min(100).max(4096).default(600),
    canvasData: z.unknown(),
    orderId: z.string().uuid().optional().nullable(),
    orderItemId: z.string().uuid().optional().nullable(),
    designId: z.string().uuid().optional().nullable(),
    isTemplate: z.boolean().optional(),
});

const UpdateProjectSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    width: z.number().int().min(100).max(4096).optional(),
    height: z.number().int().min(100).max(4096).optional(),
    canvasData: z.unknown().optional(),
    thumbnailPath: z.string().optional().nullable(),
    isTemplate: z.boolean().optional(),
    isFinalized: z.boolean().optional(),
});

// === ПРОЕКТЫ ===

// Получить проекты
export async function getEditorProjects(options?: {
    orderId?: string;
    designId?: string;
    templatesOnly?: boolean;
    limit?: number;
}): Promise<ActionResult<EditorProject[]>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const conditions = [];

        if (options?.orderId) {
            conditions.push(eq(editorProjects.orderId, options.orderId));
        }

        if (options?.designId) {
            conditions.push(eq(editorProjects.designId, options.designId));
        }

        if (options?.templatesOnly) {
            conditions.push(eq(editorProjects.isTemplate, true));
        }

        const result = await db.query.editorProjects.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [desc(editorProjects.updatedAt)],
            limit: options?.limit || 50,
            with: {
                createdByUser: {
                    columns: { id: true, name: true, avatar: true },
                },
                order: true,
            },
        });

        return { success: true, data: result as EditorProject[] };
    } catch (error) {
        console.error("Error fetching projects:", error);
        return { success: false, error: "Не удалось загрузить проекты" };
    }
}

// Получить проект по ID
export async function getEditorProject(id: string): Promise<ActionResult<EditorProjectFull>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const result = await db.query.editorProjects.findFirst({
            where: eq(editorProjects.id, id),
            with: {
                createdByUser: {
                    columns: { id: true, name: true, avatar: true },
                },
                order: true,
                design: {
                    columns: { id: true, name: true, preview: true },
                },
                exports: {
                    orderBy: [desc(editorExports.createdAt)],
                    limit: 10,
                },
            },
        });

        if (!result) {
            return { success: false, error: "Проект не найден" };
        }

        return { success: true, data: result as EditorProjectFull };
    } catch (error) {
        console.error("Error fetching project:", error);
        return { success: false, error: "Не удалось загрузить проект" };
    }
}

// Создать проект
export async function createEditorProject(
    data: z.infer<typeof CreateProjectSchema>
): Promise<ActionResult<EditorProject>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validated = CreateProjectSchema.parse(data);

        const results = await db
            .insert(editorProjects)
            .values({
                ...validated,
                createdBy: session.id,
            } as typeof editorProjects.$inferInsert)
            .returning();

        const result = results[0];

        revalidatePath("/dashboard/design/editor");
        if (validated.orderId) {
            revalidatePath(`/dashboard/orders/${validated.orderId}`);
        }

        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Error creating project:", error);
        return { success: false, error: "Не удалось создать проект" };
    }
}

// Обновить проект
export async function updateEditorProject(
    id: string,
    data: z.infer<typeof UpdateProjectSchema>
): Promise<ActionResult<EditorProject>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const validated = UpdateProjectSchema.parse(data);

        const results = await db
            .update(editorProjects)
            .set({
                ...validated,
                updatedAt: new Date(),
            })
            .where(eq(editorProjects.id, id))
            .returning();

        const result = results[0];

        if (!result) {
            return { success: false, error: "Проект не найден" };
        }

        revalidatePath("/dashboard/design/editor");
        revalidatePath(`/dashboard/design/editor/${id}`);

        return { success: true, data: result };
    } catch (error) {
        console.error("Error updating project:", error);
        return { success: false, error: "Не удалось обновить проект" };
    }
}

// Удалить проект
export async function deleteEditorProject(id: string): Promise<ActionResult> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const project = await db.query.editorProjects.findFirst({
            where: eq(editorProjects.id, id),
        });

        if (!project) {
            return { success: false, error: "Проект не найден" };
        }

        // RBAC & IDOR: Only admin or owner can delete
        const canDelete = session.roleSlug === "admin" || session.roleSlug === "management" || project.createdBy === session.id;
        if (!canDelete) {
            return { success: false, error: "У вас нет прав на удаление этого проекта" };
        }

        await db.delete(editorProjects).where(eq(editorProjects.id, id));

        // Логируем критическое действие
        await db.insert(auditLogs).values({
            userId: session.id,
            action: "delete_editor_project",
            entityType: "editor_project",
            entityId: id,
            details: { projectName: project.name },
        });

        revalidatePath("/dashboard/design/editor");

        return okVoid();
    } catch (error) {
        console.error("Error deleting project:", error);
        return { success: false, error: "Не удалось удалить проект" };
    }
}

// Автосохранение
export async function autoSaveProject(
    id: string,
    canvasData: unknown
): Promise<ActionResult> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        await db
            .update(editorProjects)
            .set({
                canvasData,
                updatedAt: new Date(),
            })
            .where(eq(editorProjects.id, id));

        return okVoid();
    } catch (error) {
        console.error("Error auto-saving:", error);
        return { success: false, error: "Ошибка автосохранения" };
    }
}

// Дублировать проект
export async function duplicateEditorProject(id: string): Promise<ActionResult<EditorProject>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const original = await db.query.editorProjects.findFirst({
            where: eq(editorProjects.id, id),
        });

        if (!original) {
            return { success: false, error: "Проект не найден" };
        }

        const results = await db
            .insert(editorProjects)
            .values({
                name: `${original.name} (копия)`,
                description: original.description,
                width: original.width,
                height: original.height,
                canvasData: original.canvasData,
                designId: original.designId,
                isTemplate: false,
                isFinalized: false,
                createdBy: session.id,
            })
            .returning();

        const result = results[0];

        revalidatePath("/dashboard/design/editor");

        return { success: true, data: result };
    } catch (error) {
        console.error("Error duplicating project:", error);
        return { success: false, error: "Не удалось дублировать проект" };
    }
}

// Создать проект из шаблона
export async function createProjectFromTemplate(
    templateId: string,
    options: {
        name: string;
        orderId?: string;
        orderItemId?: string;
    }
): Promise<ActionResult<EditorProject>> {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Необходима авторизация" };
        }

        const template = await db.query.editorProjects.findFirst({
            where: and(
                eq(editorProjects.id, templateId),
                eq(editorProjects.isTemplate, true)
            ),
        });

        if (!template) {
            return { success: false, error: "Шаблон не найден" };
        }

        const results = await db
            .insert(editorProjects)
            .values({
                name: options.name,
                width: template.width,
                height: template.height,
                canvasData: template.canvasData,
                orderId: options.orderId,
                orderItemId: options.orderItemId,
                designId: template.designId,
                isTemplate: false,
                isFinalized: false,
                createdBy: session.id,
            })
            .returning();

        const result = results[0];

        revalidatePath("/dashboard/design/editor");

        return { success: true, data: result };
    } catch (error) {
        console.error("Error creating from template:", error);
        return { success: false, error: "Не удалось создать проект" };
    }
}

// Типы
type EditorProject = typeof editorProjects.$inferSelect;
type EditorProjectFull = EditorProject & {
    createdByUser: { id: string; name: string; avatar: string | null };
    order?: { id: string; orderNumber: string; status: string } | null;
    design?: { id: string; name: string; preview: string | null } | null;
    exports: (typeof editorExports.$inferSelect)[];
};
