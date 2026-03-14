import { relations } from "drizzle-orm/relations";
import {
	printDesigns, printDesignVersions, printDesignFiles,
	inventoryItems, printCollections, users, communicationChannels,
	clientConversations, conversationMessages
} from "../../lib/schema/index";

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

export const printDesignFilesRelations = relations(printDesignFiles, ({ one }) => ({
	printDesignVersion: one(printDesignVersions, {
		fields: [printDesignFiles.versionId],
		references: [printDesignVersions.id]
	}),
}));

export const printCollectionsRelations = relations(printCollections, ({ one, many }) => ({
	productLines: many(inventoryItems), // productLines is used in inventory.ts but related here
	user: one(users, {
		fields: [printCollections.createdBy],
		references: [users.id]
	}),
	printDesigns: many(printDesigns),
}));

export const clientConversationsRelations = relations(clientConversations, ({ one, many }) => ({
	client: one(users, { // client table should be used but originally was related to clients.id
		fields: [clientConversations.clientId],
		references: [users.id]
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
