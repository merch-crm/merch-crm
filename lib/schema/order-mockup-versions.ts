import { pgTable, text, timestamp, uuid, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders, orderItems } from "./orders";
import { users } from "./users";

// ============ ИСТОРИЯ ВЕРСИЙ МАКЕТОВ (для мерч-заказов) ============

export const orderMockupVersions = pgTable("order_mockup_versions", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(1),
    mockupPath: text("mockup_path").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size"),
    comment: text("comment"),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    orderIdx: index("mockup_versions_order_idx").on(table.orderId),
    itemIdx: index("mockup_versions_item_idx").on(table.orderItemId),
    versionIdx: index("mockup_versions_version_idx").on(table.orderId, table.version),
    createdIdx: index("mockup_versions_created_idx").on(table.createdAt),
}));

// ============ RELATIONS ============

export const orderMockupVersionsRelations = relations(orderMockupVersions, ({ one }) => ({
    order: one(orders, {
        fields: [orderMockupVersions.orderId],
        references: [orders.id],
    }),
    orderItem: one(orderItems, {
        fields: [orderMockupVersions.orderItemId],
        references: [orderItems.id],
    }),
    createdByUser: one(users, {
        fields: [orderMockupVersions.createdBy],
        references: [users.id],
    }),
}));

// ============ TYPES ============

export type OrderMockupVersion = typeof orderMockupVersions.$inferSelect;
export type NewOrderMockupVersion = typeof orderMockupVersions.$inferInsert;
