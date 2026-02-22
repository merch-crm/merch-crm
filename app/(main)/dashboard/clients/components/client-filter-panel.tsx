"use client";

import { memo } from "react";
import { Search, SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ClientFilters } from "../actions";;

export interface ClientUiState {
    showFilters: boolean;
    showHistory: boolean;
    showManagerSelect: boolean;
    showDeleteConfirm: boolean;
    isBulkUpdating: boolean;
    searchHistory: string[];
}

interface ClientFilterPanelProps {
    filters: ClientFilters;
    setFilters: (filters: ClientFilters | ((prev: ClientFilters) => ClientFilters)) => void;
    uiState: ClientUiState;
    setUiState: (uiState: ClientUiState | ((prev: ClientUiState) => ClientUiState)) => void;
    regions: string[];
    onAddToHistory: (query: string) => void;
}

export const ClientFilterPanel = memo(function ClientFilterPanel({
    filters,
    setFilters,
    uiState,
    setUiState,
    regions,
    onAddToHistory
}: ClientFilterPanelProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Поиск клиентов..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && onAddToHistory(filters.search || "")}
                        onFocus={() => setUiState(prev => ({ ...prev, showHistory: true }))}
                        className="w-full h-12 pl-11 pr-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400"
                    />

                    <AnimatePresence>
                        {uiState.showHistory && uiState.searchHistory.length > 0 && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setUiState(prev => ({ ...prev, showHistory: false }))}
                                    className="fixed inset-0 z-10"
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                        <span className="text-[11px] font-black text-slate-400">Недавние запросы</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                localStorage.removeItem("client_search_history");
                                                setUiState(prev => ({ ...prev, searchHistory: [] }));
                                            }}
                                            className="h-6 text-[11px] font-bold text-slate-400 hover:text-rose-500"
                                        >
                                            Очистить
                                        </Button>
                                    </div>
                                    <div className="p-1">
                                        {uiState.searchHistory.map((h, i) => (
                                            <button type="button"
                                                key={i}
                                                onClick={() => {
                                                    setFilters(prev => ({ ...prev, search: h }));
                                                    setUiState(prev => ({ ...prev, showHistory: false }));
                                                }}
                                                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-3 transition-colors"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setUiState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                        className={cn(
                            "h-12 px-6 rounded-2xl gap-2 font-bold transition-all active:scale-95",
                            uiState.showFilters ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-100"
                        )}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Фильтры
                        {(filters.period !== "all" || filters.orderCount !== "any" || filters.region !== "all" || filters.status !== "all" || filters.showArchived) && (
                            <span className="ml-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[11px] ring-2 ring-white">
                                !
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {uiState.showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 ml-1">
                                        Период
                                    </label>
                                    <Select
                                        value={filters.period || "all"}
                                        onChange={(val: string) => setFilters(prev => ({ ...prev, period: val as ClientFilters['period'] }))}
                                        options={[
                                            { id: "all", title: "Весь период" },
                                            { id: "month", title: "За месяц" },
                                            { id: "quarter", title: "За квартал" },
                                            { id: "year", title: "За год" },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 ml-1">
                                        Кол-во заказов
                                    </label>
                                    <Select
                                        value={filters.orderCount || "any"}
                                        onChange={(val: string) => setFilters(prev => ({ ...prev, orderCount: val as ClientFilters['orderCount'] }))}
                                        options={[
                                            { id: "any", title: "Любое количество" },
                                            { id: "0", title: "Новые (0)" },
                                            { id: "1-5", title: "Постоянные (1-5)" },
                                            { id: "5+", title: "VIP (5+)" },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 ml-1">
                                        Регион
                                    </label>
                                    <Select
                                        value={filters.region || "all"}
                                        onChange={(val: string) => setFilters(prev => ({ ...prev, region: val }))}
                                        options={[
                                            { id: "all", title: "Все города" },
                                            ...regions.map(r => ({ id: r, title: r }))
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 ml-1">
                                        Статус
                                    </label>
                                    <Select
                                        value={filters.status || "all"}
                                        onChange={(val: string) => setFilters(prev => ({ ...prev, status: val as ClientFilters['status'] }))}
                                        options={[
                                            { id: "all", title: "Все статусы" },
                                            { id: "lost", title: "Потерянные" }
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button type="button"
                                        onClick={() => setFilters(prev => ({ ...prev, showArchived: !prev.showArchived }))}
                                        className="flex items-center gap-2 group cursor-pointer"
                                    >
                                        <div className={cn(
                                            "w-10 h-6 rounded-full transition-colors relative",
                                            filters.showArchived ? "bg-slate-900" : "bg-slate-200"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                                filters.showArchived ? "left-5" : "left-1"
                                            )} />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Показать архив</span>
                                    </button>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setFilters({
                                        page: 1,
                                        limit: 50,
                                        search: "",
                                        sortBy: "alphabet",
                                        period: "all",
                                        orderCount: "any",
                                        region: "all",
                                        status: "all",
                                        showArchived: false
                                    })}
                                    className="h-10 px-5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                >
                                    Сбросить фильтры
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Filters Chips */}
            {(filters.period !== "all" || filters.orderCount !== "any" || filters.region !== "all" || filters.status !== "all" || filters.showArchived) && (
                <div className="flex flex-wrap gap-2 px-1">
                    {filters.period !== "all" && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-full text-[11px] font-black">
                            Период: {filters.period}
                            <button type="button" onClick={() => setFilters(prev => ({ ...prev, period: "all" }))}><X className="w-3 h-3 hover:text-rose-400" /></button>
                        </div>
                    )}
                    {filters.orderCount !== "any" && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-full text-[11px] font-black">
                            Заказов: {filters.orderCount}
                            <button type="button" onClick={() => setFilters(prev => ({ ...prev, orderCount: "any" }))}><X className="w-3 h-3 hover:text-rose-400" /></button>
                        </div>
                    )}
                    {filters.region !== "all" && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-full text-[11px] font-black">
                            Город: {filters.region}
                            <button type="button" onClick={() => setFilters(prev => ({ ...prev, region: "all" }))}><X className="w-3 h-3 hover:text-rose-400" /></button>
                        </div>
                    )}
                    {filters.status !== "all" && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-full text-[11px] font-black">
                            Статус: потерянный
                            <button type="button" onClick={() => setFilters(prev => ({ ...prev, status: "all" }))}><X className="w-3 h-3 hover:text-rose-400" /></button>
                        </div>
                    )}
                    {filters.showArchived && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-full text-[11px] font-black">
                            Архив
                            <button type="button" onClick={() => setFilters(prev => ({ ...prev, showArchived: false }))}><X className="w-3 h-3 hover:text-rose-100" /></button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
