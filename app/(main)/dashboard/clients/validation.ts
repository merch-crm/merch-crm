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
