"use server";

import { ActionResult, okVoid } from "@/lib/types";
import { getSession } from "@/lib/session";
import { TimeTrackingService } from "@/lib/services/production/time-tracking.service";
import { revalidatePath } from "next/cache";

/**
 * Запуск таймера для задачи
 */
export async function startTaskTimerAction(taskId: string, staffId: string | null = null): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const result = await TimeTrackingService.startTimer(taskId, staffId, session.id);
    
    if (result.success) {
        revalidatePath("/dashboard/production");
        revalidatePath(`/dashboard/production/tasks/${taskId}`);
        return okVoid();
    }
    
    return { success: false, error: result.error || "Не удалось запустить таймер" };
}

/**
 * Остановка таймера для задачи
 */
export async function stopTaskTimerAction(taskId: string): Promise<ActionResult> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    const result = await TimeTrackingService.stopTimer(taskId, session.id);
    
    if (result.success) {
        revalidatePath("/dashboard/production");
        revalidatePath(`/dashboard/production/tasks/${taskId}`);
        return okVoid();
    }
    
    return { success: false, error: result.error || "Не удалось остановить таймер" };
}

/**
 * Получение (или создание) задачи и статуса таймера для позиции заказа
 */
export async function getOrCreateTaskAndTimerStatusAction(orderItemId: string, stage: string) {
    const session = await getSession();
    if (!session) return { taskId: null, isRunning: false, startTime: null };

    // 1. Получаем/создаем задачу
    const taskId = await TimeTrackingService.getOrCreateTaskForOrderItem(orderItemId, stage, session.id);
    
    // 2. Получаем статус таймера
    const status = await TimeTrackingService.getTimerStatus(taskId);
    
    return {
        taskId,
        ...status
    };
}
