"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, X, MapPin, Package, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
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
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");
    const [selectedItemId, setSelectedItemId] = useState("");
    const [fromLocationId, setFromLocationId] = useState(locations[0]?.id || "");
    const [toLocationId, setToLocationId] = useState(locations[1]?.id || locations[0]?.id || "");
    const [quantity, setQuantity] = useState("");
    const [comment, setComment] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Sync defaults if locations change
    if (locations.length > 0 && !fromLocationId) {
        setFromLocationId(locations[0].id);
        if (locations.length > 1 && !toLocationId) {
            setToLocationId(locations[1].id);
        }
    }

    async function handleSubmit(formData: FormData) {
        const itemId = formData.get("itemId") as string;
        const fromLocId = formData.get("fromLocationId") as string;
        const toLocId = formData.get("toLocationId") as string;
        const qty = parseInt(formData.get("quantity") as string);
        const commentValue = formData.get("comment") as string;

        const newErrors: Record<string, string> = {};

        if (!itemId) newErrors.itemId = "Выберите товар";
        if (!fromLocId) newErrors.fromLocationId = "Выберите склад отправитель";
        if (!toLocId) newErrors.toLocationId = "Выберите склад получатель";
        if (fromLocId === toLocId) newErrors.toLocationId = "Склады должны быть разными";

        if (!qty || qty <= 0) {
            newErrors.quantity = "Введите количество";
        } else {
            const item = items.find(i => i.id === itemId);
            if (item && qty > item.quantity) {
                newErrors.quantity = `На складе всего ${item.quantity}`;
            }
        }

        if (!commentValue || commentValue.trim().length < 3) {
            newErrors.comment = "Обязательно укажите причину перемещения";
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setFieldErrors({});
        const res = await moveInventoryItem(formData);
        if (res?.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            setError("");
            setSelectedItemId("");
            setQuantity("");
            setComment("");
            router.refresh();
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 gap-2 font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 transition-all"
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

                        <form action={handleSubmit} noValidate className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Package className="w-3 h-3" /> Товар <span className="text-rose-500 font-bold">*</span>
                                </label>
                                <div className="relative group">
                                    <select
                                        name="itemId"
                                        className={cn(
                                            "w-full h-14 px-5 rounded-2xl border bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none transition-all",
                                            fieldErrors.itemId
                                                ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                : "border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                                        )}
                                        value={selectedItemId}
                                        onChange={(e) => {
                                            setSelectedItemId(e.target.value);
                                            setFieldErrors(prev => ({ ...prev, itemId: "" }));
                                        }}
                                    >
                                        <option value="">Выберите товар...</option>
                                        {items.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} {item.sku ? `(${item.sku})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {fieldErrors.itemId && (
                                    <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                        {fieldErrors.itemId}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Откуда <span className="text-rose-500 font-bold">*</span>
                                    </label>
                                    <select
                                        name="fromLocationId"
                                        className={cn(
                                            "w-full h-14 px-5 rounded-2xl border bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none transition-all",
                                            fieldErrors.fromLocationId
                                                ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                : "border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                                        )}
                                        value={fromLocationId}
                                        onChange={(e) => {
                                            setFromLocationId(e.target.value);
                                            setFieldErrors(prev => ({ ...prev, fromLocationId: "" }));
                                        }}
                                    >
                                        <option value="">Откуда...</option>
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.fromLocationId && (
                                        <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                            {fieldErrors.fromLocationId}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Куда <span className="text-rose-500 font-bold">*</span>
                                    </label>
                                    <select
                                        name="toLocationId"
                                        className={cn(
                                            "w-full h-14 px-5 rounded-2xl border bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none transition-all",
                                            fieldErrors.toLocationId
                                                ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                : "border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                                        )}
                                        value={toLocationId}
                                        onChange={(e) => {
                                            setToLocationId(e.target.value);
                                            setFieldErrors(prev => ({ ...prev, toLocationId: "" }));
                                        }}
                                    >
                                        <option value="">Куда...</option>
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.toLocationId && (
                                        <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                            {fieldErrors.toLocationId}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    Количество <span className="text-rose-500 font-bold">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="quantity"
                                        placeholder="0"
                                        value={quantity}
                                        onChange={(e) => {
                                            setQuantity(e.target.value);
                                            setFieldErrors(prev => ({ ...prev, quantity: "" }));
                                        }}
                                        className={cn(
                                            "w-full h-14 pl-5 pr-14 rounded-2xl border bg-slate-50 text-sm font-bold outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                            fieldErrors.quantity
                                                ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                : "border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                                        )}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(prev => String(Number(prev || 0) + 1))}
                                            className="w-8 h-5 flex items-center justify-center bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-indigo-300 transition-all active:scale-95 group"
                                        >
                                            <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(prev => String(Math.max(0, Number(prev || 0) - 1)))}
                                            className="w-8 h-5 flex items-center justify-center bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-indigo-300 transition-all active:scale-95 group"
                                        >
                                            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                                        </button>
                                    </div>
                                </div>
                                {fieldErrors.quantity && (
                                    <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                        {fieldErrors.quantity}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    Комментарий <span className="text-rose-500 font-bold">*</span>
                                </label>
                                <input
                                    name="comment"
                                    placeholder="Причина перемещения..."
                                    className={cn(
                                        "w-full h-14 px-5 rounded-2xl border text-sm font-bold outline-none transition-all focus:ring-4",
                                        fieldErrors.comment
                                            ? "border-rose-300 bg-rose-50/50 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                                            : "border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/5"
                                    )}
                                    value={comment}
                                    onChange={(e) => {
                                        setComment(e.target.value);
                                        setFieldErrors(prev => ({ ...prev, comment: "" }));
                                    }}
                                />
                                {fieldErrors.comment && (
                                    <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 fade-in duration-200">
                                        {fieldErrors.comment}
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
