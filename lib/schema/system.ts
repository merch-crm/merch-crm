import { pgTable, text, timestamp, uuid, boolean, index, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { notificationTypeEnum, securityEventTypeEnum } from "./enums";
import { users } from "./users";

export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").defaultRandom().notNull(),
    userId: uuid("user_id").references(() => users.id),
    action: text("action").notNull(),
    actionCategory: text("action_category"),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.id, table.createdAt] }),
        userIdx: index("audit_logs_user_idx").on(table.userId),
        entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
        actionIdx: index("audit_logs_action_idx").on(table.action),
        actionCategoryIdx: index("audit_logs_category_idx").on(table.actionCategory),
        createdIdx: index("audit_logs_created_idx").on(table.createdAt),
    }
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id],
    }),
}));

export const systemSettings = pgTable("system_settings", {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        createdIdx: index("system_settings_created_idx").on(table.createdAt),
    }
});

export const securityEvents = pgTable("security_events", {
    id: uuid("id").defaultRandom().notNull(),
    userId: uuid("user_id").references(() => users.id),
    eventType: securityEventTypeEnum("event_type").notNull(),
    severity: text("severity").default("info").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.id, table.createdAt] }),
        userIdx: index("security_events_user_idx").on(table.userId),
        typeIdx: index("security_events_type_idx").on(table.eventType),
        entityIdx: index("security_events_entity_idx").on(table.entityType, table.entityId),
        createdIdx: index("security_events_created_idx").on(table.createdAt),
    }
});

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
    user: one(users, {
        fields: [securityEvents.userId],
        references: [users.id],
    }),
}));

export const systemErrors = pgTable("system_errors", {
    id: uuid("id").defaultRandom().notNull(),
    userId: uuid("user_id").references(() => users.id),
    message: text("message").notNull(),
    stack: text("stack"),
    path: text("path"),
    method: text("method"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    severity: text("severity").default("error").notNull(),
    details: jsonb("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.id, table.createdAt] }),
        userIdx: index("system_errors_user_idx").on(table.userId),
        createdIdx: index("system_errors_created_idx").on(table.createdAt),
    }
});

export const systemErrorsRelations = relations(systemErrors, ({ one }) => ({
    user: one(users, {
        fields: [systemErrors.userId],
        references: [users.id],
    }),
}));

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: notificationTypeEnum("type").default("info").notNull(),
    priority: text("priority").default("normal").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        userIdx: index("notifications_user_idx").on(table.userId),
        readIdx: index("notifications_read_idx").on(table.isRead),
        createdIdx: index("notifications_created_idx").on(table.createdAt),
    }
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));
