// @/lib/types/product.ts

import type { BaseEntity, AuditInfo, Meta } from "./common";

// Статус товара
export type ProductStatus = "active" | "inactive" | "draft" | "archived";

// Тип товара
export type ProductType = "simple" | "variable" | "bundle" | "service";

// Товар
export interface Product extends BaseEntity {
    // Основная информация
    name: string;
    slug: string;
    sku: string;
    barcode?: string;
    description?: string;
    shortDescription?: string;

    // Тип и статус
    type: ProductType;
    status: ProductStatus;

    // Категоризация
    categoryId?: string;
    category?: ProductCategory;
    brandId?: string;
    brand?: ProductBrand;
    tags?: string[];

    // Цены
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    currency: string;

    // Скидки
    discount?: ProductDiscount;

    // Варианты (для variable)
    variants?: ProductVariant[];
    options?: ProductOption[];

    // Медиа
    images?: ProductImage[];
    mainImage?: string;
    thumbnailImage?: string;

    // Склад
    trackInventory: boolean;
    stockQuantity?: number;
    reservedQuantity?: number;
    availableQuantity?: number;
    lowStockThreshold?: number;
    allowBackorder?: boolean;

    // Физические характеристики
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };

    // Нанесение
    printingAvailable?: boolean;
    printingMethods?: PrintingMethodConfig[];
    printingAreas?: PrintingArea[];

    // SEO
    seo?: ProductSeo;

    // Поставщик
    supplierId?: string;
    supplierSku?: string;
    supplierPrice?: number;

    // Мета
    attributes?: Record<string, string>;
    meta?: Meta;
    audit?: AuditInfo;
}

// Категория товара
export interface ProductCategory extends BaseEntity {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    parent?: ProductCategory;
    children?: ProductCategory[];
    level: number;
    position: number;
    productCount?: number;
    isActive: boolean;
}

// Бренд
export interface ProductBrand {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    website?: string;
    isActive: boolean;
}

// Вариант товара
export interface ProductVariant {
    id: string;
    productId: string;
    sku: string;
    barcode?: string;
    name: string;
    options: Record<string, string>; // { size: "XL", color: "Белый" }

    // Цены
    price?: number;
    compareAtPrice?: number;
    costPrice?: number;

    // Склад
    stockQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;

    // Медиа
    image?: string;

    // Статус
    isActive: boolean;
    position: number;
}

// Опция товара (для вариантов)
export interface ProductOption {
    id: string;
    name: string; // "Размер", "Цвет"
    values: ProductOptionValue[];
    position: number;
}

export interface ProductOptionValue {
    id: string;
    value: string; // "XL", "Белый"
    label?: string;
    color?: string; // hex для цветов
    image?: string;
    position: number;
}

// Изображение товара
export interface ProductImage {
    id: string;
    url: string;
    thumbnailUrl?: string;
    alt?: string;
    position: number;
    isMain: boolean;
}

// Скидка на товар
export interface ProductDiscount {
    type: "percent" | "fixed";
    value: number;
    startDate?: Date;
    endDate?: Date;
    minQuantity?: number;
}

// Конфигурация метода нанесения
export interface PrintingMethodConfig {
    method: string;
    name: string;
    pricePerUnit: number;
    setupPrice: number;
    minQuantity: number;
    maxColors?: number;
    maxSize?: { width: number; height: number };
    isActive: boolean;
}

// Зона нанесения
export interface PrintingArea {
    id: string;
    name: string; // "Грудь", "Спина"
    position: string;
    maxSize: { width: number; height: number };
    image?: string;
}

// SEO
export interface ProductSeo {
    title?: string;
    description?: string;
    keywords?: string[];
}

// Форма товара
export interface ProductFormData {
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    shortDescription?: string;
    type: ProductType;
    status: ProductStatus;
    categoryId?: string;
    brandId?: string;
    tags?: string[];
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    trackInventory: boolean;
    stockQuantity?: number;
    lowStockThreshold?: number;
    allowBackorder?: boolean;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    printingAvailable?: boolean;
    images?: File[];
}

// Фильтры товаров
export interface ProductFilters {
    status?: ProductStatus;
    type?: ProductType;
    categoryId?: string;
    brandId?: string;
    tags?: string[];
    inStock?: boolean;
    lowStock?: boolean;
    priceMin?: number;
    priceMax?: number;
    printingAvailable?: boolean;
}

// Краткая информация о товаре
export interface ProductSummary {
    id: string;
    name: string;
    sku: string;
    image?: string;
    price: number;
    compareAtPrice?: number;
    stockQuantity: number;
    isInStock: boolean;
    status: ProductStatus;
    category?: string;
}
