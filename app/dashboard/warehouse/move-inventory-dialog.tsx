"use client";

import { useState } from "react";
import { ArrowRightLeft, X, MapPin, Package, AlertCircle } from "lucide-react";
import { InventoryItem } from "./inventory-client";
import { StorageLocation } from "./storage-locations-tab";
import { Button } from "@/components/ui/button";
import { moveInventoryItem } from "./actions"; // Will be created
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";


interface MoveInventoryDialogProps {
    items: InventoryItem[];
    locations: StorageLocation[];
}

export function MoveInventoryDialog({ items, locations }: MoveInventoryDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");
    const [selectedItemId, setSelectedItemId] = useState("");
    const [fromLocationId, setFromLocationId] = useState(locations[0]?.id || "");
    const [toLocationId, setToLocationId] = useState(locations[1]?.id || locations[0]?.id || "");
    const [commentError, setCommentError] = useState(false);

    // Sync defaults if locations change
    if (locations.length > 0 && !fromLocationId) {
        setFromLocationId(locations[0].id);
        if (locations.length > 1 && !toLocationId) {
            setToLocationId(locations[1].id);
        }
    }

    async function handleSubmit(formData: FormData) {
        const res = await moveInventoryItem(formData);
        if (res?.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            setError("");
            setSelectedItemId("");
            // Reset to defaults
            setFromLocationId(locations[0]?.id || "");
            setToLocationId(locations[1]?.id || locations[0]?.id || "");
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] px-6 gap-2 font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 transition-all"
            >
                <ArrowRightLeft className="w-5 h-5" />
                Переместить позиции
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Перемещение</h2>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Отгрузка между складами</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl bg-slate-50 transition-all hover:rotate-90"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form action={(formData) => {
                            const comment = formData.get("comment") as string;
                            if (!comment || !comment.trim()) {
                                setCommentError(true);
                                return;
                            }
                            setCommentError(false);
                            handleSubmit(formData);
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Package className="w-3 h-3" /> Товар
                                </label>
                                <div className="relative group">
                                    <select
                                        name="itemId"
                                        required
                                        className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        value={selectedItemId}
                                        onChange={(e) => setSelectedItemId(e.target.value)}
                                    >
                                        <option value="">Выберите товар...</option>
                                        {items.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} {item.sku ? `(${item.sku})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> Откуда
                                    </label>
                                    <select
                                        name="fromLocationId"
                                        required
                                        className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        value={fromLocationId}
                                        onChange={(e) => setFromLocationId(e.target.value)}
                                    >
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> Куда
                                    </label>
                                    <select
                                        name="toLocationId"
                                        required
                                        className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        value={toLocationId}
                                        onChange={(e) => setToLocationId(e.target.value)}
                                    >
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id} disabled={loc.id === fromLocationId}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Количество</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    required
                                    min="1"
                                    placeholder="0"
                                    className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Комментарий <span className="text-rose-500 text-[10px] align-top">*</span></label>
                                <input
                                    name="comment"
                                    placeholder="Причина перемещения..."
                                    className={cn(
                                        "w-full h-14 px-5 rounded-2xl border text-sm font-bold focus:ring-4 outline-none transition-all",
                                        commentError
                                            ? "border-rose-300 bg-rose-50/50 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                                            : "border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/5"
                                    )}
                                    onChange={() => setCommentError(false)}
                                />
                                {commentError && (
                                    <p className="absolute -bottom-5 left-1 text-[10px] font-bold text-rose-500 animate-in slide-in-from-top-1 fade-in duration-200">
                                        Обязательно укажите причину перемещения
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in shake duration-500">
                                    <AlertCircle className="w-5 h-5 text-rose-500" />
                                    <p className="text-rose-600 text-xs font-bold">{error}</p>
                                </div>
                            )}

                            <SubmitButton />
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] mt-4"
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Перемещение...
                </div>
            ) : "Переместить товар"}
        </Button>
    );
}
