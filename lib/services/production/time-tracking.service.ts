import { db } from "@/lib/db";
import { productionTasks, productionTimeLogs, productionLogs } from "@/lib/schema/production";
import { orderItems } from "@/lib/schema/orders";
import { eq, and, isNull, sql } from "drizzle-orm";
import { logError } from "@/lib/error-logger";

export class TimeTrackingService {
    /**
     * Запуск таймера для задачи
     */
    static async startTimer(taskId: string, staffId: string | null, userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            return await db.transaction(async (tx) => {
                // 1. Проверяем, нет ли уже активного таймера для этой задачи
                const activeTimer = await tx.query.productionTimeLogs.findFirst({
                    where: and(
                        eq(productionTimeLogs.taskId, taskId),
                        isNull(productionTimeLogs.endTime)
                    )
                });

                if (activeTimer) {
                    return { success: false, error: "Таймер уже запущен" };
                }

                // 2. Создаем новую запись в логах времени
                await tx.insert(productionTimeLogs).values({
                    taskId,
                    staffId,
                    startTime: new Date(),
                    activityType: "work"
                });

                // 3. Обновляем статус задачи на in_progress, если она была pending или paused
                await tx.update(productionTasks)
                    .set({ 
                        status: "in_progress",
                        startDate: sql`COALESCE(${productionTasks.startDate}, NOW())`,
                        updatedAt: new Date() 
                    })
                    .where(eq(productionTasks.id, taskId));

                // 4. Добавляем общее событие в логи
                await tx.insert(productionLogs).values({
                    taskId,
                    event: "started",
                    performedBy: userId,
                    details: { message: "Таймер запущен", staffId }
                });

                return { success: true };
            });
        } catch (error) {
            await logError({ error, path: "lib/services/production/time-tracking.service.ts", method: "startTimer" });
            return { success: false, error: "Ошибка при запуске таймера" };
        }
    }

    /**
     * Остановка (пауза) таймера
     */
    static async stopTimer(taskId: string, userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            return await db.transaction(async (tx) => {
                // 1. Ищем активный таймер
                const activeTimer = await tx.query.productionTimeLogs.findFirst({
                    where: and(
                        eq(productionTimeLogs.taskId, taskId),
                        isNull(productionTimeLogs.endTime)
                    )
                });

                if (!activeTimer) {
                    return { success: false, error: "Активный таймер не найден" };
                }

                const endTime = new Date();
                const durationSeconds = Math.floor((endTime.getTime() - activeTimer.startTime.getTime()) / 1000);

                // 2. Закрываем таймер
                await tx.update(productionTimeLogs)
                    .set({ 
                        endTime,
                        duration: durationSeconds
                    })
                    .where(eq(productionTimeLogs.id, activeTimer.id));

                // 3. Обновляем общее время в задаче (actualTime храним в минутах для совместимости)
                await tx.update(productionTasks)
                    .set({
                        actualTime: sql`COALESCE(${productionTasks.actualTime}, 0) + ${Math.ceil(durationSeconds / 60)}`,
                        status: "paused",
                        updatedAt: new Date()
                    })
                    .where(eq(productionTasks.id, taskId));

                // 4. Логируем событие
                await tx.insert(productionLogs).values({
                    taskId,
                    event: "paused",
                    performedBy: userId,
                    details: { durationSeconds, message: "Таймер остановлен" }
                });

                return { success: true };
            });
        } catch (error) {
            await logError({ error, path: "lib/services/production/time-tracking.service.ts", method: "stopTimer" });
            return { success: false, error: "Ошибка при остановке таймера" };
        }
    }

    /**
     * Получение или создание задачи для позиции заказа и этапа
     */
    static async getOrCreateTaskForOrderItem(orderItemId: string, stage: string, userId: string, tx?: Parameters<Parameters<typeof db.transaction>[0]>[0]): Promise<string> {
        const d = tx || db;
        
        // 1. Ищем существующую задачу
        const existing = await d.query.productionTasks.findFirst({
            where: and(
                eq(productionTasks.orderItemId, orderItemId),
                eq(productionTasks.title, `Stage: ${stage}`) // Условное именование
            )
        });

        if (existing) return existing.id;

        // 2. Если нет, создаем (нужно больше данных, но для таймера пока так)
        const orderItem = await d.query.orderItems.findFirst({
            where: eq(orderItems.id, orderItemId),
            columns: { orderId: true }
        });

        if (!orderItem) throw new Error("Order item not found");
        if (!orderItem.orderId) throw new Error("Order item has no order ID");

        const taskId = crypto.randomUUID();
        const taskNumber = `AUTO-${Date.now().toString().slice(-6)}`;
        
        const [task] = await d.insert(productionTasks).values({
            id: taskId,
            number: taskNumber,
            title: `Stage: ${stage}`,
            orderId: orderItem.orderId,
            orderItemId,
            status: "pending",
            priority: "normal",
            quantity: 1, // По умолчанию
            createdBy: userId
        }).returning();

        return task.id;
    }

    /**
     * Получение текущего статуса таймера для задачи
     */
    static async getTimerStatus(taskId: string) {
        try {
            const activeTimer = await db.query.productionTimeLogs.findFirst({
                where: and(
                    eq(productionTimeLogs.taskId, taskId),
                    isNull(productionTimeLogs.endTime)
                )
            });

            return {
                isRunning: !!activeTimer,
                startTime: activeTimer?.startTime || null,
                staffId: activeTimer?.staffId || null
            };
        } catch (_error) {
            return { isRunning: false, startTime: null, staffId: null };
        }
    }
}
