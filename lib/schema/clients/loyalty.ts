// lib/schema/loyalty-levels.ts
import { pgTable, uuid, text, boolean, timestamp, decimal, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clients } from "./main";

export const loyaltyLevels = pgTable("loyalty_levels", {
    id: uuid("id").primaryKey().defaultRandom(),

    // Идентификация
    levelKey: text("level_key").notNull().unique(),
    levelName: text("level_name").notNull(),

    // Пороги
    minOrdersAmount: decimal("min_orders_amount", { precision: 12, scale: 2 }).default("0"),
    minOrdersCount: integer("min_orders_count").default(0),

    // Привилегии
    discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0"),
    bonusDescription: text("bonus_description"),

    // Визуальные настройки
    color: text("color").default("#64748b"),
    icon: text("icon").default("star"),
    priority: integer("priority").default(0),

    // Статус
    isActive: boolean("is_active").default(true),

    // Метаданные
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    priorityIdx: index("idx_loyalty_levels_priority").on(table.priority),
    createdAtIdx: index("idx_loyalty_levels_created_at").on(table.createdAt),
}));

// Отношения
export const loyaltyLevelsRelations = relations(loyaltyLevels, ({ many }) => ({
    clients: many(clients),
}));

// Типы
export type LoyaltyLevel = typeof loyaltyLevels.$inferSelect;
export type NewLoyaltyLevel = typeof loyaltyLevels.$inferInsert;
