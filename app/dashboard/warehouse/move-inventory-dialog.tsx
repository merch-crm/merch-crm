"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, X, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
import { InventoryItem } from "./inventory-client";
import { StorageLocation } from "./storage-locations-tab";
import { Button } from "@/components/ui/button";
import { moveInventoryItem } from "./actions";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { PremiumSelect, PremiumSelectOption } from "@/components/ui/premium-select";


interface MoveInventoryDialogProps {
    items: InventoryItem[];
    locations: StorageLocation[];
    isOpen?: boolean;
    onClose?: () => void;
    defaultItemId?: string;
}

export function MoveInventoryDialog({
    items,
    locations,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    defaultItemId
}: MoveInventoryDialogProps) {
    const router = useRouter();
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = (val: boolean) => {
        if (externalOnClose && !val) externalOnClose();
        setInternalIsOpen(val);
    };

    const [error, setError] = useState("");
    const [selectedItemId, setSelectedItemId] = useState(defaultItemId || "");
    // Initialize with default values directly to avoid setState in useEffect
    const [fromLocationId, setFromLocationId] = useState(() => locations[0]?.id || "");
    const [toLocationId, setToLocationId] = useState(() => locations[1]?.id || locations[0]?.id || "");
    const [quantity, setQuantity] = useState("");
    const [comment, setComment] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Lock scroll when open
    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    async function handleSubmit(formData: FormData) {
        formData.set("itemId", selectedItemId);
        formData.set("fromLocationId", fromLocationId);
        formData.set("toLocationId", toLocationId);

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

    const itemOptions: PremiumSelectOption[] = items.map(item => ({
        id: item.id,
        title: item.name,
        description: item.sku ? `SKU: ${item.sku}` : `Остаток: ${item.quantity} шт.`
    }));

    const locationOptions: PremiumSelectOption[] = locations.map(loc => ({
        id: loc.id,
        title: loc.name,
        description: loc.description || "Место хранения"
    }));

    return (
        <>
            {!externalIsOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-12 btn-primary rounded-[var(--radius)] px-6 gap-2 font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                    <ArrowRightLeft className="w-5 h-5" />
                    Переместить позиции
                </Button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-normaler uppercase leading-none">Перемещение</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">Между складами</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl bg-slate-50 transition-all active:scale-95"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto pr-2 flex-1 pb-2">
                            <form action={handleSubmit} noValidate className="space-y-6">
                                <div className="space-y-2">
                                    <PremiumSelect
                                        label="Товар"
                                        options={itemOptions}
                                        value={selectedItemId}
                                        onChange={(val) => {
                                            setSelectedItemId(val);
                                            setFieldErrors(prev => ({ ...prev, itemId: "" }));
                                        }}
                                        placeholder="Выберите товар..."
                                        showSearch
                                    />
                                    {fieldErrors.itemId && (
                                        <p className="text-[10px] font-bold text-rose-500 ml-1">
                                            {fieldErrors.itemId}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <PremiumSelect
                                            label="Откуда"
                                            options={locationOptions}
                                            value={fromLocationId}
                                            onChange={(val) => {
                                                setFromLocationId(val);
                                                setFieldErrors(prev => ({ ...prev, fromLocationId: "" }));
                                            }}
                                            placeholder="Откуда..."
                                        />
                                        {fieldErrors.fromLocationId && (
                                            <p className="text-[10px] font-bold text-rose-500 ml-1">
                                                {fieldErrors.fromLocationId}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <PremiumSelect
                                            label="Куда"
                                            options={locationOptions}
                                            value={toLocationId}
                                            onChange={(val) => {
                                                setToLocationId(val);
                                                setFieldErrors(prev => ({ ...prev, toLocationId: "" }));
                                            }}
                                            placeholder="Куда..."
                                        />
                                        {fieldErrors.toLocationId && (
                                            <p className="text-[10px] font-bold text-rose-500 ml-1">
                                                {fieldErrors.toLocationId}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-500 ml-1 flex items-center gap-1">
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
                                                "input-premium w-full pl-5 pr-14 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:bg-white focus:border-primary",
                                                fieldErrors.quantity && "border-rose-300 bg-rose-50/50 text-rose-900"
                                            )}
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(prev => String(Number(prev || 0) + 1))}
                                                className="w-8 h-5 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-primary/20 transition-all active:scale-95 group"
                                            >
                                                <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-primary" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(prev => String(Math.max(0, Number(prev || 0) - 1)))}
                                                className="w-8 h-5 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-primary/20 transition-all active:scale-95 group"
                                            >
                                                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-primary" />
                                            </button>
                                        </div>
                                    </div>
                                    {fieldErrors.quantity && (
                                        <p className="text-[10px] font-bold text-rose-500 ml-1">
                                            {fieldErrors.quantity}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-500 ml-1 flex items-center gap-1">
                                        Комментарий <span className="text-rose-500 font-bold">*</span>
                                    </label>
                                    <input
                                        name="comment"
                                        placeholder="Причина перемещения..."
                                        className={cn(
                                            "input-premium w-full px-5 h-14 rounded-2xl border text-sm font-bold outline-none transition-all",
                                            fieldErrors.comment
                                                ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500"
                                                : "border-slate-100 bg-slate-50 focus:bg-white focus:border-primary"
                                        )}
                                        value={comment}
                                        onChange={(e) => {
                                            setComment(e.target.value);
                                            setFieldErrors(prev => ({ ...prev, comment: "" }));
                                        }}
                                    />
                                    {fieldErrors.comment && (
                                        <p className="text-[10px] font-bold text-rose-500 ml-1">
                                            {fieldErrors.comment}
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-rose-500" />
                                        <p className="text-rose-600 text-xs font-bold">{error}</p>
                                    </div>
                                )}

                                <SubmitButton />
                            </form>
                        </div>
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
            className="w-full h-16 btn-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4"
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Обработка...
                </div>
            ) : "Переместить товар"}
        </Button>
    );
}
