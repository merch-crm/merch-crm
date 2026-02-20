// @/lib/types/client.ts

import type { BaseEntity, Address, ContactInfo, AuditInfo, Meta } from "./common";

// Тип клиента
export type ClientType = "b2c" | "b2b";

// Источник клиента
export type ClientSource =
    | "website"
    | "phone"
    | "email"
    | "referral"
    | "social"
    | "exhibition"
    | "cold_call"
    | "repeat"
    | "other";

// Статус клиента
export type ClientStatus = "active" | "inactive" | "blocked" | "potential";

// Сегмент клиента
export type ClientSegment = "vip" | "regular" | "new" | "churned";

// Клиент


export interface Client extends BaseEntity {
    // Основная информация
    clientType: ClientType;
    status: ClientStatus;
    segment?: ClientSegment;
    source?: ClientSource;

    // Персональные данные
    firstName: string;
    lastName: string;
    patronymic?: string; // Совместимость
    middleName?: string;
    fullName: string;
    displayName: string;

    // Контакты
    phone: string;
    email?: string;
    telegram?: string;
    instagram?: string;
    contacts?: ContactInfo;

    // Адрес (упрощенный)
    city?: string;
    address?: string;

    // Дополнительно
    comments?: string;
    socialLink?: string;
    acquisitionSource?: string;
    isArchived?: boolean;

    // Компания (для B2B)
    company?: {
        name: string;
        inn?: string;
        kpp?: string;
        ogrn?: string;
        legalAddress?: string;
        actualAddress?: string;
        bankDetails?: BankDetails;
    };

    // Адреса
    addresses?: ClientAddress[];
    defaultAddressId?: string;

    // Менеджер
    managerId?: string;
    managerName?: string;

    // Финансы
    discount?: number; // процент скидки
    creditLimit?: number;
    balance?: number;
    totalOrders?: number;
    totalSpent?: number;

    // Метки и заметки
    tags?: string[];
    notes?: string;
    internalNotes?: string;

    // Мета
    meta?: Meta;
    audit?: AuditInfo;
}

// Адрес клиента
export interface ClientAddress extends Address {
    id: string;
    label?: string; // "Офис", "Склад", "Дом"
    isDefault: boolean;
    contactPerson?: string;
    contactPhone?: string;
}

// Банковские реквизиты
export interface BankDetails {
    bankName: string;
    bik: string;
    accountNumber: string;
    correspondentAccount: string;
}

// Форма создания/редактирования клиента
export interface ClientFormData {
    type: ClientType;
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    email?: string;

    // Компания
    companyName?: string;
    inn?: string;
    kpp?: string;

    // Дополнительно
    source?: ClientSource;
    managerId?: string;
    discount?: number;
    tags?: string[];
    notes?: string;
}

// Фильтры клиентов
export interface ClientFilters {
    type?: ClientType;
    status?: ClientStatus;
    segment?: ClientSegment;
    source?: ClientSource;
    managerId?: string;
    tags?: string[];
    hasOrders?: boolean;
    minSpent?: number;
    maxSpent?: number;
    createdFrom?: Date;
    createdTo?: Date;
}

// Краткая информация о клиенте (для списков)
export interface ClientSummary {
    id: string;
    type: ClientType;
    clientType?: ClientType; // Совместимость со схемой БД
    firstName: string; // Обязательно (из БД)
    lastName: string; // Обязательно (из БД)
    patronymic?: string; // Совместимость
    name?: string; // Совместимость
    displayName: string;
    company?: string | null; // null compatibility
    phone: string;
    email?: string | null; // null compatibility
    telegram?: string | null;
    instagram?: string | null;
    city?: string | null;
    address?: string | null;
    comments?: string | null;
    socialLink?: string | null;
    acquisitionSource?: string | null;
    managerId?: string | null;
    isArchived?: boolean;
    createdAt?: string | Date | null; // Совместимость

    segment?: ClientSegment;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string | null; // Совместимость
    isVip: boolean;
}

// Статистика по клиентам
export interface ClientStats {
    totalClients: number;
    newThisMonth: number;
    avgCheck: number;
    totalRevenue: number;
    totalOrders: number;
    avgRevenue: number;
}

// Заказ в профиле клиента (сокращенный)
export interface ClientProfileOrder {
    id: string;
    orderNumber: string;
    createdAt: string | Date;
    status: string;
    totalPrice: number;
}

// Подробная информация о клиенте
export interface ClientDetails {
    id: string;
    name: string | null;
    firstName: string;
    lastName: string;
    patronymic: string | null;
    company: string | null;
    phone: string;
    telegram: string | null;
    instagram: string | null;
    email: string | null;
    city: string | null;
    address: string | null;
    comments: string | null;
    socialLink: string | null;
    acquisitionSource: string | null;
    managerId: string | null;
    manager?: {
        name: string;
    } | null;
    clientType: ClientType; // "b2c" | "b2b" matches ClientType
    type?: ClientType; // Совместимость
    isArchived: boolean;
    createdAt: Date | string;

    // Статистика (консолидированная)
    totalOrders: number;
    totalSpent: number;

    orders: ClientProfileOrder[];
    lastOrderDate?: string | Date | null; // Совместимость

    stats: {
        count: number;
        total: number;
        balance: number;
    };
}

// Логотип активности (для профиля)
export interface ActivityLog {
    id: string;
    action: string;
    createdAt: string;
    user?: {
        name: string;
    } | null;
    details?: Record<string, unknown>;
}

// Профиль клиента (для drawer)
export interface ClientProfile extends ClientDetails {
    activity: ActivityLog[];
}
