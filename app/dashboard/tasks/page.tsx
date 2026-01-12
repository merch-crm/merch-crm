import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getTasks } from "./actions";
import { getRoles, getUsers } from "../admin/actions";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const userData = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (!userData) redirect("/login");

    const [tasksRes, usersRes, rolesRes] = await Promise.all([
        getTasks(),
        getUsers(),
        getRoles()
    ]);

    return (
        <TasksClient
            initialTasks={tasksRes.data || []}
            users={usersRes.data || []}
            roles={rolesRes.data || []}
            currentUserId={userData.id}
            currentUserRoleId={userData.roleId || ""}
        />
    );
}
