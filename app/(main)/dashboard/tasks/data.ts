"use server";

import { db } from "@/lib/db";
import { users, departments } from "@/lib/schema/users";
import { orders } from "@/lib/schema/orders";
import { getTasks } from "./actions/task-actions";

export async function getInitialTasks() {
  const result = await getTasks();
  return result.success ? result.data || [] : [];
}

export async function getReferenceData() {
  const [allUsers, allDepartments, allOrders] = await Promise.all([
    db.select({ id: users.id, name: users.name, avatar: users.avatar }).from(users).limit(100),
    db.select({ id: departments.id, name: departments.name, color: departments.color }).from(departments).limit(50),
    db.select({ id: orders.id, orderNumber: orders.orderNumber }).from(orders).limit(100),
  ]);

  return { users: allUsers, departments: allDepartments, orders: allOrders };
}
