import { pgTable, text, timestamp, uuid, boolean, index, integer, jsonb, decimal, AnyPgColumn } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { measurementUnitEnum, inventoryItemTypeEnum } from "./enums";
import { users } from "./users";
import { storageLocations } from "./storage";
import { inventoryTransactions } from "./inventory-transactions.schema";


export const inventoryAttributes = pgTable("inventory_attributes", {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(), // 'color' or 'material'
    name: text("name").notNull(),
    value: text("value").notNull(), // Code: 'BLK', 'KUL' etc
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    meta: jsonb("meta"), // { hex: '#...' } for colors
}, (table) => {
    return {
        createdIdx: index("inv_attr_created_idx").on(table.createdAt),
    }
});

export const inventoryAttributesRelations = relations(inventoryAttributes, ({ many }) => ({
    itemAttributes: many(inventoryItemAttributes),
}));

export const inventoryCategories = pgTable("inventory_categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    icon: text("icon"),
    color: text("color"),
    colorMarker: text("color_marker"),
    slug: text("slug").unique(),
    fullPath: text("full_path"),
    prefix: text("prefix"),
    parentId: uuid("parent_id").references((): AnyPgColumn => inventoryCategories.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    defaultUnit: measurementUnitEnum("default_unit"),
    gender: text("gender").default("masculine").notNull(),
    singularName: text("singular_name"),
    pluralName: text("plural_name"),
    showInSku: boolean("show_in_sku").default(true).notNull(),
    showInName: boolean("show_in_name").default(true).notNull(),
    level: integer("level").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        parentIdx: index("inv_cats_parent_idx").on(table.parentId),
        activeIdx: index("inv_cats_active_idx").on(table.isActive),
        createdIdx: index("inv_cats_created_idx").on(table.createdAt),
        slugIdx: index("inv_cats_slug_idx").on(table.slug),
    }
});

export const inventoryCategoriesRelations = relations(inventoryCategories, ({ one, many }) => ({
    parent: one(inventoryCategories, {
        fields: [inventoryCategories.parentId],
        references: [inventoryCategories.id],
        relationName: "category_parent",
    }),
    children: many(inventoryCategories, {
        relationName: "category_parent",
    }),
    attributeTypes: many(inventoryAttributeTypes),
    items: many(inventoryItems),
}));

export const inventoryAttributeTypes = pgTable("inventory_attribute_types", {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    categoryId: uuid("category_id").references(() => inventoryCategories.id),
    showInSku: boolean("show_in_sku").default(true).notNull(),
    showInName: boolean("show_in_name").default(true).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        deptIdx: index("inv_attr_types_department_idx").on(table.categoryId),
        createdIdx: index("inv_attr_types_created_idx").on(table.createdAt),
    }
});

export const inventoryAttributeTypesRelations = relations(inventoryAttributeTypes, ({ one }) => ({
    category: one(inventoryCategories, {
        fields: [inventoryAttributeTypes.categoryId],
        references: [inventoryCategories.id],
    }),
}));

export const inventoryItems = pgTable("inventory_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    sku: text("sku").unique(),
    categoryId: uuid("category_id").references(() => inventoryCategories.id),
    itemType: inventoryItemTypeEnum("item_type").default("clothing").notNull(),
    quantity: integer("quantity").default(0).notNull(),
    unit: measurementUnitEnum("unit").default("шт.").notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(10).notNull(),
    criticalStockThreshold: integer("critical_stock_threshold").default(0).notNull(),
    description: text("description"),
    qualityCode: text("quality_code"),
    materialCode: text("material_code"),
    brandCode: text("brand_code"),
    attributeCode: text("attribute_code"),
    sizeCode: text("size_code"),
    image: text("image"),
    imageBack: text("image_back"),
    imageSide: text("image_side"),
    thumbnailSettings: jsonb("thumbnail_settings"),
    reservedQuantity: integer("reserved_quantity").default(0).notNull(),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
    sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }),
    isArchived: boolean("is_archived").default(false).notNull(),
    archivedAt: timestamp("archived_at"),
    archivedBy: uuid("archived_by").references(() => users.id),
    archiveReason: text("archive_reason"),
    zeroStockSince: timestamp("zero_stock_since"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    attributes: jsonb("attributes").default("{}"),
    imageDetails: jsonb("image_details").default("[]"),
    materialComposition: jsonb("material_composition").default("{}"),
}, (table) => {
    return {
        categoryIdx: index("inv_items_category_idx").on(table.categoryId),
        skuIdx: index("inv_items_sku_idx").on(table.sku),
        typeIdx: index("inv_items_type_idx").on(table.itemType),
        archivedIdx: index("inv_items_archived_idx").on(table.isArchived),
        createdIdx: index("inv_items_created_idx").on(table.createdAt),
    }
});

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
    category: one(inventoryCategories, {
        fields: [inventoryItems.categoryId],
        references: [inventoryCategories.id],
    }),
    archivedBy: one(users, {
        fields: [inventoryItems.archivedBy],
        references: [users.id],
    }),
    attributeValues: many(inventoryItemAttributes),
    stocks: many(inventoryStocks),
    transfers: many(inventoryTransfers),
    transactions: many(inventoryTransactions),
}));

export const inventoryItemAttributes = pgTable("inventory_item_attributes", {
    id: uuid("id").defaultRandom().primaryKey(),
    inventoryItemId: uuid("inventory_item_id").references(() => inventoryItems.id, { onDelete: "cascade" }).notNull(),
    attributeId: uuid("attribute_id").references(() => inventoryAttributes.id, { onDelete: "restrict" }).notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        itemAttrUnique: index("inv_item_attr_unique").on(table.inventoryItemId, table.attributeId),
        attributeIdx: index("inv_item_attr_attribute_idx").on(table.attributeId),
        createdIdx: index("inv_item_attr_created_idx").on(table.createdAt),
    }
});

export const inventoryItemAttributesRelations = relations(inventoryItemAttributes, ({ one }) => ({
    item: one(inventoryItems, {
        fields: [inventoryItemAttributes.inventoryItemId],
        references: [inventoryItems.id],
    }),
    attribute: one(inventoryAttributes, {
        fields: [inventoryItemAttributes.attributeId],
        references: [inventoryAttributes.id],
    }),
}));

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
