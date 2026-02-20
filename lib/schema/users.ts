import { pgTable, text, timestamp, uuid, boolean, date, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders } from "./orders";
import { payments, expenses } from "./finance";
import { inventoryTransactions } from "./inventory-transactions.schema";
import { inventoryTransfers } from "./warehouse";
import { tasks } from "./tasks";
import { notifications, auditLogs, securityEvents, systemErrors } from "./system";
import { clients } from "./clients";
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
    passwordHash: text("password_hash").notNull(),
    roleId: uuid("role_id").references(() => roles.id),
    phone: text("phone"),
    birthday: date("birthday"),
    avatar: text("avatar"),
    telegram: text("telegram"),
    instagram: text("instagram"),
    socialMax: text("social_max"),
    departmentId: uuid("department_id").references(() => departments.id),
    lastActiveAt: timestamp("last_active_at"),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
    assignedTasks: many(tasks, { relationName: "assignedTasks" }),
    createdTasks: many(tasks, { relationName: "createdTasks" }),
    notifications: many(notifications),
    auditLogs: many(auditLogs),
    securityEvents: many(securityEvents),
    systemErrors: many(systemErrors),
    managedClients: many(clients),
    wikiPages: many(wikiPages),
}));
