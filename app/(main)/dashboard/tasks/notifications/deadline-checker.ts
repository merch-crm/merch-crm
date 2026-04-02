"use server";

import { db } from "@/lib/db";
import { eq, and, lt, ne } from "drizzle-orm";
import { tasks } from "@/lib/schema/tasks";
import { taskAssignees } from "@/lib/schema/task-assignees";
import { taskDeadlineNotifications } from "@/lib/schema/task-deadline-notifications";
import { notifyDeadlineApproaching } from "./task-notification-service";
import { logError } from "@/lib/error-logger";

/**
 * Проверяет задачи на приближающиеся дедлайны и отправляет уведомления
 * Запускается через Cron (например, раз в час)
 */
export async function checkTaskDeadlines() {
  try {
    const now = new Date();
    
    // Список интервалов для уведомлений (в часах до дедлайна)
    const notificationThresholds = [
      { hours: 24, label: "24 часа" },
      { hours: 12, label: "12 часов" },
      { hours: 1, label: "1 час" },
      { hours: 0, label: "Срок истек" }
    ];

    for (const threshold of notificationThresholds) {
      const targetTime = new Date(now.getTime() + threshold.hours * 60 * 60 * 1000);
      
      // Ищем задачи, у которых дедлайн меньше targetTime, которые ещё не завершены
      // и для которых ещё не отправлялось уведомление этого уровня
      const tasksToNotify = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          deadline: tasks.deadline,
        })
        .from(tasks)
        .where(
          and(
            lt(tasks.deadline, targetTime),
            ne(tasks.status, "done"),
            ne(tasks.status, "cancelled"),
            // Проверяем через подзапрос или фильтрацию (Drizzle isNull на подзапросе может быть сложным, 
            // в оригинале был упрощенный подход)
          )
        );

      for (const task of tasksToNotify) {
        // Проверяем наличие уведомления в БД для этого порога
        const [existingNotification] = await db
          .select()
          .from(taskDeadlineNotifications)
          .where(
            and(
              eq(taskDeadlineNotifications.taskId, task.id),
              eq(taskDeadlineNotifications.hoursNotified, threshold.hours)
            )
          )
          .limit(1);

        if (existingNotification) continue;

        // Получаем всех исполнителей задачи
        const assignees = await db
          .select({ userId: taskAssignees.userId })
          .from(taskAssignees)
          .where(eq(taskAssignees.taskId, task.id));

        const userIds = assignees.map(a => a.userId);

        if (userIds.length > 0) {
          // Отправляем уведомление
          await notifyDeadlineApproaching(
            task.id,
            task.title,
            userIds,
            threshold.hours
          );

          // Фиксируем отправку в БД
          await db.insert(taskDeadlineNotifications).values({
            id: crypto.randomUUID(),
            taskId: task.id,
            hoursNotified: threshold.hours,
            notifiedAt: new Date()
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    logError({ error, method: "checkTaskDeadlines" });
    return { success: false, error: "Ошибка при проверке дедлайнов" };
  }
}
