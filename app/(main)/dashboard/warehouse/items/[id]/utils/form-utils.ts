import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";

export interface ItemUploads {
    front: File | null;
    back: File | null;
    side: File | null;
    details: File[];
}

export interface ThumbnailSettings {
    zoom: number;
    x: number;
    y: number;
}

export function createItemFormData(
    item: InventoryItem,
    editData: Partial<InventoryItem>,
    uploads: ItemUploads,
    thumbSettings: ThumbnailSettings
): FormData {
    const formData = new FormData();
    formData.append("id", item.id);
    formData.append("name", editData.name || "");
    formData.append("sku", editData.sku || "");
    formData.append("description", editData.description || "");
    formData.append("unit", editData.unit || "шт.");
    formData.append("categoryId", editData.categoryId || "");
    formData.append("lowStockThreshold", String(editData.lowStockThreshold || 10));
    formData.append("criticalStockThreshold", String(editData.criticalStockThreshold || 0));

    formData.append("quantity", String(item.quantity || 0));
    formData.append("reservedQuantity", String(item.reservedQuantity || 0));
    formData.append("itemType", item.itemType || "clothing");

    formData.append("qualityCode", editData.qualityCode || "");
    formData.append("materialCode", editData.materialCode || "");
    formData.append("attributeCode", editData.attributeCode || "");
    formData.append("sizeCode", editData.sizeCode || "");
    formData.append("brandCode", editData.brandCode || "");
    formData.append("costPrice", String(editData.costPrice || 0));
    formData.append("sellingPrice", String(editData.sellingPrice || 0));
    formData.append("materialComposition", JSON.stringify(editData.materialComposition || {}));
    formData.append("isArchived", String(editData.isArchived || false));

    if (uploads.front) formData.append("image", uploads.front);
    if (uploads.back) formData.append("imageBack", uploads.back);
    if (uploads.side) formData.append("imageSide", uploads.side);
    uploads.details.forEach(file => formData.append("imageDetails", file));

    // Current images (permanent URLs only, filtering out previews)
    const isUrl = (url: unknown) => typeof url === 'string' && (url.startsWith('/') || url.startsWith('http'));

    formData.append("currentImage", isUrl(item.image) ? item.image! : "");
    formData.append("currentImageBack", isUrl(item.imageBack) ? item.imageBack! : "");
    formData.append("currentImageSide", isUrl(item.imageSide) ? item.imageSide! : "");

    const existingDetails = (item.imageDetails || []).filter(isUrl);
    formData.append("currentImageDetails", JSON.stringify(existingDetails));

    formData.append("attributes", JSON.stringify(editData.attributes || {}));
    formData.append("thumbnailSettings", JSON.stringify(thumbSettings));

    return formData;
}
