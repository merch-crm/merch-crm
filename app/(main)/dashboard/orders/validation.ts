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

export const SearchOrdersSchema = z.object({
    from: z.date().optional(),
    to: z.date().optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    showArchived: z.boolean().default(false),
    search: z.string().optional(),
});
