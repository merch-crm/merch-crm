"use client";

import { useState, useEffect } from "react";

import { Plus, Minus, X, AlertCircle, Package, MapPin, RefreshCw } from "lucide-react";
import { adjustInventoryStock } from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorageLocation } from "./storage-locations-tab";
import { StorageLocationSelect } from "@/components/ui/storage-location-select";


interface AdjustStockDialogProps {
    item: {
        id: string;
        name: string;
        quantity: number;
        unit: string;
        storageLocationId?: string | null;
    };
    locations: StorageLocation[];
    itemStocks?: { storageLocationId: string, quantity: number }[];
    onClose: () => void;
    initialType?: "in" | "out" | "set";
}


export function AdjustStockDialog({ item, locations, itemStocks, onClose, initialType = "in" }: AdjustStockDialogProps) {

    const [amount, setAmount] = useState<number>(initialType === "set" ? item.quantity : 1);
    const [type, setType] = useState<"in" | "out" | "set">(initialType);
    const [selectedLocationId, setSelectedLocationId] = useState<string>(item.storageLocationId || "");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

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
            // @ts-ignore - type "set" is handled in action now
            const res = await adjustInventoryStock(item.id, amount, type, reason, selectedLocationId);
            if (res.success) {
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

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Корректировка</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Package className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-xs font-bold text-slate-500 truncate max-w-[200px]">{item.name}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
                    {/* Current Stock Indicator */}
                    <div className="bg-indigo-50/50 rounded-2xl p-5 flex items-center justify-between border border-indigo-100/50">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Текущий остаток</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[150px] block">{selectedLocationName}</span>
                        </div>
                        <span className="text-2xl font-black text-slate-900">{selectedLocationId ? currentStockOnLocation : item.quantity} <span className="text-sm text-slate-400 uppercase">{item.unit}</span></span>
                    </div>


                    {/* Type Selector */}
                    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => { setType("in"); setAmount(1); }}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                type === "in"
                                    ? "bg-white text-emerald-600 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Plus className="w-4 h-4" />
                            Приход
                        </button>
                        <button
                            type="button"
                            onClick={() => { setType("out"); setAmount(1); }}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                type === "out"
                                    ? "bg-white text-rose-600 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Minus className="w-4 h-4" />
                            Расход
                        </button>
                        <button
                            type="button"
                            onClick={() => { setType("set"); setAmount(item.quantity); }}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                type === "set"
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Корр.
                        </button>
                    </div>

                    {/* Warehouse Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Выберите склад
                        </label>
                        <StorageLocationSelect
                            value={selectedLocationId}
                            onChange={setSelectedLocationId}
                            options={Array.isArray(locations) ? locations : []}
                        />
                    </div>



                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            {type === "set" ? "Новый остаток" : "Количество"}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-xl font-black focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{item.unit}</span>
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Причина</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Напр. Поставка от 12.01 или Списание на образец"
                            className="w-full min-h-[100px] p-5 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting || amount <= 0}
                        className={cn(
                            "w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50",
                            type === "in"
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                                : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                        )}
                    >
                        {isSubmitting ? "Обработка..." : type === "in" ? "Оприходовать" : "Списать"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
