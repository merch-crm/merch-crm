import { pgTable, text, timestamp, uuid, boolean, date, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders } from "./orders";
import { payments, expenses } from "./finance";
import { inventoryTransactions, inventoryTransfers } from "./warehouse/stock";
import { tasks } from "./tasks";
import { taskAssignees } from "./task-assignees";
import { taskWatchers } from "./task-watchers";

import { clients } from "./clients/main";
import { wikiPages } from "./wiki";

export const departments = pgTable("departments", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    color: text("color").default("indigo"),
    isActive: boolean("is_active").default(true).notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        createdIdx: index("departments_created_idx").on(table.createdAt),
    }
});

export const departmentsRelations = relations(departments, ({ many }) => ({
    roles: many(roles),
    users: many(users),
}));

export const roles = pgTable("roles", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    isSystem: boolean("is_system").default(false).notNull(),
    departmentId: uuid("department_id").references(() => departments.id),
    color: text("color"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    permissions: jsonb("permissions").notNull().default('{}'),
}, (table) => {
    return {
        deptIdx: index("roles_department_idx").on(table.departmentId),
        createdIdx: index("roles_created_idx").on(table.createdAt),
    }
});

export const rolesRelations = relations(roles, ({ one, many }) => ({
    department: one(departments, {
        fields: [roles.departmentId],
        references: [departments.id],
    }),
    users: many(users),
}));

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    roleId: uuid("role_id").references(() => roles.id),
    phone: text("phone"),
    birthday: date("birthday"),
    image: text("image"), // Better Auth standard field.
    avatar: text("avatar"), // Legacy field, kept for reverse compatibility with existing UI. Use 'image' for new features.
    telegram: text("telegram"),
    instagram: text("instagram"),
    socialMax: text("social_max"),
    departmentId: uuid("department_id").references(() => departments.id),
    lastActiveAt: timestamp("last_active_at"),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
}, (table) => {
    return {
        roleIdx: index("users_role_idx").on(table.roleId),
        departmentIdx: index("users_department_idx").on(table.departmentId),
        phoneIdx: index("users_phone_idx").on(table.phone),
        emailIdx: index("users_email_idx").on(table.email),
        createdIdx: index("users_created_idx").on(table.createdAt),
    }
});

export const usersRelations = relations(users, ({ one, many }) => ({
    role: one(roles, {
        fields: [users.roleId],
        references: [roles.id],
    }),
    department: one(departments, {
        fields: [users.departmentId],
        references: [departments.id],
    }),
    managedOrders: many(orders, { relationName: "order_manager" }),
    createdOrders: many(orders, { relationName: "order_creator" }),
    archivedOrders: many(orders, { relationName: "order_archiver" }),
    payments: many(payments),
    expenses: many(expenses),
    inventoryTransactions: many(inventoryTransactions),
    inventoryTransfers: many(inventoryTransfers),
    taskAssignments: many(taskAssignees, { relationName: "userAssignments" }),
    taskAssignedBy: many(taskAssignees, { relationName: "taskAssignedBy" }),
    createdTasks: many(tasks, { relationName: "createdTasks" }),
    taskDelegated: many(tasks, { relationName: "taskDelegator" }),
    taskOriginalAssignments: many(tasks, { relationName: "taskOriginalAssignee" }),
    taskWatching: many(taskWatchers, { relationName: "taskWatcherUser" }),
    taskWatcherAdded: many(taskWatchers, { relationName: "taskWatcherAddedBy" }),
    // notifications: many(notifications),
    // auditLogs: many(auditLogs),
    // securityEvents: many(securityEvents),
    // systemErrors: many(systemErrors),
    managedClients: many(clients),
    wikiPages: many(wikiPages),
    sessions: many(sessions),
}));

export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(), // Using text because we'll insert our secure session hash
    token: text("token").notNull().unique(), // Added for Better Auth
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"), // Added for Better Auth
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Added for Better Auth
}, (table) => {
    return {
        userIdx: index("sessions_user_idx").on(table.userId),
        expiresIdx: index("sessions_expires_idx").on(table.expiresAt),
        createdIdx: index("sessions_created_idx").on(table.createdAt),
    }
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        userIdx: index("accounts_user_idx").on(table.userId),
        createdIdx: index("accounts_created_idx").on(table.createdAt),
    }
});

export const twoFactors = pgTable("two_factors", {
    id: text("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        userIdx: index("two_factors_user_idx").on(table.userId),
        createdIdx: index("two_factors_created_idx").on(table.createdAt),
    }
});

export const verificationTokens = pgTable("verification_tokens", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
    return {
        createdIdx: index("verification_tokens_created_idx").on(table.createdAt),
    }
});
