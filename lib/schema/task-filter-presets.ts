import { pgTable, uuid, varchar, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const taskFilterPresets = pgTable(
  "task_filter_presets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    filters: jsonb("filters").notNull().default({}),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("task_filter_presets_user_idx").on(table.userId),
    createdIdx: index("task_filter_presets_created_idx").on(table.createdAt),
  })
);

export const taskFilterPresetsRelations = relations(taskFilterPresets, ({ one }) => ({
  user: one(users, {
    fields: [taskFilterPresets.userId],
    references: [users.id],
  }),
}));
