"use client";

import Image from "next/image";
import { useState } from "react";
import { Package, RotateCcw, Trash2, Search, Clock, MessageCircle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/components/ui/toast";
import { InventoryItem } from "./inventory-client";
import { restoreInventoryItems, deleteInventoryItems } from "./actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { pluralize } from "@/lib/pluralize";

interface ArchiveTableProps {
    items: InventoryItem[];
}

export function ArchiveTable({ items }: ArchiveTableProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [password, setPassword] = useState("");
    const itemsPerPage = 10;

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.archiveReason?.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => {
        const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
        const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
        return dateB - dateA;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    const handleRestore = async (ids: string[]) => {
        setIsRestoring(true);
        try {
            const res = await restoreInventoryItems(ids, "Восстановление из архива");
            if (res.success) {
                toast(`Восстановлено: ${ids.length} ${pluralize(ids.length, 'позиция', 'позиции', 'позиций')}`, "success");
                setSelectedIds([]);
                router.refresh();
            } else {
                toast(res.error || "Ошибка при восстановлении", "error");
            }
        } finally {
            setIsRestoring(false);
        }
    };

    const handleDelete = async (ids: string[]) => {
        if (!password) {
            toast("Введите пароль для удаления", "error");
            return;
        }
        setIsDeleting(true);
        try {
            const res = await deleteInventoryItems(ids, password);
            if (res.success) {
                toast(`Удалено: ${ids.length} ${pluralize(ids.length, 'позиция', 'позиции', 'позиций')}`, "success");
                setSelectedIds([]);
                setIdsToDelete([]);
                setPassword("");
                router.refresh();
            } else {
                toast(res.error || "Ошибка при удалении", "error");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (items.length === 0 && searchQuery === "") {
        return (
            <div className="bg-white rounded-[var(--radius)] border border-gray-200 p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[var(--radius)] flex items-center justify-center text-slate-300 mb-6 border border-slate-100 shadow-sm">
                    <Clock className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Архив пуст</h3>
                <p className="text-slate-500 mt-2 max-w-[320px] font-medium leading-relaxed">Здесь будут отображаться позиции, выведенные из оборота.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/50 backdrop-blur-md p-4 rounded-[var(--radius)] border border-slate-200/60 shadow-sm">
                <div className="relative flex-1 w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск в архиве..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full h-11 pl-10 pr-4 rounded-[var(--radius)] border border-slate-200 bg-white text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    />
                </div>
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                        <button
                            onClick={() => handleRestore(selectedIds)}
                            disabled={isRestoring}
                            className="h-11 px-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[var(--radius)] text-xs font-bold flex items-center gap-2 hover:bg-emerald-100 transition-all disabled:opacity-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Восстановить ({selectedIds.length})
                        </button>
                        <button
                            onClick={() => setIdsToDelete(selectedIds)}
                            className="h-11 px-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-[var(--radius)] text-xs font-bold flex items-center gap-2 hover:bg-rose-100 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Удалить ({selectedIds.length})
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white shadow-sm rounded-[var(--radius)] border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-[50px] px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                        checked={currentItems.length > 0 && currentItems.every(i => selectedIds.includes(i.id))}
                                        onChange={() => {
                                            const allIds = currentItems.map(i => i.id);
                                            if (allIds.every(id => selectedIds.includes(id))) {
                                                setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
                                            } else {
                                                setSelectedIds(prev => Array.from(new Set([...prev, ...allIds])));
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Товар</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Артикул</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Дата архивации</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Причина</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {currentItems.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => {
                                                setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-[var(--radius)] bg-slate-100 border border-slate-200 overflow-hidden relative grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
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
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5">{item.category?.name || "Без категории"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-[var(--radius-inner)]">
                                            {item.sku || "—"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">
                                                {item.archivedAt ? format(new Date(item.archivedAt), "d MMM yyyy, HH:mm", { locale: ru }) : "—"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <MessageCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                            <span className="text-xs text-slate-500 truncate" title={item.archiveReason || ""}>
                                                {item.archiveReason || "—"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                                className="w-9 h-9 flex items-center justify-center rounded-[var(--radius)] bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-200"
                                                title="Просмотреть карточку"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRestore([item.id])}
                                                className="w-9 h-9 flex items-center justify-center rounded-[var(--radius)] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-100"
                                                title="Восстановить"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setIdsToDelete([item.id])}
                                                className="w-9 h-9 flex items-center justify-center rounded-[var(--radius)] bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all border border-rose-100"
                                                title="Удалить навсегда"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredItems.length > 0 && (
                <div className="pt-2">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredItems.length}
                        pageSize={itemsPerPage}
                        onPageChange={setCurrentPage}
                        itemNames={['записи', 'записей', 'записей']}
                    />
                </div>
            )}

            <ConfirmDialog
                isOpen={idsToDelete.length > 0}
                onClose={() => { setIdsToDelete([]); setPassword(""); }}
                onConfirm={() => handleDelete(idsToDelete)}
                isLoading={isDeleting}
                title="Удаление из системы"
                description={`Вы уверены, что хотите НАВСЕГДА удалить архивные ${pluralize(idsToDelete.length, 'позицию', 'позиции', 'позиций')} (${idsToDelete.length})? Это действие нельзя отменить. Введите пароль подтверждения.`}
                confirmText="Удалить окончательно"
                variant="destructive"
            >
                <div className="mt-4">
                    <input
                        type="password"
                        placeholder="Пароль администратора"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 px-4 rounded-[var(--radius)] border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none text-sm transition-all"
                        autoFocus
                    />
                </div>
            </ConfirmDialog>
        </div>
    );
}
