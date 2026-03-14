import { relations } from "drizzle-orm/relations";
import {
	users, departments, tasks, roles, notifications,
	orderAttachments, orders, clients, productLines,
	inventoryTransfers, clientConversations, taskHistory,
	taskComments, taskAttachments, expenses, conversationMessages,
	messageTemplates, wikiPages, dailyWorkStats, employeeFaces,
	presenceSettings, workSessions, xiaomiAccounts, presenceLogs,
	inventoryItems, sessions, storageLocations, printCollections,
	taskChecklists, wikiFolders, cameras, workstations
} from "../../lib/schema/index";

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
	payments: many(orders), // Note: payments was many(payments) in original but payments is in orders module too. Actually payments table exists.
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

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));
