import { sendNotifications } from "@/lib/notifications";
import { logError } from "@/lib/error-logger";
import { NOTIFICATION_MESSAGES, type TaskNotificationPayload } from "./types";

/**
 * Отправка системного уведомления по задачам
 */
export async function sendTaskNotification(
 payload: TaskNotificationPayload
): Promise<void> {
 try {
  const config = NOTIFICATION_MESSAGES[payload.type];
  if (!config) {
   console.warn(`Unknown notification type: ${payload.type}`);
   return;
  }

  if (payload.recipientIds.length === 0) {
   return;
  }

  await sendNotifications({
   userIds: payload.recipientIds,
   title: config.title,
   message: config.getMessage(payload),
   type: (payload.type === "task_overdue" || payload.type === "deadline_approaching") 
    ? "error" 
    : payload.type === "status_changed" 
     ? "success" 
     : "info",
  });
 } catch (error) {
  logError({ error, method: "sendTaskNotification" });
 }
}

// Хелперы для конкретных типов уведомлений
export async function notifyTaskCreated(
 taskId: string,
 taskTitle: string,
 recipientIds: string[]
): Promise<void> {
 await sendTaskNotification({
  taskId,
  taskTitle,
  recipientIds,
  type: "task_created",
 });
}

export async function notifyTaskAssigned(
 taskId: string,
 taskTitle: string,
 recipientIds: string[]
): Promise<void> {
 await sendTaskNotification({
  taskId,
  taskTitle,
  recipientIds,
  type: "task_assigned",
 });
}

export async function notifyStatusChanged(
 taskId: string,
 taskTitle: string,
 recipientIds: string[],
 newStatus: string
): Promise<void> {
 await sendTaskNotification({
  taskId,
  taskTitle,
  recipientIds,
  type: "status_changed",
  newValue: newStatus,
 });
}

export async function notifyCommentAdded(
 taskId: string,
 taskTitle: string,
 recipientIds: string[],
 actorName: string
): Promise<void> {
 await sendTaskNotification({
  taskId,
  taskTitle,
  recipientIds,
  type: "comment_added",
  actorName,
 });
}

export async function notifyTaskDelegated(
 taskId: string,
 taskTitle: string,
 recipientIds: string[],
 actorName: string
): Promise<void> {
 await sendTaskNotification({
  taskId,
  taskTitle,
  recipientIds,
  type: "task_delegated",
  actorName,
 });
}

export async function notifyDeadlineApproaching(
 taskId: string,
 taskTitle: string,
 recipientIds: string[],
 hoursUntilDeadline: number
): Promise<void> {
 await sendTaskNotification({
  taskId,
  taskTitle,
  recipientIds,
  type: "deadline_approaching",
  hoursUntilDeadline,
 });
}

export async function notifyTaskOverdue(
 taskId: string,
 taskTitle: string,
 recipientIds: string[]
): Promise<void> {
 await sendTaskNotification({
  taskId,
  taskTitle,
  recipientIds,
  type: "task_overdue",
 });
}

export async function notifyDependencyResolved(
 taskId: string,
 taskTitle: string,
 recipientIds: string[]
): Promise<void> {
 await sendTaskNotification({
  taskId,
  taskTitle,
  recipientIds,
  type: "dependency_resolved",
 });
}
