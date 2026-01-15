"use client";

import { useState, useEffect } from "react";
import { Package, Hash, ArrowLeft, Check, Plus, Trash2, Edit, X, PlusSquare, Search, SearchX, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { deleteInventoryItems, updateInventoryItem, addInventoryItem, bulkMoveInventoryItems, bulkUpdateInventoryCategory, getInventoryCategories } from "@/app/dashboard/warehouse/actions";
import { useFormStatus } from "react-dom";
import { AdjustStockDialog } from "../adjust-stock-dialog";
import { ItemDetailDrawer } from "../item-detail-drawer";
import { Pagination } from "@/components/ui/pagination";
import { StorageLocation } from "../storage-locations-tab";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface InventoryItem {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    description: string | null;
    location: string | null;
    storageLocationId: string | null;
    categoryId: string | null;
    qualityCode: string | null;
    attributeCode: string | null;
    sizeCode: string | null;
    image: string | null;
    reservedQuantity: number;
}

interface Category {
    id: string;
    name: string;
    description: string | null;
    prefix: string | null;
}

interface CategoryDetailClientProps {
    category: Category;
    items: InventoryItem[];
    storageLocations?: StorageLocation[];
}

export function CategoryDetailClient({ category, items, storageLocations = [] }: CategoryDetailClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
    const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false);
    const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getInventoryCategories();
            if (res.data) setAllCategories(res.data as Category[]);
        };
        fetchCategories();
    }, []);

    // Effect to open drawer if itemId is in URL
    useEffect(() => {
        const itemId = searchParams.get("itemId");
        if (itemId) {
            const item = items.find(i => i.id === itemId);
            if (item) {
                setViewingItem(item);
                // Clear the param without refreshing to avoid re-opening if drawer is closed
                const newPath = window.location.pathname;
                window.history.replaceState(null, '', newPath);
            }
        }
    }, [searchParams, items]);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "low" | "out">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const toggleSelectItem = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredItems.map(i => i.id));
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.sku?.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter =
            filterStatus === "all" ? true :
                filterStatus === "low" ? item.quantity <= item.lowStockThreshold && item.quantity > 0 :
                    filterStatus === "out" ? item.quantity === 0 : true;

        return matchesSearch && matchesFilter;
    });

    // Reset page on filter/search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);


    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    const handleDelete = async (ids: string[]) => {
        setIsDeleting(true);
        try {
            const res = await deleteInventoryItems(ids);
            if (res?.success) {
                toast(`Удалено позиций: ${ids.length}`, "success");
                setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
            } else {
                toast(res?.error || "Ошибка при удалении", "error");
            }
        } catch (error) {
            console.error(error);
            toast("Произошла ошибка", "error");
        } finally {
            setIsDeleting(false);
            setIdsToDelete([]);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="h-12 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                            <h1 className="text-lg font-black text-slate-900 tracking-tight">{category.name}</h1>
                        </div>

                        <div className="h-12 px-5 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-[11px] font-black uppercase tracking-widest shadow-sm border border-indigo-100/50 shrink-0 whitespace-nowrap">
                            {items.length} позиций
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-right-4 duration-500">
                            <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Выбрано: {selectedIds.length}</span>
                            <Button
                                variant="ghost"
                                disabled={isDeleting}
                                onClick={() => setIdsToDelete(selectedIds)}
                                className="h-10 w-10 p-0 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 gap-2 font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Добавить позицию
                    </Button>
                </div>
            </div>

            {/* Mass Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-2 px-6 py-4 bg-slate-900 shadow-2xl rounded-[2.5rem] animate-in slide-in-from-bottom-20 duration-500 border border-slate-800/50 backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-r border-slate-800 pr-6 mr-2">
                        <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 rounded-full text-[10px] font-black text-white">{selectedIds.length}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Позиций выбрано</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsBulkMoveOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all group"
                        >
                            <MapPin className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                            Переместить
                        </button>
                        <button
                            onClick={() => setIsBulkCategoryOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all group"
                        >
                            <Package className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                            Категория
                        </button>
                        <button
                            onClick={() => {
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                    const itemsToPrint = items.filter(i => selectedIds.includes(i.id));
                                    printWindow.document.write(`
                                        <html>
                                            <head>
                                                <title>Печать этикеток</title>
                                                <style>
                                                    body { font-family: sans-serif; padding: 20px; }
                                                    .label { border: 1px solid #ccc; padding: 10px; margin: 10px; width: 200px; display: inline-block; text-align: center; }
                                                    .sku { font-weight: bold; font-family: monospace; font-size: 1.2rem; }
                                                    .name { font-size: 0.8rem; margin-top: 5px; }
                                                </style>
                                            </head>
                                            <body>
                                                ${itemsToPrint.map(item => `
                                                    <div class="label">
                                                        <div class="sku">${item.sku || 'N/A'}</div>
                                                        <div class="name">${item.name}</div>
                                                    </div>
                                                `).join('')}
                                                <script>window.print();</script>
                                            </body>
                                        </html>
                                    `);
                                    printWindow.document.close();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all group"
                        >
                            <PlusSquare className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                            Этикетки
                        </button>
                        <button
                            onClick={() => setIdsToDelete(selectedIds)}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Удалить
                        </button>
                        <div className="w-px h-8 bg-slate-800 mx-2" />
                        <button
                            onClick={() => setSelectedIds([])}
                            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {isAddOpen && (
                <AddItemDialogWrapper
                    category={category}
                    storageLocations={storageLocations}
                    onClose={() => setIsAddOpen(false)}
                />
            )}

            {isEditOpen && editingItem && (
                <EditItemDialog
                    item={editingItem}
                    category={category}
                    storageLocations={storageLocations}
                    onClose={() => {
                        setIsEditOpen(false);
                        setEditingItem(null);
                    }}
                />
            )}

            {isBulkMoveOpen && (
                <BulkMoveDialog
                    selectedIds={selectedIds}
                    storageLocations={storageLocations}
                    onClose={() => setIsBulkMoveOpen(false)}
                    onSuccess={() => {
                        setIsBulkMoveOpen(false);
                        setSelectedIds([]);
                    }}
                />
            )}

            {isBulkCategoryOpen && (
                <BulkCategoryDialog
                    selectedIds={selectedIds}
                    categories={allCategories}
                    onClose={() => setIsBulkCategoryOpen(false)}
                    onSuccess={() => {
                        setIsBulkCategoryOpen(false);
                        setSelectedIds([]);
                    }}
                />
            )}

            {isAdjustOpen && adjustingItem && (
                <AdjustStockDialog
                    item={adjustingItem}
                    locations={storageLocations}
                    onClose={() => {
                        setIsAdjustOpen(false);
                        setAdjustingItem(null);
                    }}
                />
            )}

            {viewingItem && (
                <ItemDetailDrawer
                    item={viewingItem}
                    onClose={() => setViewingItem(null)}
                />
            )}

            {/* Sub-header with Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                    <input
                        type="text"
                        placeholder="Поиск по названию или артикулу..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none font-medium text-slate-900 transition-all"
                    />
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/60 shrink-0">
                    {[
                        { id: "all", label: "Все" },
                        { id: "low", label: "Мало" },
                        { id: "out", label: "Нет" }
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilterStatus(f.id as "all" | "low" | "out")}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                filterStatus === f.id
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Items Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Позиции</h2>
                        <div className="h-px w-12 bg-slate-200" />
                    </div>
                    <button
                        onClick={toggleSelectAll}
                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                    >
                        {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? "Снять выбор" : "Выбрать все"}
                    </button>
                </div>

                {filteredItems.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1 pb-12">
                            {currentItems.map((item) => {
                                const isSelected = selectedIds.includes(item.id);
                                const isLowStock = item.quantity <= item.lowStockThreshold;
                                const isCritical = item.quantity === 0;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            setEditingItem(item);
                                            setIsEditOpen(true);
                                        }}
                                        className={cn(
                                            "group relative bg-white rounded-[2rem] border border-slate-200/60 p-6 transition-all duration-300 cursor-pointer overflow-hidden",
                                            "hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 hover:border-indigo-100",
                                            isSelected && "ring-2 ring-indigo-500 border-transparent shadow-lg shadow-indigo-100 bg-indigo-50/10"
                                        )}
                                    >
                                        {/* Selection Checkbox (Floating) */}
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelectItem(item.id);
                                            }}
                                            className={cn(
                                                "absolute top-5 right-5 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                                                isSelected
                                                    ? "bg-indigo-600 border-indigo-600 text-white scale-110"
                                                    : "bg-white border-slate-100 opacity-0 group-hover:opacity-100"
                                            )}
                                        >
                                            {isSelected && <Check className="w-3 h-3 stroke-[4]" />}
                                        </div>

                                        {/* Item Icon & Identity */}
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 overflow-hidden shrink-0",
                                                isCritical ? "bg-rose-50 text-rose-500" : isLowStock ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                                            )}>
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-7 h-7" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-2 transition-colors group-hover:text-indigo-600">
                                                    {item.name}
                                                </h3>
                                                <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[10px] font-bold text-slate-400 group-hover:bg-white group-hover:border-indigo-100 group-hover:text-indigo-400 transition-all">
                                                    <Hash className="w-3 h-3" />
                                                    {item.sku || "N/A"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stock Metrics */}
                                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 relative">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Наличие</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className={cn(
                                                        "text-2xl font-black tabular-nums transition-colors",
                                                        isCritical ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-slate-900"
                                                    )}>
                                                        {item.quantity - (item.reservedQuantity || 0)}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-400">{item.unit}</span>
                                                </div>
                                                {item.reservedQuantity > 0 && (
                                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                                                        ({item.quantity} всего, {item.reservedQuantity} бронь)
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Локация</p>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                                                        {storageLocations.find(l => l.id === item.storageLocationId)?.name || item.location || "Не задано"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Indicator (Bottom Strip) */}
                                        {(isLowStock || isCritical) && (
                                            <div className={cn(
                                                "mt-6 py-2 px-4 rounded-xl flex items-center gap-2",
                                                isCritical ? "bg-rose-50/50" : "bg-amber-50/50"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isCritical ? "bg-rose-500" : "bg-amber-500")} />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    isCritical ? "text-rose-600" : "text-amber-600"
                                                )}>
                                                    {isCritical ? "Нет в наличии" : "Ниже порога"}
                                                </span>
                                            </div>
                                        )}

                                        {/* Hover Actions Bar */}
                                        <div className="absolute inset-x-0 bottom-0 py-2.5 px-6 bg-slate-900 flex items-center justify-between transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            <div className="flex gap-4">
                                                <button
                                                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                                                    title="Корректировка"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAdjustingItem(item);
                                                        setIsAdjustOpen(true);
                                                    }}
                                                >
                                                    <PlusSquare className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="text-slate-400 hover:text-indigo-400 transition-colors"
                                                    title="Изменить"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingItem(item);
                                                        setIsEditOpen(true);
                                                    }}
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <button
                                                className="text-slate-400 hover:text-rose-400 transition-colors"
                                                title="Удалить"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIdsToDelete([item.id]);
                                                }}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredItems.length > 0 && (
                            <div className="pb-12">
                                <Pagination
                                    totalItems={filteredItems.length}
                                    pageSize={itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                    itemName="позиций"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center px-4 bg-slate-50/30 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 text-slate-300 shadow-sm">
                            {searchQuery ? <SearchX className="w-10 h-10" /> : <Package className="w-10 h-10" />}
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">
                            {searchQuery ? "Ничего не найдено" : "Категория пуста"}
                        </h2>
                        <p className="text-slate-500 max-w-[280px] font-medium leading-relaxed">
                            {searchQuery
                                ? `По запросу "${searchQuery}" товаров не найдено. Попробуйте изменить параметры поиска.`
                                : "В этой категории пока нет товаров. Нажмите \"Добавить позицию\", чтобы начать."
                            }
                        </p>
                    </div>
                )}
            </div>
            <ConfirmDialog
                isOpen={idsToDelete.length > 0}
                onClose={() => setIdsToDelete([])}
                onConfirm={() => handleDelete(idsToDelete)}
                title="Удаление позиций"
                description={`Вы уверены, что хотите удалить ${idsToDelete.length} поз.? Это действие необратимо.`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={isDeleting}
            />
        </div>
    );
}

function SubmitButton({ label = "Сохранить", pendingLabel = "Сохранение..." }: { label?: string, pendingLabel?: string }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full bg-slate-900 text-white rounded-xl font-bold h-12 shadow-xl shadow-slate-200 transition-all active:scale-[0.98] mt-2"
        >
            {pending ? pendingLabel : label}
        </Button>
    );
}

function AddItemDialogWrapper({ category, storageLocations, onClose }: { category: Category, storageLocations: StorageLocation[], onClose: () => void }) {
    const { toast } = useToast(); const [error, setError] = useState("");
    const [qualityCode, setQualityCode] = useState("");
    const [attributeCode, setAttributeCode] = useState("");
    const [sizeCode, setSizeCode] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // SKU Sanitizer: Only A-Z, 0-9, and dashes allowed
    const sanitizeSku = (val: string) => {
        if (/[\u0400-\u04FF]/.test(val)) {
            toast("Используйте только латиницу, цифры 0-9 и символ «-»", "warning");
        }
        return val.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    };

    const skuPreview = category.prefix
        ? [category.prefix, qualityCode, attributeCode, sizeCode].filter(Boolean).join("-")
        : "";

    async function handleSubmit(formData: FormData) {
        const skuValue = formData.get("sku") as string;
        if (skuValue && /[^a-zA-Z0-9-]/.test(skuValue)) {
            setError("Артикул может содержать только латиницу, цифры и «-»");
            return;
        }
        const res = await addInventoryItem(formData);
        if (res?.error) {
            setError(res.error);
        } else {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in-95 p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Новый товар</h2>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Добавление в {category.name}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="categoryId" value={category.id} />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Название</label>
                        <input name="name" required className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Артикул (ручной)</label>
                        <input
                            name="sku"
                            placeholder="Пусто для авто"
                            className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-mono font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            onInput={(e) => {
                                e.currentTarget.value = sanitizeSku(e.currentTarget.value);
                            }}
                        />
                    </div>

                    {category.prefix && (
                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Составной артикул</label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Качество</label>
                                    <input
                                        name="qualityCode"
                                        value={qualityCode}
                                        onChange={(e) => setQualityCode(sanitizeSku(e.target.value))}
                                        placeholder="FT, BZ"
                                        className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Цвет</label>
                                    <input
                                        name="attributeCode"
                                        value={attributeCode}
                                        onChange={(e) => setAttributeCode(sanitizeSku(e.target.value))}
                                        placeholder="BLK, WHT"
                                        className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Размер</label>
                                    <input
                                        name="sizeCode"
                                        value={sizeCode}
                                        onChange={(e) => setSizeCode(sanitizeSku(e.target.value))}
                                        placeholder="L, XL"
                                        className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase"
                                    />
                                </div>
                            </div>
                            {skuPreview && (
                                <div className="pt-2 border-t border-indigo-100 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Превью:</span>
                                    <span className="text-sm font-black text-indigo-600 font-mono tracking-wider">{skuPreview}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ед. изм.</label>
                            <select name="unit" className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none focus:bg-white focus:border-indigo-500 transition-all">
                                <option value="шт">Штуки (шт)</option>
                                <option value="м">Метры (м)</option>
                                <option value="кг">Килограммы (кг)</option>
                                <option value="упак">Упаковки</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Мин. порог</label>
                            <input type="number" name="lowStockThreshold" defaultValue="5" className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Описание</label>
                        <textarea name="description" className="w-full h-24 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Изображение товара</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="w-8 h-8 text-slate-200" />
                                )}
                            </div>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin className="w-3 h-3" /> Место хранения</label>
                        <select
                            name="storageLocationId"
                            className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none focus:bg-white focus:border-indigo-500 transition-all"
                        >
                            <option value="">Не выбрано (или укажите текстом ниже)</option>
                            {storageLocations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                        <input name="location" placeholder="Или укажите вручную..." className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all mt-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Наличие</label>
                            <input type="number" name="quantity" defaultValue="0" className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                        </div>
                    </div>

                    {error && <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest bg-rose-50 p-3 rounded-xl">{error}</p>}
                    <SubmitButton label="Добавить товар" />
                </form>
            </div>
        </div>
    );
}

function EditItemDialog({ item, category, storageLocations, onClose }: { item: InventoryItem, category: Category, storageLocations: StorageLocation[], onClose: () => void }) {
    const [error, setError] = useState("");
    const [qualityCode, setQualityCode] = useState(item.qualityCode || "");
    const { toast } = useToast(); const [attributeCode, setAttributeCode] = useState(item.attributeCode || "");
    const [sizeCode, setSizeCode] = useState(item.sizeCode || "");
    const [imagePreview, setImagePreview] = useState<string | null>(item.image);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // SKU Sanitizer: Only A-Z, 0-9, and dashes allowed
    const sanitizeSku = (val: string) => {
        if (/[\u0400-\u04FF]/.test(val)) {
            toast("Используйте только латиницу, цифры 0-9 и символ «-»", "warning");
        }
        return val.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    };

    const skuPreview = category.prefix
        ? [category.prefix, qualityCode, attributeCode, sizeCode].filter(Boolean).join("-")
        : "";

    async function handleSubmit(formData: FormData) {
        const skuValue = formData.get("sku") as string;
        if (skuValue && /[^a-zA-Z0-9-]/.test(skuValue)) {
            setError("Артикул может содержать только латиницу, цифры и «-»");
            return;
        }
        const res = await updateInventoryItem(item.id, formData);
        if (res?.error) {
            setError(res.error);
        } else {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in-95 p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Редактировать</h2>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Изменение параметров товара</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="categoryId" value={item.categoryId || ""} />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Название</label>
                        <input name="name" defaultValue={item.name} required className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Артикул (ручной)</label>
                        <input
                            name="sku"
                            defaultValue={item.sku || ""}
                            className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-mono font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            onInput={(e) => {
                                e.currentTarget.value = sanitizeSku(e.currentTarget.value);
                            }}
                        />
                    </div>

                    {category.prefix && (
                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Составной артикул</label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Качество</label>
                                    <input
                                        name="qualityCode"
                                        value={qualityCode}
                                        onChange={(e) => setQualityCode(sanitizeSku(e.target.value))}
                                        placeholder="FT, BZ"
                                        className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Цвет</label>
                                    <input
                                        name="attributeCode"
                                        value={attributeCode}
                                        onChange={(e) => setAttributeCode(sanitizeSku(e.target.value))}
                                        placeholder="BLK, WHT"
                                        className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Размер</label>
                                    <input
                                        name="sizeCode"
                                        value={sizeCode}
                                        onChange={(e) => setSizeCode(sanitizeSku(e.target.value))}
                                        placeholder="L, XL"
                                        className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase"
                                    />
                                </div>
                            </div>
                            {skuPreview && (
                                <div className="pt-2 border-t border-indigo-100 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Превью:</span>
                                    <span className="text-sm font-black text-indigo-600 font-mono tracking-wider">{skuPreview}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ед. изм.</label>
                            <select name="unit" defaultValue={item.unit} className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none focus:bg-white focus:border-indigo-500 transition-all">
                                <option value="шт">Штуки (шт)</option>
                                <option value="м">Метры (м)</option>
                                <option value="кг">Килограммы (кг)</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Мин. порог</label>
                            <input type="number" name="lowStockThreshold" defaultValue={item.lowStockThreshold} className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Описание</label>
                        <textarea name="description" defaultValue={item.description || ""} className="w-full h-24 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Изображение товара</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="w-8 h-8 text-slate-200" />
                                )}
                            </div>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer"
                            />
                            <input type="hidden" name="currentImage" value={item.image || ""} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin className="w-3 h-3" /> Место хранения</label>
                        <select
                            name="storageLocationId"
                            defaultValue={item.storageLocationId || ""}
                            className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none focus:bg-white focus:border-indigo-500 transition-all"
                        >
                            <option value="">Не выбрано (или укажите текстом ниже)</option>
                            {storageLocations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                        <input name="location" defaultValue={item.location || ""} placeholder="Или укажите вручную..." className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all mt-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Наличие текущее</label>
                            <input type="number" name="quantity" defaultValue={item.quantity} className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all disabled:opacity-50" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Забронировано</label>
                            <input type="number" name="reservedQuantity" defaultValue={item.reservedQuantity} className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                        </div>
                    </div>

                    {error && <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest bg-rose-50 p-3 rounded-xl">{error}</p>}
                    <SubmitButton />
                </form>
            </div>
        </div>
    );
}

function BulkMoveDialog({ selectedIds, storageLocations, onClose, onSuccess }: { selectedIds: string[], storageLocations: StorageLocation[], onClose: () => void, onSuccess: () => void }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [targetLocationId, setTargetLocationId] = useState("");
    const [comment, setComment] = useState("");

    const handleMove = async () => {
        if (!targetLocationId) return;
        setIsLoading(true);
        try {
            const res = await bulkMoveInventoryItems(selectedIds, targetLocationId, comment);
            if (res.success) {
                toast(`Успешно перемещено позиций: ${selectedIds.length}`, "success");
                onSuccess();
            } else {
                toast(res.error || "Ошибка при перемещении", "error");
            }
        } catch (error) {
            toast("Произошла ошибка", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Массовое перемещение</h2>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Перемещение {selectedIds.length} позиций</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Целевой склад</label>
                        <select
                            value={targetLocationId}
                            onChange={(e) => setTargetLocationId(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">Выберите склад...</option>
                            {storageLocations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Комментарий</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-24 p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all resize-none"
                            placeholder="Причина перемещения..."
                        />
                    </div>

                    <Button
                        onClick={handleMove}
                        disabled={!targetLocationId || isLoading}
                        className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        {isLoading ? "Перемещение..." : "Подтвердить перемещение"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function BulkCategoryDialog({ selectedIds, categories, onClose, onSuccess }: { selectedIds: string[], categories: Category[], onClose: () => void, onSuccess: () => void }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [targetCategoryId, setTargetCategoryId] = useState("");

    const handleUpdate = async () => {
        if (!targetCategoryId) return;
        setIsLoading(true);
        try {
            const res = await bulkUpdateInventoryCategory(selectedIds, targetCategoryId);
            if (res.success) {
                toast(`Категория изменена для ${selectedIds.length} позиций`, "success");
                onSuccess();
            } else {
                toast(res.error || "Ошибка", "error");
            }
        } catch (error) {
            toast("Произошла ошибка", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Смена категории</h2>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">{selectedIds.length} поз. выбрано</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Новая категория</label>
                        <select
                            value={targetCategoryId}
                            onChange={(e) => setTargetCategoryId(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">Выберите категорию...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={handleUpdate}
                        disabled={!targetCategoryId || isLoading}
                        className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        {isLoading ? "Обновление..." : "Сменить категорию"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
