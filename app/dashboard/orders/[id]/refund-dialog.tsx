"use client";

import { useState } from "react";
import { refundOrder } from "../actions";
import { useToast } from "@/components/ui/toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Undo2 } from "lucide-react";

interface RefundDialogProps {
    orderId: string;
    maxAmount: number;
}

export function RefundDialog({ orderId, maxAmount }: RefundDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState(String(maxAmount));
    const [reason, setReason] = useState("");
    const [isPending, setIsPending] = useState(false);
    const { toast } = useToast();

    const handleRefund = async () => {
        if (!amount || Number(amount) <= 0) {
            toast("Укажите корректную сумму", "error");
            return;
        }
        if (!reason) {
            toast("Укажите причину возврата", "error");
            return;
        }

        setIsPending(true);
        const res = await refundOrder(orderId, Number(amount), reason);
        setIsPending(false);

        if (res.success) {
            toast("Возврат оформлен", "success");
            setIsOpen(false);
            window.location.reload();
        } else {
            toast(res.error || "Ошибка при оформлении возврата", "error");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-rose-600 border-rose-100 hover:bg-rose-50">
                    <Undo2 className="w-4 h-4" />
                    Оформить возврат
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Оформление возврата</DialogTitle>
                    <DialogDescription>
                        Введите сумму и причину возврата денежных средств.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Сумма возврата (₽)</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                        <p className="text-[10px] text-slate-400">Максимально доступно: {maxAmount} ₽</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Причина возврата</Label>
                        <Input
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Напр: Отказ клиента, брак материала..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
                    <Button variant="destructive" onClick={handleRefund} disabled={isPending}>
                        {isPending ? "Обработка..." : "Подтвердить возврат"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
