/**
 * Стабильные ключи ролей (slugs).
 * Используются в коде для проверки прав доступа вместо локализованных названий.
 */
export const ROLE_SLUGS = {
  ADMIN: "admin",
  MANAGEMENT: "management", // Руководство
  MANAGER: "manager",       // Менеджер / Управляющий
  SALES: "sales",           // Отдел продаж
  DESIGNER: "designer",     // Дизайнер
  PRINTER: "printer",       // Печатник
  EMBROIDERER: "embroiderer", // Вышивальщик
  WAREHOUSE: "warehouse",   // Кладовщик
  INSTALLER: "installer",   // Монтажник
} as const;

export type RoleSlug = typeof ROLE_SLUGS[keyof typeof ROLE_SLUGS];

/** Роли с административным доступом */
export const ADMIN_ROLE_SLUGS: RoleSlug[] = [ROLE_SLUGS.ADMIN, ROLE_SLUGS.MANAGEMENT];

/**
 * Проверяет, является ли роль административной.
 * @param slug - Ключ роли (slug)
 */
export const isAdmin = (slug: string | null | undefined): boolean => {
  if (!slug) return false;
  return (ADMIN_ROLE_SLUGS as string[]).includes(slug);
};

/**
 * Проверяет, может ли роль управлять заказами.
 * @param slug - Ключ роли (slug)
 */
export const canManageOrders = (slug: string | null | undefined): boolean => {
  if (!slug) return false;
  return ([ROLE_SLUGS.ADMIN, ROLE_SLUGS.MANAGEMENT, ROLE_SLUGS.MANAGER] as string[]).includes(slug);
};

// Legacy support (to be removed after full refactor)
export const ADMIN_ROLES = ["Администратор", "Руководство"] as const;
export type AdminRole = typeof ADMIN_ROLES[number];

export type AppRole = 
  | "Администратор" 
  | "Руководство" 
  | "Менеджер" 
  | "Дизайнер" 
  | "Печатник" 
  | "Вышивальщик" 
  | "Кладовщик";
