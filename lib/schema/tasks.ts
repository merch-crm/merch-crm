import { pgTable, text, timestamp, uuid, boolean, index, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { taskStatusEnum, taskPriorityEnum, taskTypeEnum } from "./enums";
import { users, roles, departments } from "./users";
import { orders } from "./orders";

export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").default("new").notNull(),
    priority: taskPriorityEnum("priority").default("normal").notNull(),
    type: taskTypeEnum("task_type").default("other").notNull(),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id),
    assignedToRoleId: uuid("assigned_to_role_id").references(() => roles.id),
    assignedToDepartmentId: uuid("assigned_to_department_id").references(() => departments.id),
    createdBy: uuid("created_by").references(() => users.id).notNull(),
    orderId: uuid("order_id").references(() => orders.id),
    dueDate: timestamp("due_date"),
    deadline: timestamp("deadline"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        assignedUserIdx: index("tasks_assigned_user_idx").on(table.assignedToUserId),
        assignedRoleIdx: index("tasks_assigned_role_idx").on(table.assignedToRoleId),
        assignedDeptIdx: index("tasks_assigned_dept_idx").on(table.assignedToDepartmentId),
        orderIdIdx: index("tasks_order_id_idx").on(table.orderId),
        statusIdx: index("tasks_status_idx").on(table.status),
        createdIdx: index("tasks_created_idx").on(table.createdAt),
    }
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
    assignedToUser: one(users, {
        fields: [tasks.assignedToUserId],
        references: [users.id],
        relationName: "assignedTasks",
    }),
    assignedToRole: one(roles, {
        fields: [tasks.assignedToRoleId],
        references: [roles.id],
    }),
    assignedToDepartment: one(departments, {
        fields: [tasks.assignedToDepartmentId],
        references: [departments.id],
    }),
    creator: one(users, {
        fields: [tasks.createdBy],
        references: [users.id],
        relationName: "createdTasks",
    }),
    order: one(orders, {
        fields: [tasks.orderId],
        references: [orders.id],
    }),
    attachments: many(taskAttachments),
    checklists: many(taskChecklists),
    comments: many(taskComments),
    history: many(taskHistory),
}));

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
