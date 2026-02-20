import { useState, useMemo } from "react";
import { InventoryItem, ItemHistoryTransaction, ItemStock, ActiveOrderItem } from "@/app/(main)/dashboard/warehouse/types";

export function useItemDetailData(initialItem: InventoryItem) {
    const [item, setItem] = useState(initialItem);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Initial edit data state — updated explicitly via setEditData when editing starts
    // Initial edit data state — updated explicitly via setEditData when editing starts
    const [editData, setEditData] = useState<InventoryItem>({
        ...initialItem,
        sku: initialItem.sku || "",
        description: initialItem.description || "",
        attributes: (initialItem.attributes as Record<string, string>) || {},
        categoryId: initialItem.categoryId || "",
        qualityCode: initialItem.qualityCode || "",
        attributeCode: initialItem.attributeCode || "",
        sizeCode: initialItem.sizeCode || "",
        materialCode: initialItem.materialCode || "",
        brandCode: initialItem.brandCode || "",
        thumbnailSettings: initialItem.thumbnailSettings || { zoom: 1, x: 0, y: 0 },
        costPrice: initialItem.costPrice || 0,
        sellingPrice: initialItem.sellingPrice || 0,
        isArchived: initialItem.isArchived || false,
        materialComposition: initialItem.materialComposition || {},
    });

    // Determine if there are unsaved changes
    const hasChanges = useMemo(() => {
        const checkFields = (data: InventoryItem, original: InventoryItem) => {
            return JSON.stringify({
                name: data.name,
                sku: data.sku || "",
                description: data.description || "",
                unit: data.unit,
                lowStockThreshold: data.lowStockThreshold || 10,
                criticalStockThreshold: data.criticalStockThreshold || 0,
                attributes: (data.attributes as Record<string, string>) || {},
                categoryId: data.categoryId || "",
                qualityCode: data.qualityCode || "",
                attributeCode: data.attributeCode || "",
                sizeCode: data.sizeCode || "",
                materialCode: data.materialCode || "",
                brandCode: data.brandCode || "",
                thumbnailSettings: data.thumbnailSettings || { zoom: 1, x: 0, y: 0 },
                costPrice: Number(data.costPrice) || 0,
                sellingPrice: Number(data.sellingPrice) || 0,
                isArchived: data.isArchived || false,
                materialComposition: data.materialComposition || {},
            }) !== JSON.stringify({
                name: original.name,
                sku: original.sku || "",
                description: original.description || "",
                unit: original.unit,
                lowStockThreshold: original.lowStockThreshold || 10,
                criticalStockThreshold: original.criticalStockThreshold || 0,
                attributes: (original.attributes as Record<string, string>) || {},
                categoryId: original.categoryId || "",
                qualityCode: original.qualityCode || "",
                attributeCode: original.attributeCode || "",
                sizeCode: original.sizeCode || "",
                materialCode: original.materialCode || "",
                brandCode: original.brandCode || "",
                thumbnailSettings: original.thumbnailSettings || { zoom: 1, x: 0, y: 0 },
                costPrice: Number(original.costPrice) || 0,
                sellingPrice: Number(original.sellingPrice) || 0,
                isArchived: original.isArchived || false,
                materialComposition: original.materialComposition || {},
            });
        };
        return checkFields(editData, item);
    }, [editData, item]);

    // Data fetching states
    const [history, setHistory] = useState<ItemHistoryTransaction[]>([]);
    const [stocks, setStocks] = useState<ItemStock[]>([]);
    const [activeOrders, setActiveOrders] = useState<ActiveOrderItem[]>([]);

    return {
        item,
        setItem,
        isEditing,
        setIsEditing,
        isSaving,
        setIsSaving,
        editData,
        setEditData,
        hasChanges,
        history,
        setHistory,
        stocks,
        setStocks,
        activeOrders,
        setActiveOrders,
    };
}
