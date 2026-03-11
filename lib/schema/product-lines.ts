import {
    pgTable,
    varchar,
    text,
    boolean,
    integer,
    timestamp,
    jsonb,
    index,
    pgEnum,
    uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { inventoryCategories } from "./warehouse/categories";
import { inventoryItems } from "./warehouse/items";
import { printCollections } from "./designs";
import { users } from "./users";

// ============ ENUMS ============

export const productLineTypeEnum = pgEnum("product_line_type", [
    "base",
    "finished",
]);

// ============ ЛИНЕЙКИ ПРОДУКТОВ ============

export const productLines = pgTable(
    "product_lines",
    {
        id: uuid("id").primaryKey(),

        // Название линейки
        // - Если пользователь ввёл — его значение
        // - Если пустое при создании — генерируется из общих характеристик
        name: varchar("name", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 255 }).notNull(),

        // Тип линейки
        type: productLineTypeEnum("type").notNull(),

        // Категория (подкатегория), к которой относится линейка
        categoryId: uuid("category_id")
            .notNull()
            .references(() => inventoryCategories.id),

        // Для готовой линейки — связь с коллекцией принтов
        printCollectionId: uuid("print_collection_id")
            .references(() => printCollections.id),

        // Для готовой линейки — связь с базовой линейкой
        baseLineId: uuid("base_line_id"),
        // Self-reference добавим через relations, чтобы избежать circular dependency

        // Общие характеристики линейки (JSON)
        // Формат: { "brand": "code123", "density": "code456", ... }
        commonAttributes: jsonb("common_attributes").default({}).$type<Record<string, string>>(),

        description: text("description"),
        image: varchar("image", { length: 500 }),

        isActive: boolean("is_active").default(true).notNull(),
        sortOrder: integer("sort_order").default(0).notNull(),

        createdBy: uuid("created_by")
            .notNull()
            .references(() => users.id),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        categoryIdx: index("product_lines_category_idx").on(table.categoryId),
        typeIdx: index("product_lines_type_idx").on(table.type),
        activeIdx: index("product_lines_active_idx").on(table.isActive),
        printCollectionIdx: index("product_lines_print_collection_idx").on(table.printCollectionId),
        baseLineIdx: index("product_lines_base_line_idx").on(table.baseLineId),
        sortOrderIdx: index("product_lines_sort_order_idx").on(table.sortOrder),
        categoryTypeIdx: index("product_lines_category_type_idx").on(table.categoryId, table.type),
        createdAtIdx: index("product_lines_created_at_idx").on(table.createdAt),
        createdByIdx: index("product_lines_created_by_idx").on(table.createdBy),
    })
);

// ============ RELATIONS ============

export const productLinesRelations = relations(
    productLines,
    ({ one, many }) => ({
        // Категория
        category: one(inventoryCategories, {
            fields: [productLines.categoryId],
            references: [inventoryCategories.id],
        }),

        // Коллекция принтов (для готовых линеек)
        printCollection: one(printCollections, {
            fields: [productLines.printCollectionId],
            references: [printCollections.id],
        }),

        // Базовая линейка (для готовых линеек) — self-reference
        baseLine: one(productLines, {
            fields: [productLines.baseLineId],
            references: [productLines.id],
            relationName: "baseToFinished",
        }),

        // Готовые линейки, использующие эту базовую
        finishedLines: many(productLines, {
            relationName: "baseToFinished",
        }),

        // Создатель
        creator: one(users, {
            fields: [productLines.createdBy],
            references: [users.id],
        }),

        // Позиции этой линейки
        items: many(inventoryItems),
    })
);

// ============ TYPES ============

export type ProductLine = typeof productLines.$inferSelect;
export type NewProductLine = typeof productLines.$inferInsert;

export type ProductLineType = "base" | "finished";

// Расширенный тип с связями
export type ProductLineWithRelations = ProductLine & {
    category?: {
        id: string;
        name: string;
        parentId?: string | null;
    };
    printCollection?: {
        id: string;
        name: string;
    } | null;
    baseLine?: {
        id: string;
        name: string;
    } | null;
    creator?: {
        id: string;
        name: string;
    };
    _count?: {
        items: number;
        finishedLines: number;
    };
};
