// @/lib/types/inventory.ts

export interface InventoryAttribute {
    id: string;
    type: string;
    value: string;
    name: string;
    hex?: string | null;
    isSystem?: boolean;
    sortOrder?: number;
    semanticColor?: string | null;
    meta?: Record<string, unknown> | null | unknown;
}

export interface AttributeType {
    id: string;
    name: string;
    slug: string;
    categoryId?: string | null;
    isSystem: boolean;
    sortOrder?: number;
    showInSku?: boolean;
    showInName?: boolean;
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
    costPrice?: string;
    sellingPrice?: string;
    isArchived?: boolean;
    materialComposition?: Record<string, number>;
    weight?: string;
    packagingType?: "transport" | "individual";
    supplierName?: string;
    supplierLink?: string;
    minBatch?: string;
    features?: string[];
    [key: string]: unknown;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    prefix?: string | null;
    parentId?: string | null;
    color: string | null;
    icon: string | null;
    gender?: 'masculine' | 'feminine' | 'neuter' | string;
    singularName?: string | null;
    pluralName?: string | null;
    slug?: string | null;
    fullPath?: string | null;
    sortOrder?: number | null;
    isActive?: boolean | null;
    isSystem?: boolean;
    showInSku?: boolean;
    showInName?: boolean;
    itemCount?: number;
    totalQuantity?: number;
    parent?: {
        id: string;
        name: string;
        color?: string | null;
        icon?: string | null;
    } | null;
}

export interface StorageLocation {
    id: string;
    name: string;
    address?: string | null;
    description?: string | null;
    userId?: string | null;
    responsibleUserId?: string | null;
    isSystem?: boolean;
    isDefault?: boolean;
    isActive?: boolean;
    type: "warehouse" | "production" | "office";
    createdAt?: Date;
}

export interface ItemHistoryTransaction {
    id: string;
    type: "in" | "out" | "transfer" | "attribute_change" | "archive" | "restore" | "stock_in" | "stock_out" | "adjustment";
    changeAmount: number;
    reason: string | null;
    createdAt: Date;
    costPrice?: number | string | null;
    item?: {
        id: string;
        name: string;
        unit: string;
        sku: string | null;
    } | null;
    creator: {
        name: string;
        avatar?: string | null;
        role?: { name: string } | null;
    } | null;
    storageLocation: { name: string } | null;
    fromStorageLocation?: { name: string } | null;
}

export interface ItemStock {
    id: string;
    quantity: number;
    updatedAt: Date;
    storageLocationId: string;
    storageLocation: { name: string } | null;
}

export interface MeasurementUnit {
    id: string;
    name: string;
}

export interface ThumbnailSettings {
    zoom: number;
    x: number;
    y: number;
}

export interface DialogState {
    archiveReason: boolean;
    draftConfirm: boolean;
    unsavedChanges: boolean;
    deleteConfirm: boolean;
    duplicateConfirm: { open: boolean, item?: { id: string, name: string, sku: string | null } | null };
    transfer: boolean;
    label: boolean;
    scanner: boolean;
}

export interface InventoryItem {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    criticalStockThreshold: number;
    description: string | null;
    image: string | null;
    imageBack: string | null;
    imageSide: string | null;
    imageDetails: string[];
    reservedQuantity: number;
    itemType: "clothing" | "packaging" | "consumables";
    categoryId: string | null;
    qualityCode: string | null;
    attributeCode: string | null;
    sizeCode: string | null;
    brandCode: string | null;
    materialCode: string | null;
    attributes: Record<string, string | number | boolean | null | undefined>;
    thumbnailSettings?: ThumbnailSettings | null;
    costPrice: number | string | null;
    sellingPrice: number | string | null;
    isArchived: boolean;
    archivedAt?: Date | string | null;
    createdAt: Date | string;
    archiveReason?: string | null;
    materialComposition: Record<string, number>;
    categoryName?: string;
    categorySingularName?: string | null;
    categoryPluralName?: string | null;
    category?: Category | {
        id: string;
        name: string;
        prefix?: string | null;
        color?: string | null;
        icon?: string | null;
        parent?: {
            id: string;
            name: string;
            color?: string | null;
            icon?: string | null;
        } | null;
    } | null;
    stocks?: { storageLocationId: string; quantity: number }[];
}


export interface ActiveOrderItem {
    id: string;
    quantity: number;
    order: {
        id: string;
        orderNumber: string;
        status: string;
        createdAt: Date;
        client: {
            firstName: string;
            lastName: string;
            company: string | null;
        } | null;
    } | null;
}

export interface InventoryFilters {
    page?: number;
    limit?: number;
    search?: string;
    categoryIds?: string[];
    status?: "all" | "in" | "low" | "out";
    storageLocationId?: string;
    sortBy?: string;
    showArchived?: boolean;
    onlyOrphaned?: boolean;
}
