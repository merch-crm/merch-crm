"use client";

import { motion } from "framer-motion";
import { Search, X, Layers, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Settings2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FilterType = "all" | "in" | "out" | "transfer" | "other";

interface HistoryToolbarProps {
    isMobileSearchExpanded: boolean;
    setIsMobileSearchExpanded: (val: boolean) => void;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    setCurrentPage: (val: number) => void;
    activeFilter: string;
    setActiveFilter: (val: FilterType) => void;
}

const FILTERS: { id: string; label: string; icon: LucideIcon; color?: string }[] = [
    { id: "all", label: "Все", icon: Layers },
    { id: "in", label: "Приход", icon: ArrowUpRight },
    { id: "out", label: "Расход", icon: ArrowDownLeft },
    { id: "transfer", label: "Перемещение", icon: ArrowLeftRight },
    { id: "other", label: "Другое", icon: Settings2, color: "bg-slate-500" },
];

export function HistoryToolbar({
    isMobileSearchExpanded,
    setIsMobileSearchExpanded,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    activeFilter,
    setActiveFilter
}: HistoryToolbarProps) {
    return (
        <div className={cn(
            "crm-filter-tray w-full overflow-hidden flex items-center p-1.5 gap-1"
        )}>
            {/* Desktop: Search Box */}
            <div
                className={cn(
                    "hidden md:block relative h-11 bg-white rounded-[18px] shadow-sm flex-1"
                )}
            >
                <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors", isMobileSearchExpanded && "text-primary")} />
                <Input
                    type="text"
                    placeholder="Поиск по истории..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    onBlur={() => {
                        if (!searchQuery) {
                            setIsMobileSearchExpanded(false);
                        }
                    }}
                    onFocus={() => setIsMobileSearchExpanded(true)}
                    className={cn(
                        "w-full h-full pl-11 pr-10 bg-transparent border-none shadow-none focus-visible:ring-0 text-[13px] font-bold text-slate-800 rounded-[18px]",
                        "xl:placeholder:text-slate-400"
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
                            setCurrentPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Mobile Search */}
            <div className={cn(
                "md:hidden relative min-w-0 flex-1"
            )}>
                <div
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center z-10",
                        isMobileSearchExpanded && "text-primary"
                    )}
                >
                    <Search className={cn("w-4 h-4 text-slate-400 transition-colors", isMobileSearchExpanded && "text-primary")} />
                </div>
                <Input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    onBlur={() => {
                        if (!searchQuery) {
                            setIsMobileSearchExpanded(false);
                        }
                    }}
                    onFocus={() => setIsMobileSearchExpanded(true)}
                    className={cn(
                        "crm-filter-tray-search w-full border-none shadow-none focus-visible:ring-0 min-w-0 !rounded-[18px]",
                        "pl-11 pr-10 opacity-100 bg-white"
                    )}
                />
                {searchQuery && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setSearchQuery("");
                            setCurrentPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-300 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Desktop: Tabs */}
            <nav
                role="tablist"
                aria-label="Фильтры истории"
                className={cn(
                    "hidden md:flex items-center gap-3 shrink-0 transition-all duration-500 ease-in-out",
                    "w-auto opacity-100 visible translate-x-0"
                )}
            >
                <div className="w-px h-6 bg-slate-500/40 mx-2 shrink-0" aria-hidden="true" />
                <div className="flex items-center gap-3">
                    {FILTERS.map(f => {
                        const isActive = activeFilter === f.id;
                        return (
                            <Button
                                key={f.id}
                                type="button"
                                variant="ghost"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => {
                                    setActiveFilter(f.id as FilterType);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "crm-filter-tab rounded-[18px]",
                                    isActive && "active"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeFilterHistoryOld"
                                        className={cn(
                                            "absolute inset-0 z-0 rounded-[18px]",
                                            f.color ? f.color : "bg-primary"
                                        )}
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    />
                                )}
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <f.icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-slate-400")} aria-hidden="true" />
                                    <span className="hidden sm:inline">{f.label}</span>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile: Dropdown Filter */}
            <div className="md:hidden w-px h-6 bg-slate-400/20 shrink-0 mx-1" />
            <div className="md:hidden flex-1 min-w-0">
                <Select
                    options={FILTERS.map(f => ({
                        id: f.id,
                        title: f.label,
                        icon: <f.icon className="w-4 h-4 shrink-0" />
                    }))}
                    value={activeFilter}
                    onChange={(val: string) => {
                        setActiveFilter(val as FilterType);
                        setCurrentPage(1);
                    }}
                    variant="minimal"
                    compact
                    align="end"
                    alignOffset={-6}
                    className="w-full"
                    triggerClassName="!bg-white border-none shadow-sm !h-11 !rounded-[18px]"
                />
            </div>
        </div>
    );
}
