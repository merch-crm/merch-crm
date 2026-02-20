"use client";

import { motion } from "framer-motion";
import { LayoutGrid, MapPin, Banknote, ClipboardList, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type TabletTab } from "../hooks/useItemDetailController";

interface ItemTabsSwitcherProps {
    tabletTab: TabletTab;
    setTabletTab: (tab: TabletTab) => void;
}

const TABS: { id: TabletTab; label: string; icon: LucideIcon }[] = [
    { id: 'characteristic', label: 'Характеристики', icon: LayoutGrid },
    { id: 'placement', label: 'Разменение', icon: MapPin },
    { id: 'cost', label: 'Стоимость', icon: Banknote },
    { id: 'history', label: 'История', icon: ClipboardList }
];

export function ItemTabsSwitcher({ tabletTab, setTabletTab }: ItemTabsSwitcherProps) {
    return (
        <div className="hidden md:flex xl:hidden col-span-2 bg-card rounded-[22px] p-1.5 shadow-sm border border-border items-center justify-between gap-2 overflow-x-auto relative z-0">
            {TABS.map((tab) => {
                const isActive = tabletTab === tab.id;
                return (
                    <Button
                        key={tab.id}
                        onClick={() => setTabletTab(tab.id)}
                        variant="ghost"
                        className={cn(
                            "relative flex items-center justify-center gap-2 py-3 px-6 rounded-[16px] text-[13px] font-bold transition-all whitespace-nowrap flex-1 active:scale-95 outline-none focus:outline-none border-none shadow-none h-auto bg-transparent hover:bg-transparent p-0",
                            isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabletTab"
                                className="absolute inset-0 bg-primary rounded-[16px] shadow-md shadow-primary/20 -z-10"
                                transition={{
                                    type: "spring",
                                    bounce: 0,
                                    duration: 0.4
                                }}
                            />
                        )}
                        <tab.icon className={cn(
                            "relative z-10 w-4 h-4 transition-transform duration-300",
                            isActive ? "text-primary-foreground scale-110" : "text-muted-foreground"
                        )} />
                        <span className="relative z-10">{tab.label}</span>
                    </Button>
                );
            })}
        </div>
    );
}
