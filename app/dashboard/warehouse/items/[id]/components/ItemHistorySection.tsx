"use client";

import React from "react";
import {
    History,
    ArrowUpRight,
    ArrowDownLeft,
    User,
    Calendar,
    ArrowRightLeft,
    Settings2,
    ChevronRight,
    LayoutList,
    Table as TableIcon,
    Search,
    Activity,
    Info,
    X,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemHistoryTransaction } from "../../../types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion } from "framer-motion";
import { pluralize } from "@/lib/pluralize";

interface ItemHistorySectionProps {
    history: ItemHistoryTransaction[];
}

export function ItemHistorySection({ history }: ItemHistorySectionProps) {
    const [viewMode, setViewMode] = React.useState<"list" | "table">("list");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [filterType, setFilterType] = React.useState<string | null>(null);

    const filteredHistory = React.useMemo(() => {
        let result = history;
        if (filterType) {
            result = result.filter(tx => tx.type === filterType);
        }
        if (searchQuery) {
            result = result.filter(tx =>
                tx.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.creator?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return result;
    }, [history, searchQuery, filterType]);

    const renderListView = () => (
        <div className="space-y-3">
            {filteredHistory.length > 0 ? (
                filteredHistory.map((tx, idx) => {
                    const isPositive = tx.changeAmount > 0;
                    const isTransfer = tx.type === "transfer";
                    const isAttrChange = tx.type === "attribute_change";

                    return (
                        <div key={tx.id || idx} className="relative overflow-hidden rounded-lg group">
                            {/* Swipe Background Actions */}
                            <div className="absolute inset-0 bg-primary flex items-center justify-end px-6">
                                <div className="flex flex-col items-center gap-1 text-white">
                                    <Info className="w-5 h-5" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Детали</span>
                                </div>
                            </div>

                            <motion.div
                                drag="x"
                                dragConstraints={{ left: -100, right: 0 }}
                                dragElastic={0.1}
                                className="relative z-10 flex items-center gap-5 p-5 md:p-6 rounded-lg bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-grab active:cursor-grabbing"
                            >
                                {/* Transaction Icon Circle */}
                                <div className={
                                    cn(
                                        "w-14 h-14 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 duration-300 shrink-0 shadow-sm",
                                        isAttrChange ? "bg-slate-900 text-white" :
                                            isTransfer ? "bg-primary text-white" :
                                                isPositive ? "bg-white text-emerald-600" : "bg-white text-rose-500"
                                    )}>
                                    {isAttrChange ? <Settings2 className="w-6 h-6" /> :
                                        isTransfer ? <ArrowRightLeft className="w-6 h-6" /> :
                                            isPositive ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h4 className="text-[12px] font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                                            {tx.type === "in" ? "Приход" :
                                                tx.type === "out" ? "Расход" :
                                                    tx.type === "transfer" ? "Перемещение" : "Обновление"}
                                            {isPositive && !isTransfer && !isAttrChange && (
                                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full tracking-widest border border-emerald-100">+ СТОК</span>
                                            )}
                                            {!isPositive && !isTransfer && !isAttrChange && (
                                                <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full tracking-widest border border-rose-100">- СТОК</span>
                                            )}
                                        </h4>
                                        <span className={cn(
                                            "text-2xl font-black tabular-nums tracking-tighter",
                                            isAttrChange ? "text-slate-300" :
                                                isPositive ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {isAttrChange ? "" : `${isPositive ? "+" : ""}${tx.changeAmount}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
                                        <p className="text-[12px] font-bold text-slate-500 whitespace-normal break-words leading-tight max-w-[400px]">
                                            {tx.reason || "Регулярная операция по ведомостям"}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/50 px-2.5 py-1 rounded-lg border border-slate-100">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            {tx.storageLocation?.name || "Основной склад"}
                                        </div>
                                    </div>
                                </div>

                                <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-primary transition-all shrink-0 transform group-hover:translate-x-1" />
                            </motion.div>
                        </div>
                    );
                })
            ) : renderEmpty()}
        </div>
    );

    const renderTableView = () => (
        <div className="bg-white rounded-lg border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Тип</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Изменение</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Локация</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Причина</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Автор</th>
                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Дата</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredHistory.map((tx, idx) => {
                            const isPositive = tx.changeAmount > 0;
                            return (
                                <tr key={tx.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                tx.type === 'in' ? "bg-emerald-500" : tx.type === 'out' ? "bg-rose-500" : "bg-primary"
                                            )} />
                                            <span className="text-[11px] font-black uppercase tracking-tighter text-slate-900">
                                                {tx.type === "in" ? "Приход" : tx.type === "out" ? "Расход" : "Пер."}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            "text-sm font-black tracking-tighter",
                                            isPositive ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {isPositive ? "+" : ""}{tx.changeAmount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-[11px] font-bold text-slate-500">{tx.storageLocation?.name || "—"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[11px] font-medium text-slate-500 line-clamp-1 max-w-[200px]">{tx.reason || "—"}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400 border border-slate-200 uppercase">
                                                {tx.creator?.name.charAt(0)}
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-600">{tx.creator?.name || "Система"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-[10px] font-black text-slate-300 tracking-tighter">
                                            {format(new Date(tx.createdAt), "dd.MM.yy HH:mm")}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {filteredHistory.length === 0 && renderEmpty()}
        </div>
    );

    const renderEmpty = () => (
        <div className="py-20 text-center bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200/50">
            <div className="w-20 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <History className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Операций не найдено</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-lg border border-slate-200/50">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по истории..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-[11px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Type Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                        {[
                            { id: null, label: 'Все' },
                            { id: 'in', label: 'Приход' },
                            { id: 'out', label: 'Расход' },
                            { id: 'transfer', label: 'Пер.' }
                        ].map((btn) => (
                            <button
                                key={String(btn.id)}
                                onClick={() => setFilterType(btn.id)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                    filterType === btn.id
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "bg-white text-slate-400 border border-slate-200 hover:border-primary/20 hover:text-slate-600"
                                )}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block" />

                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm shrink-0">
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <LayoutList className="w-3.5 h-3.5" />
                            Список
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === 'table' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                            Таблица
                        </button>
                    </div>
                </div>
            </div>

            {/* View Area */}
            {viewMode === 'list' ? renderListView() : renderTableView()}

            {/* Load More */}
            {history.length > 5 && (
                <button className="w-full py-4 rounded-lg bg-white border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:border-transparent transition-all duration-300 shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 group">
                    <Activity className="w-3.5 h-3.5 group-hover:animate-bounce" />
                    Показать еще {history.length - 5} {pluralize(history.length - 5, 'запись', 'записи', 'записей')}
                </button>
            )}
        </div>
    );
}
