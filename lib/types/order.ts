// @/lib/types/order.ts

import type { BaseEntity, Address, AuditInfo, Meta, DateRange } from "./common";
import type { ClientSummary } from "./client";
import type { UserSummary } from "./user";
import type { PaymentStatus } from "./finance";

// Статус заказа
export type OrderStatus =
    | "draft"
    | "new"
    | "confirmed"
    | "paid"
    | "in_production"
    | "quality_check"
    | "packing"
    | "ready"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded"
    | "on_hold";

// Приоритет заказа
export type OrderPriority = "low" | "normal" | "high" | "urgent";

export type ProductionStageStatus = "pending" | "in_progress" | "done" | "failed";

// Тип оплаты
export type PaymentMethod = "cash" | "card" | "bank_transfer" | "online" | "credit";

// Тип доставки
export type DeliveryMethod = "pickup" | "courier" | "cdek" | "russian_post" | "boxberry" | "dpd" | "custom";

// Категория заказа
export type OrderCategory = "print" | "embroidery" | "merch" | "other";

// Заказ
export interface Order extends BaseEntity {
    // Идентификация
    number?: string;
    orderNumber?: string; // Совместимость с БД
    externalNumber?: string;
    category?: OrderCategory | string;

    // Статус и приоритет (Совместимость: priority м.б. string | null)
    status: OrderStatus | string | null;
    priority: OrderPriority | string | null;
    statusHistory?: OrderStatusChange[];
    isUrgent?: boolean; // Совместимость

    // Клиент
    clientId: string;
    client?: ClientSummary | { name: string | null }; // Совместимость с { name: string | null }

    // Позиции
    items?: OrderItem[];
    totalItems?: number;
    totalQuantity?: number;

    // Суммы
    subtotal?: number;
    discount?: number;
    discountAmount?: number | string | null;
    discountPercent?: number;
    discountReason?: string;
    shipping?: number;
    total?: number;
    totalAmount?: string | number | null; // Совместимость: используется в orders-table и БД
    advanceAmount?: number;
    promocodeId?: string;
    currency?: string;

    // Создатель (Совместимость)
    creatorId?: string;
    creator?: UserSummary | {
        name: string;
        role?: { name: string } | null;
    } | null;
    createdBy?: string;

    // Оплата
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    paidAmount?: number;
    paidAt?: Date;
    payments?: OrderPayment[];

    // Доставка
    deliveryMethod?: DeliveryMethod;
    deliveryAddress?: Address;
    deliveryDate?: Date;
    deliveryTimeSlot?: string;
    deliveryCost?: number;
    trackingNumber?: string;
    trackingUrl?: string;

    // Сроки
    deadline?: Date | null;
    estimatedCompletionDate?: Date | null;
    completedAt?: Date | null;

    // Производство
    assigneeId?: string;
    assigneeName?: string;
    productionProgress?: number;
    productionNotes?: string;

    // Комментарии и заметки
    customerComment?: string;
    internalComment?: string;
    managerComment?: string;

    // Проблемы
    hasProblems?: boolean;
    problemDescription?: string;

    // Файлы
    attachments?: OrderAttachment[];

    // Теги и мета
    tags?: string[];
    source?: string;
    isArchived?: boolean;
    cancelReason?: string;
    meta?: Meta;
    audit?: AuditInfo;

    // С полями из БД, которых не хватало
    deliveryStatus?: string; // delivery_status
    shippingAddress?: string; // shipping_address
    deliveryTrackingNumber?: string; // delivery_tracking_number
    estimatedDeliveryDate?: Date | null; // estimated_delivery_date
    actualDeliveryDate?: Date | null; // actual_delivery_date
    comments?: string | null; // comments
    managerId?: string | null; // manager_id
    externalOrderNumber?: string | null; // external_order_number
    archivedAt?: Date | null; // archived_at
    archivedBy?: string | null; // archived_by
}

// Позиция заказа
export interface OrderItem {
    id: string;
    orderId: string;
    productId?: string;
    productName?: string;
    productSku?: string;
    productImage?: string;

    // Вариант товара
    variantId?: string;
    variantName?: string;
    attributes?: Record<string, string>; // { size: "XL", color: "Белый" }

    inventoryId?: string | null;
    stagePrepStatus?: ProductionStageStatus;
    stagePrintStatus?: ProductionStageStatus;
    stageApplicationStatus?: ProductionStageStatus;
    stagePackagingStatus?: ProductionStageStatus;

    // Количество и цены
    quantity: number;
    unitPrice?: number;
    price?: string; // Совместимость с БД
    description?: string; // Совместимость с БД
    discount?: number;
    total?: number;

    // Нанесение
    printing?: OrderItemPrinting[];

    // Статус позиции
    status?: OrderItemStatus;
    completedQuantity?: number;

    // Заметки
    notes?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string; // updated_at
    itemDetails?: string | null; // item_details
}

// Нанесение на позицию
export interface OrderItemPrinting {
    id: string;
    method: PrintingMethod;
    position: string; // "грудь", "спина", "рукав"
    colors?: number;
    size?: { width: number; height: number };
    pricePerUnit: number;
    setupPrice: number;
    total: number;
    designUrl?: string;
    designApproved?: boolean;
    notes?: string;
}

// Метод нанесения
export type PrintingMethod =
    | "screen"
    | "digital"
    | "dtf"
    | "sublimation"
    | "embroidery"
    | "engraving"
    | "transfer"
    | "flex"
    | "flock";

// Статус позиции
export type OrderItemStatus =
    | "pending"
    | "in_production"
    | "completed"
    | "cancelled";

// PaymentStatus is now imported from finance.ts at the top of the file

// Оплата по заказу
export interface OrderPayment {
    id: string;
    amount?: number;
    method?: PaymentMethod;
    status?: "pending" | "completed" | "failed" | "refunded";
    paidAt?: Date;
    transactionId?: string;
    notes?: string;
}

// Изменение статуса
export interface OrderStatusChange {
    id: string;
    fromStatus: OrderStatus;
    toStatus: OrderStatus;
    changedAt: Date;
    changedBy: string;
    comment?: string;
}

// Вложение заказа
export interface OrderAttachment {
    id: string;
    name?: string;
    url?: string;
    type?: "design" | "document" | "photo" | "other";
    size?: number;
    uploadedAt?: Date;
    uploadedBy?: string;

    // Совместимость с БД
    fileName?: string;
    fileUrl?: string;
    fileKey?: string;
    fileSize?: number | null;
    contentType?: string | null;
}

// Форма создания заказа
export interface OrderFormData {
    clientId: string;
    items: OrderItemFormData[];
    priority?: OrderPriority;
    deadline?: Date;
    deliveryMethod?: DeliveryMethod;
    deliveryAddress?: Address;
    paymentMethod?: PaymentMethod;
    discount?: number;
    discountReason?: string;
    customerComment?: string;
    internalComment?: string;
    tags?: string[];
}

// Форма позиции заказа
export interface OrderItemFormData {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice?: number;
    discount?: number;
    printing?: OrderItemPrintingFormData[];
    notes?: string;
}

// Форма нанесения
export interface OrderItemPrintingFormData {
    method: PrintingMethod;
    position: string;
    colors?: number;
    size?: { width: number; height: number };
    designUrl?: string;
    notes?: string;
}

// Фильтры заказов
export interface OrderFilters {
    status?: OrderStatus | OrderStatus[];
    priority?: OrderPriority;
    paymentStatus?: PaymentStatus;
    clientId?: string;
    assigneeId?: string;
    deliveryMethod?: DeliveryMethod;
    hasProblems?: boolean;
    tags?: string[];
    dateRange?: DateRange;
    deadlineRange?: DateRange;
    minTotal?: number;
    maxTotal?: number;
}

// Краткая информация о заказе
export interface OrderSummary {
    id: string;
    number: string;
    status: OrderStatus;
    priority: OrderPriority;
    clientName: string;
    clientCompany?: string;
    isVip: boolean;
    totalItems: number;
    total: number;
    paidAmount: number;
    paymentStatus: PaymentStatus;
    deadline?: Date;
    hasProblems: boolean;
    createdAt: Date;
}
