"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Package, ArrowLeft, Check, Plus, Trash2, Edit, X, PlusSquare, Search, SearchX, MapPin, ChevronRight, Copy, Download, ChevronDown, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "../submit-button";
import { deleteInventoryItems, updateInventoryItem, addInventoryItem, bulkMoveInventoryItems, bulkUpdateInventoryCategory, getInventoryCategories, deleteInventoryCategory } from "@/app/dashboard/warehouse/actions";
import { EditCategoryDialog } from "../edit-category-dialog";
import { CategorySelect } from "../category-select";
import { useFormStatus } from "react-dom";
import { AdjustStockDialog } from "../adjust-stock-dialog";
import { Pagination } from "@/components/ui/pagination";
import { StorageLocation } from "../storage-locations-tab";
import { StorageLocationSelect } from "@/components/ui/storage-location-select";
import { useToast } from "@/components/ui/toast";

import { AddCategoryDialog } from "../add-category-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createElement } from "react";
import { getCategoryIcon, getColorStyles, CLOTHING_COLORS, CLOTHING_SIZES, CLOTHING_QUALITIES } from "../category-utils";
import { UnitSelect } from "@/components/ui/unit-select";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";


export interface InventoryItem {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    criticalStockThreshold: number;
    description: string | null;
    location: string | null;
    storageLocationId: string | null;
    categoryId: string | null;
    qualityCode: string | null;
    attributeCode: string | null;
    sizeCode: string | null;
    image: string | null;
    reservedQuantity: number;
    attributes?: Record<string, string | number | boolean | null | undefined>;
    category?: {
        name: string;
        prefix: string | null;
    } | null;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    prefix: string | null;
    parentId?: string | null;
    color: string | null;
    icon: string | null;
}

interface CategoryDetailClientProps {
    category: Category;
    parentCategory?: Category;
    subCategories?: Category[];
    items: InventoryItem[];
    storageLocations?: StorageLocation[];
    measurementUnits?: { id: string, name: string }[];
}



export function CategoryDetailClient({
    category,
    parentCategory,
    subCategories = [],
    items,
    storageLocations = [],
    measurementUnits = []
}: CategoryDetailClientProps) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
    const [duplicatingItem, setDuplicatingItem] = useState<InventoryItem | null>(null); // New state for copy
    const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false);
    const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getInventoryCategories();
            if (res.data) setAllCategories(res.data as Category[]);
        };
        fetchCategories();
    }, []);



    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "in" | "low" | "out">("all");
    const [filterStorage, setFilterStorage] = useState<string>("all"); // New warehouse filter
    const [isStorageOpen, setIsStorageOpen] = useState(false); // State for custom dropdown
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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
                filterStatus === "in" ? item.quantity > item.lowStockThreshold :
                    filterStatus === "low" ? item.quantity <= item.lowStockThreshold && item.quantity > item.criticalStockThreshold :
                        filterStatus === "out" ? item.quantity <= item.criticalStockThreshold : true;

        const matchesStorage =
            filterStorage === "all" ? true :
                item.storageLocationId === filterStorage;

        return matchesSearch && matchesFilter && matchesStorage;
    });

    // Reset page on filter/search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, filterStorage]);


    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    const handleDeleteItems = async (ids: string[]) => {
        setIsDeleting(true);
        try {
            const res = await deleteInventoryItems(ids);
            if (res?.success) {
                toast(`Удалено позиций: ${ids.length}`, "success");
                setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
            } else {
                toast(res?.error || "Ошибка при удалении", "error");
            }
        } catch {
            toast("Произошла ошибка", "error");
        } finally {
            setIsDeleting(false);
            setIdsToDelete([]);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        setIsDeleting(true);
        try {
            const res = await deleteInventoryCategory(id);
            if (res?.success) {
                toast("Категория удалена", "success");
                router.refresh();
            } else {
                toast(res?.error || "Ошибка при удалении", "error");
            }
        } catch {
            toast("Произошла ошибка", "error");
        } finally {
            setIsDeleting(false);
            setDeletingCategory(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Group */}
            <div className="space-y-6">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: "Склад", href: "/dashboard/warehouse", icon: Package },
                        ...(parentCategory ? [{ label: parentCategory.name, href: `/dashboard/warehouse/${parentCategory.id}` }] : []),
                        { label: category.name }
                    ]}
                />

                {/* Main Title Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => router.back()}
                            className="group w-12 h-12 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 shrink-0 shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                        </button>

                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{category.name}</h1>
                                <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black tracking-wide border border-slate-200/50 self-start mt-1">
                                    {items.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center bg-[#0F172A] text-white p-1.5 pl-2 gap-2 rounded-full shadow-2xl animate-in slide-in-from-bottom-6 fade-in duration-300 border border-slate-800">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-indigo-500/30">
                                        {selectedIds.length}
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap mr-2">Позиций выбрано</span>
                                </div>

                                <div className="w-px h-8 bg-slate-700/50" />

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setIsBulkMoveOpen(true)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                                    >
                                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                        <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">Переместить</span>
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
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                                    >
                                        <Tag className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                        <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">Этикетки</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const itemsToExport = items.filter(i => selectedIds.includes(i.id));
                                            const csvContent = "data:text/csv;charset=utf-8,"
                                                + ["ID,Название,Артикул,Количество,Ед.изм,Категория,Склад"].join(",") + "\n"
                                                + itemsToExport.map(e => [
                                                    e.id,
                                                    `"${e.name.replace(/"/g, '""')}"`,
                                                    e.sku || "",
                                                    e.quantity,
                                                    e.unit,
                                                    e.category?.name || "",
                                                    storageLocations.find(l => l.id === e.storageLocationId)?.name || ""
                                                ].join(",")).join("\n");
                                            const encodedUri = encodeURI(csvContent);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", encodedUri);
                                            link.setAttribute("download", "inventory_export.csv");
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                                    >
                                        <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                        <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">Скачать</span>
                                    </button>

                                    <button
                                        disabled={isDeleting}
                                        onClick={() => setIdsToDelete(selectedIds)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 transition-colors group"
                                    >
                                        <Trash2 className="w-4 h-4 text-rose-500" />
                                        <span className="text-[10px] font-black text-rose-500 group-hover:text-rose-400 uppercase tracking-widest transition-colors">Удалить</span>
                                    </button>
                                </div>

                                <div className="w-px h-8 bg-slate-700/50 mx-2" />

                                <button onClick={() => setSelectedIds([])} className="p-2 mr-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        {category.id !== "orphaned" && !category.parentId && (
                            <AddCategoryDialog
                                categories={allCategories}
                                parentId={category.id}
                                buttonText="Добавить подкатегорию"
                            />
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
            </div>

            {/* Mass Actions Bar */}

            {/* Modals */}
            {isAddOpen && (
                <AddItemDialogWrapper
                    category={category}
                    storageLocations={storageLocations}
                    measurementUnits={measurementUnits}
                    onClose={() => setIsAddOpen(false)}
                />
            )}

            {duplicatingItem && (
                <AddItemDialogWrapper
                    category={category}
                    storageLocations={storageLocations}
                    measurementUnits={measurementUnits}
                    initialData={duplicatingItem} // Pass the item to copy
                    onClose={() => setDuplicatingItem(null)}
                />
            )}

            {isEditOpen && editingItem && (
                <EditItemDialog
                    item={editingItem}
                    category={category}
                    storageLocations={storageLocations}
                    measurementUnits={measurementUnits}
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

            {/* Remove drawer as we navigate to full page now */}

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

                <div className="flex items-center p-1.5 bg-slate-50 rounded-full border border-slate-200/60 shrink-0 gap-1 shadow-sm shadow-slate-100/50">
                    <div className="relative pl-1">
                        <button
                            onClick={() => setIsStorageOpen(!isStorageOpen)}
                            className="h-10 pl-5 pr-9 rounded-full bg-transparent text-xs font-black text-indigo-600 outline-none transition-colors hover:bg-white hover:shadow-sm flex items-center whitespace-nowrap group"
                        >
                            <span className="group-hover:opacity-80 transition-opacity">
                                {filterStorage === "all" ? "Все склады" : storageLocations.find(l => l.id === filterStorage)?.name}
                            </span>
                            <ChevronDown className={cn(
                                "absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500 stroke-[3] transition-transform",
                                isStorageOpen && "rotate-180"
                            )} />
                        </button>

                        {/* Custom Dropdown Menu */}
                        {isStorageOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsStorageOpen(false)} />
                                <div className="absolute top-full mt-3 left-0 min-w-[200px] bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-400/20 overflow-hidden z-50 flex flex-col p-1.5 animate-in fade-in zoom-in-95 duration-200 border border-slate-700">
                                    <button
                                        onClick={() => { setFilterStorage("all"); setIsStorageOpen(false); }}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                                            filterStorage === "all"
                                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                                : "text-slate-300 hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        <div className={cn("w-4 h-4 rounded-full border border-current flex items-center justify-center", filterStorage === "all" ? "border-white" : "border-slate-500")}>
                                            {filterStorage === "all" && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <span>Все склады</span>
                                    </button>
                                    {storageLocations.map(loc => (
                                        <button
                                            key={loc.id}
                                            onClick={() => { setFilterStorage(loc.id); setIsStorageOpen(false); }}
                                            className={cn(
                                                "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                                                filterStorage === loc.id
                                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            <div className={cn("w-4 h-4 rounded-full border border-current flex items-center justify-center", filterStorage === loc.id ? "border-white" : "border-slate-500")}>
                                                {filterStorage === loc.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <span>{loc.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="w-px h-8 bg-slate-200 mx-2" />

                    <div className="flex items-center gap-1">
                        {[
                            { id: "all", label: "Все", color: "text-indigo-600", activeBg: "shadow-indigo-100" },
                            { id: "in", label: "В наличии", color: "text-emerald-600", activeBg: "shadow-emerald-100" },
                            { id: "low", label: "Заканчиваются", color: "text-amber-600", activeBg: "shadow-amber-100" },
                            { id: "out", label: "Нет в наличии", color: "text-rose-600", activeBg: "shadow-rose-100" }
                        ].map((f) => {
                            const isActive = filterStatus === f.id;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setFilterStatus(f.id as "all" | "in" | "low" | "out")}
                                    className={cn(
                                        "px-6 py-2.5 rounded-full text-[11px] font-black tracking-widest transition-all",
                                        isActive
                                            ? `bg-white ${f.color} shadow-md ${f.activeBg}`
                                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                                    )}
                                >
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Subcategories Grid - Show if this is a parent category */}
            {subCategories.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <h2 className="text-sm font-black text-slate-400 tracking-[0.2em]">Подкатегории</h2>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
                        {subCategories.map((subcat) => {
                            const IconComponent = getCategoryIcon(subcat);
                            const colorStyle = getColorStyles(subcat.color);
                            const subcatItems = items.filter(i => i.categoryId === subcat.id);
                            const hasSubcatCritical = subcatItems.some(i => (i.quantity - (i.reservedQuantity || 0)) <= (i.criticalStockThreshold || 0));
                            const hasSubcatLow = subcatItems.some(i => (i.quantity - (i.reservedQuantity || 0)) <= (i.lowStockThreshold || 10));

                            let statusLabel = "СКЛАД ПОЛОН";
                            let statusStyles = "bg-emerald-50 text-emerald-600 border-emerald-100";
                            let dotStyle = "bg-emerald-500";

                            if (hasSubcatCritical) {
                                statusLabel = "СКЛАД ПУСТОЙ";
                                statusStyles = "bg-rose-50 text-rose-600 border-rose-100";
                                dotStyle = "bg-rose-500 animate-pulse";
                            } else if (hasSubcatLow) {
                                statusLabel = "ЗАКАНЧИВАЕТСЯ";
                                statusStyles = "bg-amber-50 text-amber-600 border-amber-100";
                                dotStyle = "bg-amber-500";
                            }

                            return (
                                <div
                                    key={subcat.id}
                                    onClick={() => router.push(`/dashboard/warehouse/${subcat.id}`)}
                                    className="group bg-white border border-slate-200/60 rounded-3xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 cursor-pointer flex items-center justify-between relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            colorStyle
                                        )}>
                                            {createElement(IconComponent, { className: "w-5 h-5" })}
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {subcat.name}
                                            </h4>
                                            {statusLabel !== "СКЛАД ПОЛОН" && (
                                                <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border mt-1", statusStyles)}>
                                                    <div className={cn("w-1 h-1 rounded-full", dotStyle)} />
                                                    <span className="text-[9px] font-black uppercase tracking-tight">{statusLabel}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCategory(subcat);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                            title="Редактировать"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingCategory(subcat);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                            title="Удалить"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all ml-1" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Items Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-black text-slate-400 tracking-[0.2em]">Позиции</h2>
                        <div className="h-px w-12 bg-slate-200" />
                    </div>

                </div>

                {filteredItems.length > 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-sm shadow-slate-200/50">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="w-16 px-6 py-5">
                                            <div
                                                onClick={(e) => { e.stopPropagation(); toggleSelectAll(); }}
                                                className={cn(
                                                    "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer mx-auto",
                                                    selectedIds.length === filteredItems.length && filteredItems.length > 0
                                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                                        : "bg-white border-slate-200 hover:border-indigo-300"
                                                )}
                                            >
                                                {selectedIds.length === filteredItems.length && filteredItems.length > 0 && <Check className="w-3 h-3 stroke-[4]" />}
                                            </div>
                                        </th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 tracking-[0.2em]">Категория</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 tracking-[0.2em]">Подкатегория</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 tracking-[0.2em]">Товар</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 tracking-[0.2em]">Наличие</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 tracking-[0.2em]">Склад</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 tracking-[0.2em]">Действие</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {currentItems.map((item) => {
                                        const isSelected = selectedIds.includes(item.id);
                                        const available = item.quantity - (item.reservedQuantity || 0);
                                        const isCritical = available <= (item.criticalStockThreshold || 0);
                                        const isLowStock = !isCritical && available <= (item.lowStockThreshold || 10);

                                        // Category hierarchy logic
                                        const itemCat = allCategories.find(c => c.id === item.categoryId);
                                        let catName = "—";
                                        let subCatName = "—";

                                        if (itemCat) {
                                            if (itemCat.parentId) {
                                                const parentCat = allCategories.find(c => c.id === itemCat.parentId);
                                                catName = parentCat?.name || itemCat.name;
                                                subCatName = parentCat ? itemCat.name : "—";
                                            } else {
                                                catName = itemCat.name;
                                            }
                                        }

                                        return (
                                            <tr
                                                key={item.id}
                                                onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                                className={cn(
                                                    "group transition-all cursor-pointer hover:bg-indigo-50/30",
                                                    isSelected && "bg-indigo-50/50"
                                                )}
                                            >
                                                <td className="px-6 py-4">
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSelectItem(item.id);
                                                        }}
                                                        className={cn(
                                                            "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center mx-auto",
                                                            isSelected
                                                                ? "bg-indigo-600 border-indigo-600 text-white"
                                                                : "bg-white border-slate-200 group-hover:border-indigo-300"
                                                        )}
                                                    >
                                                        {isSelected && <Check className="w-3 h-3 stroke-[4]" />}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[13px] font-bold text-slate-600 tracking-tight">
                                                        {catName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[13px] font-medium text-slate-500">
                                                        {subCatName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden shrink-0 relative",
                                                            isCritical ? "bg-rose-50 text-rose-500" : isLowStock ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                                        )}>
                                                            {item.image ? (
                                                                <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                                            ) : (
                                                                <Package className="w-6 h-6" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-[14px] font-black text-slate-900 leading-tight truncate group-hover:text-indigo-600 transition-colors">
                                                                {item.name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                                    Арт.: {item.sku || "N/A"}
                                                                </span>
                                                                {(isLowStock || isCritical) && (
                                                                    <span className={cn(
                                                                        "text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded",
                                                                        isCritical ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                                                                    )}>
                                                                        {isCritical ? "Нет" : "Мало"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-baseline gap-1">
                                                            <span className={cn(
                                                                "text-lg font-black tabular-nums transition-colors",
                                                                isCritical ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-slate-900"
                                                            )}>
                                                                {available}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400">{item.unit}</span>
                                                        </div>
                                                        {(item.reservedQuantity || 0) > 0 && (
                                                            <p className="text-[9px] font-bold text-slate-400 -mt-1">
                                                                {item.quantity} всего / {item.reservedQuantity} бронь
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <MapPin className="w-3 h-3 text-slate-400" />
                                                        <span className="text-sm font-bold">
                                                            {storageLocations.find(l => l.id === item.storageLocationId)?.name || item.location || "—"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                                                            onClick={(e) => { e.stopPropagation(); setAdjustingItem(item); setIsAdjustOpen(true); }}
                                                            title="Корректировка"
                                                        >
                                                            <PlusSquare className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                                                            onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsEditOpen(true); }}
                                                            title="Изменить"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                                                            onClick={(e) => { e.stopPropagation(); setDuplicatingItem(item); }}
                                                            title="Копировать"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                            onClick={(e) => { e.stopPropagation(); setIdsToDelete([item.id]); }}
                                                            title="Удалить"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {filteredItems.length > itemsPerPage && (
                            <div className="px-6 py-4 border-t border-slate-100">
                                <Pagination
                                    totalItems={filteredItems.length}
                                    pageSize={itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                    itemName="позиций"
                                />
                            </div>
                        )}
                    </div>
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
                )
                }
            </div>
            <ConfirmDialog
                isOpen={idsToDelete.length > 0}
                onClose={() => setIdsToDelete([])}
                onConfirm={() => handleDeleteItems(idsToDelete)}
                title="Удаление позиций"
                description={`Вы уверены, что хотите удалить ${idsToDelete.length} поз.? Это действие необратимо.`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={isDeleting}
            />

            <ConfirmDialog
                isOpen={!!deletingCategory}
                onClose={() => setDeletingCategory(null)}
                onConfirm={() => deletingCategory && handleDeleteCategory(deletingCategory.id)}
                title="Удаление подкатегории"
                description={`Вы уверены, что хотите удалить подкатегорию "${deletingCategory?.name}"? Все товары в ней останутся без категории.`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={isDeleting}
            />

            {editingCategory && (
                <EditCategoryDialog
                    category={editingCategory}
                    categories={allCategories}
                    isOpen={!!editingCategory}
                    onClose={() => setEditingCategory(null)}
                />
            )}
        </div>
    );
}

function AddItemDialogWrapper({ category, storageLocations, measurementUnits, onClose, initialData }: { category: Category, storageLocations: StorageLocation[], measurementUnits: { id: string, name: string }[], onClose: () => void, initialData?: InventoryItem }) {
    const { toast } = useToast(); const [error, setError] = useState("");
    const [qualityCode, setQualityCode] = useState(initialData?.qualityCode || "");
    const [attributeCode, setAttributeCode] = useState(initialData?.attributeCode || "");
    const [sizeCode, setSizeCode] = useState(initialData?.sizeCode || "");
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
    const [selectedUnit, setSelectedUnit] = useState(initialData?.unit || "шт");
    const [selectedLocationId, setSelectedLocationId] = useState(initialData?.storageLocationId || "");
    const [attributes, setAttributes] = useState<Record<string, string>>(() => {
        const defaults: Record<string, string> = { "Материал": "" };
        const fromItem: Record<string, string> = {};

        if (initialData?.attributes) {
            Object.entries(initialData.attributes).forEach(([k, v]) => {
                if (k !== "thumbnailSettings" && typeof v !== "object" && v !== null && v !== undefined) {
                    fromItem[k] = String(v);
                }
            });
        }

        return { ...defaults, ...fromItem };
    });

    const [showCustomColor, setShowCustomColor] = useState(false);
    const [customColorHex, setCustomColorHex] = useState("#6366f1");
    const [customColorName, setCustomColorName] = useState("");

    const isClothingCategory = category.name.toLowerCase().includes("одежда");

    const handleAttributeChange = (key: string, value: string) => {
        setAttributes(prev => ({ ...prev, [key]: value }));
    };

    const addCustomAttribute = () => {
        const name = prompt("Название характеристики (например, Плотность):");
        if (name && !attributes[name]) {
            setAttributes(prev => ({ ...prev, [name]: "" }));
        }
    };

    const removeAttribute = (key: string) => {
        setAttributes(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

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

        // Add attributes to form data
        const cleanedAttributes = Object.fromEntries(
            Object.entries(attributes).filter(([, v]) => v.trim() !== "")
        );
        formData.append("attributes", JSON.stringify(cleanedAttributes));

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
            <div className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl border border-white/20 animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="px-10 py-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-white via-white to-slate-50/50">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.2)] rotate-3">
                            <Plus className="w-8 h-8 -rotate-3" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                {initialData ? "Копирование товара" : "Новый товар"}
                            </h2>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">
                                {initialData ? `На основе: ${initialData.name}` : `Добавление в категорию: ${category.name}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form id="add-item-form" action={handleSubmit} className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                    <input type="hidden" name="categoryId" value={category.id} />

                    <div className="grid grid-cols-12 gap-10">
                        {/* COLUMN 1: Basic Info */}
                        <div className="col-span-4 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Название товара</label>
                                    <input
                                        name="name"
                                        defaultValue={initialData ? `${initialData.name} (Копия)` : ""}
                                        required
                                        placeholder="Напр. Футболка Oversize"
                                        className="w-full h-14 px-6 rounded-[20px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white text-lg"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Ед. измерения</label>
                                        <UnitSelect
                                            name="unit"
                                            value={selectedUnit}
                                            onChange={setSelectedUnit}
                                            options={measurementUnits.length > 0 ? measurementUnits : [
                                                { id: "kg", name: "КГ" },
                                                { id: "l", name: "Л" },
                                                { id: "m", name: "М" },
                                                { id: "pogm", name: "ПОГ.М" },
                                                { id: "upak", name: "УПАК" },
                                                { id: "sht", name: "ШТ" },
                                            ]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Крит. порог</label>
                                        <input
                                            type="number"
                                            name="lowStockThreshold"
                                            defaultValue={initialData?.lowStockThreshold || "5"}
                                            className="w-full h-10 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 bg-slate-50/50 hover:bg-white text-center"
                                        />
                                    </div>
                                </div>

                                {isClothingCategory && (
                                    <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Размер</label>
                                            <div className="flex flex-wrap gap-2">
                                                {CLOTHING_SIZES.map(s => (
                                                    <button
                                                        key={s.name}
                                                        type="button"
                                                        onClick={() => {
                                                            setSizeCode(s.code);
                                                            handleAttributeChange("Размер", s.name);
                                                        }}
                                                        className={cn(
                                                            "h-9 px-4 rounded-xl text-xs font-bold transition-all border",
                                                            attributes["Размер"] === s.name ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                        )}
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Качество</label>
                                            <div className="flex gap-2">
                                                {CLOTHING_QUALITIES.map(q => (
                                                    <button
                                                        key={q.name}
                                                        type="button"
                                                        onClick={() => {
                                                            setQualityCode(q.code);
                                                            handleAttributeChange("Качество", q.name);
                                                        }}
                                                        className={cn(
                                                            "flex-1 h-10 rounded-xl text-xs font-bold transition-all border",
                                                            attributes["Качество"] === q.name ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                        )}
                                                    >
                                                        {q.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Цвет</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {CLOTHING_COLORS.map(c => (
                                                    <button
                                                        key={c.name}
                                                        type="button"
                                                        onClick={() => {
                                                            setAttributeCode(c.code);
                                                            handleAttributeChange("Цвет", c.name);
                                                            setShowCustomColor(false);
                                                        }}
                                                        className={cn(
                                                            "flex items-center gap-2 p-2 rounded-xl border transition-all",
                                                            attributes["Цвет"] === c.name ? "bg-white border-indigo-300 ring-2 ring-indigo-500/10" : "bg-white/50 border-slate-100 hover:border-slate-200"
                                                        )}
                                                    >
                                                        <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: c.hex }} />
                                                        <span className="text-[10px] font-bold text-slate-600 truncate">{c.name}</span>
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomColor(true)}
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 p-2 rounded-xl border transition-all border-dashed",
                                                        showCustomColor ? "bg-indigo-50 border-indigo-300 text-indigo-600" : "bg-white/30 border-slate-200 text-slate-400 hover:bg-white hover:border-slate-300"
                                                    )}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold">Свой</span>
                                                </button>
                                            </div>
                                        </div>

                                        {showCustomColor && (
                                            <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Новый цвет</span>
                                                    <button type="button" onClick={() => setShowCustomColor(false)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                                            <input
                                                                type="color"
                                                                className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                                                value={customColorHex}
                                                                onChange={(e) => setCustomColorHex(e.target.value)}
                                                            />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Название цвета..."
                                                            className="flex-1 h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                                                            value={customColorName}
                                                            onChange={(e) => setCustomColorName(e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (customColorName) {
                                                                handleAttributeChange("Цвет", customColorName);
                                                                setAttributeCode(customColorName.substring(0, 3).toUpperCase());
                                                                setShowCustomColor(false);
                                                            }
                                                        }}
                                                        className="w-full h-9 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
                                                    >
                                                        Применить цвет
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Описание (опционально)</label>
                                    <textarea
                                        name="description"
                                        defaultValue={initialData?.description || ""}
                                        placeholder="Укажите детали товара..."
                                        className="w-full min-h-[180px] p-6 rounded-[24px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm placeholder:text-slate-300 resize-none bg-slate-50/50 hover:bg-white leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: SKU & Visuals */}
                        <div className="col-span-4 space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Артикул (Manual / Custom)</label>
                                <input
                                    name="sku"
                                    placeholder="Оставьте пустым для авто-SKU"
                                    className="w-full h-14 px-6 rounded-[20px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white tracking-widest uppercase"
                                    onInput={(e) => {
                                        e.currentTarget.value = sanitizeSku(e.currentTarget.value);
                                    }}
                                />
                            </div>

                            {category.prefix && (
                                <div className="p-8 bg-indigo-50/40 rounded-[2rem] border border-indigo-100 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Конструктор SKU</label>
                                        <span className="text-[9px] font-black text-indigo-300 uppercase bg-white px-2 py-0.5 rounded border border-indigo-100">Префикс: {category.prefix}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Качество</label>
                                            <input
                                                name="qualityCode"
                                                value={qualityCode}
                                                onChange={(e) => setQualityCode(sanitizeSku(e.target.value))}
                                                placeholder="FT"
                                                className="w-full h-11 px-3 rounded-xl border border-indigo-200/50 bg-white text-xs font-black focus:border-indigo-500 outline-none uppercase text-center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Цвет</label>
                                            <input
                                                name="attributeCode"
                                                value={attributeCode}
                                                onChange={(e) => setAttributeCode(sanitizeSku(e.target.value))}
                                                placeholder="BLK"
                                                className="w-full h-11 px-3 rounded-xl border border-indigo-200/50 bg-white text-xs font-black focus:border-indigo-500 outline-none uppercase text-center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Размер</label>
                                            <input
                                                name="sizeCode"
                                                value={sizeCode}
                                                onChange={(e) => setSizeCode(sanitizeSku(e.target.value))}
                                                placeholder="XL"
                                                className="w-full h-11 px-3 rounded-xl border border-indigo-200/50 bg-white text-xs font-black focus:border-indigo-500 outline-none uppercase text-center"
                                            />
                                        </div>
                                    </div>
                                    {skuPreview && (
                                        <div className="pt-4 border-t border-indigo-100 flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">Итоговый артикул</span>
                                            <div className="bg-indigo-600 text-white py-3 px-4 rounded-xl text-center font-mono font-black tracking-widest text-lg shadow-lg shadow-indigo-200 animate-in zoom-in-95">
                                                {skuPreview}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Визуализация</label>
                                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                            {imagePreview ? (
                                                <Image src={imagePreview} alt="Preview" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                            ) : (
                                                <Package className="w-10 h-10 text-slate-200" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <span className="text-[11px] font-black text-slate-600 block leading-tight">Загрузите фото товара</span>
                                            <p className="text-[10px] text-slate-400 font-medium italic">Поддерживаются JPG, PNG до 5MB</p>
                                            <input
                                                type="file"
                                                id="add-item-image"
                                                name="image"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="add-item-image"
                                                className="inline-flex h-10 px-5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-widest items-center cursor-pointer hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                            >
                                                Выбрать файл
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 3: Inventory & Details */}
                        <div className="col-span-4 space-y-8">
                            <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin className="w-3 h-3" /> Размещение и Остаток</label>
                                    <StorageLocationSelect
                                        name="storageLocationId"
                                        value={selectedLocationId}
                                        onChange={setSelectedLocationId}
                                        options={storageLocations}
                                        placeholder="Выберите склад..."
                                    />
                                    <input
                                        name="location"
                                        defaultValue={initialData?.location || ""}
                                        placeholder="Точное место (полка, ряд...)"
                                        className="w-full h-12 px-5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 bg-white"
                                    />
                                    <div className="pt-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Начальное количество</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            defaultValue={initialData?.quantity || "0"}
                                            className="w-full h-14 px-6 rounded-[20px] bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 text-center text-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Доп. Характеристики</label>
                                    <button
                                        type="button"
                                        onClick={addCustomAttribute}
                                        className="h-8 px-3 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3 h-3" /> ДОБАВИТЬ
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                    {Object.entries(attributes).map(([key, value]) => (
                                        <div key={key} className="flex gap-2 items-end animate-in slide-in-from-right-2 duration-300">
                                            <div className="flex-1 space-y-1.5">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">{key}</label>
                                                <input
                                                    value={value}
                                                    onChange={(e) => handleAttributeChange(key, e.target.value)}
                                                    placeholder={`Значение...`}
                                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttribute(key)}
                                                className="mb-1 p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {Object.keys(attributes).length === 0 && (
                                        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                            Нет характеристик
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in shake duration-500">
                            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
                                <X className="w-4 h-4" />
                            </div>
                            <p className="text-rose-600 text-[11px] font-black uppercase tracking-widest leading-tight">{error}</p>
                        </div>
                    )}
                </form>

                <div className="p-10 border-t border-slate-100 flex items-center justify-end shrink-0 bg-slate-50/10 gap-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-14 px-10 rounded-2xl text-slate-500 text-xs font-black tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                    >
                        ОТМЕНА
                    </button>
                    <SubmitButton
                        label={initialData ? "Копировать товар" : "Добавить товар"}
                        pendingLabel={initialData ? "Копирование..." : "Добавление..."}
                    />
                </div>
            </div>
        </div>
    );
}

function EditItemDialog({ item, category, storageLocations, measurementUnits, onClose }: { item: InventoryItem, category: Category, storageLocations: StorageLocation[], measurementUnits: { id: string, name: string }[], onClose: () => void }) {
    const [error, setError] = useState("");
    const [qualityCode, setQualityCode] = useState(item.qualityCode || "");
    const { toast } = useToast(); const [attributeCode, setAttributeCode] = useState(item.attributeCode || "");
    const [sizeCode, setSizeCode] = useState(item.sizeCode || "");
    const [imagePreview, setImagePreview] = useState<string | null>(item.image);
    const [selectedUnit, setSelectedUnit] = useState(item.unit || "шт");
    const [selectedLocationId, setSelectedLocationId] = useState(item.storageLocationId || "");
    const [attributes, setAttributes] = useState<Record<string, string>>(() => {
        const defaults: Record<string, string> = { "Материал": "" };
        const fromItem: Record<string, string> = {};

        if (item.attributes) {
            Object.entries(item.attributes).forEach(([k, v]) => {
                if (k !== "thumbnailSettings" && typeof v !== "object" && v !== null && v !== undefined) {
                    fromItem[k] = String(v);
                }
            });
        }

        return { ...defaults, ...fromItem };
    });

    const [showCustomColor, setShowCustomColor] = useState(false);
    const [customColorHex, setCustomColorHex] = useState("#6366f1");
    const [customColorName, setCustomColorName] = useState("");

    const isClothingCategory = category.name.toLowerCase().includes("одежда");

    const handleAttributeChange = (key: string, value: string) => {
        setAttributes(prev => ({ ...prev, [key]: value }));
    };

    const addCustomAttribute = () => {
        const name = prompt("Название характеристики (например, Плотность):");
        if (name && !attributes[name]) {
            setAttributes(prev => ({ ...prev, [name]: "" }));
        }
    };

    const removeAttribute = (key: string) => {
        setAttributes(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

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

        // Add attributes to form data
        const cleanedAttributes = Object.fromEntries(
            Object.entries(attributes).filter(([, v]) => v.trim() !== "")
        );
        formData.append("attributes", JSON.stringify(cleanedAttributes));

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
            <div className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl border border-white/20 animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="px-10 py-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-white via-white to-slate-50/50">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)] rotate-3">
                            <Edit className="w-8 h-8 -rotate-3" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                Редактирование товара
                            </h2>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">
                                Категория: {category.name} • ID: {item.id.split('-')[0]}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form id="edit-item-form" action={handleSubmit} className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                    <input type="hidden" name="categoryId" value={item.categoryId || ""} />

                    <div className="grid grid-cols-12 gap-10">
                        {/* COLUMN 1: Basic Info */}
                        <div className="col-span-4 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Название товара</label>
                                    <input
                                        name="name"
                                        defaultValue={item.name}
                                        required
                                        placeholder="Напр. Футболка Oversize"
                                        className="w-full h-14 px-6 rounded-[20px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white text-lg"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Ед. измерения</label>
                                        <UnitSelect
                                            name="unit"
                                            value={selectedUnit}
                                            onChange={setSelectedUnit}
                                            options={measurementUnits.length > 0 ? measurementUnits : [
                                                { id: "kg", name: "КГ" },
                                                { id: "l", name: "Л" },
                                                { id: "m", name: "М" },
                                                { id: "pogm", name: "ПОГ.М" },
                                                { id: "upak", name: "УПАК" },
                                                { id: "sht", name: "ШТ" },
                                            ]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Крит. порог</label>
                                        <input
                                            type="number"
                                            name="lowStockThreshold"
                                            defaultValue={item.lowStockThreshold}
                                            className="w-full h-10 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 bg-slate-50/50 hover:bg-white text-center"
                                        />
                                    </div>
                                </div>

                                {isClothingCategory && (
                                    <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Размер</label>
                                            <div className="flex flex-wrap gap-2">
                                                {CLOTHING_SIZES.map(s => (
                                                    <button
                                                        key={s.name}
                                                        type="button"
                                                        onClick={() => {
                                                            setSizeCode(s.code);
                                                            handleAttributeChange("Размер", s.name);
                                                        }}
                                                        className={cn(
                                                            "h-9 px-4 rounded-xl text-xs font-bold transition-all border",
                                                            attributes["Размер"] === s.name ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                        )}
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Качество</label>
                                            <div className="flex gap-2">
                                                {CLOTHING_QUALITIES.map(q => (
                                                    <button
                                                        key={q.name}
                                                        type="button"
                                                        onClick={() => {
                                                            setQualityCode(q.code);
                                                            handleAttributeChange("Качество", q.name);
                                                        }}
                                                        className={cn(
                                                            "flex-1 h-10 rounded-xl text-xs font-bold transition-all border",
                                                            attributes["Качество"] === q.name ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                        )}
                                                    >
                                                        {q.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Цвет</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {CLOTHING_COLORS.map(c => (
                                                    <button
                                                        key={c.name}
                                                        type="button"
                                                        onClick={() => {
                                                            setAttributeCode(c.code);
                                                            handleAttributeChange("Цвет", c.name);
                                                            setShowCustomColor(false);
                                                        }}
                                                        className={cn(
                                                            "flex items-center gap-2 p-2 rounded-xl border transition-all",
                                                            attributes["Цвет"] === c.name ? "bg-white border-indigo-300 ring-2 ring-indigo-500/10" : "bg-white/50 border-slate-100 hover:border-slate-200"
                                                        )}
                                                    >
                                                        <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: c.hex }} />
                                                        <span className="text-[10px] font-bold text-slate-600 truncate">{c.name}</span>
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomColor(true)}
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 p-2 rounded-xl border transition-all border-dashed",
                                                        showCustomColor ? "bg-indigo-50 border-indigo-300 text-indigo-600" : "bg-white/30 border-slate-200 text-slate-400 hover:bg-white hover:border-slate-300"
                                                    )}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold">Свой</span>
                                                </button>
                                            </div>
                                        </div>

                                        {showCustomColor && (
                                            <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Новый цвет</span>
                                                    <button type="button" onClick={() => setShowCustomColor(false)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                                            <input
                                                                type="color"
                                                                className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                                                value={customColorHex}
                                                                onChange={(e) => setCustomColorHex(e.target.value)}
                                                            />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Название цвета..."
                                                            className="flex-1 h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                                                            value={customColorName}
                                                            onChange={(e) => setCustomColorName(e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (customColorName) {
                                                                handleAttributeChange("Цвет", customColorName);
                                                                setAttributeCode(customColorName.substring(0, 3).toUpperCase());
                                                                setShowCustomColor(false);
                                                            }
                                                        }}
                                                        className="w-full h-9 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95"
                                                    >
                                                        Применить цвет
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Описание (опционально)</label>
                                    <textarea
                                        name="description"
                                        defaultValue={item.description || ""}
                                        placeholder="Укажите детали товара..."
                                        className="w-full min-h-[180px] p-6 rounded-[24px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm placeholder:text-slate-300 resize-none bg-slate-50/50 hover:bg-white leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: SKU & Visuals */}
                        <div className="col-span-4 space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Артикул (Manual / Custom)</label>
                                <input
                                    name="sku"
                                    defaultValue={item.sku || ""}
                                    placeholder="Оставьте пустым для авто-SKU"
                                    className="w-full h-14 px-6 rounded-[20px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white tracking-widest uppercase"
                                    onInput={(e) => {
                                        e.currentTarget.value = sanitizeSku(e.currentTarget.value);
                                    }}
                                />
                            </div>

                            {category.prefix && (
                                <div className="p-8 bg-indigo-50/40 rounded-[2rem] border border-indigo-100 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Конструктор SKU</label>
                                        <span className="text-[9px] font-black text-indigo-300 uppercase bg-white px-2 py-0.5 rounded border border-indigo-100">Префикс: {category.prefix}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Качество</label>
                                            <input
                                                name="qualityCode"
                                                value={qualityCode}
                                                onChange={(e) => setQualityCode(sanitizeSku(e.target.value))}
                                                placeholder="FT"
                                                className="w-full h-11 px-3 rounded-xl border border-indigo-200/50 bg-white text-xs font-black focus:border-indigo-500 outline-none uppercase text-center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Цвет</label>
                                            <input
                                                name="attributeCode"
                                                value={attributeCode}
                                                onChange={(e) => setAttributeCode(sanitizeSku(e.target.value))}
                                                placeholder="BLK"
                                                className="w-full h-11 px-3 rounded-xl border border-indigo-200/50 bg-white text-xs font-black focus:border-indigo-500 outline-none uppercase text-center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Размер</label>
                                            <input
                                                name="sizeCode"
                                                value={sizeCode}
                                                onChange={(e) => setSizeCode(sanitizeSku(e.target.value))}
                                                placeholder="XL"
                                                className="w-full h-11 px-3 rounded-xl border border-indigo-200/50 bg-white text-xs font-black focus:border-indigo-500 outline-none uppercase text-center"
                                            />
                                        </div>
                                    </div>
                                    {skuPreview && (
                                        <div className="pt-4 border-t border-indigo-100 flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">Итоговый артикул</span>
                                            <div className="bg-indigo-600 text-white py-3 px-4 rounded-xl text-center font-mono font-black tracking-widest text-lg shadow-lg shadow-indigo-200 animate-in zoom-in-95">
                                                {skuPreview}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Визуализация</label>
                                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                            {imagePreview ? (
                                                <Image src={imagePreview} alt="Preview" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                            ) : (
                                                <Package className="w-10 h-10 text-slate-200" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <span className="text-[11px] font-black text-slate-600 block leading-tight">Изменить фото товара</span>
                                            <p className="text-[10px] text-slate-400 font-medium italic">Поддерживаются JPG, PNG до 5MB</p>
                                            <input
                                                type="file"
                                                id="edit-item-image"
                                                name="image"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="edit-item-image"
                                                className="inline-flex h-10 px-5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-widest items-center cursor-pointer hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                            >
                                                Изменить фото
                                            </label>
                                        </div>
                                    </div>
                                    <input type="hidden" name="currentImage" value={item.image || ""} />
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 3: Inventory & Details */}
                        <div className="col-span-4 space-y-8">
                            <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin className="w-3 h-3" /> Размещение и Остатки</label>
                                    <StorageLocationSelect
                                        name="storageLocationId"
                                        value={selectedLocationId}
                                        onChange={setSelectedLocationId}
                                        options={storageLocations}
                                        placeholder="Выберите склад..."
                                    />
                                    <input
                                        name="location"
                                        defaultValue={item.location || ""}
                                        placeholder="Точное место (полка, ряд...)"
                                        className="w-full h-12 px-5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 bg-white"
                                    />
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Всего</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                defaultValue={item.quantity}
                                                className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 text-center text-lg disabled:opacity-50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Бронь</label>
                                            <input
                                                type="number"
                                                name="reservedQuantity"
                                                defaultValue={item.reservedQuantity || 0}
                                                className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 text-center text-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Доп. Характеристики</label>
                                    <button
                                        type="button"
                                        onClick={addCustomAttribute}
                                        className="h-8 px-3 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3 h-3" /> ДОБАВИТЬ
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                    {Object.entries(attributes).map(([key, value]) => (
                                        <div key={key} className="flex gap-2 items-end animate-in slide-in-from-right-2 duration-300">
                                            <div className="flex-1 space-y-1.5">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">{key}</label>
                                                <input
                                                    value={value}
                                                    onChange={(e) => handleAttributeChange(key, e.target.value)}
                                                    placeholder={`Значение...`}
                                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttribute(key)}
                                                className="mb-1 p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {Object.keys(attributes).length === 0 && (
                                        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                            Нет характеристик
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in shake duration-500">
                            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
                                <X className="w-4 h-4" />
                            </div>
                            <p className="text-rose-600 text-[11px] font-black uppercase tracking-widest leading-tight">{error}</p>
                        </div>
                    )}
                </form>

                <div className="p-10 border-t border-slate-100 flex items-center justify-end shrink-0 bg-slate-50/10 gap-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-14 px-10 rounded-2xl text-slate-500 text-xs font-black tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                    >
                        ОТМЕНА
                    </button>
                    <SubmitButton
                        label="Сохранить изменения"
                        pendingLabel="Сохранение..."
                    />
                </div>
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
        } catch {
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
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Целевой склад</label>
                        <StorageLocationSelect
                            value={targetLocationId}
                            onChange={setTargetLocationId}
                            options={storageLocations}
                            placeholder="Выберите склад..."
                        />
                    </div>


                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Комментарий</label>
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
        } catch {
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
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Новая категория</label>
                        <CategorySelect
                            categories={categories}
                            value={targetCategoryId}
                            onChange={setTargetCategoryId}
                            placeholder="Выберите новую категорию..."
                        />
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
