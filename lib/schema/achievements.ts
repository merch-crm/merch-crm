import { pgTable, uuid, varchar, text, timestamp, index, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const achievements = pgTable("achievements", {
    id: uuid("id").defaultRandom().primaryKey(),
    
    // Метаданные
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    icon: varchar("icon", { length: 100 }), // Lucide icon name
    points: integer("points").default(0).notNull(), // Баллы геймификации
    
    // Логика
    code: varchar("code", { length: 100 }).unique().notNull(), // Код для программного награждения (например, 'top_packer_weekly')
    badgeUrl: text("badge_url"), // Ссылка на картинку/бейдж
    
    isHidden: boolean("is_hidden").default(false).notNull(), // Скрытая ачивка до получения
    isActive: boolean("is_active").default(true).notNull(),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    codeIdx: index("achievements_code_idx").on(table.code),
    isActiveIdx: index("achievements_is_active_idx").on(table.isActive),
    createdAtIdx: index("achievements_created_at_idx").on(table.createdAt),
}));

export const userAchievements = pgTable("user_achievements", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    achievementId: uuid("achievement_id").references(() => achievements.id, { onDelete: "cascade" }).notNull(),
    
    // Дополнительные данные о получении
    achievedAt: timestamp("achieved_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    details: jsonb("details"), // Например: "Упаковано 500 единиц"
    
}, (table) => ({
    userIdx: index("user_achievements_user_idx").on(table.userId),
    achievementIdx: index("user_achievements_achievement_idx").on(table.achievementId),
    userAchievementUniqueIdx: index("user_achievements_unique_idx").on(table.userId, table.achievementId),
    userAchievementsCreatedAtIdx: index("user_achievements_created_at_idx").on(table.createdAt),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
    earnedBy: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
    user: one(users, {
        fields: [userAchievements.userId],
        references: [users.id],
    }),
    achievement: one(achievements, {
        fields: [userAchievements.achievementId],
        references: [achievements.id],
    }),
}));

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
