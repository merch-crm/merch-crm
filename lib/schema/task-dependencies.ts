import { pgTable, uuid, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tasks } from "./tasks";

export const taskDependencies = pgTable(
  "task_dependencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    dependsOnTaskId: uuid("depends_on_task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    taskDependencyUnique: uniqueIndex("task_dependencies_unique_idx").on(
      table.taskId,
      table.dependsOnTaskId
    ),
    taskIdx: index("task_dependencies_task_idx").on(table.taskId),
    dependsOnIdx: index("task_dependencies_depends_on_idx").on(table.dependsOnTaskId),
    createdIdx: index("task_dependencies_created_idx").on(table.createdAt),
  })
);

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
    relationName: "taskDependencies",
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
    relationName: "dependentTasks",
  }),
}));
