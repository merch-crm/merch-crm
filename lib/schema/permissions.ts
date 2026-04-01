import { z } from "zod";

/**
 * Схема разрешений для ролей MerchCRM.
 * Используется для валидации поля permissions (jsonb) в таблице roles.
 */
export const PermissionsSchema = z.object({
  // Управление заказами
  "orders:read": z.boolean().default(false),
  "orders:write": z.boolean().default(false),
  "orders:delete": z.boolean().default(false),
  "orders:manage_status": z.boolean().default(false),
  "orders:export": z.boolean().default(false),

  // Клиенты
  "clients:read": z.boolean().default(false),
  "clients:write": z.boolean().default(false),
  "clients:delete": z.boolean().default(false),

  // Склад
  "inventory:read": z.boolean().default(false),
  "inventory:write": z.boolean().default(false),
  "inventory:manage_stock": z.boolean().default(false),

  // Финансы
  "finance:view_stats": z.boolean().default(false),
  "finance:manage_payments": z.boolean().default(false),
  "finance:manage_expenses": z.boolean().default(false),

  // Производство
  "production:read": z.boolean().default(false),
  "production:manage_stages": z.boolean().default(false),

  // Дизайн
  "design:read": z.boolean().default(false),
  "design:manage_files": z.boolean().default(false),

  // Администрирование
  "admin:access": z.boolean().default(false),
  "admin:manage_users": z.boolean().default(false),
  "admin:manage_settings": z.boolean().default(false),
  "admin:view_logs": z.boolean().default(false),
}).partial(); // .partial() позволяет не указывать все поля сразу

/** Тип разрешений на основе схемы */
export type Permissions = z.infer<typeof PermissionsSchema>;

/** Значения по умолчанию для новой роли */
export const DEFAULT_PERMISSIONS: Permissions = {};

/** Хелпер для проверки наличия разрешения */
export const hasPermission = (permissions: unknown, key: keyof Permissions): boolean => {
  const parsed = PermissionsSchema.safeParse(permissions);
  if (!parsed.success) return false;
  return !!parsed.data[key];
};
