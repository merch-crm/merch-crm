import { relations } from "drizzle-orm/relations";
import {
	inventoryCategories, inventoryAttributes, inventoryItems, inventoryStocks,
	storageLocations, productLines, inventoryTransfers, inventoryItemAttributes,
	inventoryAttributeTypes, users, orderItems, printDesigns, printDesignVersions
} from "../../lib/schema/index";

export const inventoryAttributesRelations = relations(inventoryAttributes, ({ one, many }) => ({
	inventoryCategory: one(inventoryCategories, {
		fields: [inventoryAttributes.categoryId],
		references: [inventoryCategories.id]
	}),
	inventoryItemAttributes: many(inventoryItemAttributes),
}));

export const inventoryCategoriesRelations = relations(inventoryCategories, ({ one, many }) => ({
	inventoryAttributes: many(inventoryAttributes),
	productLines: many(productLines),
	inventoryItems: many(inventoryItems),
	inventoryCategory: one(inventoryCategories, {
		fields: [inventoryCategories.parentId],
		references: [inventoryCategories.id],
		relationName: "inventoryCategories_parentId_inventoryCategories_id"
	}),
	inventoryCategories: many(inventoryCategories, {
		relationName: "inventoryCategories_parentId_inventoryCategories_id"
	}),
	inventoryAttributeTypes: many(inventoryAttributeTypes),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
	orderItems: many(orderItems),
	inventoryStocks: many(inventoryStocks),
	inventoryTransfers: many(inventoryTransfers),
	user_archivedBy: one(users, {
		fields: [inventoryItems.archivedBy],
		references: [users.id],
		relationName: "inventoryItems_archivedBy_users_id"
	}),
	inventoryCategory: one(inventoryCategories, {
		fields: [inventoryItems.categoryId],
		references: [inventoryCategories.id]
	}),
	user_createdBy: one(users, {
		fields: [inventoryItems.createdBy],
		references: [users.id],
		relationName: "inventoryItems_createdBy_users_id"
	}),
	productLine: one(productLines, {
		fields: [inventoryItems.productLineId],
		references: [productLines.id]
	}),
	inventoryItem: one(inventoryItems, {
		fields: [inventoryItems.baseItemId],
		references: [inventoryItems.id],
		relationName: "inventoryItems_baseItemId_inventoryItems_id"
	}),
	inventoryItems: many(inventoryItems, {
		relationName: "inventoryItems_baseItemId_inventoryItems_id"
	}),
	printDesign: one(printDesigns, {
		fields: [inventoryItems.printDesignId],
		references: [printDesigns.id]
	}),
	printDesignVersion: one(printDesignVersions, {
		fields: [inventoryItems.printVersionId],
		references: [printDesignVersions.id]
	}),
	inventoryItemAttributes: many(inventoryItemAttributes),
}));

export const inventoryStocksRelations = relations(inventoryStocks, ({ one }) => ({
	inventoryItem: one(inventoryItems, {
		fields: [inventoryStocks.itemId],
		references: [inventoryItems.id]
	}),
	storageLocation: one(storageLocations, {
		fields: [inventoryStocks.storageLocationId],
		references: [storageLocations.id]
	}),
}));

export const storageLocationsRelations = relations(storageLocations, ({ one, many }) => ({
	inventoryStocks: many(inventoryStocks),
	inventoryTransfers_fromLocationId: many(inventoryTransfers, {
		relationName: "inventoryTransfers_fromLocationId_storageLocations_id"
	}),
	inventoryTransfers_toLocationId: many(inventoryTransfers, {
		relationName: "inventoryTransfers_toLocationId_storageLocations_id"
	}),
	user: one(users, {
		fields: [storageLocations.responsibleUserId],
		references: [users.id]
	}),
}));

export const inventoryTransfersRelations = relations(inventoryTransfers, ({ one }) => ({
	inventoryItem: one(inventoryItems, {
		fields: [inventoryTransfers.itemId],
		references: [inventoryItems.id]
	}),
	user: one(users, {
		fields: [inventoryTransfers.createdBy],
		references: [users.id]
	}),
	storageLocation_fromLocationId: one(storageLocations, {
		fields: [inventoryTransfers.fromLocationId],
		references: [storageLocations.id],
		relationName: "inventoryTransfers_fromLocationId_storageLocations_id"
	}),
	storageLocation_toLocationId: one(storageLocations, {
		fields: [inventoryTransfers.toLocationId],
		references: [storageLocations.id],
		relationName: "inventoryTransfers_toLocationId_storageLocations_id"
	}),
}));

export const inventoryItemAttributesRelations = relations(inventoryItemAttributes, ({ one }) => ({
	inventoryItem: one(inventoryItems, {
		fields: [inventoryItemAttributes.inventoryItemId],
		references: [inventoryItems.id]
	}),
	inventoryAttribute: one(inventoryAttributes, {
		fields: [inventoryItemAttributes.attributeId],
		references: [inventoryAttributes.id]
	}),
}));
