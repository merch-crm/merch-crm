import { pgTable, text, timestamp, uuid, index, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders } from "./orders";
import { users } from "./users";

// ============ ЧАТ ПО ЗАКАЗУ ============

export const orderChatMessages = pgTable("order_chat_messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id),
    message: text("message").notNull(),
    mentionedUserIds: jsonb("mentioned_user_ids").default([]).$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    orderIdx: index("order_chat_order_idx").on(table.orderId),
    userIdx: index("order_chat_user_idx").on(table.userId),
    createdIdx: index("order_chat_created_idx").on(table.createdAt),
}));

// Отслеживание прочитанных сообщений
export const orderChatReadStatus = pgTable("order_chat_read_status", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at").defaultNow().notNull(),
    lastReadMessageId: uuid("last_read_message_id").references(() => orderChatMessages.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    orderUserIdx: uniqueIndex("order_chat_read_order_user_idx").on(table.orderId, table.userId),
    createdAtIdx: index("order_chat_read_status_created_at_idx").on(table.createdAt),
}));

// ============ RELATIONS ============

export const orderChatMessagesRelations = relations(orderChatMessages, ({ one }) => ({
    order: one(orders, {
        fields: [orderChatMessages.orderId],
        references: [orders.id],
    }),
    user: one(users, {
        fields: [orderChatMessages.userId],
        references: [users.id],
    }),
}));

export const orderChatReadStatusRelations = relations(orderChatReadStatus, ({ one }) => ({
    order: one(orders, {
        fields: [orderChatReadStatus.orderId],
        references: [orders.id],
    }),
    user: one(users, {
        fields: [orderChatReadStatus.userId],
        references: [users.id],
    }),
    lastReadMessage: one(orderChatMessages, {
        fields: [orderChatReadStatus.lastReadMessageId],
        references: [orderChatMessages.id],
    }),
}));

// ============ TYPES ============

export type OrderChatMessage = typeof orderChatMessages.$inferSelect;
export type NewOrderChatMessage = typeof orderChatMessages.$inferInsert;
export type OrderChatReadStatus = typeof orderChatReadStatus.$inferSelect;
export type NewOrderChatReadStatus = typeof orderChatReadStatus.$inferInsert;
