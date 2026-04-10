export type TaskNotificationType =
 | "task_created"
 | "task_assigned"
 | "task_delegated"
 | "status_changed"
 | "comment_added"
 | "deadline_approaching"
 | "task_overdue"
 | "dependency_resolved"
 | "watcher_added"
 | "checklist_completed";

export interface TaskNotificationPayload {
 taskId: string;
 taskTitle: string;
 recipientIds: string[];
 type: TaskNotificationType;
 actorName?: string;
 oldValue?: string;
 newValue?: string;
 hoursUntilDeadline?: number;
}

export const NOTIFICATION_MESSAGES: Record<
 TaskNotificationType,
 { title: string; getMessage: (payload: Partial<TaskNotificationPayload>) => string }
> = {
 task_created: {
  title: "Новая задача",
  getMessage: (p) => `Создана задача "${p.taskTitle}"`,
 },
 task_assigned: {
  title: "Назначена задача",
  getMessage: (p) => `Вам назначена задача "${p.taskTitle}"`,
 },
 task_delegated: {
  title: "Задача делегирована",
  getMessage: (p) => `Вам делегирована задача "${p.taskTitle}"${p.actorName ? ` от ${p.actorName}` : ""}`,
 },
 status_changed: {
  title: "Статус изменён",
  getMessage: (p) => `Задача "${p.taskTitle}" переведена в статус "${p.newValue}"`,
 },
 comment_added: {
  title: "Новый комментарий",
  getMessage: (p) => `${p.actorName || "Пользователь"} прокомментировал задачу "${p.taskTitle}"`,
 },
 deadline_approaching: {
  title: "Приближается дедлайн",
  getMessage: (p) => {
   if (p.hoursUntilDeadline === 24) return `До дедлайна задачи "${p.taskTitle}" остались сутки`;
   if (p.hoursUntilDeadline === 12) return `До дедлайна задачи "${p.taskTitle}" осталось 12 часов`;
   if (p.hoursUntilDeadline === 1) return `До дедлайна задачи "${p.taskTitle}" остался 1 час`;
   return `Приближается дедлайн задачи "${p.taskTitle}"`;
  },
 },
 task_overdue: {
  title: "Задача просрочена",
  getMessage: (p) => `Задача "${p.taskTitle}" просрочена!`,
 },
 dependency_resolved: {
  title: "Зависимость выполнена",
  getMessage: (p) => `Зависимая задача выполнена. Задача "${p.taskTitle}" разблокирована`,
 },
 watcher_added: {
  title: "Вы добавлены как наблюдатель",
  getMessage: (p) => `Вы добавлены наблюдателем к задаче "${p.taskTitle}"`,
 },
 checklist_completed: {
  title: "Чек-лист выполнен",
  getMessage: (p) => `Все пункты чек-листа задачи "${p.taskTitle}" выполнены`,
 },
};
