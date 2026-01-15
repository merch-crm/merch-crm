"use client";

import Image from "next/image";

import { Package, ArrowUpRight, ArrowDownLeft, User, Clock, Info, Building2, ArrowRight, ArrowLeftRight, Trash2, Eraser, Search, Filter, X as CloseIcon, FileDown } from "lucide-react";
import { deleteInventoryTransactions, clearInventoryHistory } from "./actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface Transaction {
    id: string;
    type: "in" | "out" | "transfer";
    changeAmount: number;
    reason: string | null;
    createdAt: Date;
    item: {
        name: string;
        unit: string;
        sku: string | null;
        storageLocation: {
            name: string;
        } | null;
    };
    storageLocation: {
        name: string;
    } | null;
    fromStorageLocation: {
        name: string;
    } | null;
    creator: {
        name: string;
        avatar: string | null;
        role: {
            name: string;
        } | null;
    } | null;
}

interface HistoryTableProps {
    transactions: Transaction[];
    isAdmin?: boolean;
}

export function HistoryTable({ transactions, isAdmin }: HistoryTableProps) {
    const { toast } = useToast();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "in" | "out" | "transfer">("all");
    const itemsPerPage = 10;

    // Filter logic
    const filteredTransactions = transactions.filter(t => {
        const matchesFilter = activeFilter === "all" || t.type === activeFilter;
        const search = searchQuery.toLowerCase();
        const matchesSearch =
            (t.item.name?.toLowerCase() || "").includes(search) ||
            (t.item.sku?.toLowerCase() || "").includes(search) ||
            (t.reason?.toLowerCase() || "").includes(search) ||
            (t.creator?.name?.toLowerCase() || "").includes(search);
        return matchesFilter && matchesSearch;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    const isAllSelected = currentItems.length > 0 && currentItems.every(t => selectedIds.includes(t.id));

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(prev => prev.filter(id => !currentItems.some(t => t.id === id)));
        } else {
            const newSelected = currentItems.map(t => t.id);
            setSelectedIds(prev => Array.from(new Set([...prev, ...newSelected])));
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteItems = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteInventoryTransactions(selectedIds);
            if (res.success) {
                toast("Записи удалены", "success");
                setSelectedIds([]);
                setIsDeleteDialogOpen(false);
            } else {
                toast(res.error || "Ошибка при удалении", "error");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClearHistory = async () => {
        setIsClearDialogOpen(true);
    };

    const confirmClearHistory = async () => {
        setIsDeleting(true);
        try {
            const res = await clearInventoryHistory();
            if (res.success) {
                toast("История очищена", "success");
                setSelectedIds([]);
                setIsClearDialogOpen(false);
            } else {
                toast(res.error || "Ошибка при очистке", "error");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (transactions.length === 0 && searchQuery === "" && activeFilter === "all") {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 mb-6 border border-slate-100 shadow-sm">
                    <Clock className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">История пуста</h3>
                <p className="text-slate-500 mt-2 max-w-[320px] font-medium leading-relaxed">Здесь будут отображаться все перемещения товаров, списания и поставки.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative pb-20">
            {/* Toolbar Panel */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-[2rem] border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 rounded-2xl w-full md:w-fit border border-slate-200/50">
                    {[
                        { id: "all", label: "Все", icon: Filter },
                        { id: "in", label: "Приход", icon: ArrowUpRight, color: "emerald" },
                        { id: "out", label: "Расход", icon: ArrowDownLeft, color: "rose" },
                        { id: "transfer", label: "Перемещение", icon: ArrowLeftRight, color: "indigo" },
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => {
                                setActiveFilter(f.id as typeof activeFilter);
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                                activeFilter === f.id
                                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                            )}
                        >
                            <f.icon className={cn("w-3.5 h-3.5", activeFilter === f.id && (
                                f.color === "emerald" ? "text-emerald-500" :
                                    f.color === "rose" ? "text-rose-500" :
                                        f.color === "indigo" ? "text-indigo-500" : ""
                            ))} />
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-fit">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Поиск по товару, SKU, пользователю..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 bg-white text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    {isAdmin && (
                        <Button
                            variant="ghost"
                            onClick={handleClearHistory}
                            disabled={isDeleting || transactions.length === 0}
                            className="h-11 px-4 rounded-2xl border border-rose-100 bg-rose-50/20 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs gap-2 transition-all"
                        >
                            <Eraser className="w-4 h-4" />
                            <span className="hidden md:inline">Очистить</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Selection Quick Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="bg-slate-900 border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] px-8 py-4 flex items-center gap-8 backdrop-blur-xl">
                        <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-500/20">
                                {selectedIds.length}
                            </div>
                            <div>
                                <h4 className="text-white text-sm font-black tracking-tight leading-none">Записи выбраны</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Панель действий</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <CloseIcon className="w-4 h-4" />
                                Сбросить
                            </button>

                            <button
                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                            >
                                <FileDown className="w-4 h-4" />
                                Экспорт
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Удалить
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="w-[50px] px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Тип / Дата</th>
                                <th className="pl-6 pr-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Товар</th>
                                <th className="pl-2 pr-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Склад</th>
                                <th className="pl-2 pr-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Изменение</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Причина</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Пользователь</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.map((t) => {
                                const isIn = t.type === "in";
                                const amount = Math.abs(t.changeAmount);
                                const isSelected = selectedIds.includes(t.id);

                                return (
                                    <tr
                                        key={t.id}
                                        onClick={() => {
                                            /* Movement details */
                                        }}
                                        className={cn(
                                            "hover:bg-gray-50 transition-colors group cursor-pointer",
                                            isSelected ? "bg-indigo-50/30" : ""
                                        )}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(t.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                                                    t.type === "transfer"
                                                        ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                                        : isIn
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                            : "bg-rose-50 text-rose-600 border border-rose-100"
                                                )}>
                                                    {t.type === "transfer" ? (
                                                        <ArrowLeftRight className="w-5 h-5" />
                                                    ) : isIn ? (
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    ) : (
                                                        <ArrowDownLeft className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 leading-tight">
                                                        {t.type === "transfer" ? "Перемещение" : isIn ? "Приход" : "Расход"}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 whitespace-nowrap">
                                                        {format(new Date(t.createdAt), "d MMM, HH:mm", { locale: ru })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="pl-6 pr-2 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <div className="max-w-[300px]">
                                                    <div className="text-sm font-bold text-slate-900 truncate tracking-tight">{t.item.name}</div>
                                                    {t.item.sku && (
                                                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono">{t.item.sku}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="pl-2 pr-2 py-4 whitespace-nowrap">
                                            {t.type === "transfer" ? (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100 max-w-[150px]" title={t.fromStorageLocation?.name || "???"}>
                                                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="font-medium truncate">{t.fromStorageLocation?.name || "Неизвестно"}</span>
                                                    </div>
                                                    <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100 max-w-[150px]" title={t.storageLocation?.name || "???"}>
                                                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="font-medium truncate">{t.storageLocation?.name || "Неизвестно"}</span>
                                                    </div>
                                                </div>
                                            ) : t.storageLocation ? (
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 w-fit">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-medium text-slate-700">{t.storageLocation.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Склад не указан</span>
                                            )}
                                        </td>
                                        <td className="pl-2 pr-6 py-4 whitespace-nowrap text-center">
                                            <Badge className={cn(
                                                "px-3 py-1 font-black text-xs border-none shadow-none",
                                                t.type === "transfer"
                                                    ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-50"
                                                    : isIn
                                                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50"
                                                        : "bg-rose-50 text-rose-600 hover:bg-rose-50"
                                            )}>
                                                {t.type === "transfer" ? "" : isIn ? "+" : "-"}{amount} {t.item.unit}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-slate-500 leading-snug">
                                                    {(() => {
                                                        // 1. Try New Format: Перемещение со склада "A" на "B": comment
                                                        const newMatch = t.reason?.match(/Перемещение со склада "(.+)" на "(.+)"(: (.+))?/);
                                                        if (newMatch) {
                                                            return newMatch[4] || "Перемещение";
                                                        }

                                                        // 2. Try Legacy Format: Перемещение (Transfer) ... : comment
                                                        const legacyMatch = t.reason?.match(/Перемещение \(Transfer\) .+?: (.+)/);
                                                        if (legacyMatch) {
                                                            return legacyMatch[1];
                                                        }

                                                        // 3. Fallback
                                                        return t.reason || "Без описания";
                                                    })()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2.5">
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-slate-900 whitespace-nowrap">{t.creator?.name || "Система"}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                                                        {t.creator?.role?.name || (t.creator ? "Оператор" : "Система")}
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 relative">
                                                    {t.creator?.avatar ? (
                                                        <Image src={t.creator.avatar} alt={t.creator.name} width={32} height={32} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredTransactions.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredTransactions.length}
                    pageSize={itemsPerPage}
                    onPageChange={setCurrentPage}
                    itemName="записей"
                />
            )}

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDeleteItems}
                isLoading={isDeleting}
                title="Удаление записей"
                description={`Вы уверены, что хотите удалить выбранные записи (${selectedIds.length})? Это действие нельзя будет отменить.`}
                confirmText="Удалить"
                variant="destructive"
            />

            <ConfirmDialog
                isOpen={isClearDialogOpen}
                onClose={() => setIsClearDialogOpen(false)}
                onConfirm={confirmClearHistory}
                isLoading={isDeleting}
                title="Очистка всей истории"
                description="Вы собираетесь полностью удалить все записи из журнала истории склада. Это действие необратимо и будет зафиксировано в системном логе."
                confirmText="Очистить всё"
                variant="destructive"
            />
        </div>
    );
}
