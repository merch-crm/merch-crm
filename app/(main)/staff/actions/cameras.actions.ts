"use server";

import { db } from"@/lib/db";
import { cameras } from"@/lib/schema";
import { getSession } from"@/lib/auth";
import { requireAdmin } from"@/lib/admin";
import { logError } from"@/lib/error-logger";
import { logAction } from"@/lib/audit";
import { eq, desc } from"drizzle-orm";
import { revalidatePath } from"next/cache";
import { UpdateCameraSchema } from"../validation";

// ============================================
// ACTIONS
// ============================================

export async function getCameras() {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const allCameras = await db.query.cameras.findMany({
            orderBy: [desc(cameras.createdAt)],
            with: {
                xiaomiAccount: {
                    columns: {
                        id: true,
                        nickname: true,
                        email: true,
                        region: true,
                    },
                },
            },
        });

        return { success: true, data: allCameras };
    } catch (error) {
        await logError({
            error,
            path:"/staff/cameras",
            method:"getCameras",
        });
        return { success: false, error:"Не удалось загрузить камеры" };
    }
}

export async function getCamera(cameraId: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const camera = await db.query.cameras.findFirst({
            where: eq(cameras.id, cameraId),
            with: {
                xiaomiAccount: {
                    columns: {
                        id: true,
                        nickname: true,
                        email: true,
                        region: true,
                    },
                },
            },
        });

        if (!camera) {
            return { success: false, error:"Камера не найдена" };
        }

        return { success: true, data: camera };
    } catch (error) {
        await logError({
            error,
            path:"/staff/cameras",
            method:"getCamera",
        });
        return { success: false, error:"Не удалось загрузить камеру" };
    }
}

export async function updateCamera(cameraId: string, formData: FormData) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const data = Object.fromEntries(formData);
        const validated = UpdateCameraSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const [updated] = await db.update(cameras)
            .set({
                ...validated.data,
                updatedAt: new Date(),
            })
            .where(eq(cameras.id, cameraId))
            .returning();

        if (!updated) {
            return { success: false, error:"Камера не найдена" };
        }

        await logAction("Обновлена камера","camera", cameraId, validated.data);
        revalidatePath("/staff/cameras");

        return { success: true, data: updated };
    } catch (error) {
        await logError({
            error,
            path:"/staff/cameras/update",
            method:"updateCamera",
        });
        return { success: false, error:"Не удалось обновить камеру" };
    }
}

export async function toggleCamera(cameraId: string, isEnabled: boolean) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const [updated] = await db.update(cameras)
            .set({
                isEnabled,
                updatedAt: new Date(),
            })
            .where(eq(cameras.id, cameraId))
            .returning();

        if (!updated) {
            return { success: false, error:"Камера не найдена" };
        }

        await logAction(
            isEnabled ?"Камера включена" :"Камера отключена","camera",
            cameraId
        );
        revalidatePath("/staff/cameras");

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path:"/staff/cameras/toggle",
            method:"toggleCamera",
        });
        return { success: false, error:"Не удалось изменить статус камеры" };
    }
}

export async function deleteCamera(cameraId: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const camera = await db.query.cameras.findFirst({
            where: eq(cameras.id, cameraId),
        });

        if (!camera) {
            return { success: false, error:"Камера не найдена" };
        }

        await db.delete(cameras).where(eq(cameras.id, cameraId));

        await logAction("Удалена камера","camera", cameraId, {
            name: camera.name,
            deviceId: camera.deviceId,
        });
        revalidatePath("/staff/cameras");

        return { success: true };
    } catch (error) {
        await logError({
            error,
            path:"/staff/cameras/delete",
            method:"deleteCamera",
        });
        return { success: false, error:"Не удалось удалить камеру" };
    }
}

export async function testCameraConnection(cameraId: string) {
    const session = await getSession();
    try {
        await requireAdmin(session);

        const camera = await db.query.cameras.findFirst({
            where: eq(cameras.id, cameraId),
            with: {
                xiaomiAccount: true,
            },
        });

        if (!camera || !camera.xiaomiAccount) {
            return { success: false, error:"Камера не найдена" };
        }

        // Обновляем статус на"connecting"
        await db.update(cameras)
            .set({ status:"connecting", updatedAt: new Date() })
            .where(eq(cameras.id, cameraId));

        const go2rtcUrl = process.env.GO2RTC_URL ||"http://localhost:1984";

        // Проверяем доступность потока
        const response = await fetch(`${go2rtcUrl}/api/streams`, {
            method:"GET",
        });

        if (!response.ok) {
            await db.update(cameras)
                .set({
                    status:"error",
                    errorMessage:"go2rtc недоступен",
                    updatedAt: new Date(),
                })
                .where(eq(cameras.id, cameraId));
            return { success: false, error:"go2rtc сервер недоступен" };
        }

        const streams = await response.json();
        const streamName = `xiaomi_${camera.deviceId}`;
        const isOnline = streams[streamName]?.producers?.length > 0;

        await db.update(cameras)
            .set({
                status: isOnline ?"online" :"offline",
                lastOnlineAt: isOnline ? new Date() : undefined,
                errorMessage: null,
                updatedAt: new Date(),
            })
            .where(eq(cameras.id, cameraId));

        revalidatePath("/staff/cameras");

        return {
            success: true,
            data: {
                isOnline,
                streamUrl: isOnline ? `${go2rtcUrl}/api/stream.mp4?src=${streamName}` : null,
            },
        };
    } catch (error) {
        await db.update(cameras)
            .set({
                status:"error",
                errorMessage: error instanceof Error ? error.message :"Неизвестная ошибка",
                updatedAt: new Date(),
            })
            .where(eq(cameras.id, cameraId));

        await logError({
            error,
            path:"/staff/cameras/test",
            method:"testCameraConnection",
        });
        return { success: false, error:"Ошибка при проверке подключения" };
    }
}
