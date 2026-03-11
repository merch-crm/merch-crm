import { relations } from "drizzle-orm/relations";
import {
	orders, orderAttachments, users, departments, tasks, roles, notifications,
	inventoryCategories, inventoryAttributes, clients, promocodes, orderItems,
	inventoryItems, loyaltyLevels, inventoryStocks, storageLocations, productLines,
	printCollections, inventoryTransfers, clientConversations, communicationChannels,
	taskChecklists, taskHistory, taskComments, taskAttachments, expenses,
	conversationMessages, wikiFolders, payments, messageTemplates, wikiPages,
	dailyWorkStats, xiaomiAccounts, cameras, employeeFaces, presenceSettings,
	workSessions, workstations, presenceLogs, printDesigns, printDesignVersions,
	sessions, printDesignFiles, inventoryItemAttributes, inventoryAttributeTypes
} from "@/lib/schema";

export const orderAttachmentsRelations = relations(orderAttachments, ({ one }) => ({
	order: one(orders, {
		fields: [orderAttachments.orderId],
		references: [orders.id]
	}),
	user: one(users, {
		fields: [orderAttachments.createdBy],
		references: [users.id]
	}),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
	orderAttachments: many(orderAttachments),
	tasks: many(tasks),
	client: one(clients, {
		fields: [orders.clientId],
		references: [clients.id]
	}),
	user_createdBy: one(users, {
		fields: [orders.createdBy],
		references: [users.id],
		relationName: "orders_createdBy_users_id"
	}),
	promocode: one(promocodes, {
		fields: [orders.promocodeId],
		references: [promocodes.id]
	}),
	user_managerId: one(users, {
		fields: [orders.managerId],
		references: [users.id],
		relationName: "orders_managerId_users_id"
	}),
	user_archivedBy: one(users, {
		fields: [orders.archivedBy],
		references: [users.id],
		relationName: "orders_archivedBy_users_id"
	}),
	orderItems: many(orderItems),
	payments: many(payments),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
	orderAttachments: many(orderAttachments),
	tasks_assignedToUserId: many(tasks, {
		relationName: "tasks_assignedToUserId_users_id"
	}),
	tasks_createdBy: many(tasks, {
		relationName: "tasks_createdBy_users_id"
	}),
	notifications: many(notifications),
	orders_createdBy: many(orders, {
		relationName: "orders_createdBy_users_id"
	}),
	orders_managerId: many(orders, {
		relationName: "orders_managerId_users_id"
	}),
	orders_archivedBy: many(orders, {
		relationName: "orders_archivedBy_users_id"
	}),
	clients: many(clients),
	productLines: many(productLines),
	inventoryTransfers: many(inventoryTransfers),
	clientConversations: many(clientConversations),
	taskHistories: many(taskHistory),
	taskComments: many(taskComments),
	taskAttachments: many(taskAttachments),
	expenses: many(expenses),
	conversationMessages: many(conversationMessages),
	role: one(roles, {
		fields: [users.roleId],
		references: [roles.id]
	}),
	department: one(departments, {
		fields: [users.departmentId],
		references: [departments.id]
	}),
	payments: many(payments),
	messageTemplates: many(messageTemplates),
	wikiPages: many(wikiPages),
	dailyWorkStats: many(dailyWorkStats),
	employeeFaces_userId: many(employeeFaces, {
		relationName: "employeeFaces_userId_users_id"
	}),
	employeeFaces_createdById: many(employeeFaces, {
		relationName: "employeeFaces_createdById_users_id"
	}),
	presenceSettings: many(presenceSettings),
	workSessions: many(workSessions),
	workstations: many(workstations),
	xiaomiAccounts: many(xiaomiAccounts),
	presenceLogs: many(presenceLogs),
	inventoryItems_archivedBy: many(inventoryItems, {
		relationName: "inventoryItems_archivedBy_users_id"
	}),
	inventoryItems_createdBy: many(inventoryItems, {
		relationName: "inventoryItems_createdBy_users_id"
	}),
	sessions: many(sessions),
	storageLocations: many(storageLocations),
	printCollections: many(printCollections),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	department: one(departments, {
		fields: [tasks.assignedToDepartmentId],
		references: [departments.id]
	}),
	user_assignedToUserId: one(users, {
		fields: [tasks.assignedToUserId],
		references: [users.id],
		relationName: "tasks_assignedToUserId_users_id"
	}),
	role: one(roles, {
		fields: [tasks.assignedToRoleId],
		references: [roles.id]
	}),
	user_createdBy: one(users, {
		fields: [tasks.createdBy],
		references: [users.id],
		relationName: "tasks_createdBy_users_id"
	}),
	order: one(orders, {
		fields: [tasks.orderId],
		references: [orders.id]
	}),
	taskChecklists: many(taskChecklists),
	taskHistories: many(taskHistory),
	taskComments: many(taskComments),
	taskAttachments: many(taskAttachments),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
	tasks: many(tasks),
	roles: many(roles),
	users: many(users),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
	tasks: many(tasks),
	department: one(departments, {
		fields: [roles.departmentId],
		references: [departments.id]
	}),
	users: many(users),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

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

export const clientsRelations = relations(clients, ({ one, many }) => ({
	orders: many(orders),
	user: one(users, {
		fields: [clients.managerId],
		references: [users.id]
	}),
	loyaltyLevel: one(loyaltyLevels, {
		fields: [clients.loyaltyLevelId],
		references: [loyaltyLevels.id]
	}),
	clientConversations: many(clientConversations),
}));

export const promocodesRelations = relations(promocodes, ({ many }) => ({
	orders: many(orders),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	inventoryItem: one(inventoryItems, {
		fields: [orderItems.inventoryId],
		references: [inventoryItems.id]
	}),
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

export const loyaltyLevelsRelations = relations(loyaltyLevels, ({ many }) => ({
	clients: many(clients),
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

export const productLinesRelations = relations(productLines, ({ one, many }) => ({
	inventoryCategory: one(inventoryCategories, {
		fields: [productLines.categoryId],
		references: [inventoryCategories.id]
	}),
	printCollection: one(printCollections, {
		fields: [productLines.printCollectionId],
		references: [printCollections.id]
	}),
	user: one(users, {
		fields: [productLines.createdBy],
		references: [users.id]
	}),
	inventoryItems: many(inventoryItems),
}));

export const printCollectionsRelations = relations(printCollections, ({ one, many }) => ({
	productLines: many(productLines),
	user: one(users, {
		fields: [printCollections.createdBy],
		references: [users.id]
	}),
	printDesigns: many(printDesigns),
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

export const clientConversationsRelations = relations(clientConversations, ({ one, many }) => ({
	client: one(clients, {
		fields: [clientConversations.clientId],
		references: [clients.id]
	}),
	communicationChannel: one(communicationChannels, {
		fields: [clientConversations.channelId],
		references: [communicationChannels.id]
	}),
	user: one(users, {
		fields: [clientConversations.assignedManagerId],
		references: [users.id]
	}),
	conversationMessages: many(conversationMessages),
}));

export const communicationChannelsRelations = relations(communicationChannels, ({ many }) => ({
	clientConversations: many(clientConversations),
}));

export const taskChecklistsRelations = relations(taskChecklists, ({ one }) => ({
	task: one(tasks, {
		fields: [taskChecklists.taskId],
		references: [tasks.id]
	}),
}));

export const taskHistoryRelations = relations(taskHistory, ({ one }) => ({
	task: one(tasks, {
		fields: [taskHistory.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [taskHistory.userId],
		references: [users.id]
	}),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
	task: one(tasks, {
		fields: [taskComments.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [taskComments.userId],
		references: [users.id]
	}),
}));

export const taskAttachmentsRelations = relations(taskAttachments, ({ one }) => ({
	task: one(tasks, {
		fields: [taskAttachments.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [taskAttachments.createdBy],
		references: [users.id]
	}),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
	user: one(users, {
		fields: [expenses.createdBy],
		references: [users.id]
	}),
}));

export const conversationMessagesRelations = relations(conversationMessages, ({ one }) => ({
	clientConversation: one(clientConversations, {
		fields: [conversationMessages.conversationId],
		references: [clientConversations.id]
	}),
	user: one(users, {
		fields: [conversationMessages.sentById],
		references: [users.id]
	}),
}));

export const wikiFoldersRelations = relations(wikiFolders, ({ one, many }) => ({
	wikiFolder: one(wikiFolders, {
		fields: [wikiFolders.parentId],
		references: [wikiFolders.id],
		relationName: "wikiFolders_parentId_wikiFolders_id"
	}),
	wikiFolders: many(wikiFolders, {
		relationName: "wikiFolders_parentId_wikiFolders_id"
	}),
	wikiPages: many(wikiPages),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
	order: one(orders, {
		fields: [payments.orderId],
		references: [orders.id]
	}),
	user: one(users, {
		fields: [payments.createdBy],
		references: [users.id]
	}),
}));

export const messageTemplatesRelations = relations(messageTemplates, ({ one }) => ({
	user: one(users, {
		fields: [messageTemplates.createdById],
		references: [users.id]
	}),
}));

export const wikiPagesRelations = relations(wikiPages, ({ one }) => ({
	wikiFolder: one(wikiFolders, {
		fields: [wikiPages.folderId],
		references: [wikiFolders.id]
	}),
	user: one(users, {
		fields: [wikiPages.createdBy],
		references: [users.id]
	}),
}));

export const dailyWorkStatsRelations = relations(dailyWorkStats, ({ one }) => ({
	user: one(users, {
		fields: [dailyWorkStats.userId],
		references: [users.id]
	}),
}));

export const camerasRelations = relations(cameras, ({ one, many }) => ({
	xiaomiAccount: one(xiaomiAccounts, {
		fields: [cameras.xiaomiAccountId],
		references: [xiaomiAccounts.id]
	}),
	workSessions: many(workSessions),
	workstations: many(workstations),
	presenceLogs: many(presenceLogs),
}));

export const xiaomiAccountsRelations = relations(xiaomiAccounts, ({ one, many }) => ({
	cameras: many(cameras),
	user: one(users, {
		fields: [xiaomiAccounts.createdById],
		references: [users.id]
	}),
}));

export const employeeFacesRelations = relations(employeeFaces, ({ one }) => ({
	user_userId: one(users, {
		fields: [employeeFaces.userId],
		references: [users.id],
		relationName: "employeeFaces_userId_users_id"
	}),
	user_createdById: one(users, {
		fields: [employeeFaces.createdById],
		references: [users.id],
		relationName: "employeeFaces_createdById_users_id"
	}),
}));

export const presenceSettingsRelations = relations(presenceSettings, ({ one }) => ({
	user: one(users, {
		fields: [presenceSettings.updatedById],
		references: [users.id]
	}),
}));

export const workSessionsRelations = relations(workSessions, ({ one }) => ({
	user: one(users, {
		fields: [workSessions.userId],
		references: [users.id]
	}),
	camera: one(cameras, {
		fields: [workSessions.cameraId],
		references: [cameras.id]
	}),
}));

export const workstationsRelations = relations(workstations, ({ one, many }) => ({
	camera: one(cameras, {
		fields: [workstations.cameraId],
		references: [cameras.id]
	}),
	user: one(users, {
		fields: [workstations.assignedUserId],
		references: [users.id]
	}),
	presenceLogs: many(presenceLogs),
}));

export const presenceLogsRelations = relations(presenceLogs, ({ one }) => ({
	user: one(users, {
		fields: [presenceLogs.userId],
		references: [users.id]
	}),
	camera: one(cameras, {
		fields: [presenceLogs.cameraId],
		references: [cameras.id]
	}),
	workstation: one(workstations, {
		fields: [presenceLogs.workstationId],
		references: [workstations.id]
	}),
}));

export const printDesignsRelations = relations(printDesigns, ({ one, many }) => ({
	inventoryItems: many(inventoryItems),
	printCollection: one(printCollections, {
		fields: [printDesigns.collectionId],
		references: [printCollections.id]
	}),
	printDesignVersions: many(printDesignVersions),
}));

export const printDesignVersionsRelations = relations(printDesignVersions, ({ one, many }) => ({
	inventoryItems: many(inventoryItems),
	printDesignFiles: many(printDesignFiles),
	printDesign: one(printDesigns, {
		fields: [printDesignVersions.designId],
		references: [printDesigns.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const printDesignFilesRelations = relations(printDesignFiles, ({ one }) => ({
	printDesignVersion: one(printDesignVersions, {
		fields: [printDesignFiles.versionId],
		references: [printDesignVersions.id]
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

export const inventoryAttributeTypesRelations = relations(inventoryAttributeTypes, ({ one }) => ({
	inventoryCategory: one(inventoryCategories, {
		fields: [inventoryAttributeTypes.categoryId],
		references: [inventoryCategories.id]
	}),
}));