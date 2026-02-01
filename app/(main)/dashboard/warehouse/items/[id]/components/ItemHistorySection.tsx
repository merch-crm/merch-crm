"use client";

import React from "react";
import {
    History,
    Search,
    X,
    ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemHistoryTransaction } from "../../../types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { PremiumPagination } from "@/components/ui/premium-pagination";

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
        <div className="rounded-[var(--radius-inner)] border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-4 text-[12px] font-bold text-slate-400">Тип</th>
                            <th className="px-4 py-4 text-[12px] font-bold text-slate-400">Изменение</th>
                            <th className="px-4 py-4 text-[12px] font-bold text-slate-400">Склад</th>
                            <th className="px-4 py-4 text-[12px] font-bold text-slate-400">Причина</th>
                            <th className="px-4 py-4 text-[12px] font-bold text-slate-400">Автор</th>
                            <th className="px-4 py-4 text-[12px] font-bold text-slate-400 text-right">Дата</th>
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
                                            <span className="text-[13px] font-bold text-slate-900">
                                                {tx.type === "in" ? "Приход" : tx.type === "out" ? "Расход" : tx.type === "transfer" ? "Перемещение" : "Обновление"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left">
                                        <span className={cn(
                                            "text-[13px] font-bold",
                                            isPositive ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {isPositive ? "+" : ""}{tx.changeAmount}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-[13px] font-bold text-slate-500">{tx.storageLocation?.name || "—"}</span>
                                    </td>
                                    <td className="px-4 py-4 min-w-[120px] max-w-[240px]">
                                        <div className="text-[12px] font-bold text-slate-500 leading-snug">
                                            {(() => {
                                                const transferMatch = tx.reason?.match(/(?:Перемещение|Получено) со склада "(.+)" на "(.+)"(?:\. Причина: (.+))?/);

                                                if (transferMatch) {
                                                    const from = transferMatch[1];
                                                    const to = transferMatch[2];
                                                    const comment = transferMatch[3];

                                                    return (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="font-bold text-slate-700 flex items-center gap-1.5">
                                                                {from} <ArrowRight className="w-3 h-3 text-slate-400" /> {to}
                                                            </div>
                                                            {comment && <div className="text-slate-500 font-medium truncate">{comment}</div>}
                                                        </div>
                                                    );
                                                }
                                                return tx.reason || "—";
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-[13px] font-bold text-slate-600">
                                            {tx.creator?.name || "Система"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                        <span className="text-[10px] font-bold text-slate-300">
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
        <div className="py-20 text-center bg-slate-50/50 rounded-[var(--radius-inner)] border-2 border-dashed border-slate-200/50">
            <div className="w-20 h-20 bg-white rounded-[var(--radius-inner)] shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <History className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-xs font-bold text-slate-400">{searchQuery || filterType ? "Ничего не найдено" : "Операций не найдено"}</p>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Controls - Photo 2 Style */}
            <div className="crm-filter-tray gap-6 mb-8">
                {/* Search Input Box */}
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по истории..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full h-11 bg-white border-none rounded-[var(--radius-inner)] pl-14 pr-10 text-[13px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setCurrentPage(1);
                            }}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters - Right Aligned */}
                <div className="flex items-center px-1 gap-2">
                    {[
                        { id: null, label: 'Все' },
                        { id: 'in', label: 'Приход' },
                        { id: 'out', label: 'Расход' },
                        { id: 'transfer', label: 'Перемещение' }
                    ].map((btn) => {
                        const isActive = filterType === btn.id;
                        return (
                            <button
                                key={String(btn.id)}
                                onClick={() => {
                                    setFilterType(btn.id);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "relative px-6 py-2.5 rounded-[var(--radius-inner)] text-[13px] font-bold transition-all duration-300 whitespace-nowrap group",
                                    isActive ? "text-white" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabHistory"
                                        className="absolute inset-0 bg-primary rounded-[var(--radius-inner)] shadow-lg shadow-primary/25"
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    />
                                )}
                                <span className="relative z-10">{btn.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* View Area */}
            {renderTableView()}

            {/* Pagination */}
            {filteredHistory.length > 0 && (
                <div className="pt-2">
                    <PremiumPagination
                        currentPage={currentPage}
                        totalItems={filteredHistory.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        itemNames={['операция', 'операции', 'операций']}
                    />
                </div>
            )}
        </div>
    );
}
