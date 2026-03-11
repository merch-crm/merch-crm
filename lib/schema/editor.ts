import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { orders } from "./orders";
import { printDesigns } from "./designs";

// Проекты редактора (сохранённые макеты)
export const editorProjects = pgTable("editor_projects", {
    id: uuid("id").defaultRandom().primaryKey(),

    // Связи (опциональные — проект может быть привязан к заказу или дизайну)
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id"), // позиция в заказе
    designId: uuid("design_id").references(() => printDesigns.id, { onDelete: "set null" }),

    // Метаданные
    name: text("name").notNull(),
    description: text("description"),

    // Размеры холста
    width: integer("width").notNull().default(800),
    height: integer("height").notNull().default(600),

    // Данные проекта (JSON состояние Fabric.js)
    canvasData: jsonb("canvas_data").notNull(),

    // Превью
    thumbnailPath: text("thumbnail_path"),

    // Статус
    isTemplate: boolean("is_template").default(false), // шаблон для повторного использования
    isFinalized: boolean("is_finalized").default(false), // финальная версия

    // Автор
    createdBy: uuid("created_by")
        .notNull()
        .references(() => users.id),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    orderIdIdx: index("editor_projects_order_id_idx").on(table.orderId),
    designIdIdx: index("editor_projects_design_id_idx").on(table.designId),
    createdByIdx: index("editor_projects_created_by_idx").on(table.createdBy),
    isTemplateIdx: index("editor_projects_is_template_idx").on(table.isTemplate),
    createdAtIdx: index("editor_projects_created_at_idx").on(table.createdAt),
}));

// Экспортированные файлы из редактора
export const editorExports = pgTable("editor_exports", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
        .notNull()
        .references(() => editorProjects.id, { onDelete: "cascade" }),

    // Файл
    filename: text("filename").notNull(),
    format: text("format").notNull(), // png, jpeg, svg, pdf
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    size: integer("size").notNull(), // bytes
    path: text("path").notNull(),

    // Настройки экспорта
    hasWatermark: boolean("has_watermark").default(false),
    quality: integer("quality"), // для jpeg

    // Автор
    createdBy: uuid("created_by")
        .notNull()
        .references(() => users.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    projectIdIdx: index("editor_exports_project_id_idx").on(table.projectId),
    createdAtIdx: index("editor_exports_created_at_idx").on(table.createdAt),
}));


// Связи
export const editorProjectsRelations = relations(editorProjects, ({ one, many }) => ({
    order: one(orders, {
        fields: [editorProjects.orderId],
        references: [orders.id],
    }),
    design: one(printDesigns, {
        fields: [editorProjects.designId],
        references: [printDesigns.id],
    }),
    createdByUser: one(users, {
        fields: [editorProjects.createdBy],
        references: [users.id],
    }),
    exports: many(editorExports),
}));

export const editorExportsRelations = relations(editorExports, ({ one }) => ({
    project: one(editorProjects, {
        fields: [editorExports.projectId],
        references: [editorProjects.id],
    }),
    createdByUser: one(users, {
        fields: [editorExports.createdBy],
        references: [users.id],
    }),
}));

// Типы
export type EditorProject = typeof editorProjects.$inferSelect;
export type NewEditorProject = typeof editorProjects.$inferInsert;
export type EditorExport = typeof editorExports.$inferSelect;
export type NewEditorExport = typeof editorExports.$inferInsert;
