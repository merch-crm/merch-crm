import { relations } from "drizzle-orm/relations";
import {
	orders, orderAttachments, users, tasks, clients, promocodes, orderItems,
	payments,
	clientConversations, inventoryItems
} from "../../lib/schema/index";

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

export const clientsRelations = relations(clients, ({ one, many }) => ({
	orders: many(orders),
	user: one(users, {
		fields: [clients.managerId],
		references: [users.id]
	}),
	clientConversations: many(clientConversations),
}));
