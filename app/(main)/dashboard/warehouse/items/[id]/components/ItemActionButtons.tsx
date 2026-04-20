"use client";

import {
  SlidersHorizontal,
  Printer,
  FileDown,
  Archive,
  Boxes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type TabletTab } from "../hooks/useItemDetailController";

interface ItemActionButtonsProps {
  setAdjustType: (type: "in" | "out" | "set" | null) => void;
  setShowLabelDialog: (show: boolean) => void;
  handleDownload: () => void;
  onArchive: () => void;
  tabletTab: TabletTab;
}

export function ItemActionButtons({
  setAdjustType,
  setShowLabelDialog,
  handleDownload,
  onArchive,
  tabletTab
}: ItemActionButtonsProps) {


  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:mt-0 xl:mt-0">
      <Button
        type="button"
        aria-label="Корректировка остатка"
        onClick={() => setAdjustType("set")}
        className={cn(
          "group relative flex flex-col items-start justify-between p-5 h-auto",
          "bg-gradient-to-br from-violet-500 via-violet-600 to-violet-800",
          "rounded-[var(--radius-outer)] xl:rounded-[32px]",
          "shadow-[0_8px_20px_-6px_rgba(139,92,246,0.4)] hover:shadow-[0_16px_30px_-8px_rgba(139,92,246,0.6)]",
          "transition-all duration-500 ease-out active:scale-[0.96] active:translate-y-0",
          "overflow-hidden border-none text-white cursor-pointer w-full",
          "aspect-square xl:hidden xl:aspect-[3.2/1] xl:col-span-4"
        )}
      >
        {/* Thematic background icon: Boxes, stroke 1.5, low opacity (global to avoid overlap) */}
        <Boxes className="absolute top-0 right-0 w-32 h-32 text-white opacity-[0.05] -mr-8 -mt-8 -rotate-12 transition-all duration-700 ease-out group-hover:scale-90 group-hover:-translate-x-4 group-hover:translate-y-4" strokeWidth={1.5} />

        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl transition-all duration-700 ease-out group-hover:bg-white/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Subtle glass edge */}
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20 pointer-events-none" />

        <div className="w-11 h-11 rounded-[14px] bg-white/10 backdrop-blur-md ring-1 ring-white/30 shadow-xl flex items-center justify-center text-white relative z-10 transition-all duration-500 ease-out group-hover:scale-90 group-hover:bg-white/20 group-hover:shadow-white/10">
          <SlidersHorizontal className="w-5 h-5 drop-shadow-md" />
        </div>

        <div className="relative z-10 flex flex-col items-start w-full mt-auto">
          <span className="text-sm sm:text-[15px] font-bold leading-tight text-white drop-shadow-md transition-transform duration-500 ease-out group-hover:translate-x-1 text-left">
            Корректировка<br />остатка
          </span>
          <span className="text-xs text-white/80 font-medium opacity-0 -translate-x-4 max-h-0 group-hover:max-h-5 group-hover:opacity-100 group-hover:translate-x-1 group-hover:mt-1 transition-all duration-500 ease-out">
            Настроить наличие
          </span>
        </div>
      </Button>

      {/* Additional Actions — hidden on md+ (desktop has them in header) */}
      <Button type="button" variant="outline" size="icon" onClick={() => setShowLabelDialog(true)}
        className={cn(
          "group aspect-square h-auto flex flex-col items-center justify-center",
          "bg-card rounded-3xl border border-border shadow-sm",
          "hover:border-violet-500 hover:bg-violet-500 hover:text-white hover:shadow-xl hover:shadow-violet-500/20",
          "transition-all text-muted-foreground order-last md:hidden",
          tabletTab !== 'characteristic' && "hidden"
        )}
        title="Печать этикетки"
        aria-label="Печать этикетки"
      >
        <Printer className="w-7 h-7" />
      </Button>
      <Button type="button" variant="outline" size="icon" onClick={handleDownload} className={cn( "group aspect-square h-auto flex flex-col items-center justify-center", "bg-card rounded-3xl border border-border shadow-sm", "hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-xl hover:shadow-emerald-500/20", "transition-all text-muted-foreground order-last md:hidden", tabletTab !== 'characteristic' && "hidden" )} title="Экспорт PDF" aria-label="Экспорт в PDF">
        <FileDown className="w-7 h-7" />
      </Button>
      <Button type="button" variant="outline" size="icon" onClick={onArchive} className={cn( "group aspect-square h-auto flex flex-col items-center justify-center", "bg-card rounded-3xl border border-border shadow-sm", "hover:border-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-xl hover:shadow-rose-500/20", "transition-all text-muted-foreground order-last md:hidden", tabletTab !== 'characteristic' && "hidden" )} title="Архивировать" aria-label="В архив">
        <Archive className="w-7 h-7" />
      </Button>
    </div>
  );
}
