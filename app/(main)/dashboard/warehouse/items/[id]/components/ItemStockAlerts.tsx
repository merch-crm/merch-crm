"use client";

import React from "react";
import {
    Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { Input } from "@/components/ui/input";

interface ItemStockAlertsProps {
    item: InventoryItem;
    isEditing: boolean;
    editData: InventoryItem;
    setEditData: React.Dispatch<React.SetStateAction<InventoryItem>>;
    handleStartEdit: () => void;
    className?: string;
}

export const ItemStockAlerts = React.memo(({
    item,
    isEditing,
    editData,
    setEditData,
    handleStartEdit,
    className
}: ItemStockAlertsProps) => {
    return (
        <div className={cn(
            "crm-card rounded-3xl p-6 relative group/alerts overflow-hidden bg-white/50",
            className
        )}>
            <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm shrink-0">
                    <Bell className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-foreground leading-none">Оповещения</h3>
            </div>

            <div className={cn(
                "grid gap-3 relative z-10",
                isEditing ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1" // Adjusted for flexible usage
            )}>
                {/* Min Stock Widget */}
                <div className="relative p-4 rounded-2xl bg-muted/20 border border-border transition-all hover:bg-amber-500/10 hover:border-amber-500/30 group/card">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-black text-muted-foreground transition-colors group-hover/card:text-amber-600">Минимальный остаток</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-baseline gap-1">
                                    <Input
                                        type="number"
                                        value={editData.lowStockThreshold || 0}
                                        onChange={(e) => setEditData((prev) => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                                        aria-label="Минимальный остаток (число)"
                                        className="text-2xl font-black text-foreground leading-none bg-transparent border-none p-0 w-16 outline-none focus-visible:ring-0 shadow-none h-auto"
                                    />
                                    <span className="text-[11px] font-black text-muted-foreground">шт.</span>
                                </div>
                                <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center justify-center">
                                    <span className="text-xs font-bold text-amber-600 leading-none">МИНИМУМ</span>
                                </div>
                            </div>
                            <div className="relative h-6 flex items-center">
                                <div className="absolute left-0 right-0 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-amber-500"
                                        style={{ width: `${Math.min(100, ((editData.lowStockThreshold || 0) / 500) * 100)}%` }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="500"
                                    step="1"
                                    value={editData.lowStockThreshold || 0}
                                    aria-label="Минимальный остаток (слайдер)"
                                    onChange={(e) => setEditData((prev) => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {/* Custom Thumb handle */}
                                <div
                                    className="absolute w-5 h-5 rounded-full bg-white border-2 border-amber-500 shadow-md ring-4 ring-amber-500/0 active:ring-amber-500/20 transition-shadow pointer-events-none"
                                    style={{ left: `calc(${Math.min(100, ((editData.lowStockThreshold || 0) / 500) * 100)}% - 10px)` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start gap-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-foreground leading-none cursor-pointer" onDoubleClick={handleStartEdit}>{item.lowStockThreshold}</span>
                                <span className="text-xs font-bold text-muted-foreground">шт.</span>
                            </div>
                            <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-amber-600 leading-none">МИНИМУМ</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Critical Stock Widget */}
                <div className="relative p-4 rounded-2xl bg-muted/20 border border-border transition-all hover:bg-destructive/10 hover:border-destructive/30 group/card h-full">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-black text-muted-foreground transition-colors group-hover/card:text-destructive">Критический остаток</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-baseline gap-1.5">
                                    <Input
                                        type="number"
                                        value={editData.criticalStockThreshold || 0}
                                        onChange={(e) => setEditData((prev) => ({ ...prev, criticalStockThreshold: parseInt(e.target.value) || 0 }))}
                                        aria-label="Критический остаток (число)"
                                        className="text-3xl font-black text-foreground leading-none bg-transparent border-none p-0 w-20 outline-none focus-visible:ring-0 shadow-none h-auto"
                                    />
                                    <span className="text-[13px] font-black text-muted-foreground">шт.</span>
                                </div>
                                <div className="px-3 py-1 bg-destructive/10 rounded-full border border-destructive/20 flex items-center justify-center">
                                    <span className="text-xs font-bold text-destructive leading-none">КРИТИЧНО</span>
                                </div>
                            </div>
                            <div className="relative h-6 flex items-center">
                                <div className="absolute left-0 right-0 h-2.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-destructive to-destructive/80"
                                        style={{ width: `${Math.min(100, ((editData.criticalStockThreshold || 0) / 500) * 100)}%` }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="500"
                                    step="1"
                                    value={editData.criticalStockThreshold || 0}
                                    aria-label="Критический остаток (слайдер)"
                                    onChange={(e) => setEditData((prev) => ({ ...prev, criticalStockThreshold: parseInt(e.target.value) || 0 }))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="absolute w-5 h-5 rounded-full bg-background border-2 border-destructive shadow-md ring-4 ring-destructive/0 active:ring-destructive/20 transition-shadow pointer-events-none"
                                    style={{ left: `calc(${Math.min(100, ((editData.criticalStockThreshold || 0) / 500) * 100)}% - 10px)` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start gap-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-foreground leading-none cursor-pointer" onDoubleClick={handleStartEdit}>{item.criticalStockThreshold}</span>
                                <span className="text-xs font-bold text-muted-foreground">шт.</span>
                            </div>
                            <div className="px-3 py-1 bg-destructive/10 rounded-full border border-destructive/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-destructive leading-none">КРИТИЧНО</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

ItemStockAlerts.displayName = "ItemStockAlerts";
