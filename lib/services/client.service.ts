import { db } from "@/lib/db";
import { clients } from "@/lib/schema/clients/main";
import { orders } from "@/lib/schema/orders";
import { eq } from "drizzle-orm";
import { logAction } from "@/lib/audit";
import { releaseReservationsForOrders } from "@/app/(main)/dashboard/clients/actions/utils";
import { checkClientDuplicates } from "@/app/(main)/dashboard/clients/actions/core/duplicates";

export class ClientService {
    static async createClient(
        data: typeof clients.$inferInsert & { ignoreDuplicates?: boolean },
        userId: string
    ) {
        const { ignoreDuplicates, ...clientData } = data;
        
        if (!ignoreDuplicates) {
            const dupRes = await checkClientDuplicates({ 
                phone: clientData.phone || "", 
                email: clientData.email || undefined, 
                lastName: clientData.lastName || "", 
                firstName: clientData.firstName || "" 
            });
            if (dupRes.success && (dupRes.data?.length || 0) > 0) {
                return { duplicates: dupRes.data };
            }
        }

        const fullName = [clientData.lastName, clientData.firstName, clientData.patronymic].filter(Boolean).join(" ");
        let newClientId: string | undefined;

        await db.transaction(async (tx) => {
            const [newClient] = await tx.insert(clients).values({ 
                ...clientData, 
                name: fullName, 
                managerId: clientData.managerId || null 
            }).returning();
            
            newClientId = newClient.id;
            await logAction("Создан клиент", "client", newClient.id, { name: fullName }, tx, undefined, { userId });
        });

        return { id: newClientId! };
    }

    static async updateClient(clientId: string, data: Partial<typeof clients.$inferInsert>) {
        const fullName = [data.lastName, data.firstName, data.patronymic].filter(Boolean).join(" ");
        
        await db.transaction(async (tx) => {
            const updatePayload: Record<string, unknown> = { ...data, updatedAt: new Date() };
            if (fullName) updatePayload.name = fullName;
            if (data.managerId !== undefined) updatePayload.managerId = data.managerId || null;

            await tx.update(clients).set(updatePayload).where(eq(clients.id, clientId));
            await logAction("Обновлен клиент", "client", clientId, { name: fullName || "unknown" }, tx);
        });
        
        return { id: clientId };
    }

    static async deleteClient(clientId: string) {
        await db.transaction(async (tx) => {
            const client = await tx.query.clients.findFirst({ 
                where: eq(clients.id, clientId), 
                with: { orders: true } 
            });
            
            if (client?.orders && client.orders.length > 0) {
                // Если есть заказы, снимаем резервы и удаляем. 
                // В будущем релиз резервов стоит вынести в OrderService
                await releaseReservationsForOrders(client.orders.map(o => o.id), tx);
                await tx.delete(orders).where(eq(orders.clientId, clientId));
            }
            await tx.delete(clients).where(eq(clients.id, clientId));
        });
    }

    static async updateField(clientId: string, field: string, value: unknown) {
        await db.update(clients).set({ [field]: value || null, updatedAt: new Date() }).where(eq(clients.id, clientId));
        await logAction(`Изменение поля клиента: ${field}`, "client", clientId, { field, value });
    }
}
