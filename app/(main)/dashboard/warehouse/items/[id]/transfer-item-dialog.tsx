"use client";

import { useState, useMemo } from "react";
import { Minus, Package, ArrowRightLeft, ArrowRight, Plus, AlertCircle, RefreshCw, Check } from "lucide-react";
import { transferInventoryStock } from "../../actions";
import { StorageLocation } from "../../types";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { LocationSelect } from "../../location-select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface ItemStock {
    storageLocationId: string;
    quantity: number;
}

interface TransferItemDialogProps {
    item: {
        id: string;
        name: string;
        quantity: number;
        unit: string;
    };
    locations: StorageLocation[];
    itemStocks: ItemStock[];
    isOpen: boolean;
    onClose: () => void;
}

export function TransferItemDialog({ item, locations, itemStocks, isOpen, onClose }: TransferItemDialogProps) {
    const { toast } = useToast();
    const [fromLocationId, setFromLocationId] = useState("");
    const [toLocationId, setToLocationId] = useState("");
    const [amount, setAmount] = useState<number>(1);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Create a map for easy quantity lookup
    const stockMap = useMemo(() => new Map(itemStocks.map(s => [s.storageLocationId, s.quantity])), [itemStocks]);

    // Only allow "From" locations where item exists
    const availableFromLocations = useMemo(() => locations.filter(loc => (stockMap.get(loc.id) || 0) > 0), [locations, stockMap]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError("");

        if (!fromLocationId) return setError("Выберите склад отправитель");
        if (!toLocationId) return setError("Выберите склад получатель");
        if (fromLocationId === toLocationId) return setError("Склады должны отличаться");

        const availableAmount = stockMap.get(fromLocationId) || 0;
        if (amount <= 0) return setError("Неверное количество");
        if (amount > availableAmount) return setError(`Недостаточно товара на складе (в наличии: ${availableAmount})`);

        setIsSubmitting(true);

        try {
            const res = await transferInventoryStock(item.id, fromLocationId, toLocationId, amount, reason);
            if (res.success) {
                toast("Перемещение выполнено успешно", "success");
                playSound("stock_replenished");
                onClose();
            } else {
                setError(res.error || "Ошибка при перемещении");
                playSound("notification_error");
            }
        } catch {
            setError("Произошла ошибка");
            playSound("notification_error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!item) return null;

    const fromLocationName = locations.find(l => l.id === fromLocationId)?.name || "Источник";
    const toLocationName = locations.find(l => l.id === toLocationId)?.name || "Получатель";
    const fromStock = stockMap.get(fromLocationId) || 0;
    const toStock = stockMap.get(toLocationId) || 0;

    return (
        <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Перемещение товара" showVisualTitle={false} className="sm:max-w-[640px]">
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                            <ArrowRightLeft className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">Перемещение</h2>
                            <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                                Объект: <span className="text-slate-900 font-bold">{item.name}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-6">
                        {/* 1. Source & Destination selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Откуда (источник)</label>
                                <LocationSelect
                                    locations={availableFromLocations}
                                    value={fromLocationId}
                                    onChange={setFromLocationId}
                                    excludeId={toLocationId}
                                    placeholder="Выберите склад..."
                                    stocks={stockMap}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Куда (получатель)</label>
                                <LocationSelect
                                    locations={locations}
                                    value={toLocationId}
                                    onChange={setToLocationId}
                                    excludeId={fromLocationId}
                                    placeholder="Выберите склад..."
                                    stocks={stockMap}
                                />
                            </div>
                        </div>

                        {/* 2. Transaction Preview Bento Block */}
                        <div className={cn(
                            "rounded-2xl p-6 relative overflow-hidden group transition-all duration-500 shadow-crm-xl bg-gradient-to-br from-indigo-50/50 via-white to-primary/10 shadow-primary/10 border border-primary/20"
                        )}>
                            {/* Decorative Background Elements: Dynamic Package Pattern */}
                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none overflow-hidden select-none">
                                <Package className="absolute top-2 left-10 w-12 h-12 -rotate-12" />
                                <Package className="absolute top-12 left-32 w-6 h-6 rotate-12" />
                                <Package className="absolute bottom-4 left-1/4 w-16 h-16 -rotate-6" />
                                <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rotate-45" />
                                <Package className="absolute top-4 right-1/4 w-8 h-8 -rotate-12" />
                                <Package className="absolute bottom-10 right-10 w-20 h-20 rotate-12" />
                                <Package className="absolute bottom-2 right-40 w-10 h-10 -rotate-45" />
                            </div>

                            <div className="relative z-10 flex items-center justify-between min-h-[90px]">
                                <div className="space-y-2.5 flex-1">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-900 shadow-md">
                                        <Package className="w-3 h-3 text-slate-300" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[120px]" title={fromLocationName}>
                                            {fromLocationName}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2 pl-1">
                                        <span className="text-4xl font-black text-slate-900 tabular-nums tracking-tight">{fromStock}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(item.unit === 'pcs' || item.unit === 'шт') ? 'шт.' : item.unit}</span>
                                    </div>
                                </div>

                                <div className="px-6 flex items-center justify-center relative">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary shadow-lg shadow-primary/30 group-hover:scale-110 transition-all duration-500 relative z-20">
                                        <ArrowRight className="w-7 h-7 text-white" />
                                        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                                    </div>
                                    <div className="absolute w-24 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                                </div>

                                <div className="space-y-2.5 text-right flex-1">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary border border-primary-600 shadow-lg shadow-primary/20">
                                        <Package className="w-3 h-3 text-white" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[120px]" title={toLocationName}>
                                            {toLocationName}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2 justify-end pr-1">
                                        <span className="text-5xl font-black text-primary tabular-nums tracking-tight drop-shadow-sm">
                                            {toStock + amount}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(item.unit === 'pcs' || item.unit === 'шт') ? 'шт.' : item.unit}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Inputs: Amount */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Количество</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl flex items-stretch p-1.5 h-[72px] shadow-inner transition-all group focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/20">
                                    <button
                                        type="button"
                                        onClick={() => setAmount((prev: number) => Math.max(0, prev - 1))}
                                        className="w-14 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                    >
                                        <Minus className="w-5 h-5 stroke-[3]" />
                                    </button>

                                    <div className="flex-1 flex items-center justify-center gap-1.5 relative px-2">
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            required
                                            min="0"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="w-20 bg-transparent border-none text-center text-3xl font-black text-slate-900 outline-none tabular-nums p-0 leading-none"
                                        />
                                        <span className="text-sm font-bold text-slate-400 mt-1">
                                            {(item.unit === 'pcs' || item.unit === 'шт') ? 'шт.' : item.unit}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setAmount((prev: number) => prev + 1)}
                                        className="w-14 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                    >
                                        <Plus className="w-5 h-5 stroke-[3]" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-transparent select-none ml-1">Максимум</label>
                                {fromLocationId && fromStock > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAmount(fromStock);
                                            toast(`Максимальное кол-во: ${fromStock} ${item.unit}`, "info");
                                        }}
                                        className="h-[72px] w-full rounded-2xl bg-primary/5 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm flex items-center justify-center text-center px-4"
                                    >
                                        Переместить всё ({fromStock})
                                    </button>
                                ) : (
                                    <div className="h-[72px] w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Выберите склад</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. Reason */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Причина <span className="text-rose-500 uppercase-none">*</span></label>
                            <textarea
                                value={reason}
                                required
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Напр: Смена места хранения..."
                                className="w-full min-h-[80px] p-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:border-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none placeholder:text-slate-300 leading-snug shadow-sm"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 animate-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p className="text-[10px] font-bold leading-none">{error}</p>
                            </div>
                        )}
                    </div>
                </form>

                <div className="sticky bottom-0 z-10 p-5 sm:p-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 mt-auto flex items-center justify-end lg:justify-between gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-11 flex-1 lg:flex-none lg:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all text-center rounded-2xl items-center justify-center"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || amount <= 0 || !reason.trim()}
                        onClick={() => handleSubmit()}
                        className={cn(
                            "h-11 flex-1 lg:flex-none lg:w-auto lg:px-10 btn-dark rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 border-none"
                        )}
                    >
                        {isSubmitting ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        ) : (
                            <>
                                <Check className="w-4 h-4 stroke-[3] text-white" />
                                Переместить
                            </>
                        )}
                    </button>
                </div>
            </div>
        </ResponsiveModal>
    );
}
