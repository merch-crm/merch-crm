"use client";

import { Printer, FileDown, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";

interface ItemActionButtonsProps {
    item: InventoryItem;
    setShowLabelDialog: (show: boolean) => void;
    handleDownload: () => void;
    setShowArchiveReason: (show: boolean) => void;
}

export function ItemActionButtons({
    item,
    setShowLabelDialog,
    handleDownload,
    setShowArchiveReason
}: ItemActionButtonsProps) {
    const { toast } = useToast();
    return (
        <>
            <Button
                onClick={() => setShowLabelDialog(true)}
                variant="outline"
                className="group aspect-square flex items-center justify-center bg-card rounded-3xl border border-border shadow-sm hover:border-violet-500 hover:bg-violet-500 hover:text-white hover:shadow-xl hover:shadow-violet-500/20 transition-all text-muted-foreground p-0 h-auto"
                title="Печать этикетки"
            >
                <Printer className="w-8 h-8 transition-transform" />
            </Button>
            <Button
                onClick={handleDownload}
                variant="outline"
                className="group aspect-square flex items-center justify-center bg-card rounded-3xl border border-border shadow-sm hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-xl hover:shadow-emerald-500/20 transition-all text-muted-foreground p-0 h-auto"
                title="Экспорт PDF"
            >
                <FileDown className="w-8 h-8 transition-transform" />
            </Button>
            <Button
                onClick={() => {
                    if (item.quantity > 0) {
                        toast("Нельзя архивировать товар с остатком > 0", "error");
                        return;
                    }
                    setShowArchiveReason(true);
                }}
                variant="outline"
                className="group aspect-square flex items-center justify-center bg-card rounded-3xl border border-border shadow-sm hover:border-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-xl hover:shadow-rose-500/20 transition-all text-muted-foreground p-0 h-auto"
                title="В архив"
            >
                <Archive className="w-8 h-8 transition-transform" />
            </Button>
        </>
    );
}
