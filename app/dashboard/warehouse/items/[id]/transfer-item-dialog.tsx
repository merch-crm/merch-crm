"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, ArrowRight, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorageLocation } from "../../storage-locations-tab";
import { transferInventoryStock } from "../../actions";
import { useToast } from "@/components/ui/toast";

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
                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                toast("Перемещение выполнено успешно", "success");
                onClose();
            } else {
                setError(res.error || "Ошибка при перемещении");
            }
        } catch {
            setError("Произошла ошибка");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200/60 animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-normaler leading-tight">Перемещение товара</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] font-bold text-slate-400 tracking-normal truncate max-w-[400px]">{item.name}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[24px] bg-slate-50 transition-all active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6 overflow-visible flex-1">
                    {/* Locations Selection Row - High z-index to stay on top of other blocks */}
                    <div className="bg-[#F8FAFC]/80 backdrop-blur-sm p-6 rounded-[24px] border border-slate-100 flex flex-col md:flex-row items-center gap-6 relative z-30">
                        <div className="flex-1 w-full space-y-3 relative z-40">
                            <label className="text-sm font-black text-slate-900 ml-1 block">Откуда (Склад-отправитель)</label>
                            <LocationSelect
                                locations={availableFromLocations}
                                value={fromLocationId}
                                onChange={setFromLocationId}
                                excludeId={toLocationId}
                                placeholder="Выберите склад..."
                                stocks={stockMap}
                            />
                        </div>

                        <div className="shrink-0">
                            <div className="w-12 h-12 rounded-[24px] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <ArrowRight className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-3 relative z-40">
                            <label className="text-sm font-black text-slate-900 ml-1 block">Куда (Склад-получатель)</label>
                            <LocationSelect
                                locations={locations}
                                value={toLocationId}
                                onChange={setToLocationId}
                                excludeId={fromLocationId}
                                placeholder="Выберите склад..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {/* Amount Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-900 ml-1 block">Количество для перемещения</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    required
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="input-premium w-full h-16 pl-6 pr-24 rounded-[24px] border border-slate-100 bg-slate-50 text-2xl font-black focus:bg-white focus:border-primary outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none tracking-normaler"
                                />
                                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    {fromLocationId && (stockMap.get(fromLocationId) || 0) > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const max = stockMap.get(fromLocationId) || 0;
                                                setAmount(max);
                                                if (navigator.vibrate) navigator.vibrate(15);
                                                toast(`Максимальное кол-во: ${max} ${item.unit}`, "info");
                                            }}
                                            className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-90"
                                        >
                                            Все
                                        </button>
                                    )}
                                    <span className="font-bold text-slate-300 pointer-events-none text-xs tracking-normal">{item.unit}</span>
                                </div>

                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                    <button
                                        type="button"
                                        onClick={() => { setAmount(prev => prev + 1); if (navigator.vibrate) navigator.vibrate(10); }}
                                        className="w-8 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-primary/40 transition-all active:scale-95 group"
                                    >
                                        <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-primary" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setAmount(prev => Math.max(1, prev - 1)); if (navigator.vibrate) navigator.vibrate(10); }}
                                        className="w-8 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-primary/40 transition-all active:scale-95 group"
                                    >
                                        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-primary" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Reason Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-900 ml-1 block">Основание / Примечание</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Пополнение остатков на точке..."
                                className="w-full h-16 p-5 rounded-[24px] border border-slate-100 bg-slate-50 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary outline-none transition-all resize-none placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="pt-4 flex items-center gap-3 p-4 rounded-[24px] bg-rose-50 text-rose-600 border border-rose-100 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-[12px] font-bold leading-tight">{error}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting || amount <= 0}
                            className="w-full h-16 rounded-[24px] btn-primary font-black text-sm tracking-normal shadow-xl text-white transition-all active:scale-95 disabled:opacity-50 shadow-primary/20"
                        >
                            {isSubmitting ? "Обработка..." : "Выполнить перемещение"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
