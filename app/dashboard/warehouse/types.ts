export interface InventoryAttribute {
    id: string;
    type: string;
    value: string;
    name: string;
    meta?: Record<string, unknown> | null | unknown;
}

export interface AttributeType {
    id: string;
    name: string;
    slug: string;
    categoryId?: string | null;
    isSystem: boolean;
    sortOrder?: number;
}

export interface ItemFormData {
    subcategoryId?: string;
    brandCode?: string;
    qualityCode?: string;
    materialCode?: string;
    attributeCode?: string;
    sizeCode?: string;
    attributes?: Record<string, string>;
    itemName?: string;
    sku?: string;
    unit?: string;
    width?: string;
    height?: string;
    depth?: string;
    department?: string;
    description?: string;
    quantity?: string;
    minQuantity?: string;
    storageLocationId?: string;
    lowStockThreshold?: string;
    criticalStockThreshold?: string;
    imageFile?: File | null;
    imageBackFile?: File | null;
    imageSideFile?: File | null;
    imageDetailsFiles?: File[];
    imagePreview?: string | null;
    imageBackPreview?: string | null;
    imageSidePreview?: string | null;
    imageDetailsPreviews?: string[];
    [key: string]: unknown;
}
