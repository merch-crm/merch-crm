import { pgTable, text, timestamp, uuid, index, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { relations, type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { orderItemDesignStatusEnum } from "./enums";
import { users } from "./users";
import { printDesigns } from "./designs";
import { orders, orderItems } from "./orders";
import { applicationTypes } from "./production";

export const orderDesignTasks = pgTable("order_design_tasks", {
    id: uuid("id").defaultRandom().primaryKey(),

    // Связь с заказом
    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id")
        .references(() => orderItems.id, { onDelete: "cascade" }),

    // Номер задачи
    number: varchar("number", { length: 50 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),

    // Статус и прогресс
    status: orderItemDesignStatusEnum("status").default("pending").notNull(),
    priority: integer("priority").default(0), // 0 - обычный, 1 - высокий, 2 - срочный

    // Исполнитель
    assigneeId: uuid("assignee_id").references(() => users.id),

    // Даты
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    // Связь с исходным дизайном (если из каталога)
    sourceDesignId: uuid("source_design_id").references(() => printDesigns.id),

    // Примечания от клиента
    clientNotes: text("client_notes"),

    // Параметры печати
    printArea: text("print_area"),
    quantity: integer("quantity"),
    colors: integer("colors"),
    applicationTypeId: uuid("application_type_id").references(() => applicationTypes.id),

    // Системные
    completedAt: timestamp("completed_at"),
    createdBy: uuid("created_by").references(() => users.id),
    sortOrder: integer("sort_order").default(0),
}, (table) => ({
    orderIdx: index("order_design_task_order_idx").on(table.orderId),
    orderItemIdx: index("order_design_task_order_item_idx").on(table.orderItemId),
    assigneeIdx: index("order_design_task_assignee_idx").on(table.assigneeId),
    statusIdx: index("order_design_task_status_idx").on(table.status),
    createdIdx: index("order_design_task_created_idx").on(table.createdAt),
}));

export const orderDesignTasksRelations = relations(orderDesignTasks, ({ one, many }) => ({
    order: one(orders, {
        fields: [orderDesignTasks.orderId],
        references: [orders.id],
    }),
    orderItem: one(orderItems, {
        fields: [orderDesignTasks.orderItemId],
        references: [orderItems.id],
    }),
    assignee: one(users, {
        fields: [orderDesignTasks.assigneeId],
        references: [users.id],
    }),
    sourceDesign: one(printDesigns, {
        fields: [orderDesignTasks.sourceDesignId],
        references: [printDesigns.id],
    }),
    applicationType: one(applicationTypes, {
        fields: [orderDesignTasks.applicationTypeId],
        references: [applicationTypes.id],
    }),
    createdByUser: one(users, {
        fields: [orderDesignTasks.createdBy],
        references: [users.id],
    }),
    files: many(orderDesignFiles),
    history: many(orderDesignHistory),
}));

export const orderDesignFiles = pgTable("order_design_task_files", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
        .notNull()
        .references(() => orderDesignTasks.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["preview", "source", "mockup", "client_file"] }).notNull(),
    filename: text("name").notNull(),
    originalName: text("original_name"),
    path: text("path").notNull(),
    thumbnailPath: text("thumbnail_path"),
    size: integer("size"),
    mimeType: text("mime_type"),
    uploadedBy: uuid("uploaded_by_id").references(() => users.id),
    version: integer("version").default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    taskIdx: index("order_design_task_files_task_idx").on(table.taskId),
    createdIdx: index("order_design_task_files_created_idx").on(table.createdAt),
}));

export const orderDesignFilesRelations = relations(orderDesignFiles, ({ one }) => ({
    task: one(orderDesignTasks, {
        fields: [orderDesignFiles.taskId],
        references: [orderDesignTasks.id],
    }),
    uploadedByUser: one(users, {
        fields: [orderDesignFiles.uploadedBy],
        references: [users.id],
    }),
}));

export const orderDesignHistory = pgTable("order_design_task_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
        .notNull()
        .references(() => orderDesignTasks.id, { onDelete: "cascade" }),
    performedBy: uuid("user_id").references(() => users.id),
    event: text("type").notNull(), // status_change, comment, file_upload, assignment
    comment: text("details"),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    taskIdx: index("order_design_task_history_task_idx").on(table.taskId),
    createdIdx: index("order_design_task_history_created_idx").on(table.createdAt),
}));

export const orderDesignHistoryRelations = relations(orderDesignHistory, ({ one }) => ({
    task: one(orderDesignTasks, {
        fields: [orderDesignHistory.taskId],
        references: [orderDesignTasks.id],
    }),
    performedByUser: one(users, {
        fields: [orderDesignHistory.performedBy],
        references: [users.id],
    }),
}));

export type DesignTask = InferSelectModel<typeof orderDesignTasks>;
export type NewDesignTask = InferInsertModel<typeof orderDesignTasks>;
export type DesignTaskFile = InferSelectModel<typeof orderDesignFiles>;
export type NewDesignTaskFile = InferInsertModel<typeof orderDesignFiles>;
export type DesignTaskHistory = InferSelectModel<typeof orderDesignHistory>;
export type NewDesignTaskHistory = InferInsertModel<typeof orderDesignHistory>;
