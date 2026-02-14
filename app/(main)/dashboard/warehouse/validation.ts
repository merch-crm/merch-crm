import { z } from "zod";

const emptyToNull = (val: unknown) => (val === "" ? null : val);

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
