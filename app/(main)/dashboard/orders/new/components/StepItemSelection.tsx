"use client";

import React from "react";
import { Search, Package, Plus, ShoppingCart } from "lucide-react";
import { pluralize } from "@/lib/pluralize";
import { formatUnit } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrderInventoryItem {
    id: string;
    name: string | null;
    quantity: number;
    unit: string | null;
    sellingPrice?: number | string | null;
    price?: number;
    orderQuantity?: number;
}

interface StepItemSelectionProps {
    inventory: OrderInventoryItem[];
    selectedItems: OrderInventoryItem[];
    onAddItem: (item: OrderInventoryItem) => void;
    onRemoveItem: (id: string) => void;
    onUpdateItem: (id: string, updates: Partial<OrderInventoryItem>) => void;
    currencySymbol: string;
}

export function StepItemSelection({
    inventory,
    selectedItems,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
    currencySymbol
}: StepItemSelectionProps) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-foreground">Выберите товары из каталога</h4>
                <div className="text-xs font-bold text-muted-foreground">Выбрано: {selectedItems.length} {pluralize(selectedItems.length, 'позиция', 'позиции', 'позиций')}</div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Catalog */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Поиск товара..." className="pl-9" aria-label="Поиск товара" />
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                        {inventory.map(item => (
                            <Button
                                key={item.id}
                                type="button"
                                variant="ghost"
                                disabled={selectedItems.some(i => i.id === item.id)}
                                onClick={() => onAddItem(item)}
                                className="w-full flex items-center justify-between p-3 rounded-2xl border border-border hover:bg-muted transition-all text-left disabled:opacity-50 h-auto"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground font-bold shrink-0"><Package className="w-5 h-5" /></div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground font-bold">Остаток: {item.quantity} {formatUnit(item.unit || "")}</p>
                                    </div>
                                </div>
                                <Plus className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Selected */}
                <div className="bg-muted/50 rounded-2xl p-6 border border-border space-y-4">
                    <p className="text-xs font-bold text-muted-foreground">Выбранные позиции</p>
                    {selectedItems.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
                            <ShoppingCart className="w-8 h-8 opacity-50" />
                            <p className="text-xs font-bold">Список пуст</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedItems.map(item => (
                                <div key={item.id} className="bg-card p-4 rounded-2xl shadow-sm border border-border space-y-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm font-bold truncate">{item.name}</p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRemoveItem(item.id)}
                                            className="text-muted-foreground hover:text-destructive font-bold text-xs h-auto p-0 hover:bg-transparent shrink-0"
                                        >
                                            Удалить
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-muted-foreground ml-1">Кол-во</label>
                                            <Input
                                                type="number"
                                                value={item.orderQuantity || 0}
                                                onChange={(e) => onUpdateItem(item.id, { orderQuantity: Number(e.target.value) })}
                                                className="h-10"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-muted-foreground ml-1">Цена ({currencySymbol})</label>
                                            <Input
                                                type="number"
                                                value={item.price || 0}
                                                onChange={(e) => onUpdateItem(item.id, { price: Number(e.target.value) })}
                                                className="h-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
