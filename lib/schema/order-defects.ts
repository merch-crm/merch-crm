import { pgTable, text, timestamp, uuid, integer, index, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { defectReasonEnum } from "./enums";
import { orders, orderItems } from "./orders";
import { users } from "./users";
import { inventoryItems } from "./warehouse/items";

// ============ ЖУРНАЛ БРАКА ============

export const orderDefects = pgTable("order_defects", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, { onDelete: "cascade" }),
    inventoryItemId: uuid("inventory_item_id").references(() => inventoryItems.id),
    quantity: integer("quantity").notNull(),
    reason: defectReasonEnum("reason").notNull(),
    customReason: text("custom_reason"), // Если reason = 'other'
    comment: text("comment"),
    // Стоимость брака для учёта
    costAmount: decimal("cost_amount", { precision: 10, scale: 2 }),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    orderIdx: index("order_defects_order_idx").on(table.orderId),
    itemIdx: index("order_defects_item_idx").on(table.orderItemId),
    inventoryIdx: index("order_defects_inventory_idx").on(table.inventoryItemId),
    reasonIdx: index("order_defects_reason_idx").on(table.reason),
    createdByIdx: index("order_defects_created_by_idx").on(table.createdBy),
    createdIdx: index("order_defects_created_idx").on(table.createdAt),
}));

// ============ RELATIONS ============

export const orderDefectsRelations = relations(orderDefects, ({ one }) => ({
    order: one(orders, {
        fields: [orderDefects.orderId],
        references: [orders.id],
    }),
    orderItem: one(orderItems, {
        fields: [orderDefects.orderItemId],
        references: [orderItems.id],
    }),
    inventoryItem: one(inventoryItems, {
        fields: [orderDefects.inventoryItemId],
        references: [inventoryItems.id],
    }),
    createdByUser: one(users, {
        fields: [orderDefects.createdBy],
        references: [users.id],
    }),
}));

// ============ TYPES ============

export type OrderDefect = typeof orderDefects.$inferSelect;
export type NewOrderDefect = typeof orderDefects.$inferInsert;
