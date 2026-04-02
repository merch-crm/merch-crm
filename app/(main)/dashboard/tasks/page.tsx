import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, departments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TasksClient } from "./tasks-client";
import { TasksSkeleton } from "./components/tasks-skeleton";
import { getTasks } from "./actions/task-actions";
import { getUserFilterPresets } from "./actions/filter-preset-actions";

export const metadata = {
  title: "Задачи | MerchCRM",
};

export default async function TasksPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [tasksResult, presetsResult, allUsers, allDepartments] = await Promise.all([
    getTasks(),
    getUserFilterPresets(),
    db.query.users.findMany({
      orderBy: (users, { asc }) => [asc(users.name)],
      limit: 100,
    }),
    db.query.departments.findMany({
      where: eq(departments.isActive, true),
      orderBy: (departments, { asc }) => [asc(departments.name)],
      limit: 50,
    }),
  ]);

  const tasks = tasksResult.success ? tasksResult.data || [] : [];
  const presets = presetsResult.success ? presetsResult.data || [] : [];

  const [currentUser] = await db
    .select({ departmentId: users.departmentId })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  return (
    <Suspense fallback={<TasksSkeleton />}>
      <TasksClient
        initialTasks={tasks}
        users={allUsers.map(u => ({ id: u.id, name: u.name, image: u.image || undefined, email: u.email }))}
        departments={allDepartments.map(d => ({ id: d.id, name: d.name }))}
        userPresets={presets}
        currentUserId={session.id}
        currentUserDepartmentId={currentUser?.departmentId || undefined}
      />
    </Suspense>
  );
}
