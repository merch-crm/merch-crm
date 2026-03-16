/**
 * Схема таблицы вложений к задачам
 */

import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tasks } from "./tasks";
import { users } from "./users";

export const taskAttachments = pgTable("task_attachments", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
    fileName: text("file_name").notNull(),
    fileKey: text("file_key").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size"),
    contentType: text("content_type"),
    createdBy: uuid("created_by").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        taskIdx: index("task_attachments_task_idx").on(table.taskId),
        createdIdx: index("task_attachments_created_idx").on(table.createdAt),
        createdByIdx: index("task_attachments_created_by_idx").on(table.createdBy),
    }
});

export const taskAttachmentsRelations = relations(taskAttachments, ({ one }) => ({
    task: one(tasks, {
        fields: [taskAttachments.taskId],
        references: [tasks.id],
    }),
    creator: one(users, {
        fields: [taskAttachments.createdBy],
        references: [users.id],
    }),
}));

// Типы для Drizzle
export type TaskAttachmentSelect = typeof taskAttachments.$inferSelect;
export type TaskAttachmentInsert = typeof taskAttachments.$inferInsert;
