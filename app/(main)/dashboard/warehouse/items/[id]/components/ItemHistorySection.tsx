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
    Package,
    Layers,
    User,
    Calendar,
    Building2,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemHistoryTransaction } from "@/app/(main)/dashboard/warehouse/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";

interface ItemHistorySectionProps {
    history: ItemHistoryTransaction[];
}

export function ItemHistorySection({ history }: ItemHistorySectionProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [filterType, setFilterType] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 5;

    const getTransactionCategory = (tx: ItemHistoryTransaction) => {
        const reason = tx.reason?.toLowerCase() || "";
        if (tx.orderId || reason.includes("отгрузка") || reason.includes("заказ")) return "order";
        if (reason.includes("корректировка") || tx.type === "adjustment") return "adjustment";
        if (tx.type === "in") return "in";
        if (tx.type === "out") return "out";
        if (tx.type === "transfer") return "transfer";
        return "other";
    };

    const filteredHistory = React.useMemo(() => {
        let result = history;
        if (filterType) {
            result = result.filter(tx => getTransactionCategory(tx) === filterType);
        }
        if (searchQuery) {
            result = result.filter(tx =>
                tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return result;
    }, [history, searchQuery, filterType]);

    const paginatedHistory = React.useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredHistory.slice(start, start + pageSize);
    }, [filteredHistory, currentPage, pageSize]);

    const renderEmpty = () => (
        <div className="table-empty py-16">
            <History />
            <p>{searchQuery || filterType ? "Ничего не найдено" : "Операций не найдено"}</p>
        </div>
    );

    const renderTableView = () => (
        <>
            {/* Desktop Card-Row View */}
            <div className="hidden md:block bg-muted/30 rounded-[22px] p-4 border border-border shadow-sm">

                {/* Column Headers — styled as a subtle card */}
                <div className="flex items-center px-6 py-3 mb-1 bg-card/60 rounded-xl border border-border/30 text-[11px] font-bold tracking-wider text-muted-foreground/50 select-none">
                    <div className="w-[200px] shrink-0 flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" /> ТИП
                    </div>
                    <div className="w-[100px] shrink-0 flex items-center justify-center gap-2 mr-16">
                        <ArrowRightLeft className="w-3.5 h-3.5" /> ИЗМЕНЕНИЕ
                    </div>
                    <div className="flex-1 flex items-center gap-2 min-w-0 pr-4">
                        <Building2 className="w-3.5 h-3.5" /> СКЛАД
                    </div>
                    <div className="flex-1 flex items-center gap-2 min-w-0 pr-4">
                        <RefreshCw className="w-3.5 h-3.5" /> ПРИЧИНА
                    </div>
                    <div className="w-[160px] shrink-0 flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> АВТОР
                    </div>
                    <div className="w-[100px] shrink-0 flex items-center gap-2 justify-end">
                        <Calendar className="w-3.5 h-3.5" /> ДАТА
                    </div>
                </div>

                {/* Card Rows */}
                <div className="space-y-2.5">
                    {paginatedHistory.map((tx, idx) => {
                        const isPositive = tx.changeAmount > 0;
                        const category = getTransactionCategory(tx);

                        return (
                            <div key={tx.id || idx} className="bg-card px-6 py-4 rounded-xl shadow-sm border border-border/60 flex items-center transition-all hover:shadow-md hover:border-border cursor-default group">
                                {/* Icon + Type */}
                                <div className="flex items-center gap-3 w-[200px] shrink-0">
                                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                        category === "order"
                                            ? "bg-indigo-50 text-indigo-600"
                                            : category === "in"
                                                ? "bg-emerald-50 text-emerald-600"
                                                : category === "out"
                                                    ? "bg-rose-50 text-rose-600"
                                                    : category === "adjustment"
                                                        ? "bg-purple-50 text-purple-600"
                                                        : category === "transfer"
                                                            ? "bg-blue-50 text-blue-600"
                                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {category === "order" && <Package className="w-4 h-4" />}
                                        {category === "in" && <ArrowDownCircle className="w-4 h-4" />}
                                        {category === "out" && <ArrowUpCircle className="w-4 h-4" />}
                                        {category === "adjustment" && <RefreshCw className="w-4 h-4" />}
                                        {category === "transfer" && <ArrowRightLeft className="w-4 h-4" />}
                                        {category === "other" && <Layers className="w-4 h-4" />}
                                    </div>
                                    <span className="text-[14px] font-bold text-foreground">
                                        {category === "order" ? "Продажи" :
                                            category === "in" ? "Приход" :
                                                category === "out" ? "Расход" :
                                                    category === "adjustment" ? "Корректировка" :
                                                        category === "transfer" ? "Перемещение" : "Другое"}
                                    </span>
                                </div>

                                {/* Change Badge */}
                                <div className="w-[100px] shrink-0 mr-16 flex justify-center">
                                    <span className={cn("inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold font-mono",
                                        isPositive
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-rose-50 text-rose-600"
                                    )}>
                                        {isPositive ? "+" : ""}{tx.changeAmount}
                                    </span>
                                </div>

                                {/* Warehouse */}
                                <div className="flex-1 flex items-center gap-2.5 text-[14px] text-muted-foreground font-semibold min-w-0 pr-4">
                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0"></div>
                                    <span className="truncate">
                                        {(() => {
                                            const transferMatch = tx.reason?.match(/(?:Перемещение|Получено)\s+со склада\s+["«](.+)["»]\s+на\s+["«](.+)["»](?:\.\s+Причина:\s+(.+))?/i);
                                            if (transferMatch) {
                                                return (
                                                    <span className="flex items-center gap-1.5">
                                                        <span>{transferMatch[1]}</span>
                                                        <ArrowRight className="w-3 h-3 opacity-40 shrink-0" />
                                                        <span>{transferMatch[2]}</span>
                                                    </span>
                                                );
                                            }
                                            return tx.storageLocation?.name || "—";
                                        })()}
                                    </span>
                                </div>

                                {/* Reason */}
                                <div className="flex-1 text-[14px] text-muted-foreground/70 font-medium min-w-0 pr-4">
                                    <span className="truncate block">
                                        {(() => {
                                            const transferMatch = tx.reason?.match(/(?:Перемещение|Получено)\s+со склада\s+["«](.+)["»]\s+на\s+["«](.+)["»](?:\.\s+Причина:\s+(.+))?/i);
                                            if (transferMatch) {
                                                const comment = transferMatch[3];
                                                if (comment && comment.toLowerCase().trim() !== "перемещение") {
                                                    return comment;
                                                }
                                                return "Перемещение";
                                            }
                                            return (tx.reason || "—")
                                                .replace(/^Корректировка остатка:\s*/i, "")
                                                .replace(/\.?\s*Причина:\s*перемещение$/i, "");
                                        })()}
                                    </span>
                                </div>

                                {/* Author */}
                                <div className="w-[160px] shrink-0 text-[14px] text-muted-foreground font-semibold">
                                    {tx.creator?.name || "Система"}
                                </div>

                                {/* Date & Time */}
                                <div className="w-[100px] shrink-0 flex flex-col items-end justify-center">
                                    {(() => {
                                        const d = new Date(tx.createdAt);
                                        if (isNaN(d.getTime())) return <span className="text-xs font-bold text-muted-foreground/30">—</span>;
                                        return (
                                            <>
                                                <span className="text-[12px] font-bold text-foreground leading-tight">{format(d, "dd.MM.yy", { locale: ru })}</span>
                                                <span className="text-[11px] font-bold text-muted-foreground leading-tight mt-0.5">{format(d, "HH:mm", { locale: ru })}</span>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {filteredHistory.length === 0 && renderEmpty()}

            {/* Mobile Compact List View */}
            <MobileItemHistoryList history={paginatedHistory} />
            {filteredHistory.length === 0 && <div className="md:hidden">{renderEmpty()}</div>}
        </>
    );

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Controls - Photo 2 Style */}
            <div className="crm-filter-tray-light p-1.5">
                {/* Search Input Box */}
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Input
                        type="text"
                        placeholder="Поиск по истории..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="crm-filter-tray-search w-full pl-12 pr-10 focus:outline-none h-11"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setSearchQuery("");
                                setCurrentPage(1);
                            }}
                            className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground/50 hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Filters - Right Aligned */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-px h-6 bg-border mx-1" />
                    <TooltipProvider delayDuration={5000}>
                        {[
                            { id: null, label: 'Все', icon: Layers },
                            { id: 'order', label: 'Продажи', icon: Package },
                            { id: 'in', label: 'Приход', icon: ArrowDownCircle },
                            { id: 'out', label: 'Расход', icon: ArrowUpCircle },
                            { id: 'transfer', label: 'Перемещение', icon: ArrowRightLeft },
                            { id: 'adjustment', label: 'Корректировка', icon: RefreshCw }
                        ].map((btn) => {
                            const isActive = filterType === btn.id;
                            const button = (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setFilterType(btn.id);
                                        setCurrentPage(1);
                                    }}
                                    className={cn("crm-filter-tab px-3",
                                        isActive && "active"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeItemHistoryTab"
                                            className="absolute inset-0 bg-primary rounded-2xl z-0"
                                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center justify-center gap-2">
                                        <btn.icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-muted-foreground")} />
                                        {isActive && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="hidden sm:inline text-white"
                                            >
                                                {btn.label}
                                            </motion.span>
                                        )}
                                    </div>
                                </Button>
                            );

                            return (
                                <React.Fragment key={String(btn.id)}>
                                    {isActive ? (
                                        button
                                    ) : (
                                        <Tooltip content={btn.label} side="bottom">
                                            {button}
                                        </Tooltip>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </TooltipProvider>
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
                        itemNames={['операция', 'операции', 'операций']}
                        variant="card"
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
        <div className="md:hidden rounded-2xl border border-border overflow-hidden bg-card shadow-sm divide-y divide-border/50">
            {history.map((tx, idx) => {
                const isPositive = tx.changeAmount > 0;
                const isExpanded = expandedId === (tx.id || String(idx));
                const typeLabel = tx.type === "in" ? "Приход" : tx.type === "out" ? "Расход" : tx.type === "transfer" ? "Перемещ." : "Обновл.";

                return (
                    <div key={tx.id || idx} className="bg-card">
                        {/* Main Row */}
                        <div role="button" tabIndex={0}
                            className="p-3 flex items-center gap-3 cursor-pointer active:bg-muted/50 transition-colors"
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => setExpandedId(isExpanded ? null : (tx.id || String(idx)))}
                        >
                            {/* Type Indicator */}
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                tx.type === 'in' ? "bg-emerald-50" : tx.type === 'out' ? "bg-rose-50" : "bg-primary/10"
                            )}>
                                <div className={cn("w-2 h-2 rounded-full",
                                    tx.type === 'in' ? "bg-emerald-500" : tx.type === 'out' ? "bg-rose-500" : "bg-primary"
                                )} />
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm text-foreground">{typeLabel}</span>
                                    <span className={cn("font-bold text-sm tabular-nums",
                                        isPositive ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {isPositive ? "+" : ""}{tx.changeAmount}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-xs font-bold text-muted-foreground">
                                        {(() => {
                                            const d = new Date(tx.createdAt);
                                            return isNaN(d.getTime()) ? "—" : format(d, "d MMM, HH:mm", { locale: ru });
                                        })()}
                                    </span>
                                    {tx.storageLocation?.name && (
                                        <>
                                            <div className="w-0.5 h-0.5 bg-muted-foreground/50 rounded-full" />
                                            <span className="text-xs font-medium text-muted-foreground truncate">
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
                                        <div className="bg-muted/30 rounded-lg p-3 border border-border flex flex-col gap-2">
                                            {/* Author */}
                                            <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                                <span className="text-xs font-bold text-muted-foreground">Автор</span>
                                                <span className="text-xs font-bold text-foreground">{tx.creator?.name || "Система"}</span>
                                            </div>

                                            {/* Reason */}
                                            {tx.reason && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-muted-foreground">Причина</span>
                                                    <p className="text-xs text-foreground leading-normal">{tx.reason.replace(/^Корректировка остатка:\s*/i, "")}</p>
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
