"use client";

import { useState } from "react";
import { reportProductionDefect } from "./actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

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
            window.location.reload();
        } else {
            toast(res.error || "Ошибка при списании брака", "error");
            playSound("notification_error");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-[8px] text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100"
                >
                    Брак
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-[var(--radius-outer)]">
                <div className="p-6">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-sm">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 leading-tight">Зафиксировать брак</h3>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                Позиция: <span className="text-slate-900 font-bold">{itemName}</span>
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Количество брака (шт)</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400">Максимально в этой позиции: {maxQuantity} шт</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Причина брака</Label>
                            <Input
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Напр: Ошибка печати, дырка на футболке..."
                            />
                        </div>
                    </div>
                </div>
                <div className="p-6 pt-2 flex gap-3 bg-white rounded-b-[var(--radius-outer)]">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="btn-dialog-ghost flex-1"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleReport}
                        disabled={isPending}
                        className="btn-dialog-destructive flex-[1.5]"
                    >
                        {isPending ? "Обработка..." : "Списать брак"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
