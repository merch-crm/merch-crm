"use client";

import { useState, useEffect } from "react";

import { Plus, Minus, X, AlertCircle, Package, MapPin, RefreshCw, ChevronUp, ChevronDown, Lock } from "lucide-react";
import { adjustInventoryStock } from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorageLocation } from "./storage-locations-tab";
import { StorageLocationSelect } from "@/components/ui/storage-location-select";


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
    onClose: () => void;
    initialType?: "in" | "out" | "set";
    user?: Session | null;
}


export function AdjustStockDialog({ item, locations, itemStocks, onClose, initialType = "in", user }: AdjustStockDialogProps) {

    const [amount, setAmount] = useState<number>(initialType === "set" ? item.quantity : 1);
    const [type, setType] = useState<"in" | "out" | "set">(initialType);
    const [selectedLocationId, setSelectedLocationId] = useState<string>(item.storageLocationId || "");
    const [reason, setReason] = useState("");
    const [costPrice, setCostPrice] = useState<string>(item.costPrice ? String(item.costPrice) : "");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const canSeeCost = user?.roleName === "Администратор" || user?.roleName === "Руководство";

    // Lock scroll on mount
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

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

            const res = await adjustInventoryStock(
                item.id,
                amount,
                type,
                reason,
                selectedLocationId,
                type === "in" && costPrice ? parseFloat(costPrice) : undefined
            );
            if (res.success) {
                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                onClose();
            } else {
                setError(res.error || "Ошибка при обновлении");
            }
        } catch {
            setError("Произошла системная ошибка");
        } finally {
            setIsSubmitting(false);
        }
    };

    const netChange = type === "in" ? amount : (type === "out" ? -amount : amount - currentStockOnLocation);
    const isNegative = (type === "set" ? amount : currentStockOnLocation + netChange) < 0 || (item.quantity + (type === "set" ? amount - currentStockOnLocation : netChange)) < 0;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/60 animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">Складская операция</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <Package className="w-4 h-4 text-primary" />
                            <span className="text-[11px] font-bold text-slate-400 tracking-tight truncate max-w-[400px]">{item.name}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl bg-slate-50 transition-all active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-visible flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {/* LEFT COLUMN */}
                        <div className="space-y-6 relative z-30">
                            {/* Current Stock Indicator */}
                            <div className="bg-primary/5 rounded-2xl p-6 flex items-center justify-between border border-primary/10">
                                <div className="space-y-0.5">
                                    <span className="text-[11px] font-bold text-primary tracking-tight block">Текущий остаток</span>
                                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[150px] block">{selectedLocationName}</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{selectedLocationId ? currentStockOnLocation : item.quantity}</span>
                                    <span className="text-xs font-bold text-slate-400">{(item.unit === 'pcs' || item.unit === 'шт') ? 'шт.' : item.unit}</span>
                                </div>
                            </div>

                            {/* Type Selector - Tile Style */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Тип операции</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setType("in"); setAmount(1); if (navigator.vibrate) navigator.vibrate(10); }}
                                        className={cn(
                                            "relative flex flex-col items-center justify-center p-4 aspect-square rounded-2xl transition-all duration-300 overflow-hidden group border-2",
                                            type === "in"
                                                ? "bg-emerald-50/50 border-emerald-200 shadow-sm"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200/50 hover:bg-emerald-50/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 border",
                                            type === "in" ? "bg-white border-emerald-100 text-emerald-600 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-400"
                                        )}>
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            type === "in" ? "text-emerald-700" : "text-slate-500"
                                        )}>
                                            Приход
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setType("out"); setAmount(1); if (navigator.vibrate) navigator.vibrate(10); }}
                                        className={cn(
                                            "relative flex flex-col items-center justify-center p-4 aspect-square rounded-2xl transition-all duration-300 overflow-hidden group border-2",
                                            type === "out"
                                                ? "bg-rose-50/50 border-rose-200 shadow-sm"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-rose-200/50 hover:bg-rose-50/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 border",
                                            type === "out" ? "bg-white border-rose-100 text-rose-600 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-400"
                                        )}>
                                            <Minus className="w-5 h-5" />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            type === "out" ? "text-rose-700" : "text-slate-500"
                                        )}>
                                            Списание
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setType("set"); setAmount(item.quantity); if (navigator.vibrate) navigator.vibrate(10); }}
                                        className={cn(
                                            "relative flex flex-col items-center justify-center p-4 aspect-square rounded-2xl transition-all duration-300 overflow-hidden group border-2",
                                            type === "set"
                                                ? "bg-primary/5 border-primary/20 shadow-sm"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-primary/20 hover:bg-primary/5"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 border",
                                            type === "set" ? "bg-white border-primary/10 text-primary shadow-sm" : "bg-slate-50 border-slate-100 text-slate-400"
                                        )}>
                                            <RefreshCw className="w-5 h-5" />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            type === "set" ? "text-primary" : "text-slate-500"
                                        )}>
                                            Коррект.
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Warehouse Selector */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 tracking-tight ml-1 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5" /> Выберите склад
                                </label>
                                <StorageLocationSelect
                                    value={selectedLocationId}
                                    onChange={setSelectedLocationId}
                                    options={Array.isArray(locations) ? locations : []}
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                            {/* Amount Input */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 tracking-tight ml-1">
                                    {type === "set" ? "Установить значение" : "Количество"}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        required
                                        min="0"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        name="quantity"
                                        placeholder="0"
                                        className="input-premium w-full h-16 pl-6 pr-24 rounded-2xl border border-slate-100 bg-slate-50 text-2xl font-black focus:bg-white focus:border-primary outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none tracking-tighter"
                                    />
                                    <span className="absolute right-12 top-1/2 -translate-y-1/2 font-bold text-slate-300 pointer-events-none text-xs tracking-tight">{(item.unit === 'pcs' || item.unit === 'шт') ? 'шт.' : item.unit}</span>

                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setAmount(prev => prev + 1)}
                                            className="w-8 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-primary/20 transition-all active:scale-95 group"
                                        >
                                            <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-primary" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAmount(prev => Math.max(0, prev - 1))}
                                            className="w-8 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-primary/20 transition-all active:scale-95 group"
                                        >
                                            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-primary" />
                                        </button>
                                    </div>
                                </div>
                            </div>



                            {type === "in" && canSeeCost && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[11px] font-bold text-slate-500 tracking-tight ml-1">
                                        Обновить себестоимость за шт. (опционально)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            value={costPrice}
                                            onChange={(e) => setCostPrice(e.target.value)}
                                            placeholder="0.00"
                                            className="input-premium w-full h-14 pl-6 pr-14 rounded-2xl border border-slate-100 bg-slate-50 text-xl font-black focus:bg-white focus:border-primary outline-none transition-all tracking-tighter"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-300 pointer-events-none text-[10px]">RUB / шт.</span>
                                    </div>
                                </div>
                            )}

                            {/* Reason Input */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 tracking-tight ml-1">Причина <span className="text-rose-500">*</span></label>
                                <textarea
                                    value={reason}
                                    required
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Опишите причину изменений..."
                                    className="w-full min-h-[80px] p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary outline-none transition-all resize-none placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-[12px] font-bold leading-tight">{error}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting || amount <= 0 || !reason.trim()}
                            className={cn(
                                "w-full h-16 rounded-2xl font-black text-sm tracking-tight shadow-xl transition-all active:scale-95 disabled:opacity-50",
                                type === "in"
                                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 text-white"
                                    : type === "out" ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 text-white" : "btn-primary hover:bg-primary/90 shadow-primary/20 text-white"
                            )}
                        >
                            {isSubmitting ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                type === "in" ? "Оприходовать" : type === "out" ? "Списать" : "Обновить остаток"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
