"use client";

import { useState, useEffect } from "react";

import { Plus, Minus, X, AlertCircle, Package, RefreshCw, ChevronUp, ChevronDown, Check } from "lucide-react";
import { adjustInventoryStock } from "./actions";
import { playSound } from "@/lib/sounds";

import { cn } from "@/lib/utils";
import { StorageLocation } from "./storage-locations-tab";
import { StorageLocationSelect } from "@/components/ui/storage-location-select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";


import { Session } from "@/lib/auth";

interface AdjustStockDialogProps {
    item: {
        id: string;
        name: string;
        quantity: number;
        unit: string;
        storageLocationId?: string | null;
        costPrice?: number | string | null;
    };
    locations: StorageLocation[];
    itemStocks?: { storageLocationId: string, quantity: number }[];
    isOpen: boolean; // Added
    onClose: () => void;
    initialType?: "in" | "out" | "set";
    user?: Session | null;
}


export function AdjustStockDialog({ item, locations, itemStocks, isOpen, onClose, initialType = "in", user }: AdjustStockDialogProps) {

    const [amount, setAmount] = useState<number>(initialType === "set" ? (item?.quantity || 0) : 1);
    const [type, setType] = useState<"in" | "out" | "set">(initialType);
    const [selectedLocationId, setSelectedLocationId] = useState<string>(item?.storageLocationId || "");
    const [reason, setReason] = useState("");
    const [costPrice, setCostPrice] = useState<string>(item?.costPrice ? String(item.costPrice) : "");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const canSeeCost = user?.roleName === "Администратор" || user?.roleName === "Руководство" || user?.departmentName === "Отдел продаж";



    // Sync selected location when locations are loaded
    useEffect(() => {
        if (!selectedLocationId && Array.isArray(locations) && locations.length > 0) {
            setSelectedLocationId(locations[0].id);
        }
    }, [locations, selectedLocationId]);


    const currentStockOnLocation = Array.isArray(itemStocks)
        ? itemStocks.find(s => s.storageLocationId === selectedLocationId)?.quantity ?? 0
        : 0;

    const selectedLocationName = Array.isArray(locations)
        ? locations.find(l => l.id === selectedLocationId)?.name || "Склад не выбран"
        : "Загрузка складов...";




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
                if (type === "in") {
                    playSound("stock_replenished");
                } else {
                    playSound("item_updated");
                }
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

    if (!item) return null;

    return (
        <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Корректировка остатков" showVisualTitle={false} className="sm:max-w-lg">
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shadow-sm">
                            <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">Корректировка</h2>
                            <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                                Объект: <span className="text-slate-900 font-bold">{item.name}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-[var(--radius-inner)] p-3 flex items-center justify-between border border-slate-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="space-y-0.5 relative z-10">
                                    <span className="text-[9px] font-bold text-slate-700 block">Текущий остаток</span>
                                    <span className="text-[10px] font-bold text-primary block truncate max-w-[100px]">{selectedLocationName}</span>
                                </div>
                                <div className="flex items-baseline gap-1 relative z-10">
                                    <span className="text-2xl font-bold text-slate-900 tabular-nums">{selectedLocationId ? currentStockOnLocation : item.quantity}</span>
                                    <span className="text-[9px] font-bold text-slate-700">{(item.unit === 'pcs' || item.unit === 'шт') ? 'шт.' : item.unit}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Операция</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'in', label: 'Приход', icon: Plus, color: 'emerald' },
                                        { id: 'out', label: 'Расход', icon: Minus, color: 'rose' },
                                        { id: 'set', label: 'Задать', icon: RefreshCw, color: 'primary' }
                                    ].map((op) => {
                                        const isActive = type === op.id;
                                        return (
                                            <button
                                                key={op.id}
                                                type="button"
                                                onClick={() => { setType(op.id as "in" | "out" | "set"); setAmount(op.id === 'set' ? item.quantity : 1); }}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-2.5 rounded-[var(--radius-inner)] border transition-all active:scale-95 shadow-sm group/op",
                                                    isActive
                                                        ? op.id === 'emerald' ? "bg-emerald-50 border-emerald-200 text-emerald-600 ring-2 ring-emerald-500/10" :
                                                            op.id === 'rose' ? "bg-rose-50 border-rose-200 text-rose-600 ring-2 ring-rose-500/10" :
                                                                "bg-primary/5 border-primary/20 text-primary ring-2 ring-primary/10"
                                                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-100"
                                                )}
                                            >
                                                <op.icon className={cn("w-4 h-4 mb-1.5 transition-transform group-hover/op:scale-110", isActive && "stroke-[3]")} />
                                                <span className="text-[9px] font-bold">{op.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2 overflow-visible">
                                <label className="text-sm font-bold text-slate-700 ml-1">Целевой склад</label>
                                <StorageLocationSelect
                                    value={selectedLocationId}
                                    onChange={setSelectedLocationId}
                                    options={Array.isArray(locations) ? locations : []}
                                    stocks={itemStocks}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">
                                    {type === "set" ? "Новое количество" : "Количество"}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        required
                                        min="0"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        className="w-full h-11 pl-4 pr-24 rounded-[var(--radius-inner)] border border-slate-200 bg-slate-50 text-2xl font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all tabular-nums text-slate-900 shadow-sm"
                                    />
                                    <div className="absolute right-1 top-1 bottom-1 flex gap-1.5">
                                        <div className="flex flex-col gap-0.5">
                                            <button type="button" onClick={() => setAmount(prev => prev + 1)} className="flex-1 w-7 bg-slate-100 border border-slate-200 rounded-[var(--radius-inner)] flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                                                <ChevronUp className="w-3 h-3 stroke-[3]" />
                                            </button>
                                            <button type="button" onClick={() => setAmount(prev => Math.max(0, prev - 1))} className="flex-1 w-7 bg-slate-100 border border-slate-200 rounded-[var(--radius-inner)] flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                                                <ChevronDown className="w-3 h-3 stroke-[3]" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-center px-3 bg-slate-50 rounded-[var(--radius-inner)] text-[10px] font-bold text-slate-500 shadow-sm">
                                            {(item.unit === 'pcs' || item.unit === 'шт') ? 'шт.' : item.unit}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {(type === "in" || type === "out") && canSeeCost && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-sm font-bold text-slate-700 ml-1">
                                        {type === "in" ? "Цена закупки" : "Цена списания"}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="h-11 bg-slate-50 border border-slate-200 rounded-[var(--radius-inner)] p-2.5 flex flex-col justify-center shadow-sm">
                                            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Предупреждение</span>
                                            <span className="text-sm font-bold text-slate-500 text-center block mt-1 leading-none tabular-nums">
                                                {item.costPrice ? Number(item.costPrice).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) : "---"}
                                            </span>
                                        </div>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            value={costPrice}
                                            onChange={(e) => setCostPrice(e.target.value)}
                                            placeholder={item.costPrice ? String(item.costPrice) : "0"}
                                            className="h-11 w-full bg-slate-50 border border-slate-200 rounded-[var(--radius-inner)] px-3 text-lg font-bold text-primary focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-center shadow-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Основание / Причина <span className="text-rose-500 uppercase-none">*</span></label>
                                <textarea
                                    value={reason}
                                    required
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Напр: Приемка от поставщика..."
                                    className="w-full min-h-[64px] p-3 rounded-[var(--radius-inner)] border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:border-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none placeholder:text-slate-300 leading-snug shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-[var(--radius-inner)] bg-rose-50 text-rose-600 border border-rose-100 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p className="text-[10px] font-bold leading-none">{error}</p>
                        </div>
                    )}
                </form>

                <div className="sticky bottom-0 z-10 p-5 sm:p-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 mt-auto flex items-center sm:justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="hidden lg:inline-block h-11 sm:w-auto sm:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all text-center rounded-[var(--radius-inner)] sm:bg-transparent"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || amount <= 0 || !reason.trim()}
                        onClick={handleSubmit}
                        className={cn(
                            "h-11 w-full sm:w-auto sm:px-10 btn-dark rounded-[var(--radius-inner)] font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 border-none"
                        )}
                    >
                        {isSubmitting ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        ) : (
                            <>
                                {type === "in" ? <Plus className="w-4 h-4 stroke-[3] text-white" /> : type === "out" ? <Minus className="w-4 h-4 stroke-[3] text-white" /> : <Check className="w-4 h-4 stroke-[3] text-white" />}
                                Сохранить
                            </>
                        )}
                    </button>
                </div>
            </div>
        </ResponsiveModal>
    );
}
