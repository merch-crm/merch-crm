"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";
import { InventoryItem } from "./types";
import { StorageLocation } from "./storage-locations-tab";
import { Button } from "@/components/ui/button";
import { moveInventoryItem } from "./actions";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { PremiumSelect, PremiumSelectOption } from "@/components/ui/premium-select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useToast } from "@/components/ui/toast";

interface MoveInventoryDialogProps {
    items: InventoryItem[];
    locations: StorageLocation[];
    isOpen?: boolean;
    onClose?: () => void;
    defaultItemId?: string;
    className?: string;
}

export function MoveInventoryDialog({
    items,
    locations,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    defaultItemId,
    className
}: MoveInventoryDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = (val: boolean) => {
        if (externalOnClose && !val) externalOnClose();
        setInternalIsOpen(val);
    };

    const [selectedItemId, setSelectedItemId] = useState(defaultItemId || "");
    const [fromLocationId, setFromLocationId] = useState(() => locations[0]?.id || "");
    const [toLocationId, setToLocationId] = useState(() => locations[1]?.id || locations[0]?.id || "");
    const [quantity, setQuantity] = useState("");
    const [comment, setComment] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});



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
        if (fromLocId && toLocId && fromLocId === toLocId) newErrors.toLocationId = "Склады должны быть разными";

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
            toast(res.error, "error");
        } else {
            setIsOpen(false);
            setSelectedItemId("");
            setQuantity("");
            setComment("");
            toast("Товар перемещен", "success");
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
                    className={cn(
                        "h-10 w-10 sm:h-11 sm:w-auto btn-dark rounded-full sm:rounded-[18px] p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center border-none shadow-lg shadow-black/5 transition-all active:scale-95",
                        className
                    )}
                >
                    <ArrowRightLeft className="w-5 h-5 text-white shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">Переместить</span>
                </Button>
            )}

            <ResponsiveModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Перемещение товара" showVisualTitle={false} hideClose={false}>
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-50 flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
                                <ArrowRightLeft className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Перемещение</h2>
                                <p className="text-[11px] font-bold text-slate-500 mt-0.5">Между складами</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-y-auto px-6 flex-1 pb-20 custom-scrollbar">
                        <form id="move-inventory-form" action={handleSubmit} noValidate className="space-y-5 pt-4">
                            <div className="space-y-1.5 overflow-visible">
                                <label className="text-sm font-bold text-slate-700 ml-1">Объект перемещения</label>
                                <PremiumSelect
                                    options={itemOptions}
                                    value={selectedItemId}
                                    onChange={(val) => {
                                        setSelectedItemId(val);
                                        setFieldErrors(prev => ({ ...prev, itemId: "" }));
                                    }}
                                    placeholder="Выберите товар из списка..."
                                    showSearch
                                />
                                {fieldErrors.itemId && <p className="text-[9px] font-bold text-rose-500 ml-1">{fieldErrors.itemId}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Откуда</label>
                                    <PremiumSelect
                                        options={locationOptions}
                                        value={fromLocationId}
                                        onChange={(val) => {
                                            setFromLocationId(val);
                                            setFieldErrors(prev => ({ ...prev, fromLocationId: "" }));
                                        }}
                                        placeholder="Склад..."
                                        showSearch
                                    />
                                    {fieldErrors.fromLocationId && <p className="text-[9px] font-bold text-rose-500 ml-1">{fieldErrors.fromLocationId}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Куда</label>
                                    <PremiumSelect
                                        options={locationOptions}
                                        value={toLocationId}
                                        onChange={(val) => {
                                            setToLocationId(val);
                                            setFieldErrors(prev => ({ ...prev, toLocationId: "" }));
                                        }}
                                        placeholder="Склад..."
                                        showSearch
                                    />
                                    {fieldErrors.toLocationId && <p className="text-[9px] font-bold text-rose-500 ml-1">{fieldErrors.toLocationId}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Количество <span className="text-rose-500 uppercase-none">*</span></label>
                                <div className="relative group">
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
                                            "w-full h-11 pl-4 pr-12 rounded-[var(--radius-inner)] border border-slate-200 bg-slate-50 text-sm font-bold outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm",
                                            fieldErrors.quantity && "border-rose-300 bg-rose-50 text-rose-900"
                                        )}
                                    />
                                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={() => setQuantity(prev => String(Number(prev || 0) + 1))} className="w-7 h-4 flex items-center justify-center bg-white border border-slate-200 rounded-md hover:border-primary/30 active:scale-95 transition-all shadow-sm"><ChevronUp className="w-2.5 h-2.5 text-slate-400" /></button>
                                        <button type="button" onClick={() => setQuantity(prev => String(Math.max(0, Number(prev || 0) - 1)))} className="w-7 h-4 flex items-center justify-center bg-white border border-slate-200 rounded-md hover:border-primary/30 active:scale-95 transition-all shadow-sm"><ChevronDown className="w-2.5 h-2.5 text-slate-400" /></button>
                                    </div>
                                </div>
                                {fieldErrors.quantity && <p className="text-[9px] font-bold text-rose-500 ml-1">{fieldErrors.quantity}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Причина перемещения <span className="text-rose-500 uppercase-none">*</span></label>
                                <input
                                    name="comment"
                                    placeholder="Напр: Пополнение дефицита..."
                                    value={comment}
                                    onChange={(e) => {
                                        setComment(e.target.value);
                                        setFieldErrors(prev => ({ ...prev, comment: "" }));
                                    }}
                                    className={cn(
                                        "w-full h-11 px-4 rounded-[var(--radius-inner)] border text-sm font-bold outline-none transition-all shadow-sm",
                                        fieldErrors.comment ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 bg-slate-50 focus:border-primary focus:ring-4 focus:ring-primary/5"
                                    )}
                                />
                                {fieldErrors.comment && <p className="text-[9px] font-bold text-rose-500 ml-1 leading-tight">{fieldErrors.comment}</p>}
                            </div>

                        </form>
                    </div>

                    <div className="sticky bottom-0 z-10 p-5 sm:p-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 mt-auto flex items-center sm:justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="hidden lg:inline-block h-11 sm:w-auto sm:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all text-center rounded-[var(--radius-inner)] sm:bg-transparent"
                        >
                            Отмена
                        </button>
                        <SubmitButton />
                    </div>
                </div>
            </ResponsiveModal >
        </>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            form="move-inventory-form"
            disabled={pending}
            className="h-11 w-full sm:w-auto sm:px-10 btn-dark rounded-[var(--radius-inner)] font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    Обработка...
                </div>
            ) : "Переместить"}
        </Button>
    );
}
