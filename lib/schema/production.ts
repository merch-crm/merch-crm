import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum, index, uniqueIndex, jsonb } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { orders, orderItems } from "./orders";

// === ENUMS ===

export const applicationCategoryEnum = pgEnum("application_category", [
    "print",      // Печать (DTF, DTG, сублимация, шелкография)
    "embroidery", // Вышивка
    "engraving",  // Гравировка
    "transfer",   // Термоперенос
    "other"       // Прочее
]);

export const equipmentStatusEnum = pgEnum("equipment_status", [
    "active",      // Работает
    "maintenance", // На обслуживании
    "repair",      // В ремонте
    "inactive"     // Неактивно
]);

export const productionTaskStatusEnum = pgEnum("production_task_status", [
    "pending",      // Ожидает
    "in_progress",  // В работе
    "paused",       // Приостановлено
    "completed",    // Завершено
    "cancelled"     // Отменено
]);

export const productionTaskPriorityEnum = pgEnum("production_task_priority", [
    "low",
    "normal",
    "high",
    "urgent"
]);

// === ОБОРУДОВАНИЕ ===

export const applicationTypes = pgTable("application_types", {
    id: uuid("id").defaultRandom().primaryKey(),

    // Основные поля
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    category: applicationCategoryEnum("category").notNull().default("print"),

    // Иконка/изображение
    icon: varchar("icon", { length: 100 }), // название иконки из библиотеки
    color: varchar("color", { length: 7 }),  // HEX цвет для UI

    // Характеристики
    minQuantity: integer("min_quantity").default(1),        // Мин. тираж
    maxColors: integer("max_colors"),                        // Макс. кол-во цветов (null = безлимит)
    maxPrintArea: varchar("max_print_area", { length: 50 }), // Макс. область печати "30x40cm"

    // Стоимость (базовая)
    baseCost: integer("base_cost").default(0),      // Базовая стоимость в копейках
    costPerUnit: integer("cost_per_unit").default(0), // Стоимость за единицу
    setupCost: integer("setup_cost").default(0),    // Стоимость подготовки/настройки

    // Время производства
    estimatedTime: integer("estimated_time"),       // Время в минутах на единицу
    setupTime: integer("setup_time"),               // Время подготовки в минутах

    // Статус
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    slugIdx: index("application_types_slug_idx").on(table.slug),
    categoryIdx: index("application_types_category_idx").on(table.category),
    isActiveIdx: index("application_types_is_active_idx").on(table.isActive),
    sortOrderIdx: index("application_types_sort_order_idx").on(table.sortOrder),
    createdAtIdx: index("application_types_created_at_idx").on(table.createdAt),
}));

export const equipment = pgTable("equipment", {
    id: uuid("id").defaultRandom().primaryKey(),

    // Основное
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(), // Инвентарный номер
    description: text("description"),

    // Категория и тип
    category: varchar("category", { length: 100 }).notNull(), // printer, press, cutter, embroidery, laser
    brand: varchar("brand", { length: 100 }),
    model: varchar("model", { length: 100 }),

    // Характеристики
    serialNumber: varchar("serial_number", { length: 100 }),
    printWidth: integer("print_width"),  // мм
    printHeight: integer("print_height"), // мм
    printSpeed: integer("print_speed"),   // единиц в час
    notes: text("notes"),

    // Совместимость с типами нанесения
    applicationTypeIds: jsonb("application_type_ids").$type<string[]>().default([]),

    // Статус
    status: equipmentStatusEnum("status").notNull().default("active"),

    // Местоположение
    location: varchar("location", { length: 255 }),

    // Обслуживание
    lastMaintenanceAt: timestamp("last_maintenance_at"),
    nextMaintenanceAt: timestamp("next_maintenance_at"),
    maintenanceNotes: text("maintenance_notes"),

    // Изображение
    imagePath: text("image_path"),

    // Сортировка
    sortOrder: integer("sort_order").default(0).notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    codeIdx: index("equipment_code_idx").on(table.code),
    categoryIdx: index("equipment_category_idx").on(table.category),
    statusIdx: index("equipment_status_idx").on(table.status),
    createdAtIdx: index("equipment_created_at_idx").on(table.createdAt),
}));

// === ПРОИЗВОДСТВЕННЫЕ ЛИНИИ ===

export const productionLines = pgTable("production_lines", {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    description: text("description"),

    // Тип нанесения (основной)
    applicationTypeId: uuid("application_type_id")
        .references(() => applicationTypes.id, { onDelete: "set null" }),

    // Оборудование на линии
    equipmentIds: jsonb("equipment_ids").$type<string[]>().default([]),

    // Производительность
    capacity: integer("capacity").default(100), // единиц в день

    // Статус
    isActive: boolean("is_active").default(true).notNull(),

    // Цвет для UI
    color: varchar("color", { length: 7 }),

    sortOrder: integer("sort_order").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    codeIdx: index("production_lines_code_idx").on(table.code),
    applicationTypeIdx: index("production_lines_app_type_idx").on(table.applicationTypeId),
    isActiveIdx: index("production_lines_is_active_idx").on(table.isActive),
    createdAtIdx: index("production_lines_created_at_idx").on(table.createdAt),
}));

// === СОТРУДНИКИ ПРОИЗВОДСТВА ===

export const productionStaff = pgTable("production_staff", {
    id: uuid("id").defaultRandom().primaryKey(),

    // Связь с пользователем (опционально — может быть внешний сотрудник)
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    // Если нет связи с users
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),

    // Должность
    position: varchar("position", { length: 100 }),

    // Специализация (типы нанесения)
    specializationIds: jsonb("specialization_ids").$type<string[]>().default([]),

    // Закреплённые линии
    lineIds: jsonb("line_ids").$type<string[]>().default([]),

    // Ставка
    hourlyRate: integer("hourly_rate"), // копейки

    // Статус
    isActive: boolean("is_active").default(true).notNull(),

    // Аватар
    avatarPath: text("avatar_path"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("production_staff_user_id_idx").on(table.userId),
    isActiveIdx: index("production_staff_is_active_idx").on(table.isActive),
    emailIdx: index("production_staff_email_idx").on(table.email),
    phoneIdx: index("production_staff_phone_idx").on(table.phone),
    createdAtIdx: index("production_staff_created_at_idx").on(table.createdAt),
}));

// === ПРОИЗВОДСТВЕННЫЕ ЗАДАЧИ ===

export const productionTasks = pgTable("production_tasks", {
    id: uuid("id").defaultRandom().primaryKey(),

    // Номер задачи
    number: varchar("number", { length: 50 }).notNull().unique(),

    // Связь с заказом
    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id")
        .references(() => orderItems.id, { onDelete: "cascade" }),

    // Тип нанесения
    applicationTypeId: uuid("application_type_id")
        .references(() => applicationTypes.id, { onDelete: "set null" }),

    // Производственная линия
    lineId: uuid("line_id")
        .references(() => productionLines.id, { onDelete: "set null" }),

    // Исполнитель
    assigneeId: uuid("assignee_id")
        .references(() => productionStaff.id, { onDelete: "set null" }),

    // Описание
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    // Количество
    quantity: integer("quantity").notNull().default(1),
    completedQuantity: integer("completed_quantity").default(0),
    defectQuantity: integer("defect_quantity").default(0),

    // Категория и детали брака
    defectCategory: varchar("defect_category", { length: 50 }),
    defectComment: text("defect_comment"),

    // Статус и приоритет
    status: productionTaskStatusEnum("status").notNull().default("pending"),
    priority: productionTaskPriorityEnum("priority").notNull().default("normal"),

    // Сроки
    startDate: timestamp("start_date"),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),

    // Время работы (минуты)
    estimatedTime: integer("estimated_time"),
    actualTime: integer("actual_time"),

    // Файлы макета
    designFiles: jsonb("design_files").$type<{
        path: string;
        name: string;
        type: string;
    }[]>().default([]),

    // Примечания
    notes: text("notes"),

    // Сортировка в очереди
    sortOrder: integer("sort_order").default(0).notNull(),

    // Кто создал
    createdBy: uuid("created_by")
        .notNull()
        .references(() => users.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    numberIdx: index("production_tasks_number_idx").on(table.number),
    orderIdIdx: index("production_tasks_order_id_idx").on(table.orderId),
    lineIdIdx: index("production_tasks_line_id_idx").on(table.lineId),
    assigneeIdIdx: index("production_tasks_assignee_id_idx").on(table.assigneeId),
    statusIdx: index("production_tasks_status_idx").on(table.status),
    priorityIdx: index("production_tasks_priority_idx").on(table.priority),
    dueDateIdx: index("production_tasks_due_date_idx").on(table.dueDate),
    sortOrderIdx: index("production_tasks_sort_order_idx").on(table.sortOrder),
    createdAtIdx: index("production_tasks_created_at_idx").on(table.createdAt),
    // Индекс для статистики брака
    defectCategoryIdx: index("idx_production_tasks_defect_category")
        .on(table.defectCategory)
        .where(sql`${table.defectQuantity} > 0`),
}));

// === ЛОГИ ПРОИЗВОДСТВА ===

export const productionLogs = pgTable("production_logs", {
    id: uuid("id").defaultRandom().primaryKey(),

    taskId: uuid("task_id")
        .references(() => productionTasks.id, { onDelete: "cascade" }),

    // Тип события
    event: varchar("event", { length: 50 }).notNull(), // started, paused, resumed, completed, quantity_updated, assigned, etc.

    // Детали
    details: jsonb("details"),

    // Кто выполнил
    performedBy: uuid("performed_by")
        .references(() => users.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    taskIdIdx: index("production_logs_task_id_idx").on(table.taskId),
    eventIdx: index("production_logs_event_idx").on(table.event),
    createdAtIdx: index("production_logs_created_at_idx").on(table.createdAt),
}));

// === СВЯЗИ ===

export const applicationTypesRelations = relations(applicationTypes, ({ many }) => ({
    userAssignments: many(userApplicationTypes),
}));

export const equipmentRelations = relations(equipment, ({ many: _many }) => ({
    // Можно добавить связи если нужно
}));

export const productionLinesRelations = relations(productionLines, ({ one, many }) => ({
    applicationType: one(applicationTypes, {
        fields: [productionLines.applicationTypeId],
        references: [applicationTypes.id],
    }),
    tasks: many(productionTasks),
}));

export const productionStaffRelations = relations(productionStaff, ({ one, many }) => ({
    user: one(users, {
        fields: [productionStaff.userId],
        references: [users.id],
    }),
    tasks: many(productionTasks),
}));

export const productionTasksRelations = relations(productionTasks, ({ one, many }) => ({
    order: one(orders, {
        fields: [productionTasks.orderId],
        references: [orders.id],
    }),
    orderItem: one(orderItems, {
        fields: [productionTasks.orderItemId],
        references: [orderItems.id],
    }),
    applicationType: one(applicationTypes, {
        fields: [productionTasks.applicationTypeId],
        references: [applicationTypes.id],
    }),
    line: one(productionLines, {
        fields: [productionTasks.lineId],
        references: [productionLines.id],
    }),
    assignee: one(productionStaff, {
        fields: [productionTasks.assigneeId],
        references: [productionStaff.id],
    }),
    createdByUser: one(users, {
        fields: [productionTasks.createdBy],
        references: [users.id],
    }),
    logs: many(productionLogs),
}));

export const productionLogsRelations = relations(productionLogs, ({ one }) => ({
    task: one(productionTasks, {
        fields: [productionLogs.taskId],
        references: [productionTasks.id],
    }),
    performedByUser: one(users, {
        fields: [productionLogs.performedBy],
        references: [users.id],
    }),
}));

// === ТИПЫ ===

export type ApplicationType = typeof applicationTypes.$inferSelect;
export type NewApplicationType = typeof applicationTypes.$inferInsert;

export type Equipment = typeof equipment.$inferSelect;
export type NewEquipment = typeof equipment.$inferInsert;
export type ProductionLine = typeof productionLines.$inferSelect;
export type NewProductionLine = typeof productionLines.$inferInsert;
export type ProductionStaff = typeof productionStaff.$inferSelect;
export type NewProductionStaff = typeof productionStaff.$inferInsert;
export type ProductionTask = typeof productionTasks.$inferSelect;
export type NewProductionTask = typeof productionTasks.$inferInsert;
export type ProductionLog = typeof productionLogs.$inferSelect;
export type NewProductionLog = typeof productionLogs.$inferInsert;

// Legacy / Support existing relations
export const userApplicationTypes = pgTable("user_application_types", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    applicationTypeId: uuid("application_type_id").notNull().references(() => applicationTypes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userIdx: index("user_app_types_user_idx").on(table.userId),
    typeIdx: index("user_app_types_type_idx").on(table.applicationTypeId),
    uniqueIdx: uniqueIndex("user_app_types_unique_idx").on(table.userId, table.applicationTypeId),
    createdAtIdx: index("user_app_types_created_at_idx").on(table.createdAt),
}));

export const userApplicationTypesRelations = relations(userApplicationTypes, ({ one }) => ({
    user: one(users, {
        fields: [userApplicationTypes.userId],
        references: [users.id],
    }),
    applicationType: one(applicationTypes, {
        fields: [userApplicationTypes.applicationTypeId],
        references: [applicationTypes.id],
    }),
}));

export type UserApplicationType = typeof userApplicationTypes.$inferSelect;
export type NewUserApplicationType = typeof userApplicationTypes.$inferInsert;

