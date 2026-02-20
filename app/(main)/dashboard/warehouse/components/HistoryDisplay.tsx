"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    Package, ArrowUpRight, ArrowDownLeft, Clock, Building2,
    ArrowLeftRight, Book, LayoutGrid, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatUnit } from "@/lib/utils";
import { type Transaction } from "../history-types";

interface HistoryDisplayProps {
    currentItems: Transaction[];
    selectedIds: string[];
    isAllSelected: boolean;
    handleSelectAll: () => void;
    handleSelectRow: (id: string) => void;
    expandedId: string | null;
    setExpandedId: (id: string | null) => void;
}

export function HistoryDisplay({
    currentItems,
    selectedIds,
    isAllSelected,
    handleSelectAll,
    handleSelectRow,
    expandedId,
    setExpandedId
}: HistoryDisplayProps) {
    const router = useRouter();

    return (
        <>
            {/* 🖥 Desktop Table View (Hidden on mobile) */}
            <div className="table-container hidden md:block">
                <table className="crm-table">
                    <thead className="crm-thead">
                        <tr>
                            <th className="crm-th w-[40px]">
                                <Checkbox checked={isAllSelected} onChange={handleSelectAll} />
                            </th>
                            <th className="crm-th md:w-[120px]">
                                <div className="crm-th-content">
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span>Тип</span>
                                </div>
                            </th>
                            <th className="crm-th">
                                <div className="crm-th-content">
                                    <Package className="w-3.5 h-3.5" />
                                    <span>Товар</span>
                                </div>
                            </th>
                            <th className="crm-th">
                                <div className="crm-th-content">
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>Склад</span>
                                </div>
                            </th>
                            <th className="crm-th text-center">
                                <div className="crm-th-content justify-center">
                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                    <span>Изм.</span>
                                </div>
                            </th>
                            <th className="crm-th hidden xl:table-cell">
                                <div className="crm-th-content">
                                    <Book className="w-3.5 h-3.5" />
                                    <span>Причина</span>
                                </div>
                            </th>
                            <th className="crm-th hidden lg:table-cell text-right">
                                <div className="crm-th-content justify-end">
                                    <User className="w-3.5 h-3.5" />
                                    <span>Автор</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="crm-tbody">
                        {currentItems.map((t) => {
                            const isIn = t.type === "in";
                            const amount = Math.abs(t.changeAmount);
                            const isSelected = selectedIds.includes(t.id);

                            return (
                                <tr key={t.id} className={cn("crm-tr-clickable", isSelected && "crm-tr-selected")}>
                                    <td className="crm-td" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox checked={isSelected} onChange={() => handleSelectRow(t.id)} />
                                    </td>
                                    <td className="crm-td">
                                        <div className="flex items-center">
                                            <div className={cn(
                                                "w-10 h-10 rounded-[var(--radius-inner)] flex items-center justify-center shadow-sm",
                                                t.type === "transfer" ? "bg-primary/5 text-primary border border-primary/20" :
                                                    t.type === "attribute_change" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                        t.type === "archive" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                            t.type === "restore" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                                isIn ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                            )}>
                                                {t.type === "transfer" ? <ArrowLeftRight className="w-5 h-5" /> :
                                                    t.type === "attribute_change" ? <Book className="w-5 h-5" /> :
                                                        t.type === "archive" ? <Clock className="w-5 h-5" /> :
                                                            t.type === "restore" ? <Package className="w-5 h-5" /> :
                                                                isIn ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div className="hidden xl:block ml-4">
                                                <div className="text-sm font-bold text-slate-900 leading-tight">
                                                    {t.type === "transfer" ? "Перемещение" :
                                                        t.type === "attribute_change" ? "Характеристика" :
                                                            t.type === "archive" ? "Архивация" :
                                                                t.type === "restore" ? "Восстановление" :
                                                                    isIn ? "Приход" : "Расход"}
                                                </div>
                                                <div className="text-xs font-bold text-slate-400 mt-0.5 whitespace-nowrap">
                                                    {format(new Date(t.createdAt), "d MMM, HH:mm", { locale: ru })}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="crm-td">
                                        {t.item ? (
                                            <button type="button" className="flex items-center gap-3 group/item hover:opacity-80 transition-all text-left" onClick={() => router.push(`/dashboard/warehouse/items/${t.item?.id}`)}>
                                                <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover/item:bg-primary/5 group-hover/item:text-primary transition-colors">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <div className="max-w-[200px] lg:max-w-xs">
                                                    <div className="text-sm font-bold text-slate-900 truncate group-hover/item:text-primary transition-colors">{t.item.name}</div>
                                                    {t.item.sku && <div className="text-xs font-bold text-slate-400 mt-0.5 font-mono">Арт.: {t.item.sku}</div>}
                                                </div>
                                            </button>
                                        ) : <div className="text-sm font-bold text-slate-900">Система</div>}
                                    </td>
                                    <td className="crm-td">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-[var(--radius-inner)] border border-slate-200 w-fit max-w-[180px]">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="text-xs font-medium text-slate-700 truncate">{t.storageLocation?.name || "???"}</span>
                                        </div>
                                    </td>
                                    <td className="crm-td text-center">
                                        <Badge className={cn("px-3 py-1 font-semibold text-xs border-none shadow-none", isIn ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                            {isIn ? "+" : "-"}{amount} {formatUnit(t.item?.unit || "")}
                                        </Badge>
                                    </td>
                                    <td className="crm-td hidden xl:table-cell text-sm text-slate-500 italic max-w-xs truncate">
                                        {t.reason || "—"}
                                    </td>
                                    <td className="crm-td hidden lg:table-cell text-right">
                                        <div className="text-sm font-bold text-slate-900">{t.creator?.name || "Система"}</div>
                                        <div className="text-xs font-bold text-slate-400">{t.creator?.role?.name || "Админ"}</div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* 📱 Mobile List View (Hidden on desktop) */}
            <div className="md:hidden crm-card !p-0 !rounded-[var(--radius-outer)] overflow-hidden shadow-sm divide-y divide-slate-100">
                {currentItems.map((t) => {
                    const isIn = t.type === "in";
                    const amount = Math.abs(t.changeAmount);
                    const isSelected = selectedIds.includes(t.id);
                    const isExpanded = expandedId === t.id;

                    return (
                        <div key={t.id} className="bg-white">
                            <div className="flex items-stretch border-b border-slate-100">
                                <div className="p-3 flex items-center justify-center border-r border-slate-100">
                                    <Checkbox
                                        checked={isSelected}
                                        onChange={() => handleSelectRow(t.id)}
                                        aria-label="Выбрать строку"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="flex-1 p-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors focus-visible:bg-slate-50 outline-none"
                                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                                    aria-expanded={isExpanded}
                                    aria-label={isExpanded ? "Свернуть детали" : "Развернуть детали"}
                                >
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", isIn ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                        {isIn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-sm text-slate-900 truncate pr-2">{t.item?.name || "Система"}</span>
                                            <Badge className={cn("px-1.5 py-0.5 h-5 font-bold text-xs border-none shadow-none shrink-0", isIn ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                                {isIn ? "+" : "-"}{amount}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 font-bold">
                                            {format(new Date(t.createdAt), "d MMM, HH:mm", { locale: ru })}
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-50/50">
                                        <div className="px-3 pb-3 pt-1 flex flex-col gap-2">
                                            <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs space-y-2">
                                                <div className="flex justify-between"><span className="text-slate-400">Склад:</span><span className="font-bold">{t.storageLocation?.name}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-400">Автор:</span><span className="font-bold">{t.creator?.name}</span></div>
                                                {t.reason && <div className="border-t pt-2 mt-2 italic text-slate-500">«{t.reason}»</div>}
                                            </div>
                                            {t.item && (
                                                <Button variant="outline" size="sm" className="w-full text-xs font-bold h-9" onClick={() => router.push(`/dashboard/warehouse/items/${t.item?.id}`)}>
                                                    К товару
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div >
        </>
    );
}
