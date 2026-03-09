import { pgTable, uuid, timestamp, boolean, decimal, jsonb, index, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../users";
import { presenceEventTypeEnum } from "../enums";
import { cameras } from "./hardware";
import { workstations } from "./workstations";

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
