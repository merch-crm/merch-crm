/**
 * Схема таблицы чек-листов задач
 */

import { pgTable, uuid, text, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tasks } from "./tasks";

export const taskChecklists = pgTable("task_checklists", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
    content: text("content").notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        taskIdx: index("task_checklists_task_idx").on(table.taskId),
        createdIdx: index("task_checklists_created_idx").on(table.createdAt),
    }
});

export const taskChecklistsRelations = relations(taskChecklists, ({ one }) => ({
    task: one(tasks, {
        fields: [taskChecklists.taskId],
        references: [tasks.id],
    }),
}));

// Типы для Drizzle
export type TaskChecklistSelect = typeof taskChecklists.$inferSelect;
export type TaskChecklistInsert = typeof taskChecklists.$inferInsert;
