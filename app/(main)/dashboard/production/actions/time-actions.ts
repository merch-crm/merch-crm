"use server";

import { okVoid, ok } from "@/lib/types";
import { TimeTrackingService } from "@/lib/services/production/time-tracking.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";

const StartTaskTimerSchema = z.object({
    taskId: z.string().uuid("Invalid task ID"),
    staffId: z.string().uuid("Invalid staff ID").nullable().optional()
});

/**
 * Запуск таймера для задачи
 */
export const startTaskTimerAction = createSafeAction({
    schema: StartTaskTimerSchema,
    requireAuth: true,
    handler: async (input, ctx) => {
        const result = await TimeTrackingService.startTimer(input.taskId, input.staffId || null, ctx.userId);
        
        if (result.success) {
            revalidatePath("/dashboard/production");
            revalidatePath(`/dashboard/production/tasks/${input.taskId}`);
            return okVoid();
        }
        
        return { success: false, error: result.error || "Не удалось запустить таймер" };
    }
});

const StopTaskTimerSchema = z.object({
    taskId: z.string().uuid("Invalid task ID")
});

/**
 * Остановка таймера для задачи
 */
export const stopTaskTimerAction = createSafeAction({
    schema: StopTaskTimerSchema,
    requireAuth: true,
    handler: async (input, ctx) => {
        const result = await TimeTrackingService.stopTimer(input.taskId, ctx.userId);
        
        if (result.success) {
            revalidatePath("/dashboard/production");
            revalidatePath(`/dashboard/production/tasks/${input.taskId}`);
            return okVoid();
        }
        
        return { success: false, error: result.error || "Не удалось остановить таймер" };
    }
});

const GetOrCreateTaskSchema = z.object({
    orderItemId: z.string().uuid("Invalid order item ID"),
    stage: z.string().min(1, "Stage cannot be empty")
});

/**
 * Получение (или создание) задачи и статуса таймера для позиции заказа
 */
export const getOrCreateTaskAndTimerStatusAction = createSafeAction({
    schema: GetOrCreateTaskSchema,
    requireAuth: true,
    handler: async (input, ctx) => {
        // 1. Получаем/создаем задачу
        const taskId = await TimeTrackingService.getOrCreateTaskForOrderItem(input.orderItemId, input.stage, ctx.userId);
        
        // 2. Получаем статус таймера
        const status = await TimeTrackingService.getTimerStatus(taskId);
        
        return ok({
            taskId,
            ...status
        });
    }
});
