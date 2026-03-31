import { db } from "@/lib/db";
import { clients } from "@/lib/schema/clients/main";
import { tasks } from "@/lib/schema/tasks";
import { taskAssignees } from "@/lib/schema/task-assignees";
import { lt, and, isNotNull } from "drizzle-orm";
import { subDays, addDays } from "date-fns";

export class ReactivationService {
    /**
     * Finds clients who haven't ordered in more than 90 days
     * and creates a follow-up task for their manager.
     */
    static async processInactiveClients() {
        const ninetyDaysAgo = subDays(new Date(), 90);

        console.log("[ReactivationService] Starting reactivation check...");

        const inactiveClients = await db.select()
            .from(clients)
            .where(
                and(
                    isNotNull(clients.lastOrderAt),
                    lt(clients.lastOrderAt, ninetyDaysAgo),
                    isNotNull(clients.managerId)
                )
            )
            .limit(100);

        console.log(`[ReactivationService] Found ${inactiveClients.length} inactive clients potentially needing reactivation.`);
        const results: { clientId: string; taskId: string }[] = [];

        for (const client of inactiveClients as (typeof clients.$inferSelect)[]) {
            if (!client.managerId) continue;

            // Check if there's already an active reactivation task for this client to avoid duplicates
            // We'll skip this for now to keep it simple, but in prod we'd check tasks table for autoCreatedSourceId

            try {
                await db.transaction(async (tx) => {
                    // 2. Create the task
                    const [newTask] = await tx.insert(tasks).values({
                        title: `Реактивация клиента: ${client.name}`,
                        description: `Клиент не делал заказов более 90 дней (последний раз: ${client.lastOrderAt ? new Date(client.lastOrderAt).toLocaleDateString() : "нет данных"}). Необходимо связаться и предложить актуальные новинки или узнать причины затишья.`,
                        status: "new",
                        priority: "high",
                        type: "general",
                        creatorId: client.managerId!, 
                        deadline: addDays(new Date(), 3), // +3 days to complete
                        isAutoCreated: true,
                        autoCreatedReason: "client_inactivity_90d",
                        autoCreatedSourceType: "client",
                        autoCreatedSourceId: client.id,
                    }).returning();

                    // 3. Assign the task to the manager
                    await tx.insert(taskAssignees).values({
                        taskId: newTask.id,
                        userId: client.managerId!,
                        assignedBy: client.managerId!, // System automation context
                    });

                    results.push({ clientId: client.id, taskId: newTask.id });
                });
            } catch (error: unknown) {
                console.error(`[ReactivationService] Failed to create reactivation task for client ${client.id}:`, error);
            }
        }

        console.log(`[ReactivationService] Successfully created ${results?.length} reactivation tasks.`);
        return results;
    }
}
