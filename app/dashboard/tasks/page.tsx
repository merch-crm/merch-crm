import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getTasks } from "./actions";
import { getUsers } from "../admin/actions";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const userData = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (!userData) redirect("/login");

    const [tasksRes, usersRes, departmentsRes] = await Promise.all([
        getTasks(),
        getUsers(),
        db.query.departments.findMany()
    ]);

    return (
        <TasksClient
            initialTasks={tasksRes.data || []}
            users={usersRes.data || []}
            departments={departmentsRes || []}
            currentUserId={userData.id}
            currentUserDepartmentId={userData.departmentId}
        />
    );
}
