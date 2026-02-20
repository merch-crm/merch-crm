import { useState, useEffect } from "react";
import { adjustInventoryStock } from "../stock-actions";;
import { playSound } from "@/lib/sounds";
import type { StorageLocation } from "../storage-locations-tab";

interface UseAdjustStockProps {
    item: {
        id: string;
        quantity: number;
        storageLocationId?: string | null;
        costPrice?: number | string | null;
    };
    locations: StorageLocation[];
    initialType?: "in" | "out" | "set";
    onClose: () => void;
}

export function useAdjustStock({ item, locations, initialType = "in", onClose }: UseAdjustStockProps) {
    const [amount, setAmount] = useState<number>(initialType === "set" ? (item?.quantity || 0) : 1);
    const [type, setType] = useState<"in" | "out" | "set">(initialType);
    const [selectedLocationId, setSelectedLocationId] = useState<string>(item?.storageLocationId || "");
    const [reason, setReason] = useState("");
    const [costPrice, setCostPrice] = useState<string>(item?.costPrice ? String(item.costPrice) : "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!selectedLocationId && Array.isArray(locations) && locations.length > 0) {
            setSelectedLocationId(locations[0].id);
        }
    }, [locations, selectedLocationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) return;
        if (Array.isArray(locations) && locations.length > 0 && !selectedLocationId) {
            setError("Выберите склад");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const finalCostPrice = (type === "in" || type === "out")
                ? (costPrice ? parseFloat(costPrice) : (item.costPrice ? Number(item.costPrice) : undefined))
                : undefined;

            const res = await adjustInventoryStock(
                item.id,
                amount,
                type,
                reason,
                selectedLocationId,
                finalCostPrice
            );
            if (res.success) {
                if (type === "in") playSound("stock_replenished");
                else playSound("item_updated");
                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                onClose();
            } else {
                setError(res.error || "Ошибка при обновлении");
                playSound("notification_error");
            }
        } catch {
            setError("Произошла системная ошибка");
            playSound("notification_error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        amount, setAmount,
        type, setType,
        selectedLocationId, setSelectedLocationId,
        reason, setReason,
        costPrice, setCostPrice,
        isSubmitting,
        error,
        handleSubmit
    };
}
