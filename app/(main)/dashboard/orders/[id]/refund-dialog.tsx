"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { refundOrder } from "../actions/financials.actions";;
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Undo2 } from "lucide-react";
import { useBranding } from "@/components/branding-provider";

interface RefundDialogProps {
    orderId: string;
    maxAmount: number;
}

export function RefundDialog({ orderId, maxAmount }: RefundDialogProps) {
    const { currencySymbol } = useBranding();
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState(String(maxAmount));
    const [reason, setReason] = useState("");
    const [isPending, setIsPending] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleRefund = async () => {
        if (!amount || Number(amount) <= 0) {
            toast("Укажите корректную сумму", "error");
            playSound("notification_error");
            return;
        }
        if (!reason) {
            toast("Укажите причину возврата", "error");
            playSound("notification_error");
            return;
        }

        setIsPending(true);
        const res = await refundOrder(orderId, Number(amount), reason);
        setIsPending(false);

        if (res.success) {
            toast("Возврат оформлен", "success");
            playSound("expense_added");
            setIsOpen(false);
            router.refresh();
        } else {
            toast(res.error || "Ошибка при оформлении возврата", "error");
            playSound("notification_error");
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setAmount(String(maxAmount));
            setReason("");
        }
    };

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="h-11 px-6 rounded-[var(--radius-inner)] gap-2 btn-destructive-ghost font-bold text-sm"
            >
                <Undo2 className="w-4 h-4" />
                Оформить возврат
            </Button>

            <ResponsiveModal
                isOpen={isOpen}
                onClose={() => handleOpenChange(false)}
                title="Оформление возврата"
                description="Введите сумму и причину возврата денежных средств."
                className="sm:max-w-[425px]"
            >
                <div className="flex flex-col h-full">
                    <div className="p-6 pb-20 space-y-3 flex-1 overflow-y-auto">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-xs font-bold text-slate-400 ml-1">Сумма возврата ({currencySymbol})</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="h-12 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-lg font-bold text-slate-900 focus:bg-white transition-all shadow-sm"
                            />
                            <p className="text-xs font-bold text-slate-400 ml-1">Максимально доступно: <span className="text-slate-900">{maxAmount} {currencySymbol}</span></p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-xs font-bold text-slate-400 ml-1">Причина возврата</Label>
                            <Input
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Напр: Отказ клиента, брак материала..."
                                className="h-12 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 font-bold text-sm focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="sticky bottom-0 z-10 p-5 pt-3 flex items-center justify-end gap-3 shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-100 mt-auto">
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="hidden md:flex h-11 px-8 font-bold text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRefund}
                            disabled={isPending}
                            className="h-11 w-full md:w-auto md:px-10 rounded-[var(--radius-inner)] font-bold text-sm shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                        >
                            {isPending ? "Обработка..." : "Подтвердить возврат"}
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>
        </>
    );
}
