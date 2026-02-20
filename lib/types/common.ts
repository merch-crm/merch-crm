// @/lib/types/common.ts

// Пагинация
export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

// Сортировка
export type SortDirection = "asc" | "desc";

export interface SortOrder {
    field: string;
    direction: SortDirection;
}

export interface SortParams {
    sortBy?: string;
    sortDirection?: SortDirection;
}

// Диапазон дат
export interface DateRange {
    from: Date | null;
    to: Date | null;
}

// API ответ
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    pagination?: Pagination;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// Списки с фильтрацией
export interface ListParams extends PaginationParams, SortParams {
    search?: string;
    filters?: Record<string, unknown>;
}

export interface ListResponse<T> {
    items: T[];
    pagination: Pagination;
}

// Выбор элементов
export interface SelectOption<T = string> {
    value: T;
    label: string;
    description?: string;
    disabled?: boolean;
    icon?: string;
}

// Базовая сущность
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

// Сущность с мягким удалением
export interface SoftDeletableEntity extends BaseEntity {
    deletedAt: Date | null;
    isDeleted: boolean;
}

// Аудит
export interface AuditInfo {
    createdBy: string;
    createdAt: Date;
    updatedBy?: string;
    updatedAt?: Date;
}

export interface AuditLogDetails {
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
    [key: string]: unknown;
}

// Файл / Вложение
export interface Attachment {
    id: string;
    name: string;
    url: string;
    size: number;
    mimeType: string;
    createdAt: Date;
}

// Адрес
export interface Address {
    country?: string;
    region?: string;
    city: string;
    street?: string;
    building?: string;
    apartment?: string;
    postalCode?: string;
    fullAddress?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

// Контактная информация
export interface ContactInfo {
    phone?: string;
    email?: string;
    website?: string;
    telegram?: string;
    whatsapp?: string;
}

// Денежная сумма
export interface Money {
    amount: number;
    currency: string;
}

// Временной интервал
export interface TimeSlot {
    start: string; // HH:mm
    end: string; // HH:mm
}

// Мета-информация
export interface Meta {
    [key: string]: string | number | boolean | null;
}

// ActionResult
export type ActionResult<T = void> =
    | { success: true; data?: T; pagination?: Pagination }
    | { success: false; error: string; issues?: string[] };

export function isSuccess<T>(result: ActionResult<T>): result is { success: true; data: T } {
    return result.success === true && result.data !== undefined;
}
