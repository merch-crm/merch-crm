import { pgTable, text, timestamp, uuid, integer, index, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ СИСТЕМНЫЕ ШРИФТЫ ============

export const systemFonts = pgTable("system_fonts", {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(), // отображаемое имя
    family: text("family").notNull().unique(), // CSS font-family

    // Файлы шрифтов
    regularPath: text("regular_path"),
    boldPath: text("bold_path"),
    italicPath: text("italic_path"),
    boldItalicPath: text("bold_italic_path"),

    // Категория
    category: text("category").default("sans-serif"), // serif, sans-serif, display, handwriting, monospace

    // Статус
    isActive: boolean("is_active").default(true),
    isSystem: boolean("is_system").default(false), // системный шрифт (не удаляется)
    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    familyIdx: index("system_fonts_family_idx").on(table.family),
    isActiveIdx: index("system_fonts_is_active_idx").on(table.isActive),
    categoryIdx: index("system_fonts_category_idx").on(table.category),
    createdAtIdx: index("system_fonts_created_at_idx").on(table.createdAt),
}));

export const systemFontsRelations = relations(systemFonts, ({ many: _many }) => ({
    // Добавьте связи здесь, если появятся таблицы, ссылающиеся на шрифты
}));

export type _SystemFont = typeof systemFonts.$inferSelect;
export type NewSystemFont = typeof systemFonts.$inferInsert;
