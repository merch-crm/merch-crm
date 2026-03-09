import { pgTable, text, uuid, boolean, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clients } from "./clients/main";
import { users } from "./users";

// === ТИПЫ КАНАЛОВ ===
export const channelTypes = ["telegram", "instagram", "vk", "whatsapp", "email", "sms"] as const;
export type ChannelType = (typeof channelTypes)[number];

export const channelTypeLabels: Record<ChannelType, string> = {
    telegram: "Telegram",
    instagram: "Instagram",
    vk: "ВКонтакте",
    whatsapp: "WhatsApp",
    email: "Email",
    sms: "SMS",
};

export const channelTypeColors: Record<ChannelType, string> = {
    telegram: "#26A5E4",
    instagram: "#E4405F",
    vk: "#4680C2",
    whatsapp: "#25D366",
    email: "#6366F1",
    sms: "#10B981",
};

export const channelTypeIcons: Record<ChannelType, string> = {
    telegram: "Send",
    instagram: "Instagram",
    vk: "Globe",
    whatsapp: "MessageCircle",
    email: "Mail",
    sms: "Smartphone",
};

// === СТАТУСЫ ===
export const conversationStatuses = ["active", "archived", "blocked"] as const;
export type ConversationStatus = (typeof conversationStatuses)[number];

export const messageDirections = ["inbound", "outbound"] as const;
export type MessageDirection = (typeof messageDirections)[number];

export const messageTypes = ["text", "image", "file", "voice", "sticker"] as const;
export type MessageType = (typeof messageTypes)[number];

export const messageStatuses = ["pending", "sent", "delivered", "read", "failed"] as const;
export type MessageStatus = (typeof messageStatuses)[number];

export const templateCategories = ["greeting", "info", "closing", "promo"] as const;
export type TemplateCategory = (typeof templateCategories)[number];

export const templateCategoryLabels: Record<TemplateCategory, string> = {
    greeting: "Приветствие",
    info: "Информация",
    closing: "Завершение",
    promo: "Промо",
};

// === ТАБЛИЦЫ ===

export const communicationChannels = pgTable("communication_channels", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    channelType: text("channel_type").notNull().$type<ChannelType>(),
    icon: text("icon"),
    color: text("color"),
    isActive: boolean("is_active").default(true),
    config: jsonb("config").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    createdAtIdx: index("idx_channels_created_at").on(table.createdAt),
}));

export const clientConversations = pgTable("client_conversations", {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
    channelId: uuid("channel_id").references(() => communicationChannels.id),
    channelType: text("channel_type").notNull().$type<ChannelType>(),
    externalChatId: text("external_chat_id"),
    status: text("status").default("active").$type<ConversationStatus>(),
    unreadCount: integer("unread_count").default(0),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    lastMessagePreview: text("last_message_preview"),
    assignedManagerId: uuid("assigned_manager_id").references(() => users.id),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    clientIdIdx: index("idx_conversations_client_id").on(table.clientId),
    channelTypeIdx: index("idx_conversations_channel_type").on(table.channelType),
    statusIdx: index("idx_conversations_status").on(table.status),
    assignedManagerIdx: index("idx_conversations_assigned_manager").on(table.assignedManagerId),
    lastMessageIdx: index("idx_conversations_last_message").on(table.lastMessageAt),
    createdAtIdx: index("idx_conversations_created_at").on(table.createdAt),
}));

export const conversationMessages = pgTable("conversation_messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").notNull().references(() => clientConversations.id, { onDelete: "cascade" }),
    direction: text("direction").notNull().$type<MessageDirection>(),
    messageType: text("message_type").default("text").$type<MessageType>(),
    content: text("content"),
    mediaUrl: text("media_url"),
    mediaType: text("media_type"),
    externalMessageId: text("external_message_id"),
    status: text("status").default("sent").$type<MessageStatus>(),
    sentById: uuid("sent_by_id").references(() => users.id),
    sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow(),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    metadata: jsonb("metadata").default({}),
}, (table) => ({
    conversationIdIdx: index("idx_messages_conversation_id").on(table.conversationId),
    sentAtIdx: index("idx_messages_sent_at").on(table.sentAt),
    directionIdx: index("idx_messages_direction").on(table.direction),
    statusIdx: index("idx_messages_status").on(table.status),
    createdAtIdx: index("idx_messages_created_at").on(table.createdAt),
}));

export const messageTemplates = pgTable("message_templates", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").$type<TemplateCategory>(),
    shortcut: text("shortcut"),
    usageCount: integer("usage_count").default(0),
    isActive: boolean("is_active").default(true),
    createdById: uuid("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    categoryIdx: index("idx_templates_category").on(table.category),
    shortcutIdx: index("idx_templates_shortcut").on(table.shortcut),
    createdAtIdx: index("idx_templates_created_at").on(table.createdAt),
}));

// === ОТНОШЕНИЯ ===

export const communicationChannelsRelations = relations(communicationChannels, ({ many }) => ({
    conversations: many(clientConversations),
}));

export const clientConversationsRelations = relations(clientConversations, ({ one, many }) => ({
    client: one(clients, {
        fields: [clientConversations.clientId],
        references: [clients.id],
    }),
    channel: one(communicationChannels, {
        fields: [clientConversations.channelId],
        references: [communicationChannels.id],
    }),
    assignedManager: one(users, {
        fields: [clientConversations.assignedManagerId],
        references: [users.id],
    }),
    messages: many(conversationMessages),
}));

export const conversationMessagesRelations = relations(conversationMessages, ({ one }) => ({
    conversation: one(clientConversations, {
        fields: [conversationMessages.conversationId],
        references: [clientConversations.id],
    }),
    sentBy: one(users, {
        fields: [conversationMessages.sentById],
        references: [users.id],
    }),
}));

export const messageTemplatesRelations = relations(messageTemplates, ({ one }) => ({
    createdBy: one(users, {
        fields: [messageTemplates.createdById],
        references: [users.id],
    }),
}));

// === ТИПЫ ===
export type CommunicationChannel = typeof communicationChannels.$inferSelect;
export type ClientConversation = typeof clientConversations.$inferSelect;
export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type NewConversationMessage = typeof conversationMessages.$inferInsert;
