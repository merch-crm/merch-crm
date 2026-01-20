"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, ArrowRight, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorageLocation } from "../../storage-locations-tab";
import { transferInventoryStock } from "../../actions";
import { useToast } from "@/components/ui/toast";

import { LocationSelect } from "../../location-select";
import { cn } from "@/lib/utils";

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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

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

            <div className="relative w-full max-w-lg bg-white rounded-[18px] shadow-xl border border-slate-200 animate-in zoom-in-95 duration-300 overflow-visible">
                <div className="p-10 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Перемещение</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-400 truncate max-w-[300px]">{item.name}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[18px] bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-8">
                    <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-medium text-slate-400 ml-1 block">Откуда</label>
                            <LocationSelect
                                locations={locations}
                                value={fromLocationId}
                                onChange={setFromLocationId}
                                excludeId={toLocationId}
                                placeholder="Склад..."
                            />
                        </div>

                        <div className="shrink-0 mb-1.5 text-slate-300">
                            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-medium text-slate-400 ml-1 block">Куда</label>
                            <LocationSelect
                                locations={locations}
                                value={toLocationId}
                                onChange={setToLocationId}
                                excludeId={fromLocationId}
                                placeholder="Склад..."
                                // Applying the className to the LocationSelect component
                                // Assuming LocationSelect accepts a className prop and applies it to its input element
                                className={cn(
                                    "input-premium w-full h-12 px-4 rounded-[var(--radius)] border bg-slate-50 text-sm font-bold outline-none transition-all appearance-none cursor-pointer",
                                    fieldErrors.toLocationId
                                        ? "border-rose-400 bg-rose-50/30 ring-4 ring-rose-500/5 text-rose-900"
                                        : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-medium text-slate-400 ml-1">Количество</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="input-premium w-full h-14 pl-5 pr-24 rounded-[18px] border border-slate-100 bg-slate-50 text-xl font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute right-12 top-1/2 -translate-y-1/2 font-bold text-slate-400 pointer-events-none">{item.unit}</span>

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => setAmount(prev => prev + 1)}
                                    className="w-8 h-5 flex items-center justify-center bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-indigo-300 transition-all active:scale-95 group"
                                >
                                    <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAmount(prev => Math.max(1, prev - 1))}
                                    className="w-8 h-5 flex items-center justify-center bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-indigo-300 transition-all active:scale-95 group"
                                >
                                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 ml-1">Причина</label>
                        <input
                            type="text"
                            name="comment"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Причина перемещения..."
                            className="input-premium w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-[18px] bg-rose-50 text-rose-600">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 rounded-[18px] font-semibold text-sm shadow-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? "Перемещение..." : "Переместить"}
                    </Button>
                </form>
            </div>
        </div>
    );
}

