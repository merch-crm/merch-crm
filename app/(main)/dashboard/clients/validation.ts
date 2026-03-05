import { z } from "zod";

export const ClientSchema = z.object({
    lastName: z.string().min(1, "Фамилия обязательна"),
    firstName: z.string().min(1, "Имя обязательно"),
    patronymic: z.string().optional().or(z.literal("")),
    company: z.string().optional().or(z.literal("")),
    phone: z.string().min(1, "Телефон обязателен"),
    telegram: z.string().optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),
    email: z.union([z.literal(""), z.string().email("Некорректный Email")]).optional().nullable().transform(v => v === "" ? null : v),
    city: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    comments: z.string().optional().or(z.literal("")),
    socialLink: z.string().optional().or(z.literal("")),
    acquisitionSource: z.string().optional().or(z.literal("")),
    managerId: z.union([z.literal(""), z.string().uuid()]).optional().nullable().transform(v => v === "" ? null : v),
    clientType: z.enum(["b2c", "b2b"]).default("b2c"),
    ignoreDuplicates: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
});

export const ClientUpdateSchema = ClientSchema.omit({ ignoreDuplicates: true });

export const ClientFiltersSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    search: z.string().optional(),
    sortBy: z.enum(["alphabet", "last_order", "order_count", "revenue", "created"]).default("alphabet"),
    period: z.enum(["all", "month", "quarter", "year"]).default("all"),
    orderCount: z.enum(["any", "0", "1-5", "5+"]).default("any"),
    region: z.string().optional(),
    status: z.enum(["all", "lost"]).default("all"),
    showArchived: z.coerce.boolean().default(false),
    clientType: z.enum(["all", "b2c", "b2b"]).default("all"),
    managerId: z.string().optional(),
    acquisitionSource: z.string().optional(),
    rfmSegment: z.string().optional(),
    loyaltyLevelId: z.string().optional(),

    // НОВОЕ: Фильтр по активности
    activityStatus: z.enum(["all", "active", "attention", "at_risk", "inactive"]).default("all"),

    // Фильтр по сумме заказов
    minTotalAmount: z.coerce.number().optional(),
    maxTotalAmount: z.coerce.number().optional(),
});

// Описания статусов активности
export const activityStatusLabels: Record<string, string> = {
    all: "Все клиенты",
    active: "Активные",
    attention: "Требуют внимания", // 60-89 дней
    at_risk: "В зоне риска",       // 90-179 дней
    inactive: "Неактивные",        // 180+ дней
};

export const activityStatusDescriptions: Record<string, string> = {
    all: "Без фильтрации по активности",
    active: "Заказ менее 60 дней назад",
    attention: "Заказ 60-89 дней назад",
    at_risk: "Заказ 90-179 дней назад",
    inactive: "Заказ более 180 дней назад или никогда",
};

export const ClientIdSchema = z.object({
    clientId: z.string().uuid("Некорректный ID клиента"),
});

export const BulkClientsSchema = z.object({
    clientIds: z.array(z.string().uuid("Некорректный ID клиента")).min(1, "Выберите хотя бы одного клиента"),
});

export const UpdateClientFieldSchema = z.object({
    clientId: z.string().uuid("Некорректный ID клиента"),
    field: z.enum(["managerId", "clientType", "city", "lastName", "firstName", "company", "acquisitionSource"]),
    value: z.unknown(),
});
