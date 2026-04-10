"use server";

import { db } from "@/lib/db";
import { clientConversations, conversationMessages, communicationChannels } from "@/lib/schema/communications";
import { clients } from "@/lib/schema/clients/main";
import { users } from "@/lib/schema/users";
import { eq, and, desc, sql, count, isNull, or, ilike } from "drizzle-orm";
import { logAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type {
  ChannelType,
  ConversationStatus,
  ClientConversation,
} from "@/lib/schema/communications";
import { SendMessageSchema, CreateConversationSchema } from "./chat.schemas";
import { ConversationWithDetails, MessageWithSender } from "./chat.types";
import { type ActionResult, ok } from "@/lib/types";
import { withAuth } from "@/lib/action-helpers";


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
}): Promise<ActionResult<ConversationWithDetails[] & { total: number }>> {
  return withAuth(async () => {
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
        channelNameStatic: communicationChannels.name,
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

    // TypeScript type assertion fix for complex select joins
    const conversations = await query as unknown as ConversationWithDetails[];

    const [totalRes] = await db
      .select({ total: count() })
      .from(clientConversations)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(totalRes?.total || 0);

    const result = Object.assign(conversations, { total });
    return ok(result as ConversationWithDetails[] & { total: number });
  }, { errorPath: "getConversations" });
}

/**
 * Получить сообщения диалога
 */
export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
  before?: string
): Promise<ActionResult<MessageWithSender[] & { hasMore: boolean }>> {
  return withAuth(async () => {
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
        sentByAvatar: users.image,
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

    const result = data.reverse() as MessageWithSender[];
    const extendedResult = Object.assign(result, { hasMore });

    return ok(extendedResult as MessageWithSender[] & { hasMore: boolean });
  }, { errorPath: "getConversationMessages" });
}

/**
 * Отправить сообщение
 */
export async function sendMessage(
  data: z.infer<typeof SendMessageSchema>
): Promise<ActionResult<MessageWithSender>> {
  return withAuth(async (session) => {
    const validated = SendMessageSchema.parse(data);

    const [message] = await db
      .insert(conversationMessages)
      .values({
        conversationId: validated.conversationId,
        direction: "outbound",
        messageType: validated.messageType,
        content: validated.content,
        mediaUrl: validated.mediaUrl || null,
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

    return ok({
      ...message,
      sentByName: user?.name || null,
      sentByAvatar: user?.image || null,
    } as MessageWithSender);
  }, { errorPath: "sendMessage" });
}

/**
 * Создать новый диалог с клиентом
 */
export async function createConversation(
  data: z.infer<typeof CreateConversationSchema>
): Promise<ActionResult<ClientConversation>> {
  return withAuth(async (session) => {
    const validated = CreateConversationSchema.parse(data);

    const existing = await db.query.clientConversations.findFirst({
      where: and(
        eq(clientConversations.clientId, validated.clientId),
        eq(clientConversations.channelType, validated.channelType as ChannelType)
      ),
    });

    if (existing) {
      return ok(existing);
    }

    const channel = await db.query.communicationChannels.findFirst({
      where: eq(communicationChannels.channelType, validated.channelType as ChannelType),
    });

    const [conversation] = await db
      .insert(clientConversations)
      .values({
        clientId: validated.clientId,
        channelId: channel?.id || null,
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

    return ok(conversation);
  }, { errorPath: "createConversation" });
}

/**
 * Получить диалоги клиента
 */
export async function getClientConversations(clientId: string): Promise<ActionResult<Record<string, unknown>[]>> {
  return withAuth(async () => {
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

    // Fix any types by using Record<string, unknown>
    return ok(conversations as unknown as Record<string, unknown>[]);
  }, { errorPath: "getClientConversations" });
}
