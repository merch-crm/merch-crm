import { pgTable, timestamp, uuid, index, integer, text, decimal, primaryKey } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { users } from "../users";
import { storageLocations } from "../storage";
import { inventoryItems } from "./items";
import { transactionTypeEnum } from "../enums";
import { orders } from "../orders";

export const inventoryStocks = pgTable("inventory_stocks", {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id").references(() => inventoryItems.id).notNull(),
    storageLocationId: uuid("storage_location_id").references(() => storageLocations.id).notNull(),
    quantity: integer("quantity").default(0).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        itemIdx: index("inv_stocks_item_idx").on(table.itemId),
        storageIdx: index("inv_stocks_storage_idx").on(table.storageLocationId),
        itemStorageIdx: index("inv_stocks_item_storage_idx").on(table.itemId, table.storageLocationId),
        positiveQtyIdx: index("inv_stocks_qty_positive_idx").on(table.quantity).where(sql`${table.quantity} > 0`),
        createdIdx: index("inv_stocks_created_idx").on(table.createdAt),
    }
});

export const inventoryStocksRelations = relations(inventoryStocks, ({ one }) => ({
    item: one(inventoryItems, {
        fields: [inventoryStocks.itemId],
        references: [inventoryItems.id],
    }),
    storageLocation: one(storageLocations, {
        fields: [inventoryStocks.storageLocationId],
        references: [storageLocations.id],
    }),
}));

export const inventoryTransfers = pgTable("inventory_transfers", {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id").references(() => inventoryItems.id).notNull(),
    fromLocationId: uuid("from_location_id").references(() => storageLocations.id),
    toLocationId: uuid("to_location_id").references(() => storageLocations.id),
    quantity: integer("quantity").notNull(),
    comment: text("comment"),
    createdBy: uuid("created_by").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        itemIdx: index("inv_transfers_item_idx").on(table.itemId),
        fromIdx: index("inv_transfers_from_idx").on(table.fromLocationId),
        toIdx: index("inv_transfers_to_idx").on(table.toLocationId),
        createdByIdx: index("inv_transfers_created_by_idx").on(table.createdBy),
        createdIdx: index("inv_transfers_created_idx").on(table.createdAt),
    }
});

export const inventoryTransfersRelations = relations(inventoryTransfers, ({ one }) => ({
    item: one(inventoryItems, {
        fields: [inventoryTransfers.itemId],
        references: [inventoryItems.id],
    }),
    fromLocation: one(storageLocations, {
        fields: [inventoryTransfers.fromLocationId],
        references: [storageLocations.id],
        relationName: "transfer_from",
    }),
    toLocation: one(storageLocations, {
        fields: [inventoryTransfers.toLocationId],
        references: [storageLocations.id],
        relationName: "transfer_to",
    }),
    creator: one(users, {
        fields: [inventoryTransfers.createdBy],
        references: [users.id],
    }),
}));

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
