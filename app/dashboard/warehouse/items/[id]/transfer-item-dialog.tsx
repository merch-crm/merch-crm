"use client";

import { useState } from "react";
import { X, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorageLocation } from "../../storage-locations-tab";
import { transferInventoryStock } from "../../actions";
import { useToast } from "@/components/ui/toast";

interface TransferItemDialogProps {
    item: {
        id: string;
        name: string;
        quantity: number;
        unit: string;
        // Optionally pass stocks breakdown to prefill "from" locations
        itemStocks?: { id: string, storageLocationId: string, quantity: number }[]
    };
    locations: StorageLocation[];
    onClose: () => void;
}

export function TransferItemDialog({ item, locations, onClose }: TransferItemDialogProps) {
    const { toast } = useToast();
    const [fromLocationId, setFromLocationId] = useState("");
    const [toLocationId, setToLocationId] = useState("");
    const [amount, setAmount] = useState<number>(1);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Filter available source locations (where stock > 0)
    // We might need to fetch this or rely on passed props. 
    // For now assuming user knows or we can improve later.
    // Ideally we should pass 'itemStocks'.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!fromLocationId) return setError("Выберите склад отправитель");
        if (!toLocationId) return setError("Выберите склад получатель");
        if (fromLocationId === toLocationId) return setError("Склады должны отличаться");
        if (amount <= 0) return setError("Неверное количество");

        setIsSubmitting(true);

        try {
            const res = await transferInventoryStock(item.id, fromLocationId, toLocationId, amount, reason);
            if (res.success) {
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
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Перемещение</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-500 truncate max-w-[300px]">{item.name}</span>
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
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Откуда</label>
                            <select
                                value={fromLocationId}
                                onChange={(e) => setFromLocationId(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Склад...</option>
                                {locations.map(l => (
                                    <option key={l.id} value={l.id} disabled={l.id === toLocationId}>{l.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pb-3 text-slate-300">
                            <ArrowRight className="w-5 h-5" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Куда</label>
                            <select
                                value={toLocationId}
                                onChange={(e) => setToLocationId(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Склад...</option>
                                {locations.map(l => (
                                    <option key={l.id} value={l.id} disabled={l.id === fromLocationId}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

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

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Причина (опционально)</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Напр. Пополнение запасов"
                            className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
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
                        disabled={isSubmitting}
                        className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? "Перемещение..." : "Переместить"}
                    </Button>
                </form>
            </div>
        </div>
    );
}

