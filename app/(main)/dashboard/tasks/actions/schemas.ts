import { z } from "zod";

export const taskIdSchema = z.string().uuid("Некорректный ID задачи");
export const userIdSchema = z.string().uuid("Некорректный ID пользователя");
export const contentSchema = z.string().min(1, "Обязательное поле").max(2000, "Слишком длинный текст");

export const actionWithTaskIdSchema = z.object({
  taskId: taskIdSchema,
});

export const actionWithTaskIdAndUserIdSchema = z.object({
  taskId: taskIdSchema,
  userId: userIdSchema,
});

export const actionWithTaskIdAndContentSchema = z.object({
  taskId: taskIdSchema,
  content: contentSchema,
});

export const attachmentSchema = z.object({
  fileName: z.string().min(1),
  fileKey: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().optional(),
  contentType: z.string().optional(),
});

export const autoTaskInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["general", "design", "production", "embroidery", "printing"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  departmentId: z.string().uuid().optional(),
  roleName: z.string().optional(),
  sourceType: z.string().min(1),
  sourceId: z.string().min(1),
});

export const delegateTaskInputSchema = z.object({
  taskId: taskIdSchema,
  newAssigneeIds: z.array(userIdSchema).min(1),
  removeCurrentAssignees: z.boolean().optional(),
  reason: z.string().optional(),
});

export const taskFiltersSchema = z.object({
  status: z.array(z.string()).optional(),
  priority: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  departmentId: z.string().optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
});

export const saveFilterPresetSchema = z.object({
  name: z.string().min(1),
  filters: taskFiltersSchema,
});



