import { relations } from "drizzle-orm/relations";
import {
	users, departments, tasks, roles, notifications,
	orderAttachments, orders, clients, productLines,
	inventoryTransfers, clientConversations, taskHistory,
	taskComments, taskAttachments, expenses, conversationMessages,
	messageTemplates, wikiPages, dailyWorkStats,
	workSessions,
	inventoryItems, sessions, storageLocations, printCollections,
	taskChecklists, wikiFolders
} from "../../lib/schema/index";

export const usersRelations = relations(users, ({ one, many }) => ({
	orderAttachments: many(orderAttachments),
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
	payments: many(orders), // Note: payments was many(payments) in original but payments is in orders module too. Actually payments table exists.
	messageTemplates: many(messageTemplates),
	wikiPages: many(wikiPages),
	dailyWorkStats: many(dailyWorkStats),
	workSessions: many(workSessions),
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

export const workSessionsRelations = relations(workSessions, ({ one }) => ({
	user: one(users, {
		fields: [workSessions.userId],
		references: [users.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

