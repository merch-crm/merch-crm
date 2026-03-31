import { pgTable, text, timestamp, uuid, boolean, index, integer, AnyPgColumn, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { measurementUnitEnum } from "../enums";
import { productLines } from "../product-lines";
import { inventoryAttributes } from "./attributes";
import { inventoryItems } from "./items";

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
        pathIdx: index("inv_cats_path_idx").on(table.fullPath),
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
    attributes: many(inventoryAttributes),
    items: many(inventoryItems),
    productLines: many(productLines),
}));

export const inventoryAttributeTypes = pgTable("inventory_attribute_types", {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    categoryId: uuid("category_id").references(() => inventoryCategories.id),
    dataType: text("data_type").default("text").notNull(), // 'text', 'unit', 'color'
    showInSku: boolean("show_in_sku").default(true).notNull(),
    showInName: boolean("show_in_name").default(true).notNull(),
    hasColor: boolean("has_color").default(false).notNull(),
    hasUnits: boolean("has_units").default(false).notNull(),
    hasComposition: boolean("has_composition").default(false).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    meta: jsonb("meta"),
}, (table) => {
    return {
        deptIdx: index("inv_attr_types_department_idx").on(table.categoryId),
        createdIdx: index("inv_attr_types_created_idx").on(table.createdAt),
        // Composite unique: same slug can exist in different categories, but not within the same one
        slugCategoryUniq: uniqueIndex("inv_attr_types_slug_category_unique").on(table.slug, table.categoryId),
    }
});

export const inventoryAttributeTypesRelations = relations(inventoryAttributeTypes, ({ one }) => ({
    category: one(inventoryCategories, {
        fields: [inventoryAttributeTypes.categoryId],
        references: [inventoryCategories.id],
    }),
}));
