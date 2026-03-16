/**
 * Схема таблицы комментариев к задачам
 */

import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tasks } from "./tasks";
import { users } from "./users";

export const taskComments = pgTable("task_comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        taskIdx: index("task_comments_task_idx").on(table.taskId),
        userIdx: index("task_comments_user_idx").on(table.userId),
        createdIdx: index("task_comments_created_idx").on(table.createdAt),
    }
});

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
    task: one(tasks, {
        fields: [taskComments.taskId],
        references: [tasks.id],
    }),
    user: one(users, {
        fields: [taskComments.userId],
        references: [users.id],
    }),
}));

// Типы для Drizzle
export type TaskCommentSelect = typeof taskComments.$inferSelect;
export type TaskCommentInsert = typeof taskComments.$inferInsert;
