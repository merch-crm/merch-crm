"use client";

import React from "react";
import {
    History,
    Search,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemHistoryTransaction } from "../../../types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Pagination } from "@/components/ui/pagination";

interface ItemHistorySectionProps {
    history: ItemHistoryTransaction[];
}

export function ItemHistorySection({ history }: ItemHistorySectionProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [filterType, setFilterType] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 10;

    const filteredHistory = React.useMemo(() => {
        let result = history;
        if (filterType) {
            result = result.filter(tx => tx.type === filterType);
        }
        if (searchQuery) {
            result = result.filter(tx =>
                tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.creator?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return result;
    }, [history, searchQuery, filterType]);

    const paginatedHistory = React.useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredHistory.slice(start, start + pageSize);
    }, [filteredHistory, currentPage, pageSize]);

    const renderTableView = () => (
        <div className="bg-white rounded-lg border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-4 text-[12px] font-black text-slate-400">Тип</th>
                            <th className="px-4 py-4 text-[12px] font-black text-slate-400">Изменение</th>
                            <th className="px-4 py-4 text-[12px] font-black text-slate-400">Склад</th>
                            <th className="px-4 py-4 text-[12px] font-black text-slate-400">Причина</th>
                            <th className="px-4 py-4 text-[12px] font-black text-slate-400">Автор</th>
                            <th className="px-4 py-4 text-[12px] font-black text-slate-400 text-right">Дата</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedHistory.map((tx, idx) => {
                            const isPositive = tx.changeAmount > 0;
                            return (
                                <tr key={tx.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                tx.type === 'in' ? "bg-emerald-500" : tx.type === 'out' ? "bg-rose-500" : "bg-primary"
                                            )} />
                                            <span className="text-[13px] font-black text-slate-900">
                                                {tx.type === "in" ? "Приход" : tx.type === "out" ? "Расход" : tx.type === "transfer" ? "Перемещение" : "Обновление"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left">
                                        <span className={cn(
                                            "text-[13px] font-black tracking-normaler",
                                            isPositive ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {isPositive ? "+" : ""}{tx.changeAmount}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-[13px] font-black text-slate-500">{tx.storageLocation?.name || "—"}</span>
                                    </td>
                                    <td className="px-4 py-4 min-w-[120px] max-w-[180px]">
                                        <p className="text-[12px] font-bold text-slate-500 leading-snug line-clamp-3">{tx.reason || "—"}</p>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-[13px] font-black text-slate-600">
                                            {tx.creator?.name || "Система"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                        <span className="text-[10px] font-black text-slate-300 tracking-normaler">
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
            <p className="text-xs font-bold text-slate-400">{searchQuery || filterType ? "Ничего не найдено" : "Операций не найдено"}</p>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Controls - Redesigned in Pill Style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-200/40 backdrop-blur-md p-1.5 rounded-[18px] border border-white/40 shadow-inner">
                {/* Search Input */}
                <div className="relative flex-1 md:min-w-[300px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по истории..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                        className="w-full h-12 bg-white/80 border border-slate-200/50 rounded-xl pl-12 pr-10 text-[12px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setCurrentPage(1); // Reset to first page on clear search
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center h-12 rounded-xl overflow-x-auto no-scrollbar relative">
                    {[
                        { id: null, label: 'Все' },
                        { id: 'in', label: 'Приход' },
                        { id: 'out', label: 'Расход' },
                        { id: 'transfer', label: 'Перемещение' }
                    ].map((btn) => {
                        const isActive = filterType === btn.id;
                        return (
                            <motion.button
                                key={String(btn.id)}
                                onClick={() => {
                                    setFilterType(btn.id);
                                    setCurrentPage(1); // Reset to first page on filter change
                                }}
                                className={cn(
                                    "relative px-6 h-full rounded-xl text-[13px] font-black transition-colors whitespace-nowrap z-10 flex items-center justify-center",
                                    isActive ? "text-white" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary rounded-xl -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {btn.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* View Area */}
            {renderTableView()}

            {/* Pagination */}
            {filteredHistory.length > 0 && (
                <div className="pt-2">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredHistory.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        itemNames={['записи', 'записей', 'записей']}
                    />
                </div>
            )}
        </div>
    );
}
