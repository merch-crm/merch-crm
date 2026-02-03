"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorageLocation } from "../../storage-locations-tab";
import { transferInventoryStock } from "../../actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";

import { LocationSelect } from "../../location-select";


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
    onClose: () => void;
}

export function TransferItemDialog({ item, locations, itemStocks, onClose }: TransferItemDialogProps) {
    const { toast } = useToast();
    const [fromLocationId, setFromLocationId] = useState("");
    const [toLocationId, setToLocationId] = useState("");
    const [amount, setAmount] = useState<number>(1);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Create a map for easy quantity lookup
    const stockMap = new Map(itemStocks.map(s => [s.storageLocationId, s.quantity]));

    // Only allow "From" locations where item exists
    const availableFromLocations = locations.filter(loc => (stockMap.get(loc.id) || 0) > 0);

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" role="dialog" aria-modal="true" data-dialog-open="true">
            <div
                className="absolute inset-0 z-0"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-[var(--radius-outer)] shadow-2xl border-none animate-in zoom-in-95 fade-in duration-300 flex flex-col my-auto shrink-0 max-h-[92vh] overflow-visible">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-orange-100 flex items-center justify-center shadow-sm">
                            <ArrowRight className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">Перемещение</h2>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                Объект: <span className="text-slate-900 font-bold">{item.name}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[var(--radius-inner)] bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1 overflow-visible">
                    <div className="bg-slate-50/50 p-4 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-5 relative shadow-sm">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-sm font-bold text-slate-500 ml-1">Откуда (источник)</label>
                            <LocationSelect
                                locations={availableFromLocations}
                                value={fromLocationId}
                                onChange={setFromLocationId}
                                excludeId={toLocationId}
                                placeholder="Выберите склад..."
                                stocks={stockMap}
                            />
                        </div>

                        <div className="flex-1 space-y-1.5">
                            <label className="text-sm font-bold text-slate-500 ml-1">Куда (получатель)</label>
                            <LocationSelect
                                locations={locations}
                                value={toLocationId}
                                onChange={setToLocationId}
                                excludeId={fromLocationId}
                                placeholder="Выберите склад..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-500 ml-1">Сколько переместить</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    required
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full h-11 pl-4 pr-16 rounded-[var(--radius-inner)] border border-slate-200 bg-white text-xl font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all tabular-nums text-slate-900 shadow-sm"
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex gap-1">
                                    {fromLocationId && (stockMap.get(fromLocationId) || 0) > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const max = stockMap.get(fromLocationId) || 0;
                                                setAmount(max);
                                                if (navigator.vibrate) navigator.vibrate(15);
                                                toast(`Максимальное кол-во: ${max} ${item.unit}`, "info");
                                            }}
                                            className="px-2 h-full rounded-[var(--radius-inner)] bg-primary/10 text-primary text-[9px] font-bold hover:bg-primary hover:text-white transition-all active:scale-90 shadow-sm"
                                        >
                                            Все
                                        </button>
                                    )}
                                    <div className="flex items-center justify-center px-2 bg-slate-100 rounded-[var(--radius-inner)] text-[9px] font-bold text-slate-400 min-w-[32px] shadow-sm">
                                        {item.unit === 'pcs' || item.unit === 'шт' ? 'шт.' : item.unit}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-500 ml-1">Основание / Причина</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Напр: Смена места хранения..."
                                className="w-full h-11 min-h-[44px] p-3 rounded-[var(--radius-inner)] border border-slate-200 bg-white text-[13px] font-bold text-slate-900 focus:bg-white focus:border-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none placeholder:text-slate-300 leading-tight shadow-sm"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-[var(--radius-inner)] bg-rose-50 text-rose-600 border border-rose-100 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p className="text-[10px] font-bold leading-tight">{error}</p>
                        </div>
                    )}
                </form>

                <div className="p-6 pt-2 bg-white rounded-b-3xl">
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting || amount <= 0}
                        className="w-full h-11 rounded-[var(--radius-inner)] btn-dark font-bold text-[10px] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Обработка...
                            </div>
                        ) : (
                            <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                Подтвердить перемещение
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
