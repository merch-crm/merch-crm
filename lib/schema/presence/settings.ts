import { pgTable, uuid, varchar, jsonb, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../users";

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
    index("presence_settings_updated_by_idx").on(table.updatedById),
]);

export const presenceSettingsRelations = relations(presenceSettings, ({ one }) => ({
    updatedBy: one(users, {
        fields: [presenceSettings.updatedById],
        references: [users.id],
    }),
}));
