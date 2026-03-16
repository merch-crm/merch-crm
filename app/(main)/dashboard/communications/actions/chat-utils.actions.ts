"use server";

import { db } from "@/lib/db";
import {
    messageTemplates,
    communicationChannels,
    clientConversations
} from "@/lib/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { logError } from "@/lib/error-logger";
import { getSession } from "@/lib/session";
import { logAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type {
    TemplateCategory
} from "@/lib/schema";
import {
    AssignManagerSchema,
    TemplateUsageSchema,
    GetTemplatesSchema
} from "./chat.schemas";

/**
 * Получить список каналов коммуникации
 */
export async function getCommunicationChannels() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const channels = await db
            .select()
            .from(communicationChannels)
            .where(eq(communicationChannels.isActive, true))
            .orderBy(communicationChannels.name);

        return { success: true, data: channels };
    } catch (error) {
        logError({ error, details: { action: "getCommunicationChannels" } });
        return { success: false, error: "Не удалось загрузить каналы" };
    }
}

/**
 * Получить шаблоны сообщений
 */
export async function getMessageTemplates(category?: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const validated = GetTemplatesSchema.parse({ category });
        const conditions = [eq(messageTemplates.isActive, true)];

        if (validated.category && validated.category !== "all") {
            conditions.push(eq(messageTemplates.category, validated.category as TemplateCategory));
        }

        const templates = await db
            .select()
            .from(messageTemplates)
            .where(and(...conditions))
            .orderBy(desc(messageTemplates.usageCount));

        return { success: true, data: templates };
    } catch (error) {
        logError({ error, details: { action: "getMessageTemplates", category } });
        return { success: false, error: "Не удалось загрузить шаблоны" };
    }
}

/**
 * Использовать шаблон (увеличить счётчик)
 */
export async function useTemplate(templateId: string) {
    const session = await getSession();
    if (!session) return { success: false };

    try {
        const validated = TemplateUsageSchema.parse({ templateId });
        await db
            .update(messageTemplates)
            .set({
                usageCount: sql`${messageTemplates.usageCount} + 1`
            })
            .where(eq(messageTemplates.id, validated.templateId));

        return { success: true };
    } catch (error) {
        logError({ error, details: { action: "useTemplate", templateId } });
        return { success: false };
    }
}

/**
 * Получить статистику по коммуникациям
 */
export async function getCommunicationsStats() {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const [stats] = await db
            .select({
                totalConversations: count(),
                activeConversations: sql<number>`COUNT(*) FILTER (WHERE ${clientConversations.status} = 'active')`,
                unreadConversations: sql<number>`COUNT(*) FILTER (WHERE ${clientConversations.unreadCount} > 0)`,
                totalUnreadMessages: sql<number>`COALESCE(SUM(${clientConversations.unreadCount}), 0)`,
            })
            .from(clientConversations);

        // Статистика по каналам
        const channelStats = await db
            .select({
                channelType: clientConversations.channelType,
                count: count(),
                unread: sql<number>`COALESCE(SUM(${clientConversations.unreadCount}), 0)`,
            })
            .from(clientConversations)
            .groupBy(clientConversations.channelType);

        return {
            success: true,
            data: {
                ...stats,
                byChannel: channelStats,
            },
        };
    } catch (error) {
        logError({ error, details: { action: "getCommunicationsStats" } });
        return { success: false, error: "Не удалось загрузить статистику" };
    }
}

/**
 * Назначить менеджера на диалог
 */
export async function assignConversationManager(
    conversationId: string,
    managerId: string | null
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Не авторизован" };

        const validated = AssignManagerSchema.parse({ conversationId, managerId });

        await db
            .update(clientConversations)
            .set({
                assignedManagerId: validated.managerId,
                updatedAt: new Date()
            })
            .where(eq(clientConversations.id, validated.conversationId));

        await logAction(
            "assign_conversation",
            "conversation",
            validated.conversationId,
            { managerId: validated.managerId }
        );

        revalidatePath("/dashboard/communications");

        return { success: true };
    } catch (error) {
        logError({ error, details: { action: "assignConversationManager", conversationId, managerId } });
        return { success: false, error: "Не удалось назначить менеджера" };
    }
}
