import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getTasks } from "./actions";
import { getUsers } from "../../admin-panel/actions";
import { TasksClient } from "./tasks-client";
import type { User, Order } from "@/lib/types";

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
            users={(usersRes.success && usersRes.data?.users && Array.isArray(usersRes.data.users)) ? usersRes.data.users.map(u => ({
                ...u,
                phone: u.phone || undefined,
                avatar: u.avatar || undefined,
            } as unknown as User)) : []}
            departments={departmentsRes || []}
            orders={(ordersRes as unknown as Order[]) || []}
            currentUserId={userData.id}
            currentUserDepartmentId={userData.departmentId}
        />
    );
}
