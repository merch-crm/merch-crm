// @/lib/types/notification.ts

import type { BaseEntity } from "./common";

// Тип уведомления
export type NotificationType =
    | "order_new"
    | "order_status"
    | "order_payment"
    | "order_problem"
    | "order_deadline"
    | "client_new"
    | "stock_low"
    | "stock_out"
    | "payment_received"
    | "payment_overdue"
    | "task_assigned"
    | "task_reminder"
    | "mention"
    | "comment"
    | "system"
    | "custom"
    // Совместимость со старыми UI типами
    | "info"
    | "warning"
    | "success"
    | "error"
    | "transfer";

// Приоритет уведомления
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

// Канал доставки
export type NotificationChannel = "in_app" | "email" | "push" | "sms" | "telegram";

// Уведомление
export interface Notification extends BaseEntity {
    type: NotificationType;
    priority: NotificationPriority;
    channels: NotificationChannel[];

    // Получатель
    userId: string;

    // Контент
    title: string;
    message: string;
    shortMessage?: string;

    // Связи
    entityType?: string; // "order", "client", "product"
    entityId?: string;
    entityUrl?: string;

    // Автор (если есть)
    senderId?: string;
    senderName?: string;
    senderAvatar?: string;

    // Статус
    isRead: boolean;
    readAt?: Date;
    isArchived: boolean;
    archivedAt?: Date;

    // Доставка
    deliveredChannels?: NotificationChannel[];
    deliveredAt?: Date;

    // Действия
    actions?: NotificationAction[];

    // Мета
    data?: Record<string, unknown>;
}

// Действие в уведомлении
export interface NotificationAction {
    id: string;
    label: string;
    type: "link" | "action" | "dismiss";
    url?: string;
    action?: string;
    variant?: "primary" | "secondary" | "danger";
}

// Настройки уведомлений пользователя
export interface NotificationSettings {
    // Глобальные
    enabled: boolean;
    muteFrom?: string; // "22:00"
    muteTo?: string; // "08:00"
    muteWeekends?: boolean;

    // По типам
    types: Record<NotificationType, NotificationTypeSettings>;

    // По каналам
    channels: Record<NotificationChannel, boolean>;
}

export interface NotificationTypeSettings {
    enabled: boolean;
    channels: NotificationChannel[];
    priority?: NotificationPriority;
}

// Шаблон уведомления
export interface NotificationTemplate {
    id: string;
    type: NotificationType;
    name: string;
    title: string;
    message: string;
    channels: NotificationChannel[];
    variables: string[]; // ["orderNumber", "clientName"]
    isActive: boolean;
}

// Форма отправки уведомления
export interface NotificationFormData {
    type: NotificationType;
    userIds: string[];
    title: string;
    message: string;
    channels?: NotificationChannel[];
    priority?: NotificationPriority;
    entityType?: string;
    entityId?: string;
    actions?: NotificationAction[];
    scheduledAt?: Date;
}

// Фильтры уведомлений
export interface NotificationFilters {
    type?: NotificationType | NotificationType[];
    priority?: NotificationPriority;
    isRead?: boolean;
    isArchived?: boolean;
    entityType?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

// Счётчики уведомлений
export interface NotificationCounts {
    total: number;
    unread: number;
    byType: Partial<Record<NotificationType, number>>;
    byPriority: Partial<Record<NotificationPriority, number>>;
}

// Конфигурация типов уведомлений
export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, {
    label: string;
    icon: string;
    color: string;
    defaultChannels: NotificationChannel[];
}> = {
    order_new: {
        label: "Новый заказ",
        icon: "ShoppingCart",
        color: "text-blue-600",
        defaultChannels: ["in_app", "push"],
    },
    order_status: {
        label: "Статус заказа",
        icon: "RefreshCw",
        color: "text-violet-600",
        defaultChannels: ["in_app"],
    },
    order_payment: {
        label: "Оплата заказа",
        icon: "CreditCard",
        color: "text-emerald-600",
        defaultChannels: ["in_app", "push"],
    },
    order_problem: {
        label: "Проблема с заказом",
        icon: "AlertTriangle",
        color: "text-rose-600",
        defaultChannels: ["in_app", "push", "email"],
    },
    order_deadline: {
        label: "Дедлайн заказа",
        icon: "Clock",
        color: "text-orange-600",
        defaultChannels: ["in_app", "push"],
    },
    client_new: {
        label: "Новый клиент",
        icon: "UserPlus",
        color: "text-cyan-600",
        defaultChannels: ["in_app"],
    },
    stock_low: {
        label: "Низкий остаток",
        icon: "Package",
        color: "text-amber-600",
        defaultChannels: ["in_app"],
    },
    stock_out: {
        label: "Нет в наличии",
        icon: "PackageX",
        color: "text-rose-600",
        defaultChannels: ["in_app", "email"],
    },
    payment_received: {
        label: "Платёж получен",
        icon: "DollarSign",
        color: "text-emerald-600",
        defaultChannels: ["in_app"],
    },
    payment_overdue: {
        label: "Просроченный платёж",
        icon: "AlertCircle",
        color: "text-rose-600",
        defaultChannels: ["in_app", "email"],
    },
    task_assigned: {
        label: "Назначена задача",
        icon: "CheckSquare",
        color: "text-blue-600",
        defaultChannels: ["in_app", "push"],
    },
    task_reminder: {
        label: "Напоминание",
        icon: "Bell",
        color: "text-amber-600",
        defaultChannels: ["in_app", "push"],
    },
    mention: {
        label: "Упоминание",
        icon: "AtSign",
        color: "text-violet-600",
        defaultChannels: ["in_app", "push"],
    },
    comment: {
        label: "Комментарий",
        icon: "MessageSquare",
        color: "text-slate-600",
        defaultChannels: ["in_app"],
    },
    system: {
        label: "Системное",
        icon: "Settings",
        color: "text-slate-600",
        defaultChannels: ["in_app"],
    },
    custom: {
        label: "Другое",
        icon: "Bell",
        color: "text-slate-600",
        defaultChannels: ["in_app"],
    },
    // Совместимость
    info: {
        label: "Инфо",
        icon: "Info",
        color: "text-blue-500",
        defaultChannels: ["in_app"],
    },
    warning: {
        label: "Предупреждение",
        icon: "AlertTriangle",
        color: "text-amber-500",
        defaultChannels: ["in_app"],
    },
    success: {
        label: "Успех",
        icon: "CheckCircle",
        color: "text-emerald-500",
        defaultChannels: ["in_app"],
    },
    error: {
        label: "Ошибка",
        icon: "AlertCircle",
        color: "text-rose-500",
        defaultChannels: ["in_app"],
    },
    transfer: {
        label: "Перенос",
        icon: "ArrowRightLeft",
        color: "text-indigo-500",
        defaultChannels: ["in_app"],
    },
};
