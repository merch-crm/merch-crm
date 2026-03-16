/**
 * Discriminated union для результатов server actions.
 * 
 * При success: true — TypeScript знает, что есть data
 * При success: false — TypeScript знает, что есть error
 * 
 * @example
 * const result = await getOrders();
 * if (result.success) {
 *   console.log(result.data); // ✅ TypeScript знает что data существует
 * } else {
 *   console.log(result.error); // ✅ TypeScript знает что error существует
 * }
 */
export type ActionResult<T = void> = 
  | ActionSuccess<T>
  | ActionFailure;

export interface ActionSuccess<T> {
  success: true;
  data: T;
}

export interface ActionFailure {
  success: false;
  error: string;
  code?: ErrorCode;
  issues?: string[];
}

/**
 * Type guard для проверки успешности результата
 */
export function isSuccess<T>(result: ActionResult<T>): result is ActionSuccess<T> {
  return result.success;
}

/**
 * Коды ошибок для программной обработки
 */
export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED'
  | 'INSUFFICIENT_STOCK';

// ═══════════════════════════════════════════════════════════
// Хелперы для создания результатов
// ═══════════════════════════════════════════════════════════

/**
 * Создаёт успешный результат с данными
 * @example return ok(users);
 */
export function ok<T>(data: T): ActionSuccess<T> {
  return { success: true, data };
}

/**
 * Создаёт успешный результат без данных (для void-операций)
 * @example return okVoid();
 */
export function okVoid(): ActionSuccess<void> {
  return { success: true, data: undefined as void };
}

/**
 * Создаёт результат с ошибкой
 * @example return err("Не авторизован", "UNAUTHORIZED");
 */
export function err(error: string, code?: ErrorCode): ActionFailure {
  return { success: false, error, code };
}

// ═══════════════════════════════════════════════════════════
// Предопределённые ошибки
// ═══════════════════════════════════════════════════════════

export const ERRORS = {
  UNAUTHORIZED: err("Не авторизован", "UNAUTHORIZED"),
  FORBIDDEN: (msg?: string) => err(msg || "Недостаточно прав", "FORBIDDEN"),
  NOT_FOUND: (entity: string) => err(`${entity} не найден`, "NOT_FOUND"),
  VALIDATION: (message: string) => err(message, "VALIDATION_ERROR"),
  INTERNAL: (msg?: string) => err(msg || "Внутренняя ошибка сервера", "INTERNAL_ERROR"),
  RATE_LIMITED: err("Слишком много запросов", "RATE_LIMITED"),
  INSUFFICIENT_STOCK: err("Недостаточно товара на складе", "INSUFFICIENT_STOCK"),
} as const;

// ═══════════════════════════════════════════════════════════
// Остальные общие типы
// ═══════════════════════════════════════════════════════════

export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Address {
  country?: string;
  region?: string;
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  postalCode?: string;
  full?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  telegram?: string;
  instagram?: string;
  whatsapp?: string;
  vk?: string;
}

export interface AuditInfo {
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
}

export interface Meta {
  [key: string]: unknown;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Детали лога аудита
 */
export interface AuditLogDetails {
  [key: string]: unknown;
  fileName?: string;
  name?: string;
  reason?: string;
  oldKey?: string;
  newKey?: string;
  oldPath?: string;
  newPath?: string;
  key?: string;
  path?: string;
  count?: number;
}
