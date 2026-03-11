import { pgTable, uuid, varchar, text, timestamp, boolean, index, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../users";
import { cameraStatusEnum } from "../enums";
import { presenceLogs } from "./recognition";
import { workSessions } from "./sessions";
import { workstations } from "./workstations";

export const xiaomiAccounts = pgTable("xiaomi_accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    xiaomiUserId: varchar("xiaomi_user_id", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }),
    nickname: varchar("nickname", { length: 255 }),
    encryptedToken: text("encrypted_token").notNull(),
    region: varchar("region", { length: 10 }).notNull().default("cn"),
    isActive: boolean("is_active").notNull().default(true),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
}, (table) => [
    index("xiaomi_accounts_xiaomi_user_id_idx").on(table.xiaomiUserId),
    index("xiaomi_accounts_email_idx").on(table.email),
    index("xiaomi_accounts_is_active_idx").on(table.isActive),
    index("xiaomi_accounts_created_at_idx").on(table.createdAt),
    index("xiaomi_accounts_created_by_idx").on(table.createdById),
]);

export const cameras = pgTable("cameras", {
    id: uuid("id").defaultRandom().primaryKey(),
    xiaomiAccountId: uuid("xiaomi_account_id").references(() => xiaomiAccounts.id, { onDelete: "cascade" }),
    deviceId: varchar("device_id", { length: 100 }).notNull(),
    model: varchar("model", { length: 100 }),
    name: varchar("name", { length: 255 }).notNull(),
    localName: varchar("local_name", { length: 255 }),
    location: varchar("location", { length: 255 }),
    localIp: varchar("local_ip", { length: 45 }),
    streamUrl: text("stream_url"),
    status: cameraStatusEnum("status").notNull().default("offline"),
    lastOnlineAt: timestamp("last_online_at"),
    errorMessage: text("error_message"),
    isEnabled: boolean("is_enabled").notNull().default(true),
    confidenceThreshold: decimal("confidence_threshold", { precision: 3, scale: 2 }).default("0.60"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("cameras_xiaomi_account_id_idx").on(table.xiaomiAccountId),
    index("cameras_device_id_idx").on(table.deviceId),
    index("cameras_status_idx").on(table.status),
    index("cameras_is_enabled_idx").on(table.isEnabled),
    index("cameras_created_at_idx").on(table.createdAt),
]);

export const xiaomiAccountsRelations = relations(xiaomiAccounts, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [xiaomiAccounts.createdById],
        references: [users.id],
    }),
    cameras: many(cameras),
}));

export const camerasRelations = relations(cameras, ({ one, many }) => ({
    xiaomiAccount: one(xiaomiAccounts, {
        fields: [cameras.xiaomiAccountId],
        references: [xiaomiAccounts.id],
    }),
    presenceLogs: many(presenceLogs),
    workSessions: many(workSessions),
    workstations: many(workstations),
}));
