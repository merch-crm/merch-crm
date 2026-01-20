"use client";

import { useState } from "react";
import { reportProductionDefect } from "./actions";
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
            setIsOpen(false);
            window.location.reload();
        } else {
            toast(res.error || "Ошибка при списании брака", "error");
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-rose-600" />
                    </div>
                    <DialogTitle>Зафиксировать брак</DialogTitle>
                    <DialogDescription>
                        Списание испорченного материала со склада для позиции: <br />
                        <span className="font-bold text-slate-900">{itemName}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
                    <Button variant="destructive" onClick={handleReport} disabled={isPending}>
                        {isPending ? "Обработка..." : "Списать брак"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
