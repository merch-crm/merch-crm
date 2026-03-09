import { pgTable, uuid, varchar, text, jsonb, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../users";
import { cameras } from "./hardware";
import { presenceLogs } from "./recognition";

export type DetectionZone =
    | { type: 'rect'; x: number; y: number; width: number; height: number }
    | { type: 'polygon'; points: Array<{ x: number; y: number }> }
    | { type: 'circle'; cx: number; cy: number; radius: number };

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
