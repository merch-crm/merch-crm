"use client";

import React from "react";
import {
    History,
    Search,
    X,
    ArrowRight,
    ArrowUpCircle,
    ArrowDownCircle,
    ArrowRightLeft,
    Book,
    Clock,
    Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemHistoryTransaction } from "../../../types";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
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
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-2xl border border-slate-200 overflow-hidden">
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
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm transition-transform",
                                                    tx.type === "transfer"
                                                        ? "bg-primary/5 text-primary border border-primary/20"
                                                        : tx.type === "attribute_change"
                                                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                                                            : tx.type === "archive"
                                                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                                                : tx.type === "restore"
                                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                    : tx.type === 'in'
                                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                        : "bg-rose-50 text-rose-600 border border-rose-100"
                                                )}>
                                                    {tx.type === 'in' && <ArrowDownCircle className="w-5 h-5" />}
                                                    {tx.type === 'out' && <ArrowUpCircle className="w-5 h-5" />}
                                                    {tx.type === 'transfer' && <ArrowRightLeft className="w-5 h-5" />}
                                                    {tx.type === 'attribute_change' && <Book className="w-4 h-4" />}
                                                    {tx.type === 'archive' && <Clock className="w-4 h-4" />}
                                                    {tx.type === 'restore' && <Package className="w-4 h-4" />}
                                                </div>
                                                <span className="hidden lg:inline text-[13px] font-bold text-slate-900">
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
                                            {(() => {
                                                const d = new Date(tx.createdAt);
                                                if (isNaN(d.getTime())) return <span className="text-[10px] font-bold text-slate-300">—</span>;
                                                return (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[12px] font-bold text-slate-700">{format(d, "dd.MM.yy")}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">{format(d, "HH:mm")}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredHistory.length === 0 && renderEmpty()}
            </div>

            {/* Mobile Compact List View */}
            <MobileItemHistoryList history={paginatedHistory} />
            {filteredHistory.length === 0 && <div className="md:hidden">{renderEmpty()}</div>}
        </>
    );

    const renderEmpty = () => (
        <div className="py-20 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200/50">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <History className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-xs font-bold text-slate-400">{searchQuery || filterType ? "Ничего не найдено" : "Операций не найдено"}</p>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Controls - Photo 2 Style */}
            <div className="crm-filter-tray-light p-1.5 rounded-[22px]">
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
                        className="crm-filter-tray-search w-full pl-12 pr-10 focus:outline-none"
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
                <div className="flex items-center gap-[6px] shrink-0">
                    <div className="w-px h-6 bg-slate-500/40 mx-1" />
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
                                    "crm-filter-tray-tab rounded-[16px]",
                                    isActive && "active"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeItemHistoryTab"
                                        className="absolute inset-0 bg-primary rounded-[16px] z-0"
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
                        variant="light"
                    />
                </div>
            )}
        </div>
    );
}

// Mobile Compact List Component
function MobileItemHistoryList({ history }: { history: ItemHistoryTransaction[] }) {
    const [expandedId, setExpandedId] = React.useState<string | null>(null);

    if (history.length === 0) return null;

    return (
        <div className="md:hidden rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm divide-y divide-slate-100">
            {history.map((tx, idx) => {
                const isPositive = tx.changeAmount > 0;
                const isExpanded = expandedId === (tx.id || String(idx));
                const typeLabel = tx.type === "in" ? "Приход" : tx.type === "out" ? "Расход" : tx.type === "transfer" ? "Перемещ." : "Обновл.";

                return (
                    <div key={tx.id || idx} className="bg-white">
                        {/* Main Row */}
                        <div
                            className="p-3 flex items-center gap-3 cursor-pointer active:bg-slate-50 transition-colors"
                            onClick={() => setExpandedId(isExpanded ? null : (tx.id || String(idx)))}
                        >
                            {/* Type Indicator */}
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                tx.type === 'in' ? "bg-emerald-50" : tx.type === 'out' ? "bg-rose-50" : "bg-primary/10"
                            )}>
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    tx.type === 'in' ? "bg-emerald-500" : tx.type === 'out' ? "bg-rose-500" : "bg-primary"
                                )} />
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm text-slate-900">{typeLabel}</span>
                                    <span className={cn(
                                        "font-bold text-sm tabular-nums",
                                        isPositive ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {isPositive ? "+" : ""}{tx.changeAmount}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {(() => {
                                            const d = new Date(tx.createdAt);
                                            return isNaN(d.getTime()) ? "—" : format(d, "d MMM, HH:mm");
                                        })()}
                                    </span>
                                    {tx.storageLocation?.name && (
                                        <>
                                            <div className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                                            <span className="text-[10px] font-medium text-slate-500 truncate">
                                                {tx.storageLocation.name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-3 pb-3 pt-0">
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col gap-2">
                                            {/* Author */}
                                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Автор</span>
                                                <span className="text-xs font-bold text-slate-700">{tx.creator?.name || "Система"}</span>
                                            </div>

                                            {/* Reason */}
                                            {tx.reason && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Причина</span>
                                                    <p className="text-xs text-slate-700 leading-normal">{tx.reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
