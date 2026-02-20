"use client";

import React from "react";
import { ClipboardList, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ItemHistoryTransaction } from "@/app/(main)/dashboard/warehouse/types";
import { ItemHistorySection } from "./ItemHistorySection";

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
        <div className={cn(
            "crm-card rounded-3xl p-4 sm:p-8 space-y-4",
            "md:col-span-2 xl:col-span-12",
            tabletTab === 'history' ? "block" : "hidden",
            "xl:block"
        )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-foreground">История операций</h3>
                </div>
                <Button
                    size="sm"
                    onClick={onExport}
                    className="h-10 px-6 rounded-2xl bg-foreground border-none text-background text-[13px] font-black hover:bg-foreground/90 active:scale-95 shadow-lg shadow-foreground/20 transition-all"
                >
                    <Printer className="w-4 h-4 mr-2" />
                    Скачать
                </Button>
            </div>
            <ItemHistorySection history={history} />
        </div>
    );
}
