import { z } from "zod";

export const CreateTaskSchema = z.object({
    orderId: z.string().uuid(),
    orderItemId: z.string().uuid().optional().nullable(),
    title: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    applicationTypeId: z.string().uuid().optional().nullable(),
    sourceDesignId: z.string().uuid().optional().nullable(),
    printArea: z.string().optional().nullable(),
    quantity: z.number().int().min(1).optional(),
    colors: z.number().int().min(1).optional().nullable(),
    dueDate: z.date().optional().nullable(),
    clientNotes: z.string().optional().nullable(),
    priority: z.number().int().min(0).max(2).optional(),
});

export const UploadFileSchema = z.object({
    taskId: z.string().uuid(),
    type: z.enum(["source", "preview", "mockup", "client_file"]),
    file: z.any(), // File object
    comment: z.string().optional().nullable(),
});

export const GetStatsSchema = z.object({});
