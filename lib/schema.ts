import {
    pgTable,
    text,
    timestamp,
    uuid,
    pgEnum,
    integer,
    decimal,
    jsonb,
    boolean,
    date,
    AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const orderStatusEnum = pgEnum("order_status", [
    "new",
    "design",
    "production",
    "done",
    "shipped",
    "cancelled",
]);


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

export const taskTypeEnum = pgEnum("task_type", [
    "design",
    "production",
    "acquisition",
    "delivery",
    "other",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
    "info",
    "warning",
    "success",
    "error",
    "transfer",
]);

export const securityEventTypeEnum = pgEnum("security_event_type", [
    "login_success",
    "login_failed",
    "logout",
    "password_change",
    "email_change",
    "profile_update",
    "role_change",
    "permission_change",
    "data_export",
    "record_delete",
    "settings_change",
    "maintenance_mode_toggle",
    "system_error",
    "admin_impersonation_start",
    "admin_impersonation_stop",
]);

export const orderCategoryEnum = pgEnum("order_category", [
    "print",
    "embroidery",
    "merch",
    "other"
]);

export const inventoryItemTypeEnum = pgEnum("inventory_item_type", [
    "clothing",
    "packaging",
    "consumables"
]);

export const clientTypeEnum = pgEnum("client_type", ["b2c", "b2b"]);

export const measurementUnitEnum = pgEnum("measurement_unit_v2", ["pcs", "liters", "meters", "kg", "шт", "шт."]);

export const paymentMethodEnum = pgEnum("payment_method", ["cash", "bank", "online", "account"]);

export const expenseCategoryEnum = pgEnum("expense_category", ["rent", "salary", "purchase", "tax", "other"]);

export const productionStageStatusEnum = pgEnum("production_stage_status", ["pending", "in_progress", "done", "failed"]);

export const inventoryAttributes = pgTable("inventory_attributes", {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(), // 'color' or 'material'
    name: text("name").notNull(),
    value: text("value").notNull(), // Code: 'BLK', 'KUL' etc
    meta: jsonb("meta"), // { hex: '#...' } for colors
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventoryAttributeTypes = pgTable("inventory_attribute_types", {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(), // 'brand', 'color', 'custom_type'
    name: text("name").notNull(), // 'Бренд', 'Цвет', 'Мой тип'
    isSystem: boolean("is_system").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    categoryId: uuid("category_id").references(() => inventoryCategories.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Roles
export const roles = pgTable("roles", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    permissions: jsonb("permissions").notNull().default('{}'),
    isSystem: boolean("is_system").default(false).notNull(),
    departmentId: uuid("department_id").references(() => departments.id),
    color: text("color"), // Roles can override department colors
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Departments
export const departments = pgTable("departments", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    color: text("color").default("indigo"),
    isActive: boolean("is_active").default(true).notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
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
    telegram: text("telegram"),
    instagram: text("instagram"),
    socialMax: text("social_max"),
    departmentLegacy: text("department_legacy"),
    departmentId: uuid("department_id").references(() => departments.id),
    lastActiveAt: timestamp("last_active_at"),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Clients
export const clients = pgTable("clients", {
    id: uuid("id").defaultRandom().primaryKey(),
    clientType: clientTypeEnum("client_type").default("b2c").notNull(),
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
    socialLink: text("social_link"),
    acquisitionSource: text("acquisition_source"),
    managerId: uuid("manager_id").references(() => users.id),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inventory Categories
export const inventoryCategories = pgTable("inventory_categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    icon: text("icon"),
    color: text("color"),
    colorMarker: text("color_marker"), // HEX-код для визуального разделения
    slug: text("slug").unique(), // ЧПУ
    fullPath: text("full_path"), // Текстовый путь (Категория > Подкатегория)
    prefix: text("prefix"),
    parentId: uuid("parent_id").references((): AnyPgColumn => inventoryCategories.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    defaultUnit: measurementUnitEnum("default_unit"), // Ед. изм. по умолчанию
    gender: text("gender").default("masculine").notNull(), // 'masculine', 'feminine', 'neuter'
    singularName: text("singular_name"),
    pluralName: text("plural_name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inventory Items
export const inventoryItems = pgTable("inventory_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    sku: text("sku").unique(),
    categoryId: uuid("category_id").references(() => inventoryCategories.id),
    itemType: inventoryItemTypeEnum("item_type").default("clothing").notNull(),
    quantity: integer("quantity").default(0).notNull(),
    unit: measurementUnitEnum("unit").default("шт.").notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(10).notNull(),
    criticalStockThreshold: integer("critical_stock_threshold").default(0).notNull(),
    description: text("description"),
    location: text("location"),
    storageLocationId: uuid("storage_location_id").references(() => storageLocations.id),
    qualityCode: text("quality_code"),
    materialCode: text("material_code"),
    brandCode: text("brand_code"),
    attributeCode: text("attribute_code"),
    sizeCode: text("size_code"),
    attributes: jsonb("attributes").default("{}"), // Гибкие характеристики (цвет, размер и т.д.)
    image: text("image"), // Лицевая сторона (основное фото)
    imageBack: text("image_back"),
    imageSide: text("image_side"),
    imageDetails: jsonb("image_details").default("[]"), // Детали (массив строк)
    thumbnailSettings: jsonb("thumbnail_settings"),
    reservedQuantity: integer("reserved_quantity").default(0).notNull(),
    materialComposition: jsonb("material_composition").default("{}"), // Состав материалов (%)
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }), // Себестоимость
    isArchived: boolean("is_archived").default(false).notNull(), // Архивация
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders
export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number").notNull().unique(),
    clientId: uuid("client_id")
        .references(() => clients.id)
        .notNull(),
    status: orderStatusEnum("status").default("new").notNull(),
    category: orderCategoryEnum("category").default("other").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default(
        "0"
    ),
    advanceAmount: decimal("advance_amount", { precision: 10, scale: 2 }).default("0"),
    priority: text("priority").default("normal"), // low, normal, high
    isUrgent: boolean("is_urgent").default(false).notNull(),
    deadline: timestamp("deadline"),
    promocodeId: uuid("promocode_id").references(() => promocodes.id),
    createdBy: uuid("created_by").references(() => users.id),
    isArchived: boolean("is_archived").default(false).notNull(),
    cancelReason: text("cancel_reason"),
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
    inventoryId: uuid("inventory_id").references(() => inventoryItems.id),
    // Production stages
    stagePrepStatus: productionStageStatusEnum("stage_prep_status").default("pending").notNull(),
    stagePrintStatus: productionStageStatusEnum("stage_print_status").default("pending").notNull(),
    stageApplicationStatus: productionStageStatusEnum("stage_application_status").default("pending").notNull(),
    stagePackagingStatus: productionStageStatusEnum("stage_packaging_status").default("pending").notNull(),
});

// Inventory Transactions
export const transactionTypeEnum = pgEnum("transaction_type", ["in", "out", "transfer", "attribute_change"]);

export const inventoryTransactions = pgTable("inventory_transactions", {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id")
        .references(() => inventoryItems.id),
    changeAmount: integer("change_amount").notNull().default(0),
    type: transactionTypeEnum("type").notNull(),
    reason: text("reason"),
    storageLocationId: uuid("storage_location_id").references(() => storageLocations.id),
    fromStorageLocationId: uuid("from_storage_location_id").references(() => storageLocations.id),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
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
    type: taskTypeEnum("type").default("other").notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id),
    assignedToRoleId: uuid("assigned_to_role_id").references(() => roles.id),
    assignedToDepartmentId: uuid("assigned_to_department_id").references(() => departments.id),
    createdBy: uuid("created_by").references(() => users.id).notNull(),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Task Checklists
export const taskChecklists = pgTable("task_checklists", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
    content: text("content").notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Task History / Activities
export const taskHistory = pgTable("task_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    type: text("type").notNull(), // 'status_change', 'priority_change', 'assignment', etc.
    oldValue: text("old_value"),
    newValue: text("new_value"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Task Comments
export const taskComments = pgTable("task_comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    content: text("content").notNull(),
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

// Storage Locations
export const storageLocations = pgTable("storage_locations", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    description: text("description"),
    responsibleUserId: uuid("responsible_user_id").references(() => users.id),
    isSystem: boolean("is_system").default(false).notNull(),
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

// System Settings
export const systemSettings = pgTable("system_settings", {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Security Events
export const securityEvents = pgTable("security_events", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    eventType: securityEventTypeEnum("event_type").notNull(),
    severity: text("severity").default("info").notNull(), // info, warning, critical
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    entityType: text("entity_type"), // user, order, client, etc.
    entityId: uuid("entity_id"),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});


// System Errors
export const systemErrors = pgTable("system_errors", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    message: text("message").notNull(),
    stack: text("stack"),
    path: text("path"),
    method: text("method"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    severity: text("severity").default("error").notNull(), // error, warning, critical
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

// Payments
export const payments = pgTable("payments", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    method: paymentMethodEnum("method").notNull(),
    isAdvance: boolean("is_advance").default(false).notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expenses
export const expenses = pgTable("expenses", {
    id: uuid("id").defaultRandom().primaryKey(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    category: expenseCategoryEnum("category").notNull(),
    description: text("description"),
    date: date("date").notNull(),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Promocodes
export const promocodes = pgTable("promocodes", {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    discountType: text("discount_type").notNull(), // 'percentage' or 'fixed'
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }).default("0"),
    maxDiscountAmount: decimal("max_discount_amount", { precision: 10, scale: 2 }).default("0"),
    startDate: timestamp("start_date"),
    expiresAt: timestamp("expires_at"),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Wiki Folders
export const wikiFolders = pgTable("wiki_folders", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => wikiFolders.id),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Wiki Pages
export const wikiPages = pgTable("wiki_pages", {
    id: uuid("id").defaultRandom().primaryKey(),
    folderId: uuid("folder_id").references(() => wikiFolders.id),
    title: text("title").notNull(),
    content: text("content"),
    createdBy: uuid("created_by").references(() => users.id),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
// Inventory Stocks (Остатки на складах)
export const inventoryStocks = pgTable("inventory_stocks", {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id")
        .references(() => inventoryItems.id)
        .notNull(),
    storageLocationId: uuid("storage_location_id")
        .references(() => storageLocations.id)
        .notNull(),
    quantity: integer("quantity").default(0).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Inventory Transfers (Перемещения)
export const inventoryTransfers = pgTable("inventory_transfers", {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id").references(() => inventoryItems.id).notNull(),
    fromLocationId: uuid("from_location_id").references(() => storageLocations.id),
    toLocationId: uuid("to_location_id").references(() => storageLocations.id),
    quantity: integer("quantity").notNull(),
    comment: text("comment"),
    createdBy: uuid("created_by").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
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
    tasks: many(tasks),
    payments: many(payments),
    promocode: one(promocodes, {
        fields: [orders.promocodeId],
        references: [promocodes.id],
    }),
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
    inventoryItem: one(inventoryItems, {
        fields: [orderItems.inventoryId],
        references: [inventoryItems.id],
    }),
}));

export const inventoryCategoriesRelations = relations(inventoryCategories, ({ one, many }) => ({
    items: many(inventoryItems),
    parent: one(inventoryCategories, {
        fields: [inventoryCategories.parentId],
        references: [inventoryCategories.id],
        relationName: "categoryHierarchy"
    }),
    children: many(inventoryCategories, {
        relationName: "categoryHierarchy"
    }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
    category: one(inventoryCategories, {
        fields: [inventoryItems.categoryId],
        references: [inventoryCategories.id],
    }),
    storageLocation: one(storageLocations, {
        fields: [inventoryItems.storageLocationId],
        references: [storageLocations.id],
    }),
    transactions: many(inventoryTransactions),
    stocks: many(inventoryStocks),
    transfers: many(inventoryTransfers),
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
        storageLocation: one(storageLocations, {
            fields: [inventoryTransactions.storageLocationId],
            references: [storageLocations.id],
        }),
        fromStorageLocation: one(storageLocations, {
            fields: [inventoryTransactions.fromStorageLocationId],
            references: [storageLocations.id],
        }),
    })
);

export const inventoryStocksRelations = relations(inventoryStocks, ({ one }) => ({
    item: one(inventoryItems, {
        fields: [inventoryStocks.itemId],
        references: [inventoryItems.id],
    }),
    storageLocation: one(storageLocations, {
        fields: [inventoryStocks.storageLocationId],
        references: [storageLocations.id],
    }),
}));

export const inventoryTransfersRelations = relations(inventoryTransfers, ({ one }) => ({
    item: one(inventoryItems, {
        fields: [inventoryTransfers.itemId],
        references: [inventoryItems.id],
    }),
    fromLocation: one(storageLocations, {
        fields: [inventoryTransfers.fromLocationId],
        references: [storageLocations.id],
        relationName: "transfersOut",
    }),
    toLocation: one(storageLocations, {
        fields: [inventoryTransfers.toLocationId],
        references: [storageLocations.id],
        relationName: "transfersIn",
    }),
    creator: one(users, {
        fields: [inventoryTransfers.createdBy],
        references: [users.id],
    }),
}));

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

export const taskChecklistsRelations = relations(taskChecklists, ({ one }) => ({
    task: one(tasks, {
        fields: [taskChecklists.taskId],
        references: [tasks.id],
    }),
}));

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

export const rolesRelations = relations(roles, ({ one }) => ({
    department: one(departments, {
        fields: [roles.departmentId],
        references: [departments.id],
    }),
}));

export const storageLocationsRelations = relations(storageLocations, ({ one, many }) => ({
    responsibleUser: one(users, {
        fields: [storageLocations.responsibleUserId],
        references: [users.id],
    }),
    // items теперь должны получаться через stocks, но старую связь можно оставить для legacy
    items: many(inventoryItems),
    stocks: many(inventoryStocks),
    transfersIn: many(inventoryTransfers, { relationName: "transfersIn" }),
    transfersOut: many(inventoryTransfers, { relationName: "transfersOut" }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
    manager: one(users, {
        fields: [clients.managerId],
        references: [users.id],
    }),
    orders: many(orders),
}));

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

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id],
    }),
}));

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
    user: one(users, {
        fields: [securityEvents.userId],
        references: [users.id],
    }),
}));

export const systemErrorsRelations = relations(systemErrors, ({ one }) => ({
    user: one(users, {
        fields: [systemErrors.userId],
        references: [users.id],
    }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    order: one(orders, {
        fields: [payments.orderId],
        references: [orders.id],
    }),
}));

export const promocodesRelations = relations(promocodes, ({ many }) => ({
    orders: many(orders),
}));

export const wikiFoldersRelations = relations(wikiFolders, ({ one, many }) => ({
    parent: one(wikiFolders, {
        fields: [wikiFolders.parentId],
        references: [wikiFolders.id],
        relationName: "folderHierarchy",
    }),
    children: many(wikiFolders, {
        relationName: "folderHierarchy",
    }),
    pages: many(wikiPages),
}));

export const wikiPagesRelations = relations(wikiPages, ({ one }) => ({
    folder: one(wikiFolders, {
        fields: [wikiPages.folderId],
        references: [wikiFolders.id],
    }),
    author: one(users, {
        fields: [wikiPages.createdBy],
        references: [users.id],
    }),
}));


