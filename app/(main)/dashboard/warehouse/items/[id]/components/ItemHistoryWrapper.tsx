"use client";

import React from "react";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemHistoryTransaction } from "@/app/(main)/dashboard/warehouse/types";
import { ItemHistorySection } from "./ItemHistorySection";
import { Button } from "@/components/ui/button";

interface ItemHistoryWrapperProps {
  history: ItemHistoryTransaction[];
  onExport: () => void;
  tabletTab: string;
}

export function ItemHistoryWrapper({
  history,
  onExport,
  tabletTab
}: ItemHistoryWrapperProps) {
  return (
    <div className={cn("bg-white border border-slate-100/60 rounded-[28px] p-6 flex flex-col gap-3 shadow-sm", "md:col-span-2 xl:col-span-12",
      tabletTab === 'history' ? "block" : "hidden", "xl:flex"
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[17px] font-black text-slate-900">История операций</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="text-sm font-bold text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-colors flex items-center gap-1.5 h-auto p-0 border-none shadow-none"
        >
          <Printer className="w-3.5 h-3.5" />
          Скачать
        </Button>
      </div>
      <ItemHistorySection history={history} />
    </div>
  );
}
