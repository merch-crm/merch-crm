import { pgTable, uuid, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tasks } from "./tasks";
import { users } from "./users";

export const taskAssignees = pgTable(
  "task_assignees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assignedBy: uuid("assigned_by").references(() => users.id),
    createdAt: timestamp("assigned_at").defaultNow().notNull(),
  },
  (table) => ({
    taskUserUnique: uniqueIndex("task_assignees_task_user_idx").on(
      table.taskId,
      table.userId
    ),
    taskIdx: index("task_assignees_task_idx").on(table.taskId),
    userIdx: index("task_assignees_user_idx").on(table.userId),
    createdIdx: index("task_assignees_created_idx").on(table.createdAt),
  })
);

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignees.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAssignees.userId],
    references: [users.id],
    relationName: "userAssignments",
  }),
  assignedByUser: one(users, {
    fields: [taskAssignees.assignedBy],
    references: [users.id],
    relationName: "taskAssignedBy",
  }),
}));
