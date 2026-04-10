import { Metadata } from "next";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";
import { orders } from "@/lib/schema/orders";
import { DesignTaskCreateClient } from "./design-task-create-client";

export const metadata: Metadata = {
  title: "Новая задача | Дизайн",
};

export default async function NewDesignTaskPage() {
  // Получаем последние 100 заказов для выбора (в реальном приложении здесь нужен поиск, но для начала сойдет список)
  const activeOrders = await db.query.orders.findMany({
    columns: { id: true, orderNumber: true, status: true },
    limit: 100,
    orderBy: [desc(orders.createdAt)],
  });

  // Получаем типы нанесения для формы
  const appTypes = await db.query.applicationTypes.findMany({
    columns: { id: true, name: true },
    limit: 100,
  });

  return <DesignTaskCreateClient orders={activeOrders} applicationTypes={appTypes} />;
}
