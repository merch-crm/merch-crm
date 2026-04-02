"use server";

import { db } from "@/lib/db";
import {
    messageTemplates,
    communicationChannels,
    clientConversations
} from "@/lib/schema/communications";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { logAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type {
    TemplateCategory
} from "@/lib/schema/communications";
import {
    AssignManagerSchema,
    TemplateUsageSchema,
    GetTemplatesSchema
} from "./chat.schemas";

import { type ActionResult, ok, okVoid } from "@/lib/types";
import { withAuth } from "@/lib/action-helpers";

/**
 * Получить список каналов коммуникации
 */
export async function getCommunicationChannels(): Promise<ActionResult<Record<string, unknown>[]>> {
    return withAuth(async () => {
        const channels = await db
            .select()
            .from(communicationChannels)
            .where(eq(communicationChannels.isActive, true))
            .orderBy(communicationChannels.name);

        return ok(channels as unknown as Record<string, unknown>[]);
    }, { errorPath: "getCommunicationChannels" });
}

/**
 * Получить шаблоны сообщений
 */
export async function getMessageTemplates(category?: string): Promise<ActionResult<Record<string, unknown>[]>> {
    return withAuth(async () => {
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

        return ok(templates as unknown as Record<string, unknown>[]);
    }, { errorPath: "getMessageTemplates" });
}

/**
 * Использовать шаблон (увеличить счётчик)
 */
export async function useTemplate(templateId: string): Promise<ActionResult<void>> {
    return withAuth(async () => {
        const validated = TemplateUsageSchema.parse({ templateId });
        await db
            .update(messageTemplates)
            .set({
                usageCount: sql`${messageTemplates.usageCount} + 1`
            })
            .where(eq(messageTemplates.id, validated.templateId));

        return okVoid();
    }, { errorPath: "useTemplate" });
}

/**
 * Получить статистику по коммуникациям
 */
export async function getCommunicationsStats(): Promise<ActionResult<Record<string, unknown>>> {
    return withAuth(async () => {
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

        return ok({
            ...stats,
            byChannel: channelStats,
        });
    }, { errorPath: "getCommunicationsStats" });
}

/**
 * Назначить менеджера на диалог
 */
export async function assignConversationManager(
    conversationId: string,
    managerId: string | null
): Promise<ActionResult<void>> {
    return withAuth(async () => {
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

        return okVoid();
    }, { errorPath: "assignConversationManager" });
}
