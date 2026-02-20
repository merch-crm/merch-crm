"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    Package, ArrowUpRight, ArrowDownLeft, Clock, Building2,
    ArrowRight, ArrowLeftRight, Book
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn, formatUnit } from "@/lib/utils";
import { type Transaction } from "../history-types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface HistoryMobileListProps {
    currentItems: Transaction[];
    selectedIds: string[];
    handleSelectRow: (id: string) => void;
    expandedId: string | null;
    setExpandedId: (id: string | null) => void;
}

export function HistoryMobileList({
    currentItems,
    selectedIds,
    handleSelectRow,
    expandedId,
    setExpandedId
}: HistoryMobileListProps) {
    return (
        <div className="md:hidden crm-card !p-0 !rounded-[var(--radius-outer)] overflow-hidden shadow-sm divide-y divide-slate-100">
            {currentItems.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                return (
                    <MobileHistoryItem
                        key={t.id}
                        transaction={t}
                        isSelected={isSelected}
                        onSelect={() => handleSelectRow(t.id)}
                        isExpanded={expandedId === t.id}
                        onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
                    />
                );
            })}
        </div>
    );
}

interface MobileHistoryItemProps {
    transaction: Transaction;
    isSelected: boolean;
    onSelect: () => void;
    isExpanded: boolean;
    onToggle: () => void;
}

function MobileHistoryItem({
    transaction: t,
    isSelected,
    onSelect,
    isExpanded,
    onToggle
}: MobileHistoryItemProps) {
    const router = useRouter();
    const isIn = t.type === "in";
    const amount = Math.abs(t.changeAmount);

    return (
        <div className="bg-white">
            {/* Main Row - Always Visible */}
            <div
                role="button"
                tabIndex={0}
                className="p-3 flex items-center gap-3 cursor-pointer active:bg-slate-50 transition-colors"
                onClick={onToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onToggle();
                    }
                }}
            >
                <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={isSelected}
                        onChange={onSelect}
                        className="w-[16px] h-[16px]"
                    />
                </div>

                <div className={cn(
                    "w-8 h-8 rounded-[var(--radius-inner)] flex items-center justify-center shrink-0",
                    t.type === "transfer"
                        ? "bg-slate-50 text-slate-500"
                        : t.type === "attribute_change"
                            ? "bg-amber-50 text-amber-600"
                            : t.type === "archive"
                                ? "bg-rose-50 text-rose-600"
                                : t.type === "restore"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : isIn
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-rose-50 text-rose-600"
                )}>
                    {t.type === "transfer" ? (
                        <ArrowLeftRight className="w-4 h-4" />
                    ) : t.type === "attribute_change" ? (
                        <Book className="w-4 h-4" />
                    ) : t.type === "archive" ? (
                        <Clock className="w-4 h-4" />
                    ) : t.type === "restore" ? (
                        <Package className="w-4 h-4" />
                    ) : isIn ? (
                        <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                        <ArrowUpRight className="w-4 h-4" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 truncate pr-2">
                            {t.item?.name || "Характеристики"}
                        </span>
                        {t.type !== "attribute_change" && (
                            <Badge className={cn(
                                "px-1.5 py-0.5 h-5 font-bold text-xs border-none shadow-none shrink-0",
                                t.type === "transfer"
                                    ? "bg-primary/5 text-primary"
                                    : isIn
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-rose-50 text-rose-600"
                            )}>
                                {t.type === "transfer" ? "" : isIn ? "+" : "-"}{amount}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-bold text-slate-400">
                            {format(new Date(t.createdAt), "d MMM, HH:mm", { locale: ru })}
                        </span>
                        <div className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                        <span className="text-xs font-medium text-slate-500 truncate">
                            {t.type === "transfer" ? "Перемещение" :
                                t.type === "attribute_change" ? "Изменение" :
                                    t.type === "archive" ? "Архивация" :
                                        t.type === "restore" ? "Восстановление" :
                                            isIn ? "Приход" : "Расход"}
                        </span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 pt-0 flex flex-col gap-3">
                            <div className="bg-slate-50 rounded-[var(--radius-inner)] p-3 border border-slate-100 flex flex-col gap-2">
                                {t.item?.sku && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-400 tracking-wider">Артикул</span>
                                        <span className="text-xs font-mono font-bold text-slate-600">{t.item.sku}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-400 tracking-wider">Склад</span>
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="w-3 h-3 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-700">{t.storageLocation?.name || "Не указан"}</span>
                                    </div>
                                </div>
                                {t.reason && (
                                    <div className="flex flex-col gap-1 mt-1 border-t border-slate-200/60 pt-2">
                                        <span className="text-[11px] font-bold text-slate-400 tracking-wider">Причина</span>
                                        <span className="text-xs font-medium text-slate-600 leading-relaxed italic pr-2">
                                            «{t.reason}»
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between mt-1 border-t border-slate-200/60 pt-2">
                                    <span className="text-[11px] font-bold text-slate-400 tracking-wider">Автор</span>
                                    <span className="text-xs font-bold text-slate-900">{t.creator?.name || "Система"}</span>
                                </div>
                            </div>

                            {t.item && (
                                <Button
                                    onClick={() => router.push(`/dashboard/warehouse/items/${t.item?.id}`)}
                                    variant="outline"
                                    className="w-full h-10 rounded-[var(--radius-inner)] text-xs font-bold text-primary border-primary/20 hover:bg-primary/5"
                                >
                                    К товару
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
