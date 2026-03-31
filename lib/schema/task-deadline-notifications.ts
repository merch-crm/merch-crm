import { pgTable, uuid, timestamp, uniqueIndex, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tasks } from "./tasks";

export const taskDeadlineNotifications = pgTable(
  "task_deadline_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    hoursNotified: integer("hours_notified").notNull(), // 24, 12, 1, 0
    notifiedAt: timestamp("notified_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    taskHoursUnique: uniqueIndex("task_deadline_notifications_unique_idx").on(
      table.taskId,
      table.hoursNotified
    ),
    createdIdx: index("task_deadline_notifications_created_idx").on(table.createdAt),
  })
);

export const taskDeadlineNotificationsRelations = relations(taskDeadlineNotifications, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDeadlineNotifications.taskId],
    references: [tasks.id],
  }),
}));

