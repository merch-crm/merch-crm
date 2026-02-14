import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getTasks } from "./actions";
import { getUsers } from "../../admin-panel/actions";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const userData = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    if (!userData) redirect("/login");

    const [tasksRes, usersRes, departmentsRes, ordersRes] = await Promise.all([
        getTasks(),
        getUsers(),
        db.query.departments.findMany(),
        db.query.orders.findMany({
            with: { client: true },
            orderBy: (orders, { desc }) => [desc(orders.createdAt)],
            limit: 50
        })
    ]);

    return (
        <TasksClient
            initialTasks={(tasksRes.success && tasksRes.data) ? tasksRes.data : []}
            users={usersRes.success && usersRes.data ? usersRes.data.users : []}
            departments={departmentsRes || []}
            orders={ordersRes || []}
            currentUserId={userData.id}
            currentUserDepartmentId={userData.departmentId}
        />
    );
}
