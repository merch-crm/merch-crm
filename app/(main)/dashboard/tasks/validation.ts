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
