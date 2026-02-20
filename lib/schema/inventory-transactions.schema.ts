import { pgTable, text, timestamp, uuid, index, integer, decimal, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { transactionTypeEnum } from "./enums";
import { inventoryItems } from "./warehouse";
import { orders } from "./orders";
import { storageLocations } from "./storage";
import { users } from "./users";

export const inventoryTransactions = pgTable("inventory_transactions", {
    id: uuid("id").defaultRandom().notNull(),
    itemId: uuid("item_id").references(() => inventoryItems.id),
    orderId: uuid("order_id").references(() => orders.id),
    changeAmount: integer("change_amount").notNull().default(0),
    type: transactionTypeEnum("type").notNull(),
    reason: text("reason"),
    storageLocationId: uuid("storage_location_id").references(() => storageLocations.id),
    fromStorageLocationId: uuid("from_storage_location_id").references(() => storageLocations.id),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.id, table.createdAt] }),
        itemIdx: index("inv_tx_item_idx").on(table.itemId),
        storageIdx: index("inv_tx_storage_idx").on(table.storageLocationId),
        fromStorageIdx: index("inv_tx_from_storage_idx").on(table.fromStorageLocationId),
        createdByIdx: index("inv_tx_created_by_idx").on(table.createdBy),
        orderIdx: index("inv_tx_order_idx").on(table.orderId),
        typeIdx: index("inv_tx_type_idx").on(table.type),
        dateIdx: index("inv_tx_date_idx").on(table.createdAt),
    }
});

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
    item: one(inventoryItems, {
        fields: [inventoryTransactions.itemId],
        references: [inventoryItems.id],
    }),
    order: one(orders, {
        fields: [inventoryTransactions.orderId],
        references: [orders.id],
    }),
    storageLocation: one(storageLocations, {
        fields: [inventoryTransactions.storageLocationId],
        references: [storageLocations.id],
    }),
    fromStorageLocation: one(storageLocations, {
        fields: [inventoryTransactions.fromStorageLocationId],
        references: [storageLocations.id],
    }),
    creator: one(users, {
        fields: [inventoryTransactions.createdBy],
        references: [users.id],
    }),
}));
