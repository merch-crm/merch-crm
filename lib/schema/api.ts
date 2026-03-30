import {
    pgTable,
    text,
    timestamp,
    uuid,
    boolean,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const apiKeys = pgTable("api_keys", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    key: text("key").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("api_keys_user_id_idx").on(table.userId),
    createdAtIdx: index("api_keys_created_at_idx").on(table.createdAt),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
    user: one(users, {
        fields: [apiKeys.userId],
        references: [users.id],
    }),
}));

