import { pgTable, text, timestamp, uuid, boolean, index, integer, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders } from "./orders";

export const promocodes = pgTable("promocodes", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    code: text("code").notNull().unique(),
    discountType: text("discount_type").notNull(), // 'percentage', 'fixed', 'free_shipping', 'gift'
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }).default("0"),
    maxDiscountAmount: decimal("max_discount_amount", { precision: 10, scale: 2 }).default("0"),
    startDate: timestamp("start_date"),
    expiresAt: timestamp("expires_at"),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    adminComment: text("admin_comment"),
    constraints: jsonb("constraints").default("{}"), // { includedProducts: [], excludedCategories: [] }
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        codeIdx: index("promocodes_code_idx").on(table.code),
        activeIdx: index("promocodes_active_idx").on(table.isActive),
        createdIdx: index("promocodes_created_idx").on(table.createdAt),
    }
});

export const promocodesRelations = relations(promocodes, ({ many }) => ({
    orders: many(orders),
}));
