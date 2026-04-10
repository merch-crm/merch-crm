"use server";

import { okVoid, type ActionResult } from "@/lib/types";

import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { ROLE_SLUGS } from "@/lib/roles";
import { clients } from "@/lib/schema/clients/main";
import { orders } from "@/lib/schema/orders";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { BulkClientsSchema } from "../validation";
import { releaseReservationsForOrders } from "./utils";
import { withAuth, ActionError } from "@/lib/action-helpers";


export async function bulkDeleteClients(clientIds: string[]): Promise<ActionResult> {
  return withAuth(async () => {
    try {
      const validated = BulkClientsSchema.safeParse({ clientIds });
      if (!validated.success) return { success: false, error: validated.error.issues[0].message };

      await db.transaction(async (tx) => {
        const clientOrders = await tx.query.orders.findMany({ where: inArray(orders.clientId, clientIds), limit: 500 });
        if (clientOrders.length > 0) {
          await releaseReservationsForOrders(clientOrders.map(o => o.id), tx);
          await tx.delete(orders).where(inArray(orders.clientId, clientIds));
        }
        await tx.delete(clients).where(inArray(clients.id, clientIds));
      });

      revalidatePath("/dashboard/clients");
      await logAction("Групповое удаление клиентов", "client", "bulk", { count: clientIds.length });
      return okVoid();
    } catch (_error) {
      throw new ActionError("Ошибка при удалении", "INTERNAL_ERROR");
    }
  }, { roles: [ROLE_SLUGS.ADMIN], errorPath: "bulkDeleteClients" });
}

export async function bulkUpdateClientManager(clientIds: string[], managerId: string): Promise<ActionResult> {
  return withAuth(async () => {
    try {
      const validated = BulkClientsSchema.safeParse({ clientIds });
      if (!validated.success) return { success: false, error: "Ошибка валидации" };

      await db.update(clients).set({ managerId: managerId || null, updatedAt: new Date() }).where(inArray(clients.id, clientIds));
      await logAction("Групповая смена менеджера", "client", "bulk", { count: clientIds.length, managerId });

      revalidatePath("/dashboard/clients");
      return okVoid();
    } catch (_error) {
      throw new ActionError("Ошибка при обновлении", "INTERNAL_ERROR");
    }
  }, { roles: [ROLE_SLUGS.ADMIN, ROLE_SLUGS.MANAGEMENT, ROLE_SLUGS.SALES], errorPath: "bulkUpdateClientManager" });
}

export async function bulkArchiveClients(clientIds: string[], isArchived: boolean = true): Promise<ActionResult> {
  return withAuth(async () => {
    try {
      const validated = BulkClientsSchema.safeParse({ clientIds });
      if (!validated.success) return { success: false, error: "Ошибка валидации" };

      await db.update(clients).set({ isArchived, updatedAt: new Date() }).where(inArray(clients.id, clientIds));
      await logAction(isArchived ? "Групповая архивация" : "Групповая разархивация", "client", "bulk", { count: clientIds.length, isArchived });

      revalidatePath("/dashboard/clients");
      return okVoid();
    } catch (_error) {
      throw new ActionError("Ошибка при архивации", "INTERNAL_ERROR");
    }
  }, { roles: [ROLE_SLUGS.ADMIN, ROLE_SLUGS.MANAGEMENT, ROLE_SLUGS.SALES], errorPath: "bulkArchiveClients" });
}
