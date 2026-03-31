import { pgTable, uuid, timestamp, integer, decimal, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../users";
import { sessionTypeEnum } from "../enums";


export const workSessions = pgTable("work_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    durationSeconds: integer("duration_seconds").default(0),
    sessionType: sessionTypeEnum("session_type").notNull().default("work"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
    index("work_sessions_user_id_idx").on(table.userId),
    index("work_sessions_date_idx").on(table.date),
    index("work_sessions_session_type_idx").on(table.sessionType),
    index("work_sessions_user_date_idx").on(table.userId, table.date),
    index("work_sessions_created_at_idx").on(table.createdAt),
]);

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

export const workSessionsRelations = relations(workSessions, ({ one }) => ({
    user: one(users, {
        fields: [workSessions.userId],
        references: [users.id],
    }),
}));

export const dailyWorkStatsRelations = relations(dailyWorkStats, ({ one }) => ({
    user: one(users, {
        fields: [dailyWorkStats.userId],
        references: [users.id],
    }),
}));

export type WorkSession = typeof workSessions.$inferSelect;
export type DailyWorkStat = typeof dailyWorkStats.$inferSelect;
