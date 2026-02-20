"use client";

import React from "react";
import { Tag, Warehouse } from "lucide-react";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { FinancialMetricCard } from "./FinancialMetricCard";

interface FinancialMetricsGridProps {
    item: InventoryItem;
    weightedAverageCost: number;
    lastInCostPrice: number;
    currencySymbol: string;
    isEditing: boolean;
    editData: InventoryItem;
    setEditData: React.Dispatch<React.SetStateAction<InventoryItem>>;
    handleStartEdit: () => void;
}

export function FinancialMetricsGrid({
    item,
    weightedAverageCost,
    lastInCostPrice,
    currencySymbol,
    isEditing,
    editData,
    setEditData,
    handleStartEdit
}: FinancialMetricsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Cost Price */}
            <FinancialMetricCard
                label="Себестоимость"
                value={weightedAverageCost}
                secondaryValue={
                    Math.abs(weightedAverageCost - lastInCostPrice) > 1
                        ? `последняя: ${lastInCostPrice.toLocaleString('ru-RU')} ${currencySymbol}`
                        : undefined
                }
                icon={currencySymbol}
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
                currencySymbol={currencySymbol}
                isEditing={isEditing}
                editValue={editData.costPrice}
                onEditChange={(val) => setEditData(prev => ({ ...prev, costPrice: val === "" ? 0 : parseFloat(val) }))}
                onDoubleClick={handleStartEdit}
            />

            {/* Selling Price */}
            <FinancialMetricCard
                label="Цена продажи"
                value={Number(item.sellingPrice) || 0}
                icon={Tag}
                bgColor="bg-emerald-100"
                iconColor="text-emerald-500"
                currencySymbol={currencySymbol}
                isEditing={isEditing}
                editValue={editData.sellingPrice}
                onEditChange={(val) => setEditData(prev => ({ ...prev, sellingPrice: val === "" ? 0 : parseFloat(val) }))}
                onDoubleClick={handleStartEdit}
            />

            {/* Total Stock Value */}
            <FinancialMetricCard
                label="Склад по с/с"
                value={item.quantity * weightedAverageCost}
                icon={Warehouse}
                bgColor="bg-amber-100"
                iconColor="text-amber-600"
                currencySymbol={currencySymbol}
            />
        </div>
    );
}
