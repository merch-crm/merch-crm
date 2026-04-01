import { ErrorCode } from "@/lib/types";

// ═══════════════════════════════════════════════════════════
// Типы
// ═══════════════════════════════════════════════════════════

export interface SessionUser {
  id: string;
  sessionId: string;
  email: string;
  name: string;
  roleName: string;
  roleSlug: string;
  roleId?: string;
  departmentName: string | null;
}

export interface UserWithRelations {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; slug: string; permissions: Record<string, boolean> } | null;
  department: { id: string; name: string } | null;
}

export type RoleCheck = string[] | ((roleSlug: string, user: UserWithRelations) => boolean);

export interface WithAuthOptions {
  /** Список разрешённых ролей или функция проверки */
  roles?: RoleCheck;
  /** Загрузить полные данные пользователя из БД */
  loadUser?: boolean;
  /** Путь для логирования ошибок */
  errorPath?: string;
}

// ═══════════════════════════════════════════════════════════
// Кастомные ошибки
// ═══════════════════════════════════════════════════════════

/**
 * Ошибка для выброса внутри action
 */
export class ActionError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ActionError';
  }
}

// Фабрики для удобства
export const NotFoundError = (entity: string) => 
  new ActionError(`${entity} не найден`, 'NOT_FOUND');

export const ValidationError = (message: string) => 
  new ActionError(message, 'VALIDATION_ERROR');

export const ForbiddenError = () => 
  new ActionError('Недостаточно прав', 'FORBIDDEN');

// ═══════════════════════════════════════════════════════════
// Константы ролей
// ═══════════════════════════════════════════════════════════

import { ROLE_SLUGS } from "@/lib/roles";

export const ROLES = {
  ADMIN: ROLE_SLUGS.ADMIN,
  MANAGEMENT: ROLE_SLUGS.MANAGEMENT,
  MANAGER: ROLE_SLUGS.MANAGER,
  SALES: ROLE_SLUGS.SALES,
  DESIGNER: ROLE_SLUGS.DESIGNER,
  PRINTER: ROLE_SLUGS.PRINTER,
  EMBROIDERY: ROLE_SLUGS.EMBROIDERER,
  WAREHOUSE: ROLE_SLUGS.WAREHOUSE,
} as const;

export const ROLE_GROUPS = {
  /** Полный доступ */
  ADMINS: [ROLES.ADMIN, ROLES.MANAGEMENT] as string[],
  
  /** Могут редактировать заказы */
  CAN_EDIT_ORDERS: [
    ROLES.ADMIN, 
    ROLES.MANAGEMENT, 
    ROLES.SALES, 
    ROLES.DESIGNER,
    ROLES.PRINTER,
    ROLES.EMBROIDERY,
    ROLES.WAREHOUSE,
  ] as string[],
  
  /** Скрывать телефон клиента */
  HIDE_CLIENT_PHONE: [ROLES.PRINTER, ROLES.DESIGNER] as string[],
  
  /** Производственные роли */
  PRODUCTION: [ROLES.DESIGNER, ROLES.PRINTER, ROLES.EMBROIDERY] as string[],
  
  /** Могут управлять складом */
  CAN_MANAGE_WAREHOUSE: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.WAREHOUSE] as string[],

  /** Могут работать с клиентами */
  CAN_EDIT_CLIENTS: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SALES] as string[],

  /** Могут просматривать аналитику */
  CAN_VIEW_ANALYTICS: [ROLES.ADMIN, ROLES.MANAGEMENT] as string[],
} as const;
