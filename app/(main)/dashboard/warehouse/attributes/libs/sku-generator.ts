import { type InferSelectModel } from "drizzle-orm";
import {
    inventoryAttributes,
    inventoryCategories,
    inventoryAttributeTypes
} from "@/lib/schema";

type Attribute = InferSelectModel<typeof inventoryAttributes>;
type Category = InferSelectModel<typeof inventoryCategories>;
type AttributeType = InferSelectModel<typeof inventoryAttributeTypes>;

export interface SKUGenParams {
    item: {
        brandCode: string | null;
        qualityCode: string | null;
        materialCode: string | null;
        attributeCode: string | null; // color
        sizeCode: string | null;
        attributes: unknown; // JSONB for custom attributes
    };
    category: Category;
    allAttributes: Attribute[];
    customTypes: AttributeType[];
}

/**
 * Generates an item name based on its attributes and category gender.
 */
export function generateItemName({ item, category, allAttributes, customTypes }: SKUGenParams): string {
    const targetGender = category.gender || "masculine";

    const getAttrName = (type: string, code: string | null) => {
        if (!code) return null;
        const attr = allAttributes.find(a => a.type === type && a.value === code);

        // Check visibility in name
        if (attr && (attr.meta as { showInName?: boolean })?.showInName === false) return null;

        if (attr) {
            const meta = attr.meta as { fem?: string; neut?: string } | null;
            if (targetGender === "feminine" && meta?.fem) return meta.fem;
            if (targetGender === "neuter" && meta?.neut) return meta.neut;
            return attr.name;
        }
        return code;
    };

    const brandName = getAttrName("brand", item.brandCode);
    const colorName = getAttrName("color", item.attributeCode);
    const sizeName = getAttrName("size", item.sizeCode);
    const qualityName = getAttrName("quality", item.qualityCode);

    const nameParts = [
        category.name,
        brandName,
        qualityName,
        colorName,
        sizeName
    ].filter(Boolean);

    customTypes.forEach(t => {
        const code = (item.attributes as Record<string, unknown>)?.[t.slug] as string;
        const name = getAttrName(t.slug, code);
        if (name) nameParts.push(name);
    });

    return nameParts.join(" ");
}

/**
 * Generates an item SKU based on its attributes and category prefix.
 */
export function generateItemSku({ item, category, allAttributes, customTypes }: SKUGenParams): string | null {
    if (!category.prefix) return null;

    const shouldShowInSku = (type: string, code: string | null) => {
        if (!code) return false;
        const attr = allAttributes.find(a => a.type === type && a.value === code);
        return (attr?.meta as { showInSku?: boolean })?.showInSku ?? true;
    };

    const skuParts: string[] = [];
    skuParts.push(category.prefix);

    if (shouldShowInSku('brand', item.brandCode)) skuParts.push(item.brandCode!);
    if (shouldShowInSku('quality', item.qualityCode)) skuParts.push(item.qualityCode!);
    if (shouldShowInSku('material', item.materialCode)) skuParts.push(item.materialCode!);
    if (shouldShowInSku('color', item.attributeCode)) skuParts.push(item.attributeCode!); // color
    if (shouldShowInSku('size', item.sizeCode)) skuParts.push(item.sizeCode!);

    customTypes.forEach(t => {
        const code = (item.attributes as Record<string, unknown>)?.[t.slug] as string;
        if (code && shouldShowInSku(t.slug, code)) {
            skuParts.push(code);
        }
    });

    return skuParts.join("-").toUpperCase();
}
