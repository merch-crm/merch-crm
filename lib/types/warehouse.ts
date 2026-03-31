// @/lib/types/warehouse.ts

import type { BaseEntity, Meta } from "./common";
import type { ProductSummary, ProductVariant } from "./product";
import type { UserSummary } from "./user";

// Склад
export interface Warehouse extends BaseEntity {
    name: string;
    code: string;
    description?: string;
    address?: string;
    isActive: boolean;
    isDefault: boolean;
    managerId?: string;
    manager?: UserSummary;
    settings?: WarehouseSettings;
}

// Настройки склада
export interface WarehouseSettings {
    allowNegativeStock: boolean;
    lowStockNotification: boolean;
    autoReserve: boolean;
}

// Складская позиция
export interface StockItem extends BaseEntity {
    warehouseId: string;
    warehouse?: Warehouse;
    productId: string;
    product?: ProductSummary;
    variantId?: string;
    variant?: ProductVariant;

    // Количества
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;

    // Пороги
    minQuantity?: number;
    maxQuantity?: number;
    reorderPoint?: number;
    reorderQuantity?: number;

    // Размещение
    location?: string; // "A-1-2" (стеллаж-полка-место)
    zone?: string;

    // Стоимость
    costPrice?: number;
    totalValue?: number;

    // Даты
    lastMovementAt?: Date;
    lastCountAt?: Date;

    // Статус
    isLowStock: boolean;
    isOutOfStock: boolean;
}

// Тип движения
export type StockMovementType =
    | "receipt"        // Приход
    | "shipment"       // Отгрузка
    | "transfer"       // Перемещение
    | "adjustment"     // Корректировка
    | "reserve"        // Резервирование
    | "unreserve"      // Снятие резерва
    | "return"         // Возврат
    | "write_off"      // Списание
    | "inventory";     // Инвентаризация

// Причина движения
export type StockMovementReason =
    | "order"
    | "purchase"
    | "return_from_client"
    | "return_to_supplier"
    | "damage"
    | "loss"
    | "found"
    | "correction"
    | "inventory"
    | "production"
    | "other";

// Движение товара
export interface StockMovement extends BaseEntity {
    type: StockMovementType;
    reason?: StockMovementReason;

    // Склады
    warehouseId: string;
    warehouse?: Warehouse;
    targetWarehouseId?: string; // Для перемещений
    targetWarehouse?: Warehouse;

    // Товар
    productId: string;
    product?: ProductSummary;
    variantId?: string;
    variant?: ProductVariant;

    // Количества
    quantity: number;
    previousQuantity: number;
    newQuantity: number;

    // Связи
    orderId?: string;
    orderNumber?: string;
    documentId?: string;
    documentNumber?: string;

    // Дополнительно
    costPrice?: number;
    totalValue?: number;
    location?: string;
    notes?: string;

    // Автор
    userId: string;
    user?: UserSummary;

    // Мета
    meta?: Meta;
}

// Форма движения
export interface StockMovementFormData {
    type: StockMovementType;
    reason?: StockMovementReason;
    warehouseId: string;
    targetWarehouseId?: string;
    items: StockMovementItemFormData[];
    notes?: string;
    documentNumber?: string;
}

export interface StockMovementItemFormData {
    productId: string;
    variantId?: string;
    quantity: number;
    location?: string;
    costPrice?: number;
}

// Инвентаризация
export interface InventoryCount extends BaseEntity {
    warehouseId: string;
    warehouse?: Warehouse;
    status: "draft" | "in_progress" | "completed" | "cancelled";
    startedAt?: Date;
    completedAt?: Date;
    items: InventoryCountItem[];
    totalItems: number;
    matchedItems: number;
    discrepancyItems: number;
    userId: string;
    user?: UserSummary;
    notes?: string;
}

export interface InventoryCountItem {
    id: string;
    productId: string;
    product?: ProductSummary;
    variantId?: string;
    expectedQuantity: number;
    actualQuantity?: number;
    discrepancy?: number;
    location?: string;
    status: "pending" | "counted" | "verified";
    notes?: string;
}

// Фильтры склада
export interface StockFilters {
    warehouseId?: string;
    categoryId?: string;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    hasMovements?: boolean;
    location?: string;
    zone?: string;
}

// Фильтры движений
export interface StockMovementFilters {
    type?: StockMovementType | StockMovementType[];
    reason?: StockMovementReason;
    warehouseId?: string;
    productId?: string;
    orderId?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

// Сводка по складу
export interface WarehouseSummary {
    warehouseId: string;
    warehouseName: string;
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    lastMovementAt?: Date;
}
