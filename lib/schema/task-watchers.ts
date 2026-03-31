import { pgTable, uuid, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tasks } from "./tasks";
import { users } from "./users";

export const taskWatchers = pgTable(
  "task_watchers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addedBy: uuid("added_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    taskUserUnique: uniqueIndex("task_watchers_task_user_idx").on(
      table.taskId,
      table.userId
    ),
    taskIdx: index("task_watchers_task_idx").on(table.taskId),
    userIdx: index("task_watchers_user_idx").on(table.userId),
    createdIdx: index("task_watchers_created_idx").on(table.createdAt),
  })
);

export const taskWatchersRelations = relations(taskWatchers, ({ one }) => ({
  task: one(tasks, {
    fields: [taskWatchers.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskWatchers.userId],
    references: [users.id],
    relationName: "taskWatcherUser",
  }),
  addedByUser: one(users, {
    fields: [taskWatchers.addedBy],
    references: [users.id],
    relationName: "taskWatcherAddedBy",
  }),
}));
