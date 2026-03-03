import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
    integer,
    decimal,
    text,
    index,
    pgEnum,
    jsonb
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// ============================================
// ENUMS
// ============================================

export const presenceEventTypeEnum = pgEnum("presence_event_type", [
    "detected",
    "lost",
    "recognized",
    "unknown"
]);

export const sessionTypeEnum = pgEnum("session_type", [
    "work",
    "break",
    "idle"
]);

export const cameraStatusEnum = pgEnum("camera_status", [
    "online",
    "offline",
    "error",
    "connecting"
]);

export type DetectionZone =
    | { type: 'rect'; x: number; y: number; width: number; height: number }
    | { type: 'polygon'; points: Array<{ x: number; y: number }> }
    | { type: 'circle'; cx: number; cy: number; radius: number };

// ============================================
// XIAOMI ACCOUNTS
// ============================================

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
]);

// ============================================
// CAMERAS
// ============================================

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

// ============================================
// EMPLOYEE FACES
// ============================================

export const employeeFaces = pgTable("employee_faces", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    faceEncoding: jsonb("face_encoding").notNull(),
    photoUrl: text("photo_url"),
    isActive: boolean("is_active").notNull().default(true),
    isPrimary: boolean("is_primary").notNull().default(false),
    quality: decimal("quality", { precision: 3, scale: 2 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
}, (table) => [
    index("employee_faces_user_id_idx").on(table.userId),
    index("employee_faces_is_active_idx").on(table.isActive),
    index("employee_faces_is_primary_idx").on(table.isPrimary),
    index("employee_faces_created_at_idx").on(table.createdAt),
]);

// ============================================
// WORKSTATIONS
// ============================================

export const workstations = pgTable("workstations", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    cameraId: uuid("camera_id").references(() => cameras.id, { onDelete: "set null" }),
    assignedUserId: uuid("assigned_user_id").references(() => users.id, { onDelete: "set null" }),
    zone: jsonb("zone").$type<DetectionZone>(),
    color: varchar("color", { length: 7 }).default("#3B82F6"),
    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true),
    requiresAssignedUser: boolean("requires_assigned_user").default(false),
    lastSeenUserId: uuid("last_seen_user_id"),
    lastSeenAt: timestamp("last_seen_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("workstations_camera_id_idx").on(table.cameraId),
    index("workstations_assigned_user_id_idx").on(table.assignedUserId),
    index("workstations_is_active_idx").on(table.isActive),
    index("workstations_created_at_idx").on(table.createdAt),
]);

// ============================================
// PRESENCE LOGS
// ============================================

export const presenceLogs = pgTable("presence_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    cameraId: uuid("camera_id").references(() => cameras.id, { onDelete: "set null" }),
    workstationId: uuid("workstation_id").references(() => workstations.id, { onDelete: "set null" }),
    eventType: presenceEventTypeEnum("event_type").notNull(),
    confidence: decimal("confidence", { precision: 3, scale: 2 }),
    faceEncoding: jsonb("face_encoding"),
    facePosition: jsonb("face_position").$type<{
        x: number
        y: number
        width: number
        height: number
    }>(),
    snapshotUrl: text("snapshot_url"),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
    index("presence_logs_user_id_idx").on(table.userId),
    index("presence_logs_camera_id_idx").on(table.cameraId),
    index("presence_logs_workstation_id_idx").on(table.workstationId),
    index("presence_logs_event_type_idx").on(table.eventType),
    index("presence_logs_timestamp_idx").on(table.timestamp),
    index("presence_logs_created_at_idx").on(table.createdAt),
]);

// ============================================
// WORK SESSIONS
// ============================================

export const workSessions = pgTable("work_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    cameraId: uuid("camera_id").references(() => cameras.id, { onDelete: "set null" }),
    date: timestamp("date").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    durationSeconds: integer("duration_seconds").default(0),
    sessionType: sessionTypeEnum("session_type").notNull().default("work"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
    index("work_sessions_user_id_idx").on(table.userId),
    index("work_sessions_camera_id_idx").on(table.cameraId),
    index("work_sessions_date_idx").on(table.date),
    index("work_sessions_session_type_idx").on(table.sessionType),
    index("work_sessions_user_date_idx").on(table.userId, table.date),
    index("work_sessions_created_at_idx").on(table.createdAt),
]);

// ============================================
// DAILY WORK STATS
// ============================================

export const dailyWorkStats = pgTable("daily_work_stats", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    firstSeenAt: timestamp("first_seen_at"),
    lastSeenAt: timestamp("last_seen_at"),
    workSeconds: integer("work_seconds").notNull().default(0),
    idleSeconds: integer("idle_seconds").notNull().default(0),
    breakSeconds: integer("break_seconds").notNull().default(0),
    productivity: decimal("productivity", { precision: 5, scale: 2 }),
    totalSessions: integer("total_sessions").notNull().default(0),
    lateArrivalMinutes: integer("late_arrival_minutes").default(0),
    earlyDepartureMinutes: integer("early_departure_minutes").default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
    index("daily_work_stats_user_id_idx").on(table.userId),
    index("daily_work_stats_date_idx").on(table.date),
    index("daily_work_stats_user_date_idx").on(table.userId, table.date),
    index("daily_work_stats_created_at_idx").on(table.createdAt),
]);

// ============================================
// PRESENCE SETTINGS
// ============================================

export const presenceSettings = pgTable("presence_settings", {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 100 }).notNull().unique(),
    value: jsonb("value").notNull(),
    description: text("description"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedById: uuid("updated_by_id").references(() => users.id, { onDelete: "set null" }),
}, (table) => [
    index("presence_settings_key_idx").on(table.key),
    index("presence_settings_created_at_idx").on(table.createdAt),
]);

// ============================================
// RELATIONS
// ============================================

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
}));

export const employeeFacesRelations = relations(employeeFaces, ({ one }) => ({
    user: one(users, {
        fields: [employeeFaces.userId],
        references: [users.id],
    }),
    createdBy: one(users, {
        fields: [employeeFaces.createdById],
        references: [users.id],
        relationName: "faceCreatedBy",
    }),
}));

export const presenceLogsRelations = relations(presenceLogs, ({ one }) => ({
    user: one(users, {
        fields: [presenceLogs.userId],
        references: [users.id],
    }),
    camera: one(cameras, {
        fields: [presenceLogs.cameraId],
        references: [cameras.id],
    }),
    workstation: one(workstations, {
        fields: [presenceLogs.workstationId],
        references: [workstations.id],
    }),
}));

export const workstationsRelations = relations(workstations, ({ one, many }) => ({
    camera: one(cameras, {
        fields: [workstations.cameraId],
        references: [cameras.id],
    }),
    assignedUser: one(users, {
        fields: [workstations.assignedUserId],
        references: [users.id],
    }),
    presenceLogs: many(presenceLogs),
}));

export const workSessionsRelations = relations(workSessions, ({ one }) => ({
    user: one(users, {
        fields: [workSessions.userId],
        references: [users.id],
    }),
    camera: one(cameras, {
        fields: [workSessions.cameraId],
        references: [cameras.id],
    }),
}));

export const dailyWorkStatsRelations = relations(dailyWorkStats, ({ one }) => ({
    user: one(users, {
        fields: [dailyWorkStats.userId],
        references: [users.id],
    }),
}));

export const presenceSettingsRelations = relations(presenceSettings, ({ one }) => ({
    updatedBy: one(users, {
        fields: [presenceSettings.updatedById],
        references: [users.id],
    }),
}));
