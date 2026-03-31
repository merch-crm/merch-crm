import { pgTable, text, timestamp, uuid, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { inventoryCategories } from "./categories";
import { inventoryItems } from "./items";

export const inventoryAttributes = pgTable("inventory_attributes", {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(), // 'color' or 'material'
    name: text("name").notNull(),
    value: text("value").notNull(), // Code: 'BLK', 'KUL' etc
    categoryId: uuid("category_id").references(() => inventoryCategories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    meta: jsonb("meta"), // { hex: '#...' } for colors
}, (table) => {
    return {
        typeIdx: index("inv_attr_type_idx").on(table.type),
        valueIdx: index("inv_attr_value_idx").on(table.value),
        categoryIdx: index("inv_attr_category_idx").on(table.categoryId),
        // Composite index for category-scoped uniqueness check
        typeValueCategoryIdx: uniqueIndex("inv_attr_type_value_category_idx").on(table.type, table.value, table.categoryId),
        createdIdx: index("inv_attr_created_idx").on(table.createdAt),
    }
});

export const inventoryAttributesRelations = relations(inventoryAttributes, ({ one, many }) => ({
    category: one(inventoryCategories, {
        fields: [inventoryAttributes.categoryId],
        references: [inventoryCategories.id],
    }),
    itemAttributes: many(inventoryItemAttributes),
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
