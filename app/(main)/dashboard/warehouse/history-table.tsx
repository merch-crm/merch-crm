"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Package, ArrowUpRight, ArrowDownLeft, Clock, Building2, ArrowRight, ArrowLeftRight, Trash2, Eraser, Search, Filter, X, FileDown, Book } from "lucide-react";

// ... lower down ...

<X className="w-4 h-4" />
import { deleteInventoryTransactions } from "./actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { PremiumPagination } from "@/components/ui/premium-pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { pluralize, sentence } from "@/lib/pluralize";
import { exportToCSV } from "@/lib/export-utils";

export interface Transaction {
    id: string;
    type: "in" | "out" | "transfer" | "attribute_change" | "archive" | "restore";
    changeAmount: number;
    reason: string | null;
    createdAt: Date;
    item: {
        id: string;
        name: string;
        unit: string;
        sku: string | null;
        storageLocation?: {
            name: string;
        } | null;
    } | null;
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
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const { toast } = useToast();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "in" | "out" | "transfer" | "attribute_change" | "archive" | "restore">("all");
    const itemsPerPage = 10;

    // Filter logic
    const filteredTransactions = transactions.filter(t => {
        const matchesFilter = activeFilter === "all" || t.type === activeFilter;
        const search = searchQuery.toLowerCase();
        const matchesSearch =
            t.id.toLowerCase().includes(search) ||
            (t.item?.name?.toLowerCase() || "").includes(search) ||
            (t.item?.sku?.toLowerCase() || "").includes(search) ||
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
                toast(sentence(selectedIds.length, 'f', { one: 'Запись удалена', many: 'Записи удалены' }, { one: 'запись', few: 'записи', many: 'записей' }), "success");
                setSelectedIds([]);
                setIsDeleteDialogOpen(false);
            } else {
                toast(res.error || "Ошибка при удалении", "error");
            }
        } finally {
            setIsDeleting(false);
        }
    };



    if (transactions.length === 0 && searchQuery === "" && activeFilter === "all") {
        return (
            <div className="glass-panel p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[var(--radius-inner)] flex items-center justify-center text-slate-300 mb-6 border border-slate-200 shadow-sm">
                    <Clock className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">История пуста</h3>
                <p className="text-slate-500 mt-2 max-w-[320px] font-medium leading-relaxed">Здесь будут отображаться все перемещения товаров, списания и поставки.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative pb-20">
            {/* Toolbar Panel - Photo 2 Style */}
            <div className="crm-filter-tray gap-6 mb-6">
                {/* Left: Search Box */}
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по истории..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full h-11 bg-white border-none !rounded-[var(--radius-inner)] pl-12 pr-10 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setCurrentPage(1);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Right: Filters & Actions */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-fit order-none md:order-1 px-1">
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: "all", label: "Все" },
                            { id: "in", label: "Приход" },
                            { id: "out", label: "Расход" },
                            { id: "transfer", label: "Перемещение" },
                            { id: "attribute_change", label: "Изменения" },
                            { id: "archive", label: "Архив" },
                            { id: "restore", label: "Восстановление" },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => {
                                    setActiveFilter(f.id as typeof activeFilter);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "relative px-6 py-2.5 rounded-[12px] text-sm font-bold transition-all duration-300 whitespace-nowrap group hover:scale-[1.02]",
                                    activeFilter === f.id ? "text-white" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                                )}
                            >
                                {activeFilter === f.id && (
                                    <motion.div
                                        layoutId="activeTabHistoryTable"
                                        className="absolute inset-0 bg-primary rounded-[12px] shadow-lg shadow-primary/25"
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    />
                                )}
                                <span className="relative z-10">{f.label}</span>
                            </button>
                        ))}
                    </div>


                </div>
            </div>

            {/* Selection Quick Actions Bar */}
            {mounted && createPortal(
                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <>
                            {/* Bottom Progressive Gradient Blur Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="fixed inset-x-0 bottom-0 h-80 pointer-events-none z-[80]"
                                style={{
                                    backdropFilter: 'blur(40px)',
                                    WebkitBackdropFilter: 'blur(40px)',
                                    maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.7) 40%, transparent 100%)'
                                }}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                                exit={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
                                className="fixed bottom-10 left-1/2 z-[110] flex items-center bg-white/95 backdrop-blur-3xl p-2.5 px-8 gap-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/60"
                            >
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20 text-white">
                                        {selectedIds.length}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Записей выбрано</span>
                                </div>

                                <div className="w-px h-8 bg-slate-200 mx-2" />

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => {
                                            const transactionsToExport = transactions.filter(t => selectedIds.includes(t.id));
                                            exportToCSV(transactionsToExport, "history_export", [
                                                { header: "ID", key: "id" },
                                                { header: "Тип", key: (t) => t.type },
                                                { header: "Товар", key: (t) => t.item?.name || "Характеристики" },
                                                { header: "Артикул", key: (t) => t.item?.sku || "" },
                                                { header: "Количество", key: "changeAmount" },
                                                { header: "Причина", key: (t) => t.reason || "" },
                                                { header: "Склад", key: (t) => t.storageLocation?.name || "" },
                                                { header: "Создал", key: (t) => t.creator?.name || "Система" },
                                                { header: "Дата", key: (t) => new Date(t.createdAt) }
                                            ]);
                                            toast("Экспорт завершен", "success");
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-slate-100 transition-all group"
                                    >
                                        <FileDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Экспорт</span>
                                    </button>

                                    {isAdmin && (
                                        <button
                                            onClick={handleDeleteSelected}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-rose-500/10 transition-all group"
                                        >
                                            <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                                            <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Удалить</span>
                                        </button>
                                    )}

                                    <div className="w-px h-8 bg-slate-200 mx-2" />

                                    <button
                                        onClick={() => setSelectedIds([])}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="w-[50px] px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Тип / Дата</th>
                                <th className="pl-6 pr-2 py-3 text-left text-xs font-semibold text-muted-foreground">Товар</th>
                                <th className="pl-2 pr-2 py-3 text-left text-xs font-semibold text-muted-foreground">Склад</th>
                                <th className="pl-2 pr-6 py-3 text-center text-xs font-semibold text-muted-foreground">Изменение</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Причина</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Пользователь</th>
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
                                            isSelected ? "bg-primary/5" : ""
                                        )}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(t.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-[var(--radius-inner)] flex items-center justify-center shadow-sm transition-transform",
                                                    t.type === "transfer"
                                                        ? "bg-primary/5 text-primary border border-primary/20"
                                                        : t.type === "attribute_change"
                                                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                                                            : t.type === "archive"
                                                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                                                : t.type === "restore"
                                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                    : isIn
                                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                        : "bg-rose-50 text-rose-600 border border-rose-100"
                                                )}>
                                                    {t.type === "transfer" ? (
                                                        <ArrowLeftRight className="w-5 h-5" />
                                                    ) : t.type === "attribute_change" ? (
                                                        <Book className="w-5 h-5" />
                                                    ) : t.type === "archive" ? (
                                                        <Clock className="w-5 h-5" />
                                                    ) : t.type === "restore" ? (
                                                        <Package className="w-5 h-5" />
                                                    ) : isIn ? (
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    ) : (
                                                        <ArrowDownLeft className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 leading-tight">
                                                        {t.type === "transfer" ? "Перемещение" :
                                                            t.type === "attribute_change" ? "Характеристика" :
                                                                t.type === "archive" ? "Архивация" :
                                                                    t.type === "restore" ? "Восстановление" :
                                                                        isIn ? "Приход" : "Расход"}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 whitespace-nowrap">
                                                        {format(new Date(t.createdAt), "d MMM, HH:mm", { locale: ru })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="pl-6 pr-2 py-4 whitespace-nowrap">
                                            {t.item ? (
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer group/item hover:opacity-80 transition-all"
                                                    onClick={() => router.push(`/dashboard/warehouse/items/${t.item?.id}`)}
                                                >
                                                    <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover/item:bg-primary/5 group-hover/item:text-primary transition-colors">
                                                        <Package className="w-4 h-4" />
                                                    </div>
                                                    <div className="max-w-[300px]">
                                                        <div className="text-sm font-bold text-slate-900 truncate group-hover/item:text-primary transition-colors">{t.item.name}</div>
                                                        {t.item.sku && (
                                                            <div className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono">Арт.: {t.item.sku}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 py-1">
                                                    <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                                                        <Book className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900 ">Характеристики</div>
                                                        <div className="text-xs font-bold text-slate-400 mt-0.5">
                                                            {t.reason?.includes("категория") ? "Категории" :
                                                                t.reason?.includes("атрибут") ? "Атрибуты" : "Система"}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="pl-2 pr-2 py-4 whitespace-nowrap">
                                            {t.type === "transfer" ? (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 max-w-[150px]" title={t.fromStorageLocation?.name || "???"}>
                                                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="font-medium truncate">{t.fromStorageLocation?.name || "Неизвестно"}</span>
                                                    </div>
                                                    <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 max-w-[150px]" title={t.storageLocation?.name || "???"}>
                                                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="font-medium truncate">{t.storageLocation?.name || "Неизвестно"}</span>
                                                    </div>
                                                </div>
                                            ) : t.storageLocation ? (
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-[var(--radius-inner)] border border-slate-200 w-fit">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-medium text-slate-700">{t.storageLocation.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">Склад не указан</span>
                                            )}
                                        </td>
                                        <td className="pl-2 pr-6 py-4 whitespace-nowrap text-center">
                                            {t.type === "attribute_change" ? (
                                                <Badge className="bg-amber-100/50 text-amber-700 border border-amber-200/50 px-3 py-1 font-semibold text-xs shadow-none hover:bg-amber-100/70">
                                                    {t.reason?.includes("Создана") || t.reason?.includes("Добавлен") ? "Создание" :
                                                        t.reason?.includes("Удален") ? "Удаление" : "Изменение"}
                                                </Badge>
                                            ) : (
                                                <Badge className={cn(
                                                    "px-3 py-1 font-semibold text-xs border-none shadow-none",
                                                    t.type === "transfer"
                                                        ? "bg-primary/5 text-primary hover:bg-primary/10"
                                                        : isIn
                                                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50"
                                                            : "bg-rose-50 text-rose-600 hover:bg-rose-50"
                                                )}>
                                                    {t.type === "transfer" ? "" : isIn ? "+" : "-"}{amount} {t.item?.unit || ""}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-slate-500 leading-snug">
                                                    {(() => {
                                                        // Unified Format: Перемещение со склада "A" на "B". Причина: comment
                                                        const transferMatch = t.reason?.match(/(?:Перемещение|Получено) со склада "(.+)" на "(.+)"(?:\. Причина: (.+))?/);

                                                        if (transferMatch) {
                                                            const from = transferMatch[1];
                                                            const to = transferMatch[2];
                                                            const comment = transferMatch[3];

                                                            return (
                                                                <span className="flex flex-col gap-0.5">
                                                                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                                                        {from} <ArrowRight className="w-3 h-3 text-slate-400" /> {to}
                                                                    </span>
                                                                    {comment && <span className="text-slate-500 font-normal">{comment}</span>}
                                                                </span>
                                                            );
                                                        }

                                                        // Fallback
                                                        return t.reason || "Без описания";
                                                    })()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-slate-900 whitespace-nowrap">{t.creator?.name || "Система"}</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5 whitespace-nowrap">
                                                    {t.creator?.role?.name || (t.creator ? "Оператор" : "Система")}
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

            {
                filteredTransactions.length > 0 && (
                    <div className="pt-2">
                        <PremiumPagination
                            currentPage={currentPage}
                            totalItems={filteredTransactions.length}
                            pageSize={itemsPerPage}
                            onPageChange={setCurrentPage}
                            itemNames={['операция', 'операции', 'операций']}
                        />
                    </div>
                )
            }

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDeleteItems}
                isLoading={isDeleting}
                title={`Удаление ${pluralize(selectedIds.length, 'записи', 'записей', 'записей')}`}
                description={`Вы уверены, что хотите удалить ${pluralize(selectedIds.length, 'выбранную запись', 'выбранные записи', 'выбранные записи')} (${selectedIds.length})? Это действие нельзя будет отменить.`}
                confirmText="Удалить"
                variant="destructive"
            />


        </div >
    );
}
