"use server";

import { db } from "@/lib/db";
import { employeeFaces, users } from "@/lib/schema";
import { getSession } from "@/lib/session";
import { requireAdmin } from "@/lib/admin";
import { logError } from "@/lib/error-logger";
import { logAction } from "@/lib/audit";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CreateFaceSchema, UpdateFaceSchema } from "../validation";

// ============================================
// ACTIONS
// ============================================

export async function getEmployeeFaces() {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const faces = await db.query.employeeFaces.findMany({
            limit: 500,
            where: eq(employeeFaces.isActive, true),
            orderBy: [desc(employeeFaces.createdAt)],
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                    with: {
                        department: {
                            columns: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return { success: true, data: faces };
    } catch (error) {
        await logError({
            error,
            path: "/staff/faces",
            method: "getEmployeeFaces",
        });
        return { success: false, error: "Не удалось загрузить данные лиц" };
    }
}

export async function getFacesByUser(userId: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const faces = await db.query.employeeFaces.findMany({
            limit: 500,
            where: and(
                eq(employeeFaces.userId, userId),
                eq(employeeFaces.isActive, true)
            ),
            orderBy: [desc(employeeFaces.isPrimary), desc(employeeFaces.createdAt)],
        });

        return { success: true, data: faces };
    } catch (error) {
        await logError({
            error,
            path: "/staff/faces",
            method: "getFacesByUser",
        });
        return { success: false, error: "Не удалось загрузить данные лиц сотрудника" };
    }
}

export async function createFace(data: {
    userId: string;
    faceEncoding: number[];
    photoUrl?: string | null;
    isPrimary?: boolean;
}) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const validated = CreateFaceSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const { userId, faceEncoding, photoUrl, isPrimary } = validated.data;

        // Проверяем существование пользователя
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return { success: false, error: "Сотрудник не найден" };
        }

        // Если это основное лицо — снимаем флаг с других
        if (isPrimary) {
            await db.update(employeeFaces)
                .set({ isPrimary: false })
                .where(and(
                    eq(employeeFaces.userId, userId),
                    eq(employeeFaces.isActive, true)
                ));
        }

        const [newFace] = await db.insert(employeeFaces).values({
            userId,
            faceEncoding,
            photoUrl,
            isPrimary: isPrimary || false,
            createdById: session!.id,
        }).returning();

        await logAction("Добавлено лицо сотрудника", "employee_face", newFace.id, {
            userId,
            userName: user.name,
        });

        revalidatePath("/staff/employees");

        return { success: true, data: newFace };
    } catch (error) {
        await logError({
            error,
            path: "/staff/faces/create",
            method: "createFace",
        });
        return { success: false, error: "Не удалось сохранить данные лица" };
    }
}

export async function updateFace(faceId: string, formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const data = Object.fromEntries(formData);
        const validated = UpdateFaceSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const face = await db.query.employeeFaces.findFirst({
            where: eq(employeeFaces.id, faceId),
        });

        if (!face) {
            return { success: false, error: "Запись не найдена" };
        }

        // Если устанавливаем как основное — снимаем флаг с других
        if (validated.data.isPrimary) {
            await db.update(employeeFaces)
                .set({ isPrimary: false })
                .where(and(
                    eq(employeeFaces.userId, face.userId),
                    eq(employeeFaces.isActive, true)
                ));
        }

        const [updated] = await db.update(employeeFaces)
            .set({
                ...validated.data,
                updatedAt: new Date(),
            })
            .where(eq(employeeFaces.id, faceId))
            .returning();

        await logAction("Обновлены данные лица", "employee_face", faceId, validated.data);
        revalidatePath("/staff/employees");

        return { success: true, data: updated };
    } catch (error) {
        await logError({
            error,
            path: "/staff/faces/update",
            method: "updateFace",
        });
        return { success: false, error: "Не удалось обновить данные" };
    }
}

export async function deleteFace(faceId: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const face = await db.query.employeeFaces.findFirst({
            where: eq(employeeFaces.id, faceId),
            with: {
                user: {
                    columns: { name: true },
                },
            },
        });

        if (!face) {
            return { success: false, error: "Запись не найдена" };
        }

        // Мягкое удаление
        await db.update(employeeFaces)
            .set({
                isActive: false,
                updatedAt: new Date(),
            })
            .where(eq(employeeFaces.id, faceId));

        await logAction("Удалены данные лица", "employee_face", faceId, {
            userId: face.userId,
            userName: face.user?.name,
        });

        revalidatePath("/staff/employees");

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path: "/staff/faces/delete",
            method: "deleteFace",
        });
        return { success: false, error: "Не удалось удалить данные" };
    }
}

export async function getEmployeesWithoutFaces() {
    const session = await getSession();
    try {
        await requireAdmin(session);

        // Получаем всех пользователей
        const allUsers = await db.query.users.findMany({
            limit: 500,
            columns: {
                id: true,
                name: true,
                email: true,
                avatar: true,
            },
            with: {
                department: {
                    columns: {
                        id: true,
                        name: true,
                    },
                },
                role: {
                    columns: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Получаем ID пользователей с лицами
        const usersWithFaces = await db.query.employeeFaces.findMany({
            limit: 500,
            where: eq(employeeFaces.isActive, true),
            columns: {
                userId: true,
            },
        });

        const userIdsWithFaces = new Set(usersWithFaces.map(f => f.userId));

        // Фильтруем пользователей без лиц
        const usersWithoutFaces = allUsers.filter(u => !userIdsWithFaces.has(u.id));

        return { success: true, data: usersWithoutFaces };
    } catch (error) {
        await logError({
            error,
            path: "/staff/faces",
            method: "getEmployeesWithoutFaces",
        });
        return { success: false, error: "Не удалось загрузить список сотрудников" };
    }
}
