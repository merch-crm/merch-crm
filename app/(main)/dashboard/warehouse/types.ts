export * from "@/lib/types";

export interface AttributeMeta {
    fullName?: string;
    shortName?: string;
    isOversize?: boolean;
    hex?: string;
    measureValue?: string;
    measureUnit?: string;
    length?: string;
    width?: string;
    height?: string;
    dimensionUnit?: string;
    weight?: string;
    unit?: string;
    volume?: string;
    density?: string;
    quantity?: string;
    items?: { name: string; percent: string }[];
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    slug?: string | null;
    prefix?: string | null;
    parentId?: string | null;
    gender?: string | null;
    singularName?: string | null;
    pluralName?: string | null;
    fullPath?: string | null;
    showInSku?: boolean;
    showInName?: boolean;
    isActive?: boolean | null;
    isSystem?: boolean;
    sortOrder?: number | null;
    level?: number;
    parent?: Category | null;
    children?: Category[];
    itemCount?: number;
    totalQuantity?: number;
    totalCost?: number | string;
}

export interface CategoryWithStats extends Category {
    stats?: {
        itemsCount: number;
        totalStock: number;
    };
}

export interface StorageLocation {
    id: string;
    name: string;
    type: "warehouse" | "production" | "office";
    address?: string | null;
    description?: string | null;
    userId?: string | null;
    responsibleUserId?: string | null;
    responsibleUser?: { name: string } | null;
    isActive?: boolean;
    isDefault?: boolean;
    isSystem?: boolean;
    sortOrder?: number | null;
    createdAt?: Date;
}

export interface ProductLine {
    id: string;
    name: string;
    slug: string;
    type: "base" | "finished";
    categoryId: string;
    printCollectionId: string | null;
    baseLineId: string | null;
    commonAttributes: Record<string, string>;
    description: string | null;
    image: string | null;
    isActive: boolean;
    sortOrder: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductLineWithStats extends ProductLine {
    positionsCount: number;
    totalStock: number;
    category?: Category;
    printCollection?: PrintCollection;
}

export interface PrintCollection {
    id: string;
    name: string;
    description: string | null;
    coverImage?: string | null;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PrintDesign {
    id: string;
    collectionId: string;
    name: string;
    sku?: string | null;
    preview?: string | null;
    description?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PrintDesignVersion {
    id: string;
    designId: string;
    name: string;
    fabricType?: string | null;
    preview?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PrintDesignFile {
    id: string;
    versionId: string;
    filename: string;
    format: string;
    size: number;
    dimensions?: { width: number; height: number } | null;
    url: string;
    createdAt: Date;
}

// Типы для формы создания
export type CreationType = "single" | "base_line" | "finished_line";
export type LineMode = "new" | "existing";

export interface LineFormState {
    creationType: CreationType;
    lineMode: LineMode;
    selectedLineId: string;
    selectedCollectionId: string;
    lineName: string;
    lineDescription: string;
    commonAttributes: Record<string, { isCommon: boolean; value: string }>;
    matrixSelection: Record<string, string[]>;
    selectedDesigns: string[];
    generatedPositions: PositionPreview[];
}

export interface PositionPreview {
    attributes: Record<string, string>;
    name: string;
    sku: string;
}
