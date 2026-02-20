import { z } from "zod";



export const InventoryCategorySchema = z.object({
    name: z.string().min(1, "Название обязательно"),
    description: z.string().optional().or(z.literal("")),
    parentId: z.string().uuid().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    color: z.string().optional().or(z.literal("")),
    singularName: z.string().optional().or(z.literal("")),
    pluralName: z.string().optional().or(z.literal("")),
    gender: z.enum(["masculine", "feminine", "neuter"]).default("masculine"),
    sortOrder: z.coerce.number().int().default(0),
    isActive: z.coerce.boolean().default(true),
    defaultUnit: z.string().optional().or(z.literal("")),
    showInSku: z.coerce.boolean().default(true),
    showInName: z.coerce.boolean().default(true),
    prefix: z.string().optional().or(z.literal("")),
    icon: z.string().optional().or(z.literal("")),
});

export const InventoryItemSchema = z.object({
    itemType: z.enum(["clothing", "packaging", "consumables"]).default("clothing"),
    name: z.string().min(1, "Название обязательно"),
    sku: z.string().optional().or(z.literal("")),
    quantity: z.coerce.number().int().min(0).default(0),
    reservedQuantity: z.coerce.number().int().min(0).optional(),
    unit: z.string().default("шт."),
    lowStockThreshold: z.coerce.number().int().min(0).default(10),
    criticalStockThreshold: z.coerce.number().int().min(0).default(0),
    categoryId: z.string().uuid().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    description: z.string().optional().or(z.literal("")),
    storageLocationId: z.string().uuid().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),

    // Codes
    qualityCode: z.string().optional().or(z.literal("")).transform(v => v === "" ? null : v),
    materialCode: z.string().optional().or(z.literal("")).transform(v => v === "" ? null : v),
    attributeCode: z.string().optional().or(z.literal("")).transform(v => v === "" ? null : v),
    sizeCode: z.string().optional().or(z.literal("")).transform(v => v === "" ? null : v),
    brandCode: z.string().optional().or(z.literal("")).transform(v => v === "" ? null : v),

    // Prices
    costPrice: z.preprocess(
        (val) => (val === "" || val === null ? null : val),
        z.coerce.number().min(0).nullable().optional()
    ),
    sellingPrice: z.preprocess(
        (val) => (val === "" || val === null ? null : val),
        z.coerce.number().min(0).nullable().optional()
    ),

    // JSONs
    attributes: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                try { return JSON.parse(val); } catch { return {}; }
            }
            return val;
        },
        z.record(z.string(), z.unknown()).default({})
    ),
    thumbnailSettings: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                try { return JSON.parse(val); } catch { return null; }
            }
            return val;
        },
        z.record(z.string(), z.unknown()).nullable().optional()
    ),
    materialComposition: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                try { return JSON.parse(val); } catch { return {}; }
            }
            return val;
        },
        z.record(z.string(), z.unknown()).default({})
    ),

    // Packaging specific (merged into attributes usually, but form sends them separately)
    width: z.string().optional(),
    height: z.string().optional(),
    depth: z.string().optional(),
    weight: z.string().optional(),
    packagingType: z.string().optional(),
    supplierName: z.string().optional(),
    supplierLink: z.string().optional(),
    minBatch: z.string().optional(),
    features: z.preprocess(
        (val) => {
            if (typeof val === "string") {
                try { return JSON.parse(val); } catch { return []; }
            }
            return val;
        },
        z.array(z.unknown()).optional()
    ),
    department: z.string().optional(), // for consumables
});

export const AdjustStockSchema = z.object({
    itemId: z.string().uuid(),
    amount: z.number().min(0, "Amount must be non-negative"),
    type: z.enum(["in", "out", "set"]),
    reason: z.string().min(1, "Reason is required"),
    storageLocationId: z.string().uuid().optional().nullable(),
    costPrice: z.number().min(0).optional()
});

export const StorageLocationSchema = z.object({
    name: z.string().min(1, "Название обязательно"),
    address: z.string().min(1, "Адрес обязателен"),
    description: z.string().optional().or(z.literal("")),
    responsibleUserId: z.string().uuid().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    type: z.enum(["warehouse", "production", "office"]).default("warehouse"),
    isDefault: z.coerce.boolean().default(false),
    isActive: z.coerce.boolean().default(true),
});

export const AttributeTypeSchema = z.object({
    name: z.string().min(1, "Название обязательно"),
    slug: z.string().min(1, "Slug обязателен"),
    category: z.string().optional().nullable(),
    isSystem: z.coerce.boolean().default(false),
    showInSku: z.coerce.boolean().default(true),
    showInName: z.coerce.boolean().default(true),
});

export const AttributeSchema = z.object({
    type: z.string().min(1, "Тип обязателен"),
    name: z.string().min(1, "Название обязательно"),
    value: z.string().min(1, "Значение обязательно"),
    meta: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const BulkMoveSchema = z.object({
    itemIds: z.array(z.string().uuid()),
    targetLocationId: z.string().uuid(),
    reason: z.string().optional(),
});

export const BulkActionSchema = z.object({
    ids: z.array(z.string().uuid()),
    reason: z.string().optional().or(z.literal("")),
});


export const TransferStockSchema = z.object({
    itemId: z.string().uuid("Invalid Item ID"),
    fromLocationId: z.string().uuid("Invalid Source Location ID"),
    toLocationId: z.string().uuid("Invalid Target Location ID"),
    amount: z.number().positive("Количество должно быть больше 0"),
    reason: z.string().optional().or(z.literal("")),
});

export const MoveItemSchema = z.object({
    itemId: z.string().uuid("Invalid Item ID"),
    fromLocationId: z.string().uuid("Invalid Source Location ID"),
    toLocationId: z.string().uuid("Invalid Target Location ID"),
    quantity: z.coerce.number().positive("Количество должно быть больше 0"),
    comment: z.string().optional().or(z.literal("")),
});

export const InventoryFiltersSchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(0).optional().default(0),
    search: z.string().optional().or(z.literal("")),
    categoryIds: z.array(z.string().uuid()).optional().default([]),
    status: z.enum(["all", "in", "low", "out"]).optional().default("all"),
    storageLocationId: z.string().uuid().optional().or(z.literal("all")).default("all"),
    sortBy: z.string().optional().default("createdAt"),
    showArchived: z.coerce.boolean().optional().default(false),
    onlyOrphaned: z.coerce.boolean().optional().default(false),
});

export const BulkUpdateCategorySchema = z.object({
    ids: z.array(z.string().uuid()),
    categoryId: z.string().uuid("Invalid Category ID"),
});

export const CheckDuplicateItemSchema = z.object({
    name: z.string().min(1),
    sku: z.string().optional(),
    currentItemId: z.string().uuid().optional(),
});
