import { z } from "zod";

export const CreateTaskSchema = z.object({
    title: z.string().min(1, "Заголовок обязателен"),
    description: z.string().optional().or(z.literal("")),
    priority: z.enum(["low", "normal", "high"]).default("normal"),
    type: z.enum(["design", "production", "acquisition", "delivery", "other"]).default("other"),
    orderId: z.string().uuid().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    assignedToUserId: z.string().uuid().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    assignedToRoleId: z.string().uuid().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    assignedToDepartmentId: z.string().uuid().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    dueDate: z.string().optional().or(z.literal("")).transform(v => v ? new Date(v) : null),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
    status: z.enum(["new", "in_progress", "review", "done", "archived"]).optional(),
});

export const TaskIdSchema = z.object({
    taskId: z.string().uuid("Некорректный ID задачи"),
});

export const TaskContentSchema = z.object({
    content: z.string().min(1, "Контент не может быть пустым"),
});

export const ChecklistItemSchema = z.object({
    itemId: z.string().uuid("Некорректный ID пункта"),
});
