"use client";

import {
    LayoutGrid,
    MapPin,
    Banknote,
    ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { type TabletTab } from "../hooks/useItemDetailController";

interface ItemMobileTabsProps {
    tabletTab: TabletTab;
    setTabletTab: (tab: TabletTab) => void;
}

export function ItemMobileTabs({ tabletTab, setTabletTab }: ItemMobileTabsProps) {
    return (
        <div className="flex md:hidden col-span-2 bg-card rounded-full p-1 shadow-sm border border-border items-center justify-between gap-1 overflow-x-auto relative z-0 mt-1">
            {[
                { id: 'characteristic', label: 'Инфо', icon: LayoutGrid },
                { id: 'placement', label: 'Склады', icon: MapPin },
                { id: 'cost', label: 'Цена', icon: Banknote },
                { id: 'history', label: 'История', icon: ClipboardList }
            ].map((tab) => {
                const isActive = tabletTab === tab.id;
                return (
                    <Button
                        type="button"
                        key={tab.id}
                        onClick={() => setTabletTab(tab.id as TabletTab)}
                        variant="ghost"
                        className={cn(
                            "relative flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-[11px] font-bold transition-all whitespace-nowrap flex-1 active:scale-95 outline-none focus:outline-none border-none shadow-none h-auto p-0 bg-transparent hover:bg-transparent",
                            isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabBackgroundOverlay"
                                className="absolute inset-0 bg-primary rounded-full shadow-md shadow-primary/20 -z-10"
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30
                                }}
                            />
                        )}
                        <div className="relative z-10 flex items-center justify-center gap-1.5">
                            <tab.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </div>
                    </Button>
                );
            })}
        </div>
    );
}
