import { pgTable, text, timestamp, uuid, index, decimal, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { inventoryItemTypeEnum, measurementUnitEnum } from "../enums";
import { users } from "../users";
import { productLines } from "../product-lines";
import { printDesigns, printDesignVersions } from "../designs";
import { inventoryCategories } from "./categories";
import { inventoryItemAttributes } from "./attributes";
import { inventoryStocks, inventoryTransfers } from "./stock";

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
    createdBy: uuid("created_by").references(() => users.id),
    attributes: jsonb("attributes").default("{}"),
    imageDetails: jsonb("image_details").default("[]"),
    materialComposition: jsonb("material_composition").default("{}"),
    productLineId: text("product_line_id"),
    baseItemId: text("base_item_id"),
    printDesignId: text("print_design_id"),
    printVersionId: text("print_version_id"),
}, (table) => {
    return {
        categoryIdx: index("inv_items_category_idx").on(table.categoryId),
        skuIdx: index("inv_items_sku_idx").on(table.sku),
        nameIdx: index("inv_items_name_idx").on(table.name),
        typeIdx: index("inv_items_type_idx").on(table.itemType),
        archivedIdx: index("inv_items_archived_idx").on(table.isArchived),
        createdIdx: index("inv_items_created_idx").on(table.createdAt),
        createdByIdx: index("inv_items_created_by_idx").on(table.createdBy),
        productLineIdx: index("inventory_items_product_line_idx").on(table.productLineId),
        baseItemIdx: index("inventory_items_base_item_idx").on(table.baseItemId),
        printDesignIdx: index("inventory_items_print_design_idx").on(table.printDesignId),
        printVersionIdx: index("inventory_items_print_version_idx").on(table.printVersionId),
        archivedByIdx: index("inv_items_archived_by_idx").on(table.archivedBy),
    }
});

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
    category: one(inventoryCategories, {
        fields: [inventoryItems.categoryId],
        references: [inventoryCategories.id],
    }),
    creator: one(users, {
        fields: [inventoryItems.createdBy],
        references: [users.id],
    }),
    archivedBy: one(users, {
        fields: [inventoryItems.archivedBy],
        references: [users.id],
    }),
    attributeValues: many(inventoryItemAttributes),
    stocks: many(inventoryStocks),
    transfers: many(inventoryTransfers),
    // transactions: many(inventoryTransactions),
    productLine: one(productLines, {
        fields: [inventoryItems.productLineId],
        references: [productLines.id],
    }),
    baseItem: one(inventoryItems, {
        fields: [inventoryItems.baseItemId],
        references: [inventoryItems.id],
        relationName: "baseToFinished",
    }),
    finishedItems: many(inventoryItems, {
        relationName: "baseToFinished",
    }),
    printDesign: one(printDesigns, {
        fields: [inventoryItems.printDesignId],
        references: [printDesigns.id],
    }),
    printVersion: one(printDesignVersions, {
        fields: [inventoryItems.printVersionId],
        references: [printDesignVersions.id],
    }),
}));
