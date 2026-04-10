import { z } from "zod";

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(4000),
  messageType: z.enum(["text", "image", "file"]).default("text"),
  mediaUrl: z.string().url().optional(),
});

export const CreateConversationSchema = z.object({
  clientId: z.string().uuid(),
  channelType: z.enum(["telegram", "instagram", "vk", "whatsapp", "email", "sms"]),
});
export const AssignManagerSchema = z.object({
  conversationId: z.string().uuid(),
  managerId: z.string().uuid().nullable(),
});

export const TemplateUsageSchema = z.object({
  templateId: z.string().uuid(),
});

export const GetTemplatesSchema = z.object({
  category: z.string().optional(),
});
