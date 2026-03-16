"use server";

import { db } from "@/lib/db";
import {
    clientConversations,
    conversationMessages,
    communicationChannels,
    clients,
    users
} from "@/lib/schema";
import { eq, and, desc, sql, count, isNull, or, ilike } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { logError } from "@/lib/error-logger";
import { logAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type {
    ChannelType,
    ConversationStatus,
    ClientConversation
} from "@/lib/schema";
import { SendMessageSchema, CreateConversationSchema } from "./chat.schemas";
import { ConversationWithDetails, MessageWithSender } from "./chat.types";


/**
 * Получить список диалогов с фильтрацией
 */
export async function getConversations(params: {
    search?: string;
    channelType?: string;
    status?: string;
    managerId?: string;
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
}): Promise<{ success: boolean; data?: ConversationWithDetails[]; total?: number; error?: string }> {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const { search, channelType, status, managerId, unreadOnly, limit = 50, offset = 0 } = params;

        const conditions = [];

        if (channelType && channelType !== "all") {
            conditions.push(eq(clientConversations.channelType, channelType as ChannelType));
        }
        if (status && status !== "all") {
            conditions.push(eq(clientConversations.status, status as ConversationStatus));
        }
        if (managerId) {
            if (managerId === "none") {
                conditions.push(isNull(clientConversations.assignedManagerId));
            } else {
                conditions.push(eq(clientConversations.assignedManagerId, managerId));
            }
        }
        if (unreadOnly) {
            conditions.push(sql`${clientConversations.unreadCount} > 0`);
        }

        const query = db
            .select({
                id: clientConversations.id,
                clientId: clientConversations.clientId,
                clientName: sql<string>`CONCAT(${clients.lastName}, ' ', ${clients.firstName})`,
                clientCompany: clients.company,
                clientType: clients.clientType,
                clientAvatar: sql<string | null>`NULL`,
                channelType: clientConversations.channelType,
                channelName: sql<string>`COALESCE(${communicationChannels.name}, ${clientConversations.channelType})`,
                channelColor: sql<string>`COALESCE(${communicationChannels.color}, '#6B7280')`,
                status: clientConversations.status,
                unreadCount: clientConversations.unreadCount,
                lastMessageAt: clientConversations.lastMessageAt,
                lastMessagePreview: clientConversations.lastMessagePreview,
                assignedManagerId: clientConversations.assignedManagerId,
                assignedManagerName: users.name,
            })
            .from(clientConversations)
            .leftJoin(clients, eq(clientConversations.clientId, clients.id))
            .leftJoin(communicationChannels, eq(clientConversations.channelId, communicationChannels.id))
            .leftJoin(users, eq(clientConversations.assignedManagerId, users.id))
            .where(conditions.length > 0 ? (search ? and(...conditions, or(
                ilike(clients.lastName, `%${search}%`),
                ilike(clients.firstName, `%${search}%`),
                ilike(clients.company, `%${search}%`),
                ilike(clients.phone, `%${search}%`)
            )) : and(...conditions)) : (search ? or(
                ilike(clients.lastName, `%${search}%`),
                ilike(clients.firstName, `%${search}%`),
                ilike(clients.company, `%${search}%`),
                ilike(clients.phone, `%${search}%`)
            ) : undefined))
            .orderBy(desc(clientConversations.lastMessageAt))
            .limit(limit)
            .offset(offset);

        const conversations = await query;

        const [{ total }] = await db
            .select({ total: count() })
            .from(clientConversations)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return {
            success: true,
            data: conversations as ConversationWithDetails[],
            total: Number(total)
        };
    } catch (error) {
        logError({ error, details: { action: "getConversations" } });
        return { success: false, error: "Не удалось загрузить диалоги" };
    }
}

/**
 * Получить сообщения диалога
 */
export async function getConversationMessages(
    conversationId: string,
    limit: number = 50,
    before?: string
): Promise<{ success: boolean; data?: MessageWithSender[]; hasMore?: boolean; error?: string }> {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Не авторизован" };

        const conditions = [eq(conversationMessages.conversationId, conversationId)];

        if (before) {
            conditions.push(sql`${conversationMessages.sentAt} < ${before}`);
        }

        const messages = await db
            .select({
                id: conversationMessages.id,
                conversationId: conversationMessages.conversationId,
                direction: conversationMessages.direction,
                messageType: conversationMessages.messageType,
                content: conversationMessages.content,
                mediaUrl: conversationMessages.mediaUrl,
                status: conversationMessages.status,
                sentAt: conversationMessages.sentAt,
                sentById: conversationMessages.sentById,
                sentByName: users.name,
                sentByAvatar: users.avatar,
            })
            .from(conversationMessages)
            .leftJoin(users, eq(conversationMessages.sentById, users.id))
            .where(and(...conditions))
            .orderBy(desc(conversationMessages.sentAt))
            .limit(limit + 1);

        const hasMore = messages.length > limit;
        const data = hasMore ? messages.slice(0, limit) : messages;

        await db
            .update(conversationMessages)
            .set({
                status: "read",
                readAt: new Date()
            })
            .where(
                and(
                    eq(conversationMessages.conversationId, conversationId),
                    eq(conversationMessages.direction, "inbound"),
                    sql`${conversationMessages.status} != 'read'`
                )
            );

        await db
            .update(clientConversations)
            .set({ unreadCount: 0 })
            .where(eq(clientConversations.id, conversationId));

        return {
            success: true,
            data: data.reverse() as MessageWithSender[],
            hasMore
        };
    } catch (error) {
        logError({ error, details: { action: "getConversationMessages", conversationId } });
        return { success: false, error: "Не удалось загрузить сообщения" };
    }
}

/**
 * Отправить сообщение
 */
export async function sendMessage(
    data: z.infer<typeof SendMessageSchema>
): Promise<{ success: boolean; data?: MessageWithSender; error?: string }> {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Не авторизован" };

        const validated = SendMessageSchema.parse(data);

        const [message] = await db
            .insert(conversationMessages)
            .values({
                conversationId: validated.conversationId,
                direction: "outbound",
                messageType: validated.messageType,
                content: validated.content,
                mediaUrl: validated.mediaUrl,
                status: "sent",
                sentById: session.id,
                sentAt: new Date(),
            })
            .returning();

        await db
            .update(clientConversations)
            .set({
                lastMessageAt: new Date(),
                lastMessagePreview: validated.content.slice(0, 100),
                updatedAt: new Date(),
            })
            .where(eq(clientConversations.id, validated.conversationId));

        const user = await db.query.users.findFirst({
            where: eq(users.id, session.id),
        });

        await logAction(
            "send_message",
            "conversation",
            validated.conversationId,
            { messageId: message.id }
        );

        revalidatePath("/dashboard/communications");

        return {
            success: true,
            data: {
                ...message,
                sentByName: user?.name || null,
                sentByAvatar: user?.avatar || null,
            } as MessageWithSender,
        };
    } catch (error) {
        logError({ error, details: { action: "sendMessage", data } });
        return { success: false, error: "Не удалось отправить сообщение" };
    }
}

/**
 * Создать новый диалог с клиентом
 */
export async function createConversation(
    data: z.infer<typeof CreateConversationSchema>
): Promise<{ success: boolean; data?: ClientConversation; error?: string }> {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: "Не авторизован" };

        const validated = CreateConversationSchema.parse(data);

        const existing = await db.query.clientConversations.findFirst({
            where: and(
                eq(clientConversations.clientId, validated.clientId),
                eq(clientConversations.channelType, validated.channelType as ChannelType)
            ),
        });

        if (existing) {
            return { success: true, data: existing };
        }

        const channel = await db.query.communicationChannels.findFirst({
            where: eq(communicationChannels.channelType, validated.channelType as ChannelType),
        });

        const [conversation] = await db
            .insert(clientConversations)
            .values({
                clientId: validated.clientId,
                channelId: channel?.id,
                channelType: validated.channelType as ChannelType,
                status: "active",
                assignedManagerId: session.id,
            })
            .returning();

        await logAction(
            "create_conversation",
            "conversation",
            conversation.id,
            { clientId: validated.clientId, channelType: validated.channelType }
        );

        revalidatePath("/dashboard/communications");

        return { success: true, data: conversation };
    } catch (error) {
        logError({ error, details: { action: "createConversation", data } });
        return { success: false, error: "Не удалось создать диалог" };
    }
}

/**
 * Получить диалоги клиента
 */
export async function getClientConversations(clientId: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Не авторизован" };

    try {
        const conversations = await db
            .select({
                id: clientConversations.id,
                channelType: clientConversations.channelType,
                channelName: communicationChannels.name,
                channelColor: communicationChannels.color,
                status: clientConversations.status,
                unreadCount: clientConversations.unreadCount,
                lastMessageAt: clientConversations.lastMessageAt,
                lastMessagePreview: clientConversations.lastMessagePreview,
            })
            .from(clientConversations)
            .leftJoin(communicationChannels, eq(clientConversations.channelId, communicationChannels.id))
            .where(eq(clientConversations.clientId, clientId))
            .orderBy(desc(clientConversations.lastMessageAt));

        return { success: true, data: conversations };
    } catch (error) {
        logError({ error, details: { action: "getClientConversations", clientId } });
        return { success: false, error: "Не удалось загрузить диалоги клиента" };
    }
}
