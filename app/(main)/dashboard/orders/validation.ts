import { z } from "zod";

export const CreateOrderSchema = z.object({
    clientId: z.string().uuid({ message: "Invalid client ID" }),
    priority: z.enum(["low", "medium", "high", "normal"]).default("normal"), // "normal" found in code often? Code uses "low", "medium", "high" usually. Let's check schema.
    isUrgent: z.preprocess((val) => val === "true" || val === true, z.boolean()),
    advanceAmount: z.string().regex(/^-?\d+(\.\d+)?$/, "Invalid amount").default("0"),
    promocodeId: z.string().uuid().optional().nullable().or(z.literal("")),
    paymentMethod: z.enum(["cash", "bank", "online", "account"]).default("cash"),
    deadline: z.string().optional().nullable().or(z.literal("")).transform((val) => val ? new Date(val) : null),
    items: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                try {
                    return JSON.parse(val);
                } catch {
                    return [];
                }
            }
            return val;
        },
        z.array(z.object({
            inventoryId: z.string().uuid().optional().nullable(),
            quantity: z.number().min(0.01, "Quantity must be positive"), // Float quantity allowed?
            price: z.number().min(0, "Price must be non-negative"),
            description: z.string().min(1, "Description is required"),
        }))
    ),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderPrioritySchema = z.object({
    priority: z.enum(["low", "medium", "high", "normal"]),
});

export const OrderIdSchema = z.object({
    orderId: z.string().uuid("Некорректный ID заказа"),
});

export const UpdateOrderStatusSchema = z.object({
    orderId: z.string().uuid("Некорректный ID заказа"),
    newStatus: z.enum(["new", "design", "production", "done", "shipped", "cancelled"]),
    reason: z.string().optional(),
});

export const BulkOrdersSchema = z.object({
    orderIds: z.array(z.string().uuid("Некорректный ID заказа")).min(1, "Выберите хотя бы один заказ"),
});

export const AddPaymentSchema = z.object({
    orderId: z.string().uuid("Некорректный ID заказа"),
    amount: z.number().min(0.01, "Сумма должна быть больше 0"),
    method: z.enum(["cash", "bank", "online", "account"]),
    isAdvance: z.boolean().default(false),
    comment: z.string().optional(),
});

export const RefundOrderSchema = z.object({
    orderId: z.string().uuid("Некорректный ID заказа"),
    amount: z.number().min(0.01, "Сумма должна быть больше 0"),
    reason: z.string().min(1, "Укажите причину возврата"),
});

export const UpdateOrderFieldSchema = z.object({
    orderId: z.string().uuid("Некорректный ID заказа"),
    field: z.string(),
    value: z.union([z.string(), z.number(), z.boolean(), z.date()]).nullable(),
});
