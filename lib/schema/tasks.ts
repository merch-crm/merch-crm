/**
 * Схема таблицы задач (обновлённая под финальную интеграцию)
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users, departments } from "./users";
import { taskAssignees } from "./task-assignees";
import { taskWatchers } from "./task-watchers";
import { taskDependencies } from "./task-dependencies";
import { taskChecklists } from "./task-checklists";
import { taskComments } from "./task-comments";
import { taskAttachments } from "./task-attachments";
import { taskHistory } from "./task-history";
import {
  taskStatusEnum,
  taskPriorityEnum,
  taskTypeEnum,
} from "./enums";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    
    // Статус, приоритет, тип
    status: taskStatusEnum("status").notNull().default("new"),
    priority: taskPriorityEnum("priority").notNull().default("normal"),
    type: taskTypeEnum("type").notNull().default("general"),
    
    // Даты
    deadline: timestamp("deadline").notNull(), // Переименовано из due_date для соответствия экшнам
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    
    // Создатель
    creatorId: uuid("creator_id") // Переименовано из created_by_user_id
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    // Отдел (для группировки и автозадач)
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    
    // Делегирование
    delegatedByUserId: uuid("delegated_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    delegatedAt: timestamp("delegated_at"),
    originalAssigneeId: uuid("original_assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    
    // Автоматическое создание
    isAutoCreated: boolean("is_auto_created").notNull().default(false),
    autoCreatedReason: text("auto_created_reason"),
    autoCreatedSourceType: text("auto_created_source_type"),
    autoCreatedSourceId: uuid("auto_created_source_id"),
  },
  (table) => ({
    statusIdx: index("tasks_status_idx").on(table.status),
    priorityIdx: index("tasks_priority_idx").on(table.priority),
    typeIdx: index("tasks_type_idx").on(table.type),
    creatorIdx: index("tasks_creator_idx").on(table.creatorId),
    departmentIdx: index("tasks_department_idx").on(table.departmentId),
    deadlineIdx: index("tasks_deadline_idx").on(table.deadline),
    createdAtIdx: index("tasks_created_at_idx").on(table.createdAt),
    
    // Составные индексы
    statusDeadlineIdx: index("tasks_status_deadline_idx").on(table.status, table.deadline),
  })
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(users, {
    fields: [tasks.creatorId],
    references: [users.id],
    relationName: "createdTasks",
  }),
  department: one(departments, {
    fields: [tasks.departmentId],
    references: [departments.id],
  }),
  delegatedBy: one(users, {
    fields: [tasks.delegatedByUserId],
    references: [users.id],
    relationName: "taskDelegator",
  }),
  originalAssignee: one(users, {
    fields: [tasks.originalAssigneeId],
    references: [users.id],
    relationName: "taskOriginalAssignee",
  }),
  assignees: many(taskAssignees),
  watchers: many(taskWatchers),
  dependencies: many(taskDependencies, { relationName: "taskDependencies" }),
  dependentTasks: many(taskDependencies, { relationName: "dependentTasks" }),
  checklists: many(taskChecklists),
  comments: many(taskComments),
  attachments: many(taskAttachments),
  history: many(taskHistory),
}));

export type TaskSelect = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;
