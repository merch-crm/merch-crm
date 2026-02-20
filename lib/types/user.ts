// @/lib/types/user.ts

import type { BaseEntity, ContactInfo, AuditInfo } from "./common";

// Роль пользователя
export type Role =
    | "admin"
    | "manager"
    | "sales"
    | "production"
    | "warehouse"
    | "accountant"
    | "support"
    | "viewer"
    | string; // Совместимость: иногда роль приходит как строка из БД

// Статус пользователя
export type UserStatus = "active" | "inactive" | "blocked" | "pending";

// Отдел
export type Department =
    | "management"
    | "sales"
    | "production"
    | "warehouse"
    | "finance"
    | "support"
    | "marketing";

// Разрешения
export type Permission =
    // Заказы
    | "orders.view"
    | "orders.create"
    | "orders.edit"
    | "orders.delete"
    | "orders.manage_status"
    | "orders.manage_payment"
    // Клиенты
    | "clients.view"
    | "clients.create"
    | "clients.edit"
    | "clients.delete"
    // Товары
    | "products.view"
    | "products.create"
    | "products.edit"
    | "products.delete"
    | "products.manage_prices"
    // Склад
    | "warehouse.view"
    | "warehouse.manage"
    | "warehouse.movements"
    // Финансы
    | "finance.view"
    | "finance.manage"
    | "finance.reports"
    // Пользователи
    | "users.view"
    | "users.create"
    | "users.edit"
    | "users.delete"
    // Настройки
    | "settings.view"
    | "settings.manage"
    // Отчёты
    | "reports.view"
    | "reports.export";

// Пользователь
export interface User extends BaseEntity {
    // Основная информация
    email: string;
    phone?: string;
    birthday?: string | Date | null;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    fullName?: string;
    displayName?: string;
    name: string; // From DB schema

    // Аватар
    avatar?: string;

    // Роль и статус
    roleId: string | null; // Совместимость
    role: Role | { name: string; color?: string | null } | null; // Совместимость: объект роли
    status?: UserStatus;

    departmentId: string | null; // Совместимость
    department?: Department | string | null; // Совместимость: string | null
    department_color?: string | null; // Совместимость: цвет отдела

    // Разрешения
    permissions?: Permission[];
    customPermissions?: Permission[];
    isSystem?: boolean; // Совместимость: системный пользователь

    // Рабочая информация
    position?: string;
    employeeId?: string;
    hireDate?: Date;

    // Настройки
    settings?: UserSettings;
    preferences?: UserPreferences;

    // Активность
    lastLoginAt?: Date;
    lastActivityAt?: Date;
    lastActiveAt?: Date; // Schema compatibility
    isOnline?: boolean;

    // Рабочее время
    workStatus?: WorkStatus;
    workStartedAt?: Date;

    // Контакты
    contacts?: ContactInfo;
    telegram?: string;
    instagram?: string;

    // Безопасность и системные
    passwordHash?: string;
    socialMax?: number; // Лимит соц. сетей?

    // Мета
    audit?: AuditInfo;
}

// Статус работы
export type WorkStatus = "offline" | "working" | "break" | "away";

// Настройки пользователя
export interface UserSettings {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    theme: "light" | "dark" | "system";
}

// Предпочтения пользователя
export interface UserPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
    soundNotifications: boolean;
    defaultOrderView: "list" | "kanban" | "calendar";
    itemsPerPage: number;
    sidebarCollapsed: boolean;
}

// Форма пользователя
export interface UserFormData {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    role: Role;
    department?: Department;
    position?: string;
    permissions?: Permission[];
    avatar?: File;
}

// Фильтры пользователей
export interface UserFilters {
    status?: UserStatus;
    role?: Role;
    department?: Department;
    isOnline?: boolean;
}

// Сессия пользователя
export interface UserSession {
    id: string;
    userId: string;
    device: string;
    browser: string;
    ip: string;
    location?: string;
    createdAt: Date;
    lastActivityAt: Date;
    isCurrent: boolean;
}

// Краткая информация о пользователе
export interface UserSummary {
    id: string;
    fullName: string;
    displayName: string;
    name?: string; // Совместимость
    avatar?: string;
    role: Role;
    department?: Department;
    isOnline: boolean;
}

// Конфигурация ролей
export const ROLE_CONFIG: Record<Role, { label: string; color: string; permissions: Permission[] }> = {
    admin: {
        label: "Администратор",
        color: "text-rose-600",
        permissions: [], // Все разрешения
    },
    manager: {
        label: "Менеджер",
        color: "text-violet-600",
        permissions: [
            "orders.view", "orders.create", "orders.edit", "orders.manage_status", "orders.manage_payment",
            "clients.view", "clients.create", "clients.edit",
            "products.view",
            "warehouse.view",
            "finance.view",
            "reports.view",
        ],
    },
    sales: {
        label: "Продажи",
        color: "text-blue-600",
        permissions: [
            "orders.view", "orders.create", "orders.edit",
            "clients.view", "clients.create", "clients.edit",
            "products.view",
        ],
    },
    production: {
        label: "Производство",
        color: "text-amber-600",
        permissions: [
            "orders.view", "orders.manage_status",
            "products.view",
            "warehouse.view",
        ],
    },
    warehouse: {
        label: "Склад",
        color: "text-emerald-600",
        permissions: [
            "products.view",
            "warehouse.view", "warehouse.manage", "warehouse.movements",
        ],
    },
    accountant: {
        label: "Бухгалтер",
        color: "text-cyan-600",
        permissions: [
            "orders.view", "orders.manage_payment",
            "clients.view",
            "finance.view", "finance.manage", "finance.reports",
            "reports.view", "reports.export",
        ],
    },
    support: {
        label: "Поддержка",
        color: "text-orange-600",
        permissions: [
            "orders.view",
            "clients.view",
            "products.view",
        ],
    },
    viewer: {
        label: "Наблюдатель",
        color: "text-slate-600",
        permissions: [
            "orders.view",
            "clients.view",
            "products.view",
            "reports.view",
        ],
    },
};
// Детальная информация о роли (для админ-панели)
export interface RoleDetail {
    id: string;
    name: string;
    permissions: Record<string, Record<string, boolean>>;
    isSystem: boolean;
    departmentId: string | null;
    color: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    department?: DepartmentDetail | null;
}

// Детальная информация об отделе (для админ-панели)
export interface DepartmentDetail {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    isActive: boolean;
    userCount?: number;
    createdAt: Date | string;
    updatedAt: Date | string;
}
