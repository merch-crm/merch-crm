"use client";

import React from "react";
import { Search, X, Layers, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { InventoryFilters } from "../../types";
import { StorageLocation } from "../../storage-locations-tab";

interface CategoryFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isSearchExpanded: boolean;
    setIsSearchExpanded: (expanded: boolean) => void;
    filterStorage: string;
    setFilterStorage: (storage: string) => void;
    filterStatus: InventoryFilters["status"];
    setFilterStatus: (status: InventoryFilters["status"]) => void;
    storageLocations: StorageLocation[];
    itemCountsByStorage: Record<string, number>;
    isMobile: boolean;
}

export const CategoryFilters = React.memo(({
    searchQuery,
    setSearchQuery,
    isSearchExpanded,
    setIsSearchExpanded,
    filterStorage,
    setFilterStorage,
    filterStatus,
    setFilterStatus,
    storageLocations = [],
    itemCountsByStorage = {},
    isMobile
}: CategoryFiltersProps) => {
    return (
        <div className={cn(
            "crm-filter-tray w-full overflow-hidden flex flex-col lg:flex-row items-stretch lg:items-center p-1.5 gap-1 lg:gap-3",
            (isSearchExpanded && isMobile) ? "gap-0" : ""
        )}>
            {/* Search & Storage Group */}
            <div className={cn(
                "flex items-center gap-2",
                "w-full lg:w-auto lg:flex-1",
                (isSearchExpanded && isMobile) ? "gap-0" : ""
            )}>
                {/* Search Field */}
                <div className={cn(
                    "relative transition-all duration-300 ease-in-out h-11",
                    (isSearchExpanded && isMobile) ? "flex-1 w-full" : "flex-1"
                )}>
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isMobile) setIsSearchExpanded(true);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (isMobile) setIsSearchExpanded(true);
                            }
                        }}
                        className={cn(
                            "absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center z-10 cursor-pointer transition-colors duration-300",
                            isSearchExpanded && "text-primary"
                        )}
                    >
                        <Search className={cn("w-4 h-4 transition-colors duration-300", isSearchExpanded ? "text-primary" : "text-slate-400")} />
                    </div>
                    <input
                        type="text"
                        placeholder={isSearchExpanded ? "Поиск по названию или артикулу..." : "Поиск..."}
                        value={searchQuery}
                        onFocus={() => setIsSearchExpanded(true)}
                        onBlur={() => {
                            if (!searchQuery) {
                                setTimeout(() => setIsSearchExpanded(false), 200);
                            }
                        }}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "crm-filter-tray-search w-full h-full focus:outline-none min-w-0 transition-all duration-300 rouded-[16px]",
                            (isSearchExpanded && isMobile)
                                ? "pl-11 pr-4 bg-white/50 rounded-[16px]"
                                : "pl-11 pr-10 bg-white rounded-[16px] shadow-sm"
                        )}
                    />
                    {searchQuery && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery("");
                                setIsSearchExpanded(false);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-300 hover:text-slate-600 transition-colors duration-300"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Storage Select - Hides on search expand (Mobile) */}
                <div className={cn(
                    "transition-all duration-300 ease-in-out bg-white rounded-[16px] shadow-sm",
                    (isSearchExpanded && isMobile)
                        ? "w-0 flex-none opacity-0 invisible overflow-hidden border-none"
                        : "w-auto opacity-100 visible flex-1 sm:flex-none min-w-[140px]"
                )}>
                    <Select
                        options={[
                            { id: "all", title: "Все склады" },
                            ...storageLocations.map(loc => ({
                                id: loc.id,
                                title: loc.name,
                                badge: itemCountsByStorage[loc.id] ? `${itemCountsByStorage[loc.id]} поз.` : undefined
                            }))
                        ]}
                        value={filterStorage}
                        onChange={setFilterStorage}
                        variant="minimal"
                        triggerClassName="border-none shadow-none bg-transparent h-11 w-full"
                        align="end"
                        className="w-full h-full"
                    />
                </div>
            </div>

            <div className="hidden lg:block w-px h-6 bg-slate-300 mx-1 shrink-0" />

            {/* Status Pills Section */}
            <div className={cn(
                "flex items-center gap-1.5 p-1 lg:p-0 rounded-2xl w-full lg:w-auto shrink-0 transition-all duration-500 ease-in-out lg:mt-0 max-h-20"
            )}>
                {[
                    { id: "all", label: "Все", icon: Layers },
                    { id: "in", label: "В наличии", icon: CheckCircle2, color: "emerald" },
                    { id: "low", label: "Скоро закончится", icon: AlertTriangle, color: "amber" },
                    { id: "out", label: "Нет", icon: XCircle, color: "rose" }
                ].map((f) => {
                    const isActive = filterStatus === f.id;
                    const StatusIcon = f.icon;
                    return (
                        <Button
                            key={f.id}
                            type="button"
                            variant="ghost"
                            onClick={() => setFilterStatus(f.id as InventoryFilters["status"])}
                            className={cn(
                                "crm-filter-tab flex-1 lg:flex-none text-[11px] sm:text-xs py-2 sm:py-0 px-2 sm:px-6 h-9 min-h-0",
                                isActive && "active"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeItemStatusTab"
                                    className="absolute inset-0 bg-primary rounded-[10px] z-0"
                                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                />
                            )}
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                <StatusIcon className={cn(
                                    "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                                    isActive ? "text-white" : (f.color ? `text-${f.color}-500` : "text-slate-400")
                                )} />
                                <span className="hidden sm:inline whitespace-nowrap">{f.label}</span>
                            </div>
                        </Button>
                    );
                })}
            </div>
        </div >
    );
});

CategoryFilters.displayName = "CategoryFilters";
