"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Package, RotateCcw, Trash2, Search, Clock, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";


import { InventoryItem } from "./types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { pluralize } from "@/lib/pluralize";
import { useDebounce } from "@/hooks/use-debounce";
import { EmptyState } from "@/components/ui/empty-state";
import { useArchiveActions } from "./hooks/useArchiveActions";

interface ArchiveTableProps {
    items: InventoryItem[];
    total?: number;
}

export function ArchiveTable({ items = [], total }: ArchiveTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { state, actions } = useArchiveActions();
    const { searchQuery, selectedIds, isRestoring, isDeleting, idsToDelete, password } = state;
    const { setSearchQuery, setSelectedIds, setIdsToDelete, setPassword, updateUrl, handleRestore, handleDelete } = actions;

    const debouncedSearch = useDebounce(searchQuery, 400);

    const currentPage = Number(searchParams.get("page")) || 1;
    const itemsPerPage = 20;

    useEffect(() => {
        if (debouncedSearch !== (searchParams.get("search") || "")) {
            updateUrl({ search: debouncedSearch, page: "1" });
        }
    }, [debouncedSearch, updateUrl, searchParams]);

    const currentItems = Array.isArray(items) ? items : [];

    if ((items?.length || 0) === 0 && searchQuery === "") {
        return (
            <EmptyState
                icon={Clock}
                title="Архив пуст"
                description="Здесь будут отображаться позиции, выведенные из оборота."
                className="py-20"
            />
        );
    }

    return (
        <div data-testid="archive-table" className="space-y-4">
            <div className="crm-card flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder="Поиск в архиве..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Поиск в архиве"
                        className="pl-10 h-11 w-full border rounded-md"
                    />
                </div>
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Button
                            type="button"
                            onClick={() => handleRestore(selectedIds)}
                            disabled={isRestoring}
                            className="h-11 px-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[var(--radius-inner)] text-xs font-bold flex items-center gap-2 hover:bg-emerald-100 transition-all disabled:opacity-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Восстановить ({selectedIds.length})
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setIdsToDelete(selectedIds)}
                            className="h-11 px-4 rounded-[var(--radius-inner)] text-xs font-bold flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Удалить ({selectedIds.length})
                        </Button>
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="table-container">
                <table className="crm-table">
                    <thead className="crm-thead">
                        <tr>
                            <th className="crm-th w-[50px]">
                                <Checkbox
                                    checked={(currentItems?.length || 0) > 0 && (currentItems || []).every(i => selectedIds.includes(i.id))}
                                    onChange={() => {
                                        const allIds = (currentItems || []).map(i => i.id);
                                        if (allIds.every(id => selectedIds.includes(id))) {
                                            setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
                                        } else {
                                            setSelectedIds(prev => Array.from(new Set([...prev, ...allIds])));
                                        }
                                    }}
                                    className="mx-auto"
                                />
                            </th>
                            <th className="crm-th">Товар</th>
                            <th className="crm-th">Артикул</th>
                            <th className="crm-th">Дата архивации</th>
                            <th className="crm-th">Причина</th>
                            <th className="crm-th text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="crm-tbody">
                        {(currentItems || []).map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                className={cn(
                                    "crm-tr-clickable",
                                    selectedIds.includes(item.id) && "crm-tr-selected"
                                )}
                            >
                                <td className="crm-td" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => {
                                            setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                                        }}
                                        className="mx-auto"
                                    />
                                </td>
                                <td className="crm-td">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 overflow-hidden relative grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 leading-tight">{item.name}</div>
                                            <div className="text-xs font-bold text-slate-400 mt-0.5">{item.category?.name || "Без категории"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="crm-td">
                                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-[var(--radius-inner)]">
                                        {item.sku || "—"}
                                    </span>
                                </td>
                                <td className="crm-td">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">
                                            {item.archivedAt ? format(new Date(item.archivedAt), "d MMM yyyy, HH:mm", { locale: ru }) : "—"}
                                        </span>
                                    </div>
                                </td>
                                <td className="crm-td">
                                    <div className="flex items-center gap-2 max-w-[200px]">
                                        <MessageCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                        <span className="text-xs text-slate-500 truncate" title={item.archiveReason || ""}>
                                            {item.archiveReason || "—"}
                                        </span>
                                    </div>
                                </td>
                                <td className="crm-td text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                            className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-inner)] bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-200"
                                            title="Просмотреть карточку"
                                            aria-label="Просмотреть карточку товара"
                                        >
                                            <Eye className="w-4 h-4" aria-hidden="true" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRestore([item.id])}
                                            className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-inner)] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-100"
                                            title="Восстановить"
                                            aria-label="Восстановить товар из архива"
                                        >
                                            <RotateCcw className="w-4 h-4" aria-hidden="true" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIdsToDelete([item.id])}
                                            className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-inner)] text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                                            title="Удалить навсегда"
                                            aria-label="Удалить товар навсегда"
                                        >
                                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Compact List View */}
            <MobileArchiveList
                items={currentItems || []}
                selectedIds={selectedIds}
                onSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                onRestore={handleRestore}
                onDelete={(id) => setIdsToDelete([id])}
                router={router}
            />

            {total !== undefined && total > 0 && (
                <div className="pt-2">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={total}
                        pageSize={itemsPerPage}
                        onPageChange={(page) => updateUrl({ page: page.toString() })}
                        itemNames={['позиция', 'позиции', 'позиций']}
                    />
                </div>
            )}

            <ConfirmDialog
                isOpen={idsToDelete.length > 0}
                onClose={() => { setIdsToDelete([]); setPassword(""); }}
                onConfirm={() => handleDelete(idsToDelete)}
                isLoading={isDeleting}
                title="Удаление из системы"
                description={"Вы уверены, что хотите НАВСЕГДА удалить архивные " + pluralize(idsToDelete.length, 'позицию', 'позиции', 'позиций') + " (" + idsToDelete.length + ")? Это действие нельзя отменить. Введите пароль подтверждения."}
                confirmText="Удалить окончательно"
                variant="destructive"
            >
                <div className="mt-4">
                    <Input
                        type="password"
                        placeholder="Пароль от своей учетной записи"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-rose-500/10"
                        autoFocus
                    />
                </div>
            </ConfirmDialog>
        </div>
    );
}

// Mobile Compact List Component
function MobileArchiveList({
    items,
    selectedIds,
    onSelect,
    onRestore,
    onDelete,
    router
}: {
    items: InventoryItem[];
    selectedIds: string[];
    onSelect: (id: string) => void;
    onRestore: (ids: string[]) => void;
    onDelete: (id: string) => void;
    router: ReturnType<typeof import("next/navigation").useRouter>;
}) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="md:hidden rounded-[var(--radius-outer)] border border-slate-200 overflow-hidden bg-white shadow-sm divide-y divide-slate-100">
            {(items || []).map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isExpanded = expandedId === item.id;

                return (
                    <div key={item.id} className="bg-white">
                        {/* Main Row */}
                        <div
                            className="p-3 flex items-center gap-3 cursor-pointer active:bg-slate-50 transition-colors"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setExpandedId(isExpanded ? null : item.id);
                                }
                            }}
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                            {/* Checkbox */}
                            <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={isSelected}
                                    onChange={() => onSelect(item.id)}
                                    className="w-[16px] h-[16px]"
                                />
                            </div>

                            {/* Item Image */}
                            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 overflow-hidden relative grayscale opacity-60 shrink-0">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Package className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm text-slate-900 truncate pr-2">
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-xs font-bold text-slate-400">
                                        {item.archivedAt ? format(new Date(item.archivedAt), "d MMM, HH:mm", { locale: ru }) : "—"}
                                    </span>
                                    <div className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                                    <span className="text-xs font-medium text-slate-500 truncate">
                                        {item.category?.name || "Без категории"}
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
                                            {/* SKU */}
                                            {item.sku && (
                                                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                    <span className="text-xs font-bold text-slate-400">Артикул</span>
                                                    <span className="text-xs font-mono text-slate-600">{item.sku}</span>
                                                </div>
                                            )}

                                            {/* Archive Reason */}
                                            {item.archiveReason && (
                                                <div className="flex flex-col gap-1 border-b border-slate-200/60 pb-2">
                                                    <span className="text-xs font-bold text-slate-400">Причина</span>
                                                    <p className="text-xs text-slate-700 leading-normal">{item.archiveReason}</p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="pt-2 mt-1 border-t border-slate-200/60 flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        router.push(`/dashboard/warehouse/items/${item.id}`);
                                                    }}
                                                    className="flex-1 h-9 rounded-[var(--radius-inner)] text-xs font-bold text-slate-600 flex items-center justify-center gap-2"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Карточка
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        onRestore([item.id]);
                                                    }}
                                                    className="flex-1 h-9 bg-emerald-50 border border-emerald-100 rounded-[var(--radius-inner)] text-xs font-bold text-emerald-600 flex items-center justify-center gap-2 hover:bg-emerald-100"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    Восстановить
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        onDelete(item.id);
                                                    }}
                                                    className="h-9 w-9 bg-rose-50 border border-rose-100 rounded-[var(--radius-inner)] text-rose-600 hover:bg-rose-100"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
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
