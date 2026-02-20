"use client";

import { motion } from "framer-motion";
import { Search, X, Layers, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Tag, Archive, ChevronDown, LayoutGrid, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type FilterType = "all" | "in" | "out" | "transfer" | "attribute_change" | "archive";

interface HistoryToolbarProps {
    isMobileSearchExpanded: boolean;
    setIsMobileSearchExpanded: (val: boolean) => void;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    setCurrentPage: (val: number) => void;
    activeFilter: string;
    setActiveFilter: (val: FilterType) => void;
}

const FILTERS: { id: string; label: string; icon: LucideIcon }[] = [
    { id: "all", label: "Все", icon: Layers },
    { id: "in", label: "Приход", icon: ArrowDownLeft },
    { id: "out", label: "Расход", icon: ArrowUpRight },
    { id: "transfer", label: "Перемещение", icon: ArrowLeftRight },
    { id: "attribute_change", label: "Изменения", icon: Tag },
    { id: "archive", label: "Архив", icon: Archive },
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
            "crm-filter-tray w-full overflow-hidden flex items-center p-1.5",
            isMobileSearchExpanded ? "!gap-0 !p-[6px]" : "gap-1"
        )}>
            {/* Desktop: Search Box */}
            <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileSearchExpanded(true);
                }}
                className={cn(
                    "hidden md:block relative transition-all duration-400 ease-in-out overflow-hidden h-11 bg-white rounded-[10px] shadow-sm",
                    isMobileSearchExpanded
                        ? "flex-1"
                        : "xl:flex-1 xl:w-auto xl:cursor-default xl:hover:bg-white w-[120px] cursor-pointer hover:bg-slate-50"
                )}
            >
                <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors", isMobileSearchExpanded && "text-primary")} />
                <Input
                    type="text"
                    placeholder={isMobileSearchExpanded ? "Поиск по истории..." : "Поиск"}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    onBlur={() => {
                        if (!searchQuery) {
                            setTimeout(() => setIsMobileSearchExpanded(false), 200);
                        }
                    }}
                    className={cn(
                        "w-full h-full pl-11 pr-10 bg-transparent border-none shadow-none focus-visible:ring-0 text-[13px] font-bold text-slate-800 transition-all duration-300 rounded-[10px]",
                        isMobileSearchExpanded ? "xl:placeholder:text-slate-400" : "xl:placeholder:text-slate-400 xl:cursor-text cursor-pointer"
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
                "md:hidden relative transition-all duration-300 ease-in-out min-w-0 flex-1"
            )}>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileSearchExpanded(!isMobileSearchExpanded);
                    }}
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center z-10 cursor-pointer",
                        isMobileSearchExpanded && "text-primary"
                    )}
                >
                    <Search className={cn("w-4 h-4 text-slate-400 transition-colors", isMobileSearchExpanded && "text-primary")} />
                </button>
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
                            setTimeout(() => setIsMobileSearchExpanded(false), 200);
                        }
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileSearchExpanded(true);
                    }}
                    className={cn(
                        "crm-filter-tray-search w-full border-none shadow-none focus-visible:ring-0 min-w-0 transition-all duration-300",
                        isMobileSearchExpanded
                            ? "pl-11 pr-4 opacity-100"
                            : "pl-11 pr-10 w-full opacity-100 bg-white"
                    )}
                />
                {searchQuery && isMobileSearchExpanded && (
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
                    "hidden md:flex items-center gap-[6px] shrink-0 transition-all duration-500 ease-in-out",
                    isMobileSearchExpanded
                        ? "xl:w-auto xl:opacity-100 xl:visible xl:translate-x-0 xl:overflow-visible w-0 opacity-0 invisible -translate-x-10 overflow-hidden"
                        : "w-auto opacity-100 visible translate-x-0"
                )}
            >
                <div className="w-px h-6 bg-slate-500/40 mx-2 shrink-0" aria-hidden="true" />
                <div className="flex items-center gap-[4px]">
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
                                    "crm-filter-tab",
                                    isActive && "active"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeFilterHistory"
                                        className="absolute inset-0 bg-primary rounded-[10px] z-0"
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

            {/* Mobile: Dropdown */}
            {!isMobileSearchExpanded && (
                <>
                    <div className="md:hidden w-px h-6 bg-slate-200 shrink-0 mx-0" />
                    <div className="md:hidden flex-1 min-w-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full h-11 flex items-center justify-between gap-2 px-4 rounded-[10px] bg-white shadow-sm hover:bg-slate-50 transition-colors border-none"
                                >
                                    <span className="text-[13px] font-bold text-slate-800 truncate">
                                        {FILTERS.find(f => f.id === activeFilter)?.label || "Фильтр"}
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                {FILTERS.map(f => (
                                    <DropdownMenuItem
                                        key={f.id}
                                        onClick={() => {
                                            setActiveFilter(f.id as FilterType);
                                            setCurrentPage(1);
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 text-xs font-bold py-2 cursor-pointer",
                                            activeFilter === f.id ? "text-primary bg-primary/5" : "text-slate-600"
                                        )}
                                    >
                                        <f.icon className="w-3.5 h-3.5" />
                                        {f.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </>
            )}
        </div>
    );
}
