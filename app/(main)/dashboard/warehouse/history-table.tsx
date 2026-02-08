"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Package, ArrowUpRight, ArrowDownLeft, Clock, Building2, ArrowRight, ArrowLeftRight, Trash2, Search, X, FileDown, Book, LayoutGrid, Tag, Archive, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// ... lower down ...

<X className="w-4 h-4" />
import { deleteInventoryTransactions } from "./actions";

import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
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
    const [activeFilter, setActiveFilter] = useState<"all" | "in" | "out" | "transfer" | "attribute_change" | "archive">("all");
    const itemsPerPage = 10;
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

    // Filter logic
    const filteredTransactions = transactions.filter(t => {
        const matchesFilter = activeFilter === "all"
            ? true
            : activeFilter === "archive"
                ? (t.type === "archive" || t.type === "restore")
                : t.type === activeFilter;
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
                playSound("notification_success");
                setSelectedIds([]);
                setIsDeleteDialogOpen(false);
            } else {
                toast(res.error || "Ошибка при удалении", "error");
                playSound("notification_error");
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
        <div className="space-y-3 relative pb-0">
            {/* Toolbar Panel */}
            <div className={cn(
                "crm-filter-tray w-full overflow-hidden flex items-center p-1.5 rounded-[22px]",
                isMobileSearchExpanded ? "!gap-0 !p-[6px]" : "gap-1"
            )}>
                {/* Desktop: Search Box */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileSearchExpanded(true);
                    }}
                    className={cn(
                        "hidden md:block relative transition-all duration-400 ease-in-out overflow-hidden h-11 bg-white rounded-[16px] shadow-sm",
                        isMobileSearchExpanded
                            ? "flex-1"
                            : "xl:flex-1 xl:w-auto xl:cursor-default xl:hover:bg-white w-[120px] cursor-pointer hover:bg-slate-50"
                    )}
                >
                    <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors", isMobileSearchExpanded && "text-primary")} />
                    <input
                        type="text"
                        placeholder={isMobileSearchExpanded ? "Поиск по истории..." : "Поиск"}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        onBlur={() => {
                            if (!searchQuery) {
                                setTimeout(() => setIsMobileSearchExpanded(false), 200);
                            }
                        }}
                        className={cn(
                            "w-full h-full pl-11 pr-10 bg-transparent focus:outline-none text-[13px] font-bold text-slate-800 transition-all duration-300",
                            isMobileSearchExpanded ? "xl:placeholder:text-slate-400" : "xl:placeholder:text-slate-400 xl:cursor-text cursor-pointer"
                        )}
                    />
                    {searchQuery && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery("");
                                setCurrentPage(1);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Mobile: Search Box */}
                <div className={cn(
                    "md:hidden relative transition-all duration-300 ease-in-out min-w-0 flex-1"
                )}>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileSearchExpanded(!isMobileSearchExpanded);
                        }}
                        className={cn(
                            "absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center z-10 cursor-pointer",
                            isMobileSearchExpanded && "text-primary"
                        )}
                    >
                        <Search className={cn("w-4 h-4 text-slate-400 transition-colors", isMobileSearchExpanded && "text-primary")} />
                    </div>
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        onBlur={() => {
                            if (!searchQuery) {
                                setTimeout(() => setIsMobileSearchExpanded(false), 200);
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileSearchExpanded(true);
                        }}
                        className={cn(
                            "crm-filter-tray-search w-full focus:outline-none min-w-0 transition-all duration-300",
                            isMobileSearchExpanded
                                ? "pl-11 pr-4 opacity-100"
                                : "pl-11 pr-10 w-full opacity-100 bg-white"
                        )}
                    />
                    {searchQuery && isMobileSearchExpanded && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setCurrentPage(1);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Desktop: Tabs */}
                <div className={cn(
                    "hidden md:flex items-center gap-[6px] shrink-0 transition-all duration-500 ease-in-out",
                    isMobileSearchExpanded
                        ? "xl:w-auto xl:opacity-100 xl:visible xl:translate-x-0 xl:overflow-visible w-0 opacity-0 invisible -translate-x-10 overflow-hidden"
                        : "w-auto opacity-100 visible translate-x-0"
                )}>
                    <div className="w-px h-6 bg-slate-500/40 mx-2 shrink-0" />
                    <div className="flex items-center gap-[4px]">
                        {[
                            { id: "all", label: "Все" },
                            { id: "in", label: "Приход" },
                            { id: "out", label: "Расход" },
                            { id: "transfer", label: "Перемещение" },
                            { id: "attribute_change", label: "Изменения" },
                            { id: "archive", label: "Архив" },
                        ].map(f => {
                            const isActive = activeFilter === f.id;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => {
                                        setActiveFilter(f.id as typeof activeFilter);
                                        setCurrentPage(1);
                                    }}
                                    className={cn(
                                        "crm-filter-tray-tab",
                                        isActive && "active"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeFilterHistory"
                                            className="absolute inset-0 bg-primary rounded-[16px] z-0"
                                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                        />
                                    )}
                                    <span className="relative z-10">{f.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile: Separator & Dropdown */}
                <div className={cn(
                    "md:hidden w-px h-6 bg-slate-200 shrink-0 transition-opacity duration-200 mx-0",
                    isMobileSearchExpanded && "hidden"
                )} />

                <div className={cn(
                    "md:hidden min-w-0 flex items-center transition-all duration-300 ease-in-out",
                    isMobileSearchExpanded
                        ? "w-0 flex-none opacity-0 invisible"
                        : "flex-1 opacity-100 visible"
                )}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full h-11 flex items-center justify-between gap-2 px-4 rounded-[16px] bg-white shadow-sm hover:bg-slate-50 transition-colors border-none">
                                <span className="text-[13px] font-bold text-slate-800 truncate">
                                    {[
                                        { id: "all", label: "Все операции" },
                                        { id: "in", label: "Приход" },
                                        { id: "out", label: "Расход" },
                                        { id: "transfer", label: "Перемещение" },
                                        { id: "attribute_change", label: "Изменение" },
                                        { id: "archive", label: "Архив" },
                                    ].find(f => f.id === activeFilter)?.label || "Фильтр"}
                                </span>
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            {[
                                { id: "all", label: "Все операции", icon: LayoutGrid },
                                { id: "in", label: "Приход", icon: ArrowDownLeft },
                                { id: "out", label: "Расход", icon: ArrowUpRight },
                                { id: "transfer", label: "Перемещение", icon: ArrowLeftRight },
                                { id: "attribute_change", label: "Изменение", icon: Tag },
                                { id: "archive", label: "Архив", icon: Archive },
                            ].map(f => (
                                <DropdownMenuItem
                                    key={f.id}
                                    onClick={() => {
                                        setActiveFilter(f.id as typeof activeFilter);
                                        setCurrentPage(1);
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 text-xs font-bold py-2 cursor-pointer",
                                        activeFilter === f.id ? "text-primary bg-primary/5" : "text-slate-600"
                                    )}
                                >
                                    <f.icon className="w-3.5 h-3.5" />
                                    {f.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                                    maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                    background: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%)'
                                }}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                                exit={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
                                className="fixed bottom-6 sm:bottom-10 left-1/2 z-[100] flex items-center bg-white p-1.5 sm:p-2 gap-2 sm:gap-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 max-w-[95vw]"
                            >
                                <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 text-white shrink-0">
                                        {selectedIds.length}
                                    </div>
                                    <span className="hidden sm:inline text-xs font-bold text-slate-500 whitespace-nowrap">Записей выбрано</span>
                                </div>

                                <div className="w-px h-6 sm:h-8 bg-slate-200 mx-1 sm:mx-2 shrink-0" />

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
                                                { header: "Роль", key: (t) => t.creator?.role?.name || (t.creator ? "Оператор" : "Система") },
                                                { header: "Дата", key: (t) => new Date(t.createdAt) }
                                            ]);
                                            toast("Экспорт завершен", "success");
                                            playSound("notification_success");
                                        }}
                                        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full hover:bg-slate-50 transition-all group"
                                    >
                                        <FileDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                        <span className="hidden sm:inline text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Экспорт</span>
                                    </button>

                                    {isAdmin && (
                                        <button
                                            onClick={handleDeleteSelected}
                                            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full hover:bg-rose-500/10 transition-all group"
                                        >
                                            <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                                            <span className="hidden sm:inline text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Удалить</span>
                                        </button>
                                    )}

                                    <div className="w-px h-6 sm:h-8 bg-slate-200 mx-1 sm:mx-2 shrink-0" />

                                    <button
                                        onClick={() => setSelectedIds([])}
                                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )
            }
            {/* Desktop Table View */}
            <div className="hidden md:block glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="w-[40px] px-3 md:px-4 lg:px-6 py-2 md:py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-3 md:px-4 lg:px-6 py-2 md:py-3 text-left text-xs font-semibold text-muted-foreground md:w-[80px]">Тип</th>
                                <th className="pl-0 md:pl-0 lg:pl-0 pr-2 py-2 md:py-3 text-left text-xs font-semibold text-muted-foreground">Товар</th>
                                <th className="pl-2 pr-2 py-2 md:py-3 text-left text-xs font-semibold text-muted-foreground">Склад</th>
                                <th className="pl-2 pr-4 lg:pr-6 py-2 md:py-3 text-center text-xs font-semibold text-muted-foreground">Изм.</th>
                                <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Причина</th>
                                <th className="hidden lg:table-cell px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Пользователь</th>
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
                                        <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(t.id)}
                                            />
                                        </td>
                                        <td className="px-3 md:px-4 lg:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-slate-900">
                                            <div className="flex items-center">
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
                                                <div className="hidden xl:block ml-4">
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
                                        <td className="pl-0 md:pl-0 lg:pl-0 pr-2 py-3 md:py-4 whitespace-nowrap">
                                            {t.item ? (
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer group/item hover:opacity-80 transition-all"
                                                    onClick={() => router.push(`/dashboard/warehouse/items/${t.item?.id}`)}
                                                >
                                                    <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover/item:bg-primary/5 group-hover/item:text-primary transition-colors">
                                                        <Package className="w-4 h-4" />
                                                    </div>
                                                    <div className="max-w-[150px] lg:max-w-[220px] xl:max-w-[300px]">
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
                                        <td className="pl-2 pr-2 py-3 md:py-4 whitespace-nowrap">
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
                                        <td className="pl-2 pr-4 lg:pr-6 py-3 md:py-4 whitespace-nowrap text-center">
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
                                        <td className="hidden xl:table-cell px-6 py-4">
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm font-medium text-slate-500 leading-snug">
                                                    {(() => {
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

                                                        return t.reason || "Без описания";
                                                    })()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
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

            {/* Mobile Compact List View */}
            <div className="md:hidden rounded-[var(--radius-outer)] border border-slate-200 overflow-hidden bg-white shadow-sm divide-y divide-slate-100">
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

            {
                filteredTransactions.length > 0 && (
                    <PremiumPagination
                        currentPage={currentPage}
                        totalItems={filteredTransactions.length}
                        pageSize={itemsPerPage}
                        onPageChange={setCurrentPage}
                        itemNames={['операция', 'операции', 'операций']}
                    />
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
                className="p-3 flex items-center gap-3 cursor-pointer active:bg-slate-50 transition-colors"
                onClick={onToggle}
            >
                {/* Selection Checkbox - Stop propagation to avoid toggling accordion */}
                <div onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer w-3 h-3"
                        checked={isSelected}
                        onChange={onSelect}
                    />
                </div>

                {/* Minimal Icon */}
                <div className={cn(
                    "w-8 h-8 rounded-[var(--radius-inner)] flex items-center justify-center shrink-0",
                    t.type === "transfer"
                        ? "bg-slate-50 text-slate-500" // Neutral for transfer
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
                        <ArrowUpRight className="w-4 h-4" />
                    ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                    )}
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 truncate pr-2">
                            {t.item?.name || "Характеристики"}
                        </span>
                        {t.type !== "attribute_change" && (
                            <Badge className={cn(
                                "px-1.5 py-0.5 h-5 font-bold text-[10px] border-none shadow-none shrink-0",
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
                        <span className="text-[10px] font-bold text-slate-400">
                            {format(new Date(t.createdAt), "d MMM, HH:mm", { locale: ru })}
                        </span>
                        <div className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                        <span className="text-[10px] font-medium text-slate-500 truncate">
                            {t.type === "transfer" ? "Перемещение" :
                                t.type === "attribute_change" ? "Изменение" :
                                    t.type === "archive" ? "Архивация" :
                                        t.type === "restore" ? "Восстановление" :
                                            isIn ? "Приход" : "Расход"}
                        </span>
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
                        <div className="px-3 pb-3 pt-0 flex flex-col gap-3">
                            <div className="bg-slate-50 rounded-[var(--radius-inner)] p-3 border border-slate-100 flex flex-col gap-2">
                                {/* Item Details */}
                                {t.item?.sku && (
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Артикул</span>
                                        <span className="text-xs font-mono text-slate-600">{t.item.sku}</span>
                                    </div>
                                )}

                                {/* Reason */}
                                {t.reason && (
                                    <div className="flex flex-col gap-1 border-b border-slate-200/60 pb-2 last:border-0 last:pb-0">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Причина / Описание</span>
                                        <p className="text-xs text-slate-700 leading-normal">{t.reason}</p>
                                    </div>
                                )}

                                {/* User */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Сотрудник</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                            {t.creator?.name?.[0] || "?"}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{t.creator?.name || "Система"}</span>
                                    </div>
                                </div>

                                {t.item && (
                                    <div className="pt-2 mt-1 border-t border-slate-200/60">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/dashboard/warehouse/items/${t.item!.id}`);
                                            }}
                                            className="w-full h-8 bg-white border border-slate-200 rounded-[var(--radius-inner)] text-xs font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                                        >
                                            Открыть карточку товара
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
