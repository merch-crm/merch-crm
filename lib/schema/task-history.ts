/**
 * Схема таблицы истории изменений задач
 */

import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tasks } from "./tasks";
import { users } from "./users";

export const taskHistory = pgTable("task_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    type: text("type").notNull(), // 'status_change', 'priority_change', 'assignment', etc.
    oldValue: text("old_value"),
    newValue: text("new_value"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        taskIdx: index("task_history_task_idx").on(table.taskId),
        userIdx: index("task_history_user_idx").on(table.userId),
        createdIdx: index("task_history_created_idx").on(table.createdAt),
    }
});

export const taskHistoryRelations = relations(taskHistory, ({ one }) => ({
    task: one(tasks, {
        fields: [taskHistory.taskId],
        references: [tasks.id],
    }),
    user: one(users, {
        fields: [taskHistory.userId],
        references: [users.id],
    }),
}));

// Типы для Drizzle
export type TaskHistorySelect = typeof taskHistory.$inferSelect;
export type TaskHistoryInsert = typeof taskHistory.$inferInsert;
