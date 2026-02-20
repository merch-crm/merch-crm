import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Building, ArrowRightLeft, RefreshCw } from "lucide-react";

import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn, formatUnit } from "@/lib/utils";

import { moveInventoryItem } from "../../stock-actions";
import { StorageLocation, StorageLocationItem } from "../../storage-locations-tab";

interface QuickTransferModalProps {
    item: StorageLocationItem;
    currentLocationId: string;
    locations: StorageLocation[];
    onClose: () => void;
    onSuccess: (itemId: string, quantity: number) => void;
}

export function QuickTransferModal({ item, currentLocationId, locations, onClose, onSuccess }: QuickTransferModalProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [state, setState] = useState({
        toLocationId: "",
        errors: {} as Record<string, string>
    });

    async function handleTransfer(formData: FormData) {
        const toLocationId = formData.get("toLocationId") as string;
        const qtyS = formData.get("quantity") as string;
        const qty = parseInt(qtyS);
        const comment = formData.get("comment") as string;
        const newErrors: Record<string, string> = {};

        if (!toLocationId) newErrors.toLocationId = "Выберите склад получатель";
        if (!qtyS || isNaN(qty) || qty <= 0) newErrors.quantity = "Введите корректное количество";
        else if (qty > item.quantity) newErrors.quantity = `Максимально: ${item.quantity}`;
        if (!comment || comment.trim().length < 3) newErrors.comment = "Укажите причину";

        if (Object.keys(newErrors).length > 0) {
            setState(prev => ({ ...prev, errors: newErrors }));
            return;
        }

        setState(prev => ({ ...prev, errors: {} }));
        const res = await moveInventoryItem(formData);
        if (!res?.success) {
            toast(res.error, "error");
            playSound("notification_error");
        } else {
            toast(`Товар перемещен`, "success");
            playSound("stock_replenished");
            onSuccess(item.id, qty);
            router.refresh();
            onClose();
        }
    }

    return (
        <ResponsiveModal isOpen={!!item} onClose={onClose} showVisualTitle={false}>
            <div className="p-8 flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">Перемещение</h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">Экспресс-операция</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 shadow-inner group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="text-xs font-bold text-slate-400 mb-1 group-hover:text-primary transition-colors">Объект перемещения</div>
                    <div className="text-sm font-bold text-slate-900 truncate">{item.name}</div>
                    <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 bg-white rounded-[var(--radius-inner)] border border-slate-200 text-xs font-bold text-primary shadow-sm tabular-nums">
                        Доступно: {item.quantity} {formatUnit(item.unit)}
                    </div>
                </div>

                <form action={handleTransfer} className="space-y-4">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="fromLocationId" value={currentLocationId} />

                    <div className="space-y-2 overflow-visible">
                        <label className="text-sm font-bold text-slate-700 ml-1">Куда переместить <span className="text-rose-500">*</span></label>
                        <Select
                            options={locations.filter(l => l.id !== currentLocationId).map(l => ({ id: l.id, title: l.name, icon: <Building className="w-4 h-4 opacity-50" /> }))}
                            value={state.toLocationId}
                            onChange={(val) => setState(prev => ({ ...prev, toLocationId: val, errors: { ...prev.errors, toLocationId: "" } }))}
                            placeholder="Выберите склад"
                        />
                        <input type="hidden" name="toLocationId" value={state.toLocationId} />
                        {state.errors.toLocationId && <p className="text-xs font-bold text-rose-500 ml-1 leading-none">{state.errors.toLocationId}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Количество <span className="text-rose-500">*</span></label>
                            <Input
                                type="number"
                                name="quantity"
                                min="1"
                                max={item.quantity}
                                placeholder="0"
                                className={cn(
                                    "w-full h-11 px-4 rounded-[var(--radius-inner)] border bg-slate-50 text-sm font-bold outline-none transition-all shadow-sm tabular-nums",
                                    state.errors.quantity ? "border-rose-200 bg-rose-50/50" : "border-slate-200 bg-slate-50 focus:border-primary"
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Причина <span className="text-rose-500">*</span></label>
                            <Input
                                name="comment"
                                placeholder="..."
                                className={cn(
                                    "w-full h-11 px-4 rounded-[var(--radius-inner)] border bg-slate-50 text-sm font-bold outline-none transition-all shadow-sm",
                                    state.errors.comment ? "border-rose-200 bg-rose-50/50" : "border-slate-200 bg-slate-50 focus:border-primary"
                                )}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3 w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex h-11 w-full max-w-[120px] text-slate-400 font-bold text-sm hover:text-slate-600 transition-all items-center justify-center p-0"
                        >
                            Отмена
                        </Button>
                        <div className="flex-1">
                            <TransferSubmitButton />
                        </div>
                    </div>
                </form>
            </div>
        </ResponsiveModal>
    );
}

function TransferSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            variant="btn-dark"
            type="submit"
            disabled={pending}
            className="w-full h-11 rounded-[var(--radius-inner)] font-bold text-sm active:scale-95 flex items-center justify-center gap-2"
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Обработка...</span>
                </div>
            ) : (
                <>
                    <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
                    Переместить
                </>
            )}
        </Button>
    );
}
