"use client";

import { useState } from "react";
import { Plus, Minus, X, AlertCircle, Package, MapPin } from "lucide-react";
import { adjustInventoryStock } from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorageLocation } from "./storage-locations-tab";

interface AdjustStockDialogProps {
    item: {
        id: string;
        name: string;
        quantity: number;
        unit: string;
        storageLocationId?: string | null;
    };
    locations: StorageLocation[];
    onClose: () => void;
}

export function AdjustStockDialog({ item, locations, onClose }: AdjustStockDialogProps) {
    const [amount, setAmount] = useState<number>(1);
    const [type, setType] = useState<"in" | "out">("in");
    const [selectedLocationId, setSelectedLocationId] = useState<string>(item.storageLocationId || (locations.length > 0 ? locations[0].id : ""));
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) return;
        if (locations.length > 0 && !selectedLocationId) {
            setError("Выберите склад");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
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
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Текущий остаток</span>
                        <span className="text-lg font-black text-slate-900">{item.quantity} {item.unit}</span>
                    </div>

                    {/* Type Selector */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setType("in")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
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
                            onClick={() => setType("out")}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                                type === "out"
                                    ? "bg-white text-rose-600 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Minus className="w-4 h-4" />
                            Расход
                        </button>
                    </div>

                    {/* Warehouse Selector */}
                    {locations.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Склад
                            </label>
                            <select
                                value={selectedLocationId}
                                onChange={(e) => setSelectedLocationId(e.target.value)}
                                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Выберите склад...</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Количество</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="1"
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
