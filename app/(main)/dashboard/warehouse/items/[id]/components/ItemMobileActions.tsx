"use client";

import {
    SlidersHorizontal,
    ArrowRightLeft,
    Printer,
    FileDown,
    Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { useToast } from "@/components/ui/toast";
import { type TabletTab } from "../hooks/useItemDetailController";

interface ItemMobileActionsProps {
    setAdjustType: (type: "in" | "out" | "set" | null) => void;
    setShowTransfer: (show: boolean) => void;
    setShowLabelDialog: (show: boolean) => void;
    handleDownload: () => void;
    setShowArchiveReason: (show: boolean) => void;
    item: InventoryItem;
    tabletTab: TabletTab;
}

export function ItemMobileActions({
    setAdjustType,
    setShowTransfer,
    setShowLabelDialog,
    handleDownload,
    setShowArchiveReason,
    item,
    tabletTab
}: ItemMobileActionsProps) {
    const { toast } = useToast();

    return (
        <div className="grid grid-cols-2 gap-3 mt-4 md:mt-0">
            <button
                type="button"
                aria-label="Корректировка остатка"
                onClick={() => setAdjustType("set")}
                className="group relative flex flex-col items-start justify-between p-4 aspect-square bg-primary rounded-[24px] shadow-lg shadow-primary/20 hover:bg-[#731cff] transition-all active:scale-95 overflow-hidden border-none text-white cursor-pointer w-full"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform duration-700" />
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white relative z-10 p-0">
                    <SlidersHorizontal className="w-5 h-5" />
                </div>
                <span className="text-[11px] sm:text-[13px] font-bold text-white leading-tight relative z-10 text-left">
                    Корректировка<br />остатка
                </span>
            </button>

            <button
                type="button"
                aria-label="Перемещение товара"
                onClick={() => setShowTransfer(true)}
                className="group relative flex flex-col items-start justify-between p-4 aspect-square bg-slate-900 rounded-[24px] shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 overflow-hidden border-none text-white cursor-pointer w-full"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform duration-700" />
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white relative z-10 p-0">
                    <ArrowRightLeft className="w-5 h-5" />
                </div>
                <span className="text-[11px] sm:text-[13px] font-bold text-white leading-tight relative z-10 text-left">
                    Перемещение<br />товара
                </span>
            </button>

            {/* Additional Actions - Mobile Only */}
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowLabelDialog(true)}
                className={cn(
                    "group aspect-square h-auto flex flex-col items-center justify-center bg-card rounded-3xl border border-border shadow-sm hover:border-violet-500 hover:bg-violet-500 hover:text-white hover:shadow-xl hover:shadow-violet-500/20 transition-all text-muted-foreground order-last md:hidden",
                    tabletTab !== 'characteristic' && "hidden"
                )}
                title="Печать этикетки"
                aria-label="Печать этикетки"
            >
                <Printer className="w-7 h-7" />
            </Button>
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDownload}
                className={cn(
                    "group aspect-square h-auto flex flex-col items-center justify-center bg-card rounded-3xl border border-border shadow-sm hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-xl hover:shadow-emerald-500/20 transition-all text-muted-foreground order-last md:hidden",
                    tabletTab !== 'characteristic' && "hidden"
                )}
                title="Экспорт PDF"
                aria-label="Экспорт в PDF"
            >
                <FileDown className="w-7 h-7" />
            </Button>
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                    if (item.quantity > 0) {
                        toast("Нельзя архивировать товар с остатком > 0", "error");
                        return;
                    }
                    setShowArchiveReason(true);
                }}
                className={cn(
                    "group aspect-square h-auto flex flex-col items-center justify-center bg-card rounded-3xl border border-border shadow-sm hover:border-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-xl hover:shadow-rose-500/20 transition-all text-muted-foreground order-last md:hidden",
                    tabletTab !== 'characteristic' && "hidden"
                )}
                title="Архивировать"
                aria-label="В архив"
            >
                <Archive className="w-7 h-7" />
            </Button>
        </div>
    );
}
