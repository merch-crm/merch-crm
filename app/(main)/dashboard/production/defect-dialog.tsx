"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportProductionDefect } from "./actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DefectDialogProps {
    orderItemId: string;
    maxQuantity: number;
    itemName: string;
}

export function DefectDialog({ orderItemId, maxQuantity, itemName }: DefectDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [quantity, setQuantity] = useState(String(maxQuantity));
    const [reason, setReason] = useState("");
    const [isPending, setIsPending] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleReport = async () => {
        if (!quantity || Number(quantity) <= 0) {
            toast("Укажите корректное количество", "error");
            return;
        }
        if (!reason) {
            toast("Укажите причину списания", "error");
            return;
        }

        setIsPending(true);
        const res = await reportProductionDefect(orderItemId, Number(quantity), reason);
        setIsPending(false);

        if (res.success) {
            toast("Брак зафиксирован. Остатки списаны.", "success");
            playSound("notification_success");
            setIsOpen(false);
            router.refresh();
        } else {
            toast(res.error || "Ошибка при списании брака", "error");
            playSound("notification_error");
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                className="flex-1 px-3 py-1.5 h-auto bg-rose-50 text-rose-600 rounded-[8px] text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100"
            >
                Брак
            </Button>

            <ResponsiveModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Зафиксировать брак"
                description={`Позиция: ${itemName}`}
                className="max-w-md"
            >
                <div className="flex flex-col">
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-sm">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-slate-900 leading-tight">Списание брака</h3>
                                <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                                    {itemName}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-[11px] font-bold text-slate-400">Количество брака (шт)</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="h-12 bg-slate-50 border-slate-200 font-bold rounded-2xl"
                                />
                                <p className="text-xs text-slate-400 font-bold">Максимально в этой позиции: {maxQuantity} шт</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-[11px] font-bold text-slate-400">Причина брака</Label>
                                <Input
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Напр: Ошибка печати, дырка…"
                                    className="h-12 bg-slate-50 border-slate-200 font-bold rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="w-full sm:flex-1 h-12 rounded-2xl font-bold text-slate-600 border-slate-200"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            onClick={handleReport}
                            disabled={isPending}
                            className="w-full sm:flex-1 h-12 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200"
                        >
                            {isPending ? "Списание..." : "Списать брак"}
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>
        </>
    );
}
