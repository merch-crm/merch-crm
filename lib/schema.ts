import {
    pgTable,
    text,
    timestamp,
    uuid,
    pgEnum,
    integer,
    decimal,
    serial,
    jsonb,
    boolean,
    date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const orderStatusEnum = pgEnum("order_status", [
    "new",
    "layout_pending",
    "layout_approved",
    "in_printing",
    "done",
    "cancelled",
]);

export const transactionTypeEnum = pgEnum("transaction_type", ["in", "out"]);

export const taskStatusEnum = pgEnum("task_status", [
    "new",
    "in_progress",
    "review",
    "done",
    "archived",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
    "low",
    "normal",
    "high",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
    "info",
    "warning",
    "success",
    "error",
]);

export const orderCategoryEnum = pgEnum("order_category", [
    "print",
    "embroidery",
    "merch",
    "other"
]);

// Roles
export const roles = pgTable("roles", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    permissions: jsonb("permissions").notNull().default('{}'),
    isSystem: boolean("is_system").default(false).notNull(),
    departmentId: uuid("department_id").references(() => departments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Departments
export const departments = pgTable("departments", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    color: text("color").default("indigo"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    roleId: uuid("role_id").references(() => roles.id),
    phone: text("phone"),
    birthday: date("birthday"),
    avatar: text("avatar"),
    department: text("department"),
    departmentId: uuid("department_id").references(() => departments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Clients
export const clients = pgTable("clients", {
    id: uuid("id").defaultRandom().primaryKey(),
    lastName: text("last_name").notNull(),
    firstName: text("first_name").notNull(),
    patronymic: text("patronymic"),
    name: text("name"), // Kept for legacy compatibility/display
    company: text("company"),
    phone: text("phone").notNull(),
    telegram: text("telegram"),
    instagram: text("instagram"),
    email: text("email"),
    city: text("city"),
    address: text("address"),
    comments: text("comments"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inventory Items
export const inventoryItems = pgTable("inventory_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    sku: text("sku").unique(),
    quantity: integer("quantity").default(0).notNull(),
    unit: text("unit").default("pcs").notNull(), // pcs, meters, etc.
    lowStockThreshold: integer("low_stock_threshold").default(10).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders
export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
        .references(() => clients.id)
        .notNull(),
    status: orderStatusEnum("status").default("new").notNull(),
    category: orderCategoryEnum("category").default("other").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default(
        "0"
    ),
    priority: text("priority").default("normal"), // low, normal, high
    deadline: timestamp("deadline"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order Items (Line Items)
export const orderItems = pgTable("order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
        .references(() => orders.id, { onDelete: "cascade" })
        .notNull(),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Inventory Transactions
export const inventoryTransactions = pgTable("inventory_transactions", {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id")
        .references(() => inventoryItems.id)
        .notNull(),
    changeAmount: integer("change_amount").notNull(), // Positive for IN, Negative for OUT (or utilize type)
    type: transactionTypeEnum("type").notNull(),
    reason: text("reason"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tasks
export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").default("new").notNull(),
    priority: taskPriorityEnum("priority").default("normal").notNull(),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id),
    assignedToRoleId: uuid("assigned_to_role_id").references(() => roles.id),
    createdBy: uuid("created_by").references(() => users.id).notNull(),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: notificationTypeEnum("type").default("info").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});


// Task Attachments
export const taskAttachments = pgTable("task_attachments", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id")
        .references(() => tasks.id, { onDelete: "cascade" })
        .notNull(),
    fileName: text("file_name").notNull(),
    fileKey: text("file_key").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size"),
    contentType: text("content_type"),
    createdBy: uuid("created_by").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order Attachments
export const orderAttachments = pgTable("order_attachments", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
        .references(() => orders.id, { onDelete: "cascade" })
        .notNull(),
    fileName: text("file_name").notNull(),
    fileKey: text("file_key").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size"),
    contentType: text("content_type"),
    createdBy: uuid("created_by").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
    role: one(roles, {
        fields: [users.roleId],
        references: [roles.id],
    }),
    department: one(departments, {
        fields: [users.departmentId],
        references: [departments.id],
    }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    client: one(clients, {
        fields: [orders.clientId],
        references: [clients.id],
    }),
    items: many(orderItems),
    creator: one(users, {
        fields: [orders.createdBy],
        references: [users.id],
    }),
    attachments: many(orderAttachments),
}));

export const orderAttachmentsRelations = relations(orderAttachments, ({ one }) => ({
    order: one(orders, {
        fields: [orderAttachments.orderId],
        references: [orders.id],
    }),
    creator: one(users, {
        fields: [orderAttachments.createdBy],
        references: [users.id],
    }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
}));

export const inventoryTransactionsRelations = relations(
    inventoryTransactions,
    ({ one }) => ({
        item: one(inventoryItems, {
            fields: [inventoryTransactions.itemId],
            references: [inventoryItems.id],
        }),
        creator: one(users, {
            fields: [inventoryTransactions.createdBy],
            references: [users.id],
        }),
    })
);

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
    creator: one(users, {
        fields: [tasks.createdBy],
        references: [users.id],
        relationName: "createdTasks",
    }),
    attachments: many(taskAttachments),
}));

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

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
    users: many(users),
    roles: many(roles),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
    department: one(departments, {
        fields: [roles.departmentId],
        references: [departments.id],
    }),
}));
