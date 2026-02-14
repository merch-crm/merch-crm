import { z } from "zod";

export const CreateUserSchema = z.object({
    name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
    email: z.string().email("Некорректный email"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    roleId: z.string().uuid("Выберите корректную роль"),
    departmentId: z.string().uuid("Выберите корректный отдел").nullable().optional().or(z.literal("")),
});

export const UpdateUserSchema = z.object({
    name: z.string().min(2, "Имя должно содержать минимум 2 символа").optional(),
    email: z.string().email("Некорректный email").optional(),
    roleId: z.string().uuid("Выберите корректную роль").optional(),
    departmentId: z.string().uuid("Выберите корректный отдел").nullable().optional().or(z.literal("")),
    isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
});

export const UpdateRoleSchema = z.object({
    name: z.string().min(2, "Название роли должно содержать минимум 2 символа").optional(),
    description: z.string().optional().or(z.literal("")),
    departmentId: z.string().uuid("Выберите корректный отдел").nullable().optional().or(z.literal("")),
    color: z.string().optional().nullable(),
});

export const CreateRoleSchema = z.object({
    name: z.string().min(2, "Название роли должно содержать минимум 2 символа"),
    description: z.string().optional().or(z.literal("")),
    departmentId: z.string().uuid("Выберите корректный отдел").nullable().optional().or(z.literal("")),
});

export const CreateDepartmentSchema = z.object({
    name: z.string().min(2, "Название отдела должно содержать минимум 2 символа"),
    description: z.string().optional().or(z.literal("")),
    color: z.string().optional(),
});

export const UpdateDepartmentSchema = z.object({
    name: z.string().min(2, "Название отдела должно содержать минимум 2 символа").optional(),
    description: z.string().optional().or(z.literal("")),
    color: z.string().optional(),
});
