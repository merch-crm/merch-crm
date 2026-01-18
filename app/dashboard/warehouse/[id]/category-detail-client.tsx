"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Package, ArrowLeft, Check, Plus, Trash2, Edit, X, PlusSquare, Search, SearchX, MapPin, ChevronRight, Copy, Download, ChevronDown, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "../submit-button";
import { deleteInventoryItems, updateInventoryItem, addInventoryItem, bulkMoveInventoryItems, bulkUpdateInventoryCategory, getInventoryCategories, deleteInventoryCategory, getInventoryAttributes, createInventoryAttribute } from "@/app/dashboard/warehouse/actions";
import { EditCategoryDialog } from "../edit-category-dialog";
import { CategorySelect } from "../category-select";
import { AdjustStockDialog } from "../adjust-stock-dialog";
import { Pagination } from "@/components/ui/pagination";
import { StorageLocation } from "../storage-locations-tab";
import { StorageLocationSelect } from "@/components/ui/storage-location-select";
import { useToast } from "@/components/ui/toast";

import { AddCategoryDialog } from "../add-category-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createElement } from "react";
import { getCategoryIcon, getColorStyles, CLOTHING_COLORS, CLOTHING_SIZES, CLOTHING_QUALITIES, CLOTHING_MATERIALS } from "../category-utils";
import { UnitSelect } from "@/components/ui/unit-select";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Session } from "@/lib/auth";
import { type InferSelectModel } from "drizzle-orm";
import { inventoryAttributes } from "@/lib/schema";

type InventoryAttribute = InferSelectModel<typeof inventoryAttributes>;

interface ThumbnailSettings {
    zoom: number;
    x: number;
    y: number;
}


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
    materialCode: string | null;
    brandCode: string | null;
    attributeCode: string | null;
    sizeCode: string | null;
    image: string | null;
    imageBack: string | null;
    imageSide: string | null;
    imageDetails: string[] | null;
    reservedQuantity: number;
    attributes?: Record<string, unknown>;
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
    gender?: 'masculine' | 'feminine' | 'neuter' | string;
    singularName?: string | null;
}

interface CategoryDetailClientProps {
    category: Category;
    parentCategory?: Category;
    subCategories?: Category[];
    items: InventoryItem[];
    storageLocations?: StorageLocation[];
    measurementUnits?: { id: string, name: string }[];
    user: Session | null;
}

export function CategoryDetailClient({
    category,
    parentCategory,
    subCategories = [],
    items,
    storageLocations = [],
    measurementUnits = [],
    user
}: CategoryDetailClientProps) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
    const [duplicatingItem, setDuplicatingItem] = useState<InventoryItem | null>(null); // New state for copy
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

    const [dynamicAttributes, setDynamicAttributes] = useState<InventoryAttribute[]>([]);

    const fetchAttributes = async () => {
        const res = await getInventoryAttributes();
        if (res.data) setDynamicAttributes(res.data);
    };

    useEffect(() => {
        const init = async () => {
            const res = await getInventoryCategories();
            if (res.data) setAllCategories(res.data as Category[]);
            await fetchAttributes();
        };
        init();
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
                                <div className="px-2.5 py-1 rounded-[14px] bg-slate-100 text-slate-500 text-[10px] font-black tracking-wide border border-slate-200/50 self-start mt-1">
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
                                        className="flex items-center gap-2 px-3 py-2 rounded-[14px] hover:bg-white/10 transition-colors group"
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
                                        className="flex items-center gap-2 px-3 py-2 rounded-[14px] hover:bg-white/10 transition-colors group"
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
                                        className="flex items-center gap-2 px-3 py-2 rounded-[14px] hover:bg-white/10 transition-colors group"
                                    >
                                        <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                        <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">Скачать</span>
                                    </button>

                                    <button
                                        disabled={isDeleting}
                                        onClick={() => setIdsToDelete(selectedIds)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-[14px] hover:bg-rose-500/10 transition-colors group"
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
                            onClick={() => router.push(`/dashboard/warehouse/items/new?categoryId=${category.id}`)}
                            className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] px-6 gap-2 font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
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
                    subCategories={subCategories}
                    dynamicAttributes={dynamicAttributes}
                    onRefreshAttributes={fetchAttributes}
                    onClose={() => setIsAddOpen(false)}
                />
            )}

            {duplicatingItem && (
                <AddItemDialogWrapper
                    category={category}
                    storageLocations={storageLocations}
                    measurementUnits={measurementUnits}
                    subCategories={subCategories}
                    dynamicAttributes={dynamicAttributes}
                    onRefreshAttributes={fetchAttributes}
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
                    subCategories={subCategories}
                    dynamicAttributes={dynamicAttributes}
                    onRefreshAttributes={fetchAttributes}
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
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-[14px] border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                    <input
                        type="text"
                        placeholder="Поиск по названию или артикулу..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 rounded-[14px] bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none font-medium text-slate-900 transition-all"
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
                                <div className="absolute top-full mt-3 left-0 min-w-[200px] bg-slate-800/95 backdrop-blur-xl rounded-[14px] shadow-2xl shadow-slate-400/20 overflow-hidden z-50 flex flex-col p-1.5 animate-in fade-in zoom-in-95 duration-200 border border-slate-700">
                                    <button
                                        onClick={() => { setFilterStorage("all"); setIsStorageOpen(false); }}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-[14px] text-xs font-bold transition-all flex items-center gap-3",
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
                                                "w-full text-left px-4 py-3 rounded-[14px] text-xs font-bold transition-all flex items-center gap-3",
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
                                    className="group bg-white border border-slate-200/60 rounded-[14px] p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 cursor-pointer flex items-center justify-between relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-[14px] flex items-center justify-center transition-all",
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
                                            className="w-8 h-8 flex items-center justify-center rounded-[14px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                            title="Редактировать"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingCategory(subcat);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-[14px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
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
                    <div className="bg-white rounded-[14px] border border-slate-200/60 overflow-hidden shadow-sm shadow-slate-200/50">
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
                                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden shrink-0 relative",
                                                            isCritical ? "bg-rose-50 text-rose-500" : isLowStock ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                                        )}>
                                                            {item.image ? (
                                                                <Image
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-cover transition-transform duration-300"
                                                                    unoptimized
                                                                    style={item.attributes?.thumbnailSettings ? {
                                                                        transform: `scale(${(item.attributes.thumbnailSettings as ThumbnailSettings).zoom || 1}) translate(${(item.attributes.thumbnailSettings as ThumbnailSettings).x || 0}%, ${(item.attributes.thumbnailSettings as ThumbnailSettings).y || 0}%)`
                                                                    } : undefined}
                                                                />
                                                            ) : (
                                                                <Package className="w-5 h-5" />
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
                                                            className="w-9 h-9 flex items-center justify-center rounded-[14px] text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                                                            onClick={(e) => { e.stopPropagation(); setAdjustingItem(item); setIsAdjustOpen(true); }}
                                                            title="Корректировка"
                                                        >
                                                            <PlusSquare className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="w-9 h-9 flex items-center justify-center rounded-[14px] text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                                                            onClick={(e) => { e.stopPropagation(); setEditingItem(item); setIsEditOpen(true); }}
                                                            title="Изменить"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="w-9 h-9 flex items-center justify-center rounded-[14px] text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                                                            onClick={(e) => { e.stopPropagation(); setDuplicatingItem(item); }}
                                                            title="Копировать"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="w-9 h-9 flex items-center justify-center rounded-[14px] text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
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
                    user={user}
                    isOpen={!!editingCategory}
                    onClose={() => setEditingCategory(null)}
                />
            )}
        </div>
    );
}

function AddItemDialogWrapper({ category, storageLocations, measurementUnits, subCategories, onClose, initialData, dynamicAttributes, onRefreshAttributes }: { category: Category, storageLocations: StorageLocation[], measurementUnits: { id: string, name: string }[], subCategories?: Category[], onClose: () => void, initialData?: InventoryItem, dynamicAttributes: InventoryAttribute[], onRefreshAttributes: () => void }) {
    const { toast } = useToast();
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const [step, setStep] = useState(1);
    const [validationError, setValidationError] = useState("");

    // Form States
    const [itemName, setItemName] = useState(initialData?.name || "");
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(initialData?.categoryId === category.id ? "" : (initialData?.categoryId || ""));

    // SKU / Attributes
    const [qualityCode, setQualityCode] = useState(initialData?.qualityCode || "");
    const [attributeCode, setAttributeCode] = useState(initialData?.attributeCode || "");
    const [sizeCode, setSizeCode] = useState(initialData?.sizeCode || "");
    const [materialCode, setMaterialCode] = useState(initialData?.materialCode || "");
    const [brandCode, setBrandCode] = useState(initialData?.brandCode || "");

    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
    const [imageBackPreview, setImageBackPreview] = useState<string | null>(initialData?.imageBack || null);
    const [imageSidePreview, setImageSidePreview] = useState<string | null>(initialData?.imageSide || null);
    const [imageDetailsPreviews, setImageDetailsPreviews] = useState<string[]>(initialData?.imageDetails || []);
    const [selectedUnit, setSelectedUnit] = useState(initialData?.unit || "шт");
    const [selectedLocationId, setSelectedLocationId] = useState(initialData?.storageLocationId || "");
    const [thumbSettings, setThumbSettings] = useState<ThumbnailSettings>(() => {
        const defaultSettings = { zoom: 1, x: 0, y: 0 };
        const saved = initialData?.attributes?.thumbnailSettings as ThumbnailSettings | undefined;
        return saved ? { ...defaultSettings, ...saved } : defaultSettings;
    });
    const [showThumbAdjuster, setShowThumbAdjuster] = useState(false);
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

    const isClothingCategory = category.name.toLowerCase().includes("одежда");

    // Disable body scroll when dialog is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Auto-generate Name Effect
    useEffect(() => {
        if (!isClothingCategory && !subCategories?.length) return;

        // Don't overwrite if editing existing item initially, unless user changes something?
        // Actually for "New Item" we want auto-gen. For "Copy" we might want it too if they change params.
        // Let's just generate it if any dependency changes.

        const currentQualities = [...CLOTHING_QUALITIES, ...dynamicAttributes.filter(a => a.type === 'quality').map(a => ({ name: a.name, code: a.value }))];

        const currentBrands = dynamicAttributes.filter(a => a.type === 'brand').map(a => ({ name: a.name, code: a.value }));
        const currentColors = [...CLOTHING_COLORS, ...dynamicAttributes.filter(a => a.type === 'color').map(a => ({ name: a.name, code: a.value, hex: (a.meta as { hex?: string })?.hex || "#CCCCCC" }))];
        const currentSizes = [...CLOTHING_SIZES, ...dynamicAttributes.filter(a => a.type === 'size').map(a => ({ name: a.name, code: a.value }))];

        const subCatName = subCategories?.find(c => c.id === selectedSubcategoryId)?.name || "";
        const qualName = currentQualities.find(q => q.code === qualityCode)?.name || "";

        const brandName = currentBrands.find(b => b.code === brandCode)?.name || "";
        const colName = currentColors.find(c => c.code === attributeCode)?.name || "";
        const szName = currentSizes.find(s => s.code === sizeCode)?.name || "";

        const parts = [brandName, subCatName, qualName, colName, szName].filter(Boolean);
        if (parts.length > 0) {
            const nextName = parts.join(" ");
            if (nextName !== itemName) {
                setTimeout(() => setItemName(nextName), 0);
            }
        }
    }, [selectedSubcategoryId, qualityCode, attributeCode, sizeCode, materialCode, brandCode, isClothingCategory, subCategories, dynamicAttributes, itemName]);

    const [addingAttr, setAddingAttr] = useState<{ type: string, name: string, hex: string } | null>(null);



    const handleSwapImage = (type: 'back' | 'side' | 'detail', index?: number) => {
        const currentMain = imagePreview;
        if (type === 'back') {
            setImagePreview(imageBackPreview);
            setImageBackPreview(currentMain);
        } else if (type === 'side') {
            setImagePreview(imageSidePreview);
            setImageSidePreview(currentMain);
        } else if (type === 'detail' && index !== undefined) {
            const next = [...imageDetailsPreviews];
            setImagePreview(next[index]);
            next[index] = currentMain || "";
            setImageDetailsPreviews(next);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'back' | 'side' | 'detail', index?: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (type === 'main') setImagePreview(result);
                else if (type === 'back') setImageBackPreview(result);
                else if (type === 'side') setImageSidePreview(result);
                else if (type === 'detail' && index !== undefined) {
                    setImageDetailsPreviews(prev => {
                        const next = [...prev];
                        next[index] = result;
                        return next;
                    });
                } else if (type === 'detail') {
                    setImageDetailsPreviews(prev => [...prev, result]);
                }
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

    async function handleSubmit(formData: FormData) {
        const skuValue = formData.get("sku") as string;
        if (skuValue && /[^a-zA-Z0-9-]/.test(skuValue)) {
            setValidationError("Артикул может содержать только латиницу, цифры и «-»");
            return;
        }

        // Ensure categoryId is set to subcategory if selected
        if (selectedSubcategoryId) {
            formData.set("categoryId", selectedSubcategoryId);
        }

        // Add constructor codes
        formData.set("qualityCode", qualityCode);
        formData.set("materialCode", materialCode);
        formData.set("brandCode", brandCode);
        formData.set("attributeCode", attributeCode);
        formData.set("sizeCode", sizeCode);

        // Add attributes to form data
        const cleanedAttributes: Record<string, unknown> = Object.fromEntries(
            Object.entries(attributes).filter(([, v]) => v.trim() !== "")
        );
        cleanedAttributes.thumbnailSettings = thumbSettings;
        formData.append("attributes", JSON.stringify(cleanedAttributes));

        // Ensure name is passed (it might be controlled state now)
        formData.set("name", itemName);

        // Add images from state (important for swapped images)
        if (imagePreview) formData.set("image", imagePreview);
        if (imageBackPreview) formData.set("imageBack", imageBackPreview);
        if (imageSidePreview) formData.set("imageSide", imageSidePreview);
        if (imageDetailsPreviews.length > 0) {
            formData.delete("imageDetails");
            imageDetailsPreviews.forEach(img => {
                if (img) formData.append("imageDetails", img);
            });
        }

        const res = await addInventoryItem(formData);
        if (res?.error) {
            setValidationError(res.error);
        } else {
            onClose();
        }
    }

    const nextStep = () => {
        if (step === 1) {
            if (isClothingCategory) {
                if (subCategories && subCategories.length > 0 && !selectedSubcategoryId) {
                    setValidationError("Выберите подкатегорию");
                    return;
                }
                if (!brandCode) {
                    setValidationError("Выберите бренд");
                    return;
                }
                if (!qualityCode) {
                    setValidationError("Выберите качество");
                    return;
                }
                if (!materialCode) {
                    setValidationError("Выберите материал");
                    return;
                }
                if (!attributeCode) {
                    setValidationError("Выберите цвет");
                    return;
                }
                if (!sizeCode) {
                    setValidationError("Выберите размер");
                    return;
                }
            } else {
                if (!itemName.trim()) {
                    setValidationError("Название товара должно быть заполнено");
                    return;
                }
            }
        }
        setValidationError("");
        setStep(s => Math.min(s + 1, 3));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-white rounded-[14px] shadow-2xl border border-white/20 animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-white via-white to-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-[18px] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                {initialData ? "Копирование товара" : "Новый товар"}
                            </h2>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                                {category.name} <span className="w-1 h-1 rounded-full bg-slate-300" /> Шаг {step} из 3
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[14px] bg-slate-50 border border-slate-100 hover:bg-white transition-all active:scale-95"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Step Progress Bar - New Segmented Design */}
                <div className="px-6 pb-2 shrink-0">
                    <div className="flex gap-1.5 h-1 relative">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={cn(
                                    "flex-1 rounded-full transition-all duration-700 ease-out relative overflow-hidden",
                                    step >= s ? "bg-indigo-600 shadow-sm shadow-indigo-100" : "bg-slate-100"
                                )}
                            >
                                {step === s && (
                                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        <div className={cn("text-[7px] font-black uppercase tracking-[0.15em] transition-colors", step >= 1 ? "text-indigo-600" : "text-slate-300")}>ОСНОВНОЕ</div>
                        <div className={cn("text-[7px] font-black uppercase tracking-[0.15em] transition-colors", step >= 2 ? "text-indigo-600" : "text-slate-300")}>ФОТО</div>
                        <div className={cn("text-[7px] font-black uppercase tracking-[0.15em] transition-colors", step >= 3 ? "text-indigo-600" : "text-slate-300")}>СКЛАД</div>
                    </div>
                </div>

                <form id="add-item-form" action={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <input type="hidden" name="categoryId" value={category.id} />

                    <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                        {/* STEP 1: Basic Info & Constructor */}
                        <div className={cn("animate-in fade-in slide-in-from-right-4 duration-300", step === 1 ? "block" : "hidden")}>
                            <div className={cn(isClothingCategory ? "grid grid-cols-1 md:grid-cols-12 gap-6" : "max-w-2xl mx-auto space-y-6")}>
                                <div className={isClothingCategory ? "md:col-span-4 space-y-6" : "space-y-6"}>
                                    {!isClothingCategory && (
                                        <div className="space-y-4 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Название товара</label>
                                                <input name="name" value={itemName} onChange={(e) => setItemName(e.target.value)} required placeholder="Введите название..." className="w-full h-10 px-4 rounded-[14px] border border-slate-200 outline-none text-sm font-bold text-slate-900 bg-white focus:border-indigo-500 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Артикул (SKU)</label>
                                                    <input name="sku" placeholder="Авто" className="w-full h-10 px-4 rounded-[14px] border border-slate-200 outline-none font-mono font-bold text-xs uppercase" onInput={e => e.currentTarget.value = sanitizeSku(e.currentTarget.value)} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ед. изм.</label>
                                                    <UnitSelect name="unit" value={selectedUnit} onChange={setSelectedUnit} options={measurementUnits.length > 0 ? measurementUnits : [{ id: "sht", name: "ШТ" }, { id: "kg", name: "КГ" }]} />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Описание</label>
                                                <textarea name="description" placeholder="Детали товара..." className="w-full h-24 p-4 rounded-[14px] border border-slate-200 outline-none text-sm resize-none bg-white focus:border-indigo-500 transition-all" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Subcategory Selection */}
                                    {subCategories && subCategories.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Подкатегория</label>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {subCategories.map(sub => (
                                                    <button
                                                        key={sub.id}
                                                        type="button"
                                                        onClick={() => setSelectedSubcategoryId(cur => cur === sub.id ? "" : sub.id)}
                                                        className={cn(
                                                            "w-full h-9 rounded-[14px] text-[10px] font-bold transition-all border truncate",
                                                            selectedSubcategoryId === sub.id
                                                                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                                                : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                                                        )}
                                                    >
                                                        {sub.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isClothingCategory && (
                                        <>
                                            {/* Brand Selection */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Бренд</label>
                                                    <button type="button" onClick={() => setAddingAttr({ type: 'brand', name: '', hex: '' })} className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5">
                                                        <Plus className="w-2.5 h-2.5" /> Добавить
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {dynamicAttributes.filter(a => a.type === 'brand').map(b => (
                                                        <button
                                                            key={b.value}
                                                            type="button"
                                                            onClick={() => setBrandCode(cur => cur === b.value ? "" : b.value)}
                                                            className={cn(
                                                                "w-full h-9 rounded-[14px] text-[10px] font-bold transition-all border uppercase truncate",
                                                                brandCode === b.value
                                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                                    : "bg-white text-slate-500 border-slate-100 hover:border-indigo-300"
                                                            )}
                                                        >
                                                            {b.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Quality Selection */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Качество</label>
                                                    <button type="button" onClick={() => setAddingAttr({ type: 'quality', name: '', hex: '' })} className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5">
                                                        <Plus className="w-2.5 h-2.5" /> Добавить
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {[...CLOTHING_QUALITIES, ...dynamicAttributes.filter(a => a.type === 'quality').map(a => ({ name: a.name, code: a.value }))].map(q => (
                                                        <button
                                                            key={q.code}
                                                            type="button"
                                                            onClick={() => setQualityCode(cur => cur === q.code ? "" : q.code)}
                                                            className={cn(
                                                                "w-full h-9 rounded-[14px] text-[10px] font-bold transition-all border uppercase truncate",
                                                                qualityCode === q.code
                                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                                    : "bg-white text-slate-500 border-slate-100 hover:border-indigo-300"
                                                            )}
                                                        >
                                                            {q.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Material Selection */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Материал</label>
                                                    <button type="button" onClick={() => setAddingAttr({ type: 'material', name: '', hex: '' })} className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5">
                                                        <Plus className="w-2.5 h-2.5" /> Добавить
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {[...CLOTHING_MATERIALS, ...dynamicAttributes.filter(a => a.type === 'material').map(a => ({ name: a.name, code: a.value }))].map(m => (
                                                        <button
                                                            key={m.code}
                                                            type="button"
                                                            onClick={() => setMaterialCode(cur => cur === m.code ? "" : m.code)}
                                                            className={cn(
                                                                "w-full h-9 rounded-[14px] text-[10px] font-bold transition-all border uppercase truncate",
                                                                materialCode === m.code
                                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                                    : "bg-white text-slate-500 border-slate-100 hover:border-indigo-300"
                                                            )}
                                                        >
                                                            {m.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {isClothingCategory && (
                                    <div className="md:col-span-8 flex flex-col gap-6">
                                        <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6 flex-1">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Цвет</label>
                                                    <button type="button" onClick={() => setAddingAttr({ type: 'color', name: '', hex: '#6366f1' })} className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5">
                                                        <Plus className="w-2.5 h-2.5" /> Добавить
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[...CLOTHING_COLORS, ...dynamicAttributes.filter(a => a.type === 'color').map(a => ({ name: a.name, code: a.value, hex: (a.meta as { hex?: string })?.hex || "#CCCCCC" }))].map(c => (
                                                        <button
                                                            key={c.code}
                                                            type="button"
                                                            onClick={() => setAttributeCode(c.code)}
                                                            className={cn(
                                                                "flex items-center gap-2 p-1.5 rounded-[14px] border transition-all truncate",
                                                                attributeCode === c.code
                                                                    ? "bg-white border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm"
                                                                    : "bg-white border-slate-100 hover:border-slate-200"
                                                            )}
                                                        >
                                                            <div className="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: c.hex }} />
                                                            <span className="text-[9px] font-bold text-slate-600 truncate">{c.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Размер</label>
                                                    <button type="button" onClick={() => setAddingAttr({ type: 'size', name: '', hex: '' })} className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5">
                                                        <Plus className="w-2.5 h-2.5" /> Добавить
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                                                    {[...CLOTHING_SIZES, ...dynamicAttributes.filter(a => a.type === 'size').map(a => ({ name: a.name, code: a.value }))].map(s => (
                                                        <button
                                                            key={s.code}
                                                            type="button"
                                                            onClick={() => setSizeCode(s.code)}
                                                            className={cn(
                                                                "h-8 rounded-[14px] text-[10px] font-bold transition-all border flex items-center justify-center truncate",
                                                                sizeCode === s.code
                                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                                                    : "bg-white text-slate-500 border-slate-100"
                                                            )}
                                                        >
                                                            {s.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-indigo-600/5 p-5 rounded-[2rem] border border-indigo-100/50">
                                            <div className="flex items-center justify-between mb-2 px-1">
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Превью названия</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                            </div>
                                            <div className="text-sm font-black text-slate-900 tracking-tight">{itemName || "Укажите характеристики..."}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* STEP 2: Media */}
                        <div className={cn("animate-in fade-in slide-in-from-right-4 duration-300", step === 2 ? "block" : "hidden")}>
                            <div className="grid grid-cols-12 gap-6">
                                {/* Left: Main Photo */}
                                <div className="col-span-12 md:col-span-6 space-y-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Основное фото</label>
                                        <span className="text-[9px] text-slate-300 font-medium italic">Лицевая сторона</span>
                                    </div>
                                    <div className="aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer">
                                        {imagePreview ? (
                                            <>
                                                <div className="absolute inset-0 w-full h-full">
                                                    <Image
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover transition-transform duration-300"
                                                        unoptimized
                                                        style={{
                                                            transform: `scale(${thumbSettings.zoom}) translate(${thumbSettings.x}%, ${thumbSettings.y}%)`
                                                        }}
                                                    />
                                                </div>
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setShowThumbAdjuster(!showThumbAdjuster); }}
                                                        className="h-10 px-6 rounded-[14px] bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 border border-white/20 transition-all shadow-xl"
                                                    >
                                                        {showThumbAdjuster ? "Закрыть" : "Миниатюра"}
                                                    </button>
                                                </div>

                                                {showThumbAdjuster && (
                                                    <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={e => e.stopPropagation()}>
                                                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                                                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                                                <div>
                                                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] leading-none mb-1">Настройка миниатюры</h4>
                                                                    <p className="text-[9px] text-slate-400 font-medium">Как товар будет отображаться в списке</p>
                                                                </div>
                                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 relative shrink-0 shadow-sm">
                                                                    <Image src={imagePreview as string} alt="Preview" fill className="object-cover" unoptimized style={{ transform: `scale(${thumbSettings.zoom}) translate(${thumbSettings.x}%, ${thumbSettings.y}%)` }} />
                                                                </div>
                                                            </div>

                                                            {/* Full Image Preview */}
                                                            <div className="relative w-full aspect-square rounded-[14px] overflow-hidden border-2 border-slate-100 bg-slate-50">
                                                                <Image
                                                                    src={imagePreview as string}
                                                                    alt="Full Preview"
                                                                    fill
                                                                    className="object-contain"
                                                                    unoptimized
                                                                />
                                                                {/* Crop Preview Overlay */}
                                                                <div className="absolute inset-0 pointer-events-none">
                                                                    <div
                                                                        className="absolute border-2 border-indigo-500 shadow-lg"
                                                                        style={{
                                                                            width: `${100 / thumbSettings.zoom}%`,
                                                                            height: `${100 / thumbSettings.zoom}%`,
                                                                            left: `${50 - thumbSettings.x / thumbSettings.zoom}%`,
                                                                            top: `${50 - thumbSettings.y / thumbSettings.zoom}%`,
                                                                            transform: 'translate(-50%, -50%)'
                                                                        }}
                                                                    >
                                                                        <div className="absolute inset-0 bg-indigo-500/10" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between items-center px-1">
                                                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Масштаб</span>
                                                                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-[14px]">{Math.round(thumbSettings.zoom * 100)}%</span>
                                                                    </div>
                                                                    <input
                                                                        type="range"
                                                                        min="1"
                                                                        max="3"
                                                                        step="0.05"
                                                                        value={thumbSettings.zoom}
                                                                        onChange={e => {
                                                                            const newZoom = parseFloat(e.target.value);
                                                                            const maxOffset = ((newZoom - 1) / newZoom) * 50;
                                                                            setThumbSettings((prev) => ({
                                                                                ...prev,
                                                                                zoom: newZoom,
                                                                                x: Math.max(-maxOffset, Math.min(maxOffset, prev.x)),
                                                                                y: Math.max(-maxOffset, Math.min(maxOffset, prev.y))
                                                                            }));
                                                                        }}
                                                                        className="w-full accent-indigo-600 h-2"
                                                                    />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between items-center px-1">
                                                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Ось X</span>
                                                                            <span className="text-[9px] font-mono font-bold text-slate-400">{thumbSettings.x.toFixed(0)}</span>
                                                                        </div>
                                                                        <input
                                                                            type="range"
                                                                            min={-((thumbSettings.zoom - 1) / thumbSettings.zoom) * 50}
                                                                            max={((thumbSettings.zoom - 1) / thumbSettings.zoom) * 50}
                                                                            step="0.5"
                                                                            value={thumbSettings.x}
                                                                            onChange={e => setThumbSettings((prev) => ({ ...prev, x: parseFloat(e.target.value) }))}
                                                                            className="w-full accent-indigo-600 h-2"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between items-center px-1">
                                                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Ось Y</span>
                                                                            <span className="text-[9px] font-mono font-bold text-slate-400">{thumbSettings.y.toFixed(0)}</span>
                                                                        </div>
                                                                        <input
                                                                            type="range"
                                                                            min={-((thumbSettings.zoom - 1) / thumbSettings.zoom) * 50}
                                                                            max={((thumbSettings.zoom - 1) / thumbSettings.zoom) * 50}
                                                                            step="0.5"
                                                                            value={thumbSettings.y}
                                                                            onChange={e => setThumbSettings((prev) => ({ ...prev, y: parseFloat(e.target.value) }))}
                                                                            className="w-full accent-indigo-600 h-2"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3 pt-2">
                                                                <button type="button" onClick={() => setThumbSettings({ zoom: 1, x: 0, y: 0 })} className="flex-1 h-10 rounded-[14px] border-2 border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Сброс</button>
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); setShowThumbAdjuster(false); }} className="flex-[2] h-10 bg-slate-900 text-white rounded-[14px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Готово</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                <div className="w-12 h-12 rounded-[14px] bg-white flex items-center justify-center shadow-lg shadow-slate-200/50">
                                                    <Download className="w-6 h-6" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Загрузить фото</span>
                                            </div>
                                        )}
                                        <input type="file" name="image" accept="image/*" onChange={(e) => handleImageChange(e, 'main')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    <div className="p-3 bg-indigo-50/30 rounded-[14px] border border-indigo-100/50">
                                        <p className="text-center text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Квадрат • JPG, PNG до 5MB</p>
                                    </div>
                                </div>

                                {/* Right: Other Perspectives */}
                                <div className="col-span-12 md:col-span-6 space-y-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Другие ракурсы</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Back */}
                                        <div className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
                                            {imageBackPreview ? (
                                                <>
                                                    <Image src={imageBackPreview} alt="Back" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleSwapImage('back'); }} className="w-full py-1.5 rounded-[14px] bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 border border-white/30 transition-all">Главное</button>
                                                        <span className="text-white text-[8px] font-black uppercase tracking-widest pointer-events-none opacity-60">Сменить</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                                    <PlusSquare className="w-4 h-4" />
                                                    <span className="text-[8px] font-black uppercase tracking-tight">Сзади</span>
                                                </div>
                                            )}
                                            <input type="file" name="imageBack" accept="image/*" onChange={(e) => handleImageChange(e, 'back')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>

                                        {/* Side */}
                                        <div className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
                                            {imageSidePreview ? (
                                                <>
                                                    <Image src={imageSidePreview} alt="Side" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleSwapImage('side'); }} className="w-full py-1.5 rounded-[14px] bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 border border-white/30 transition-all">Главное</button>
                                                        <span className="text-white text-[8px] font-black uppercase tracking-widest pointer-events-none opacity-60">Сменить</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                                    <PlusSquare className="w-4 h-4" />
                                                    <span className="text-[8px] font-black uppercase tracking-tight">Сбоку</span>
                                                </div>
                                            )}
                                            <input type="file" name="imageSide" accept="image/*" onChange={(e) => handleImageChange(e, 'side')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>

                                        {/* Detail 1 */}
                                        <div className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
                                            {imageDetailsPreviews[0] ? (
                                                <>
                                                    <Image src={imageDetailsPreviews[0]} alt="Detail 1" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleSwapImage('detail', 0); }} className="w-full py-1.5 rounded-[14px] bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 border border-white/30 transition-all">Главное</button>
                                                        <span className="text-white text-[8px] font-black uppercase tracking-widest pointer-events-none opacity-60">Сменить</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                                    <PlusSquare className="w-4 h-4" />
                                                    <span className="text-[8px] font-black uppercase tracking-tight">Детали</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'detail', 0)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>

                                        {/* Detail 2 */}
                                        <div className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
                                            {imageDetailsPreviews[1] ? (
                                                <>
                                                    <Image src={imageDetailsPreviews[1]} alt="Detail 2" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleSwapImage('detail', 1); }} className="w-full py-1.5 rounded-[14px] bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 border border-white/30 transition-all">Главное</button>
                                                        <span className="text-white text-[8px] font-black uppercase tracking-widest pointer-events-none opacity-60">Сменить</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                                    <PlusSquare className="w-4 h-4" />
                                                    <span className="text-[8px] font-black uppercase tracking-tight">Детали</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'detail', 1)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STEP 3: Stock & Save */}
                        <div className={cn("space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col", step === 3 ? "block" : "hidden")}>
                            <div className="grid grid-cols-12 gap-5">
                                <div className="col-span-12 md:col-span-7 space-y-4">
                                    <div className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-4 h-4 text-indigo-600" />
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Размещение</span>
                                        </div>
                                        <StorageLocationSelect name="storageLocationId" value={selectedLocationId} onChange={setSelectedLocationId} options={storageLocations} placeholder="Выберите склад..." />
                                    </div>

                                    {isClothingCategory && (
                                        <div className="space-y-4 p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Название товара</label>
                                                <input name="name" value={itemName} onChange={(e) => setItemName(e.target.value)} required placeholder="Направление..." className="w-full h-10 px-4 rounded-[14px] border border-slate-200 outline-none text-sm font-bold text-slate-900 focus:border-indigo-500 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Артикул (SKU)</label>
                                                    <input name="sku" placeholder="Авто" className="w-full h-10 px-4 rounded-[14px] border border-slate-200 outline-none font-mono font-bold text-xs uppercase" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Описание</label>
                                                    <input name="description" defaultValue={initialData?.description || ""} placeholder="Опционально" className="w-full h-10 px-4 rounded-[14px] border border-slate-200 outline-none text-xs" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-12 md:col-span-5 space-y-4">
                                    <div className="p-5 bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50 space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1 text-center block">Начальный остаток</label>
                                            <input type="number" name="quantity" defaultValue={initialData?.quantity || "0"} className="w-full h-14 rounded-[14px] bg-white border-2 border-emerald-100 outline-none text-center text-2xl font-black text-emerald-600 focus:border-emerald-500 transition-all" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1 text-center block">Крит. порог</label>
                                            <input type="number" name="lowStockThreshold" defaultValue={initialData?.lowStockThreshold || "5"} className="w-full h-10 rounded-[14px] bg-white border-2 border-rose-100 outline-none text-center text-lg font-black text-rose-600 focus:border-rose-500 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {validationError && (
                                <div className="mt-auto p-3 bg-rose-50 border border-rose-100 rounded-[14px] flex items-center gap-2">
                                    <X className="w-4 h-4 text-rose-500" />
                                    <p className="text-rose-600 text-xs font-bold">{validationError}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between gap-3 mt-auto shrink-0">
                        <button
                            type="button"
                            onClick={step === 1 ? onClose : prevStep}
                            className="h-9 px-4 rounded-[14px] text-slate-500 font-bold hover:bg-slate-50 transition-colors text-xs uppercase tracking-wider"
                        >
                            {step === 1 ? "Отмена" : "Назад"}
                        </button>

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="h-9 px-5 rounded-[14px] bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-95 text-xs uppercase tracking-wider shadow-lg shadow-slate-200 flex items-center gap-1.5"
                            >
                                Далее <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <SubmitButton
                                label={initialData ? "Сохранить изменения" : "Создать товар"}
                                pendingLabel="Сохранение..."
                                className="w-auto px-5 h-9 text-xs uppercase tracking-wider"
                                form="add-item-form"
                            />
                        )}
                    </div>
                </form>
            </div>
        </div >
    );
}

function EditItemDialog({ item, category, storageLocations, measurementUnits, onClose, dynamicAttributes, onRefreshAttributes, subCategories }: { item: InventoryItem, category: Category, storageLocations: StorageLocation[], measurementUnits: { id: string, name: string }[], onClose: () => void, dynamicAttributes: InventoryAttribute[], onRefreshAttributes: () => void, subCategories: Category[] }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const { toast } = useToast();
    const [error, setError] = useState("");
    const [qualityCode, setQualityCode] = useState(item.qualityCode || "");
    const [materialCode, setMaterialCode] = useState(item.materialCode || "");
    const [brandCode, setBrandCode] = useState(item.brandCode || "");
    const [attributeCode, setAttributeCode] = useState(item.attributeCode || "");
    const [sizeCode, setSizeCode] = useState(item.sizeCode || "");
    const [itemName, setItemName] = useState(item.name || "");
    const [imagePreview, setImagePreview] = useState<string | null>(item.image);
    const [imageBackPreview, setImageBackPreview] = useState<string | null>(item.imageBack || null);
    const [imageSidePreview, setImageSidePreview] = useState<string | null>(item.imageSide || null);
    const [imageDetailsPreviews, setImageDetailsPreviews] = useState<string[]>(item.imageDetails || []);
    const [selectedUnit, setSelectedUnit] = useState(item.unit || "шт");
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(item.categoryId || "");
    const [selectedLocationId, setSelectedLocationId] = useState(item.storageLocationId || "");
    const [thumbSettings, setThumbSettings] = useState<ThumbnailSettings>(() => {
        const defaultSettings = { zoom: 1, x: 0, y: 0 };
        const saved = item.attributes?.thumbnailSettings as ThumbnailSettings | undefined;
        return saved ? { ...defaultSettings, ...saved } : defaultSettings;
    });
    const [showThumbAdjuster, setShowThumbAdjuster] = useState(false);
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

    const isClothingCategory = category.name.toLowerCase().includes("одежда");

    // Auto-generate Name Effect
    useEffect(() => {
        if (!isClothingCategory) return;


        // Determine target gender from active category
        const activeCat = subCategories?.find(c => c.id === selectedSubcategoryId) || category;
        const targetGender = activeCat?.gender || "masculine";
        const baseName = activeCat?.singularName || activeCat?.name || "";

        // Helper to get attribute name with gender consideration
        const getAttrValue = (typeSlug: string, code: string | null) => {
            if (!code) return null;

            // For system types, we might have predefined lists, but we also check dynamicAttributes
            const attr = dynamicAttributes.find(a => a.type === typeSlug && a.value === code);

            if (attr) {
                // Check visibility
                if ((attr.meta as { showInName?: boolean })?.showInName === false) return null;

                const meta = attr.meta as { fem?: string; neut?: string } | null;
                if (targetGender === "feminine" && meta?.fem) return meta.fem;
                if (targetGender === "neuter" && meta?.neut) return meta.neut;
                return attr.name;
            }

            return code;
        };

        const qualName = getAttrValue("quality", qualityCode);
        const brandName = getAttrValue("brand", brandCode);
        const colName = getAttrValue("color", attributeCode);
        const szName = getAttrValue("size", sizeCode);
        const matName = getAttrValue("material", materialCode);

        const parts = [brandName, baseName, matName, qualName, colName, szName].filter(Boolean);
        if (parts.length > 0) {
            const nextName = parts.join(" ");
            if (nextName !== itemName) {
                setTimeout(() => setItemName(nextName), 0);
            }
        }
    }, [qualityCode, attributeCode, sizeCode, materialCode, brandCode, isClothingCategory, subCategories, dynamicAttributes, selectedSubcategoryId, itemName, category]);

    const handleAttributeChange = (key: string, value: string) => {
        setAttributes(prev => ({ ...prev, [key]: value }));
    };


    const handleSwapImage = (type: 'back' | 'side' | 'detail', index?: number) => {
        const currentMain = imagePreview;
        if (type === 'back') {
            setImagePreview(imageBackPreview);
            setImageBackPreview(currentMain);
        } else if (type === 'side') {
            setImagePreview(imageSidePreview);
            setImageSidePreview(currentMain);
        } else if (type === 'detail' && index !== undefined) {
            const next = [...imageDetailsPreviews];
            setImagePreview(next[index]);
            next[index] = currentMain || "";
            setImageDetailsPreviews(next);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'back' | 'side' | 'detail', index?: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (type === 'main') setImagePreview(result);
                else if (type === 'back') setImageBackPreview(result);
                else if (type === 'side') setImageSidePreview(result);
                else if (type === 'detail' && index !== undefined) {
                    setImageDetailsPreviews(prev => {
                        const next = [...prev];
                        next[index] = result;
                        return next;
                    });
                } else if (type === 'detail') {
                    setImageDetailsPreviews(prev => [...prev, result]);
                }
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
        ? [category.prefix, brandCode, qualityCode, materialCode, attributeCode, sizeCode].filter(Boolean).join("-")
        : "";

    const [addingAttr, setAddingAttr] = useState<{ type: string, name: string, hex: string } | null>(null);

    const handleAddDynamicAttribute = async () => {
        if (!addingAttr || !addingAttr.name) return;

        const { type, name, hex } = addingAttr;
        let meta = {};
        if (type === 'color') {
            meta = { hex: hex || "#CCCCCC" };
        }

        const code = name.replace(/\s+/g, '').substring(0, 5).toUpperCase();
        const res = await createInventoryAttribute(type, name, code, meta);
        if (res.success) {
            toast("Характеристика добавлена", "success");
            onRefreshAttributes();
            setAddingAttr(null);
        } else {
            toast(res.error || "Не удалось добавить характеристику", "error");
        }
    };

    async function handleSubmit(formData: FormData) {
        if (isClothingCategory) {
            if (subCategories && subCategories.length > 0 && !selectedSubcategoryId) {
                setError("Выберите подкатегорию");
                return;
            }
            if (!brandCode) {
                setError("Выберите бренд");
                return;
            }
            if (!qualityCode) {
                setError("Выберите качество");
                return;
            }
            if (!materialCode) {
                setError("Выберите материал");
                return;
            }
            if (!attributeCode) {
                setError("Выберите цвет");
                return;
            }
            if (!sizeCode) {
                setError("Выберите размер");
                return;
            }
        }

        const skuValue = formData.get("sku") as string;
        if (skuValue && /[^a-zA-Z0-9-]/.test(skuValue)) {
            setError("Артикул может содержать только латиницу, цифры и «-»");
            return;
        }

        // Ensure categoryId is set to subcategory if selected, else keep parent
        if (selectedSubcategoryId) {
            formData.set("categoryId", selectedSubcategoryId);
        } else {
            formData.set("categoryId", category.id);
        }

        // Add constructor codes
        formData.set("qualityCode", qualityCode);
        formData.set("materialCode", materialCode);
        formData.set("brandCode", brandCode);
        formData.set("attributeCode", attributeCode);
        formData.set("sizeCode", sizeCode);

        // Add attributes to form data
        const cleanedAttributes: Record<string, unknown> = Object.fromEntries(
            Object.entries(attributes).filter(([, v]) => v.trim() !== "")
        );
        cleanedAttributes.thumbnailSettings = thumbSettings;
        formData.append("attributes", JSON.stringify(cleanedAttributes));

        // Add images from state (important for swapped images)
        if (imagePreview) formData.set("image", imagePreview);
        if (imageBackPreview) formData.set("imageBack", imageBackPreview);
        if (imageSidePreview) formData.set("imageSide", imageSidePreview);
        if (imageDetailsPreviews.length > 0) {
            formData.delete("imageDetails");
            imageDetailsPreviews.forEach(img => {
                if (img) formData.append("imageDetails", img);
            });
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
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-white via-white to-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] bg-indigo-600 flex items-center justify-center text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] rotate-3">
                            <Edit className="w-5 h-5 -rotate-3" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-0.5">
                                Редактирование товара
                            </h2>
                            <p className="text-[8px] text-slate-400 uppercase font-black tracking-[0.2em]">
                                Категория: {category.name} • ID: {item.id.split('-')[0]}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[14px] bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all active:scale-95"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form id="edit-item-form" action={handleSubmit} className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <input type="hidden" name="categoryId" value={selectedSubcategoryId || category.id} />

                    <div className="grid grid-cols-12 gap-6">
                        {/* COLUMN 1: Basic Info */}
                        <div className="col-span-4 space-y-5">
                            {/* Subcategory Selection */}
                            {subCategories && subCategories.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Подкатегория</label>
                                    <div className="grid grid-cols-2 gap-1">
                                        {subCategories.map(sub => (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                onClick={() => setSelectedSubcategoryId(cur => cur === sub.id ? "" : sub.id)}
                                                className={cn(
                                                    "w-full px-2 py-1.5 rounded-[14px] text-[8px] font-bold transition-all border truncate",
                                                    selectedSubcategoryId === sub.id
                                                        ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200"
                                                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                )}
                                            >
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Название товара</label>
                                    <input
                                        name="name"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        required
                                        placeholder="Напр. Футболка Oversize"
                                        className="w-full h-9 px-3 rounded-[14px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-xs text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white"
                                    />
                                </div>

                                <div className={cn("grid gap-2", isClothingCategory ? "grid-cols-1" : "grid-cols-2")}>
                                    {!isClothingCategory && (
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ед. измерения</label>
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
                                    )}
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Крит. порог</label>
                                        <input
                                            type="number"
                                            name="lowStockThreshold"
                                            defaultValue={item.lowStockThreshold}
                                            className="w-full h-9 px-3 rounded-[14px] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 bg-slate-50/50 hover:bg-white text-center text-sm"
                                        />
                                    </div>
                                </div>

                                {isClothingCategory && (
                                    <div className="p-3 bg-indigo-50/30 rounded-[14px] border border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                            {/* Brand Selection */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">Бренд</label>
                                                    <button type="button" onClick={() => setAddingAttr({ type: 'brand', name: '', hex: '' })} className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5">
                                                        <Plus className="w-2 h-2" />
                                                    </button>
                                                </div>
                                                {addingAttr?.type === 'brand' && (
                                                    <div className="mb-1 p-2 bg-white rounded-[14px] border border-indigo-100 shadow-sm space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                                        <input
                                                            autoFocus
                                                            placeholder="Бренд..."
                                                            className="w-full h-7 px-2 text-[9px] font-bold rounded-[14px] border border-slate-100 outline-none"
                                                            value={addingAttr.name}
                                                            onChange={e => setAddingAttr({ ...addingAttr, name: e.target.value })}
                                                        />
                                                        <div className="flex gap-1.5">
                                                            <button type="button" onClick={() => setAddingAttr(null)} className="flex-1 h-6 rounded-[14px] text-[8px] font-bold uppercase text-slate-400">Отм.</button>
                                                            <button type="button" onClick={handleAddDynamicAttribute} className="flex-1 h-6 rounded-[14px] bg-indigo-600 text-white text-[8px] font-bold uppercase">Создать</button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 gap-1">
                                                    {dynamicAttributes.filter(a => a.type === 'brand').map(b => (
                                                        <button
                                                            key={b.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setBrandCode(b.value);
                                                                handleAttributeChange("Бренд", b.name);
                                                            }}
                                                            className={cn(
                                                                "w-full h-9 px-4 rounded-[14px] text-[10px] font-bold transition-all border uppercase truncate",
                                                                attributes["Бренд"] === b.name ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                            )}
                                                        >
                                                            {b.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Quality Selection */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Качество</label>
                                                    <button type="button" onClick={() => setAddingAttr({ type: 'quality', name: '', hex: '' })} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                                        <Plus className="w-2.5 h-2.5" /> Добавить
                                                    </button>
                                                </div>

                                                {addingAttr?.type === 'quality' && (
                                                    <div className="p-4 bg-white rounded-[14px] border border-indigo-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                                                        <input
                                                            autoFocus
                                                            placeholder="Название качества..."
                                                            className="w-full h-10 px-3 text-xs font-bold rounded-[14px] border border-slate-100 focus:border-indigo-500 outline-none"
                                                            value={addingAttr.name}
                                                            onChange={e => setAddingAttr({ ...addingAttr, name: e.target.value })}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => setAddingAttr(null)} className="flex-1 h-9 rounded-[14px] text-[10px] font-bold uppercase text-slate-400 hover:bg-slate-50 transition-all">Отмена</button>
                                                            <button type="button" onClick={handleAddDynamicAttribute} className="flex-1 h-9 rounded-[14px] bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all">Создать</button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 gap-2">
                                                    {[...CLOTHING_QUALITIES, ...dynamicAttributes.filter(a => a.type === 'quality').map(a => ({ name: a.name, code: a.value }))].map(q => (
                                                        <button
                                                            key={q.name}
                                                            type="button"
                                                            onClick={() => {
                                                                setQualityCode(q.code);
                                                                handleAttributeChange("Качество", q.name);
                                                            }}
                                                            className={cn(
                                                                "w-full h-9 px-4 rounded-[14px] text-[10px] font-bold transition-all border uppercase truncate",
                                                                attributes["Качество"] === q.name ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                            )}
                                                        >
                                                            {q.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Материал</label>
                                                    <button type="button" onClick={() => setAddingAttr({ type: 'material', name: '', hex: '' })} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                                        <Plus className="w-2.5 h-2.5" /> Добавить
                                                    </button>
                                                </div>

                                                {addingAttr?.type === 'material' && (
                                                    <div className="p-4 bg-white rounded-[14px] border border-indigo-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                                                        <input
                                                            autoFocus
                                                            placeholder="Название..."
                                                            className="w-full h-10 px-3 text-xs font-bold rounded-[14px] border border-slate-100 focus:border-indigo-500 outline-none"
                                                            value={addingAttr.name}
                                                            onChange={e => setAddingAttr({ ...addingAttr, name: e.target.value })}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => setAddingAttr(null)} className="flex-1 h-9 rounded-[14px] text-[10px] font-bold uppercase text-slate-400 hover:bg-slate-50 transition-all">Отмена</button>
                                                            <button type="button" onClick={handleAddDynamicAttribute} className="flex-1 h-9 rounded-[14px] bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all">Создать</button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 gap-2">
                                                    {[...CLOTHING_MATERIALS, ...dynamicAttributes.filter(a => a.type === 'material').map(a => ({ name: a.name, code: a.value }))].map(m => (
                                                        <button
                                                            key={m.name}
                                                            type="button"
                                                            onClick={() => {
                                                                setMaterialCode(m.code);
                                                                handleAttributeChange("Материал", m.name);
                                                            }}
                                                            className={cn(
                                                                "w-full h-9 px-4 rounded-[14px] text-[10px] font-bold transition-all border uppercase truncate",
                                                                attributes["Материал"] === m.name ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                            )}
                                                        >
                                                            {m.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Размер</label>
                                                    <button type="button" onClick={() => setAddingAttr({ type: 'size', name: '', hex: '' })} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                                        <Plus className="w-2.5 h-2.5" /> Добавить
                                                    </button>
                                                </div>

                                                {addingAttr?.type === 'size' && (
                                                    <div className="p-4 bg-white rounded-[14px] border border-indigo-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                                                        <input
                                                            autoFocus
                                                            placeholder="Название..."
                                                            className="w-full h-10 px-3 text-xs font-bold rounded-[14px] border border-slate-100 focus:border-indigo-500 outline-none"
                                                            value={addingAttr.name}
                                                            onChange={e => setAddingAttr({ ...addingAttr, name: e.target.value })}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => setAddingAttr(null)} className="flex-1 h-9 rounded-[14px] text-[10px] font-bold uppercase text-slate-400 hover:bg-slate-50 transition-all">Отмена</button>
                                                            <button type="button" onClick={handleAddDynamicAttribute} className="flex-1 h-9 rounded-[14px] bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all">Создать</button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[...CLOTHING_SIZES, ...dynamicAttributes.filter(a => a.type === 'size').map(a => ({ name: a.name, code: a.value }))].map(s => (
                                                        <button
                                                            key={s.name}
                                                            type="button"
                                                            onClick={() => {
                                                                setSizeCode(s.code);
                                                                handleAttributeChange("Размер", s.name);
                                                            }}
                                                            className={cn(
                                                                "w-full h-9 px-4 rounded-[14px] text-[10px] font-bold transition-all border uppercase truncate",
                                                                attributes["Размер"] === s.name ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                            )}
                                                        >
                                                            {s.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Цвет</label>
                                                <button type="button" onClick={() => setAddingAttr({ type: 'color', name: '', hex: '#6366f1' })} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                                                    <Plus className="w-2.5 h-2.5" /> Добавить
                                                </button>
                                            </div>

                                            {addingAttr?.type === 'color' && (
                                                <div className="p-4 bg-white rounded-[14px] border border-indigo-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex gap-3">
                                                        <div className="relative w-10 h-10 rounded-[14px] overflow-hidden border border-slate-100 shrink-0">
                                                            <input
                                                                type="color"
                                                                className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                                                value={addingAttr.hex}
                                                                onChange={e => setAddingAttr({ ...addingAttr, hex: e.target.value })}
                                                            />
                                                        </div>
                                                        <input
                                                            autoFocus
                                                            placeholder="Название цвета..."
                                                            className="flex-1 h-10 px-3 text-xs font-bold rounded-[14px] border border-slate-100 focus:border-indigo-500 outline-none"
                                                            value={addingAttr.name}
                                                            onChange={e => setAddingAttr({ ...addingAttr, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => setAddingAttr(null)} className="flex-1 h-9 rounded-[14px] text-[10px] font-bold uppercase text-slate-400 hover:bg-slate-50 transition-all">Отмена</button>
                                                        <button type="button" onClick={handleAddDynamicAttribute} className="flex-1 h-9 rounded-[14px] bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all">Создать</button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-3 gap-2">
                                                {[...CLOTHING_COLORS, ...dynamicAttributes.filter(a => a.type === 'color').map(a => ({ name: a.name, code: a.value, hex: (a.meta as { hex?: string })?.hex || "#CCCCCC" }))].map(c => (
                                                    <button
                                                        key={c.name}
                                                        type="button"
                                                        onClick={() => {
                                                            setAttributeCode(c.code);
                                                            handleAttributeChange("Цвет", c.name);
                                                        }}
                                                        className={cn(
                                                            "flex items-center gap-2 p-2 rounded-[14px] border transition-all",
                                                            attributes["Цвет"] === c.name ? "bg-white border-indigo-300 ring-2 ring-indigo-500/10" : "bg-white/50 border-slate-100 hover:border-slate-200"
                                                        )}
                                                    >
                                                        <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: c.hex }} />
                                                        <span className="text-[10px] font-bold text-slate-600 truncate">{c.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
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
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Характеристики SKU</label>
                                        <span className="text-[9px] font-black text-indigo-300 uppercase bg-white px-2 py-0.5 rounded border border-indigo-100">Префикс: {category.prefix}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Бренд</label>
                                            <input
                                                name="brandCode"
                                                value={brandCode}
                                                onChange={(e) => setBrandCode(sanitizeSku(e.target.value))}
                                                placeholder="BR"
                                                className="w-full h-11 px-3 rounded-[14px] border border-indigo-200/50 bg-white text-xs font-black focus:border-indigo-500 outline-none uppercase text-center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Качество</label>
                                            <input
                                                name="qualityCode"
                                                value={qualityCode}
                                                onChange={(e) => setQualityCode(sanitizeSku(e.target.value))}
                                                placeholder="FT"
                                                className="w-full h-11 px-3 rounded-[14px] border border-indigo-200/50 bg-white text-xs font-black focus:border-indigo-500 outline-none uppercase text-center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Цвет</label>
                                            <input
                                                name="attributeCode"
                                                value={attributeCode}
                                                onChange={(e) => setAttributeCode(sanitizeSku(e.target.value))}
                                                placeholder="BLK"
                                                className="w-full h-11 px-3 rounded-[14px] border border-indigo-200/50 bg-white text-xs font-black focus:border-indigo-500 outline-none uppercase text-center"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Размер</label>
                                            <input
                                                name="sizeCode"
                                                value={sizeCode}
                                                onChange={(e) => setSizeCode(sanitizeSku(e.target.value))}
                                                placeholder="XL"
                                                className="w-full h-11 px-3 rounded-[14px] border border-indigo-200/50 bg-white text-xs font-black focus:border-indigo-500 outline-none uppercase text-center"
                                            />
                                        </div>
                                    </div>
                                    {skuPreview && (
                                        <div className="pt-4 border-t border-indigo-100 flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">Итоговый артикул</span>
                                            <div className="bg-indigo-600 text-white py-3 px-4 rounded-[14px] text-center font-mono font-black tracking-widest text-lg shadow-lg shadow-indigo-200 animate-in zoom-in-95">
                                                {skuPreview}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Визуализация</label>
                                <div className="p-8 bg-white rounded-[14px] border border-slate-100 shadow-sm space-y-6">
                                    <div className="grid grid-cols-12 gap-6">
                                        {/* Main Photo */}
                                        <div className="col-span-12 lg:col-span-7 space-y-4">
                                            <div className="aspect-square rounded-[14px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-indigo-400 transition-all">
                                                {imagePreview ? (
                                                    <>
                                                        <div className="absolute inset-0 w-full h-full">
                                                            <Image
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                fill
                                                                className="object-cover transition-transform duration-300"
                                                                unoptimized
                                                                style={{
                                                                    transform: `scale(${thumbSettings.zoom}) translate(${thumbSettings.x}%, ${thumbSettings.y}%)`
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                            <span className="text-white text-[10px] font-black uppercase tracking-widest pointer-events-none">Изменить</span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); setShowThumbAdjuster(!showThumbAdjuster); }}
                                                                className="h-8 px-4 rounded-[14px] bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/40 border border-white/30 transition-all shadow-xl"
                                                            >
                                                                {showThumbAdjuster ? "Закрыть" : "Настроить миниатюру"}
                                                            </button>
                                                        </div>

                                                        {showThumbAdjuster && (
                                                            <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in" onClick={e => e.stopPropagation()}>
                                                                <div className="bg-white rounded-[14px] shadow-2xl w-full max-w-sm p-6 space-y-6 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                                                        <div>
                                                                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none mb-1">Миниатюра</h4>
                                                                            <p className="text-[9px] text-slate-400 font-medium italic">Как товар будет виден в общем списке</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-[14px] border border-slate-200/50 shadow-sm relative shrink-0">
                                                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm relative">
                                                                                <Image
                                                                                    src={imagePreview as string}
                                                                                    alt="Preview"
                                                                                    fill
                                                                                    className="object-cover"
                                                                                    unoptimized
                                                                                    style={{
                                                                                        transform: `scale(${thumbSettings.zoom}) translate(${thumbSettings.x}%, ${thumbSettings.y}%)`
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-5 py-2">
                                                                        <div className="space-y-3">
                                                                            <div className="flex justify-between items-center px-1">
                                                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Масштаб</span>
                                                                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{Math.round(thumbSettings.zoom * 100)}%</span>
                                                                            </div>
                                                                            <input type="range" min="1" max="5" step="0.05" value={thumbSettings.zoom} onChange={e => setThumbSettings((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }))} className="w-full accent-indigo-600" />
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-6">
                                                                            <div className="space-y-3">
                                                                                <div className="flex justify-between items-center px-1">
                                                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Ось X</span>
                                                                                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{thumbSettings.x}%</span>
                                                                                </div>
                                                                                <input type="range" min="-100" max="100" step="1" value={thumbSettings.x} onChange={e => setThumbSettings((prev) => ({ ...prev, x: parseInt(e.target.value) }))} className="w-full accent-indigo-600" />
                                                                            </div>

                                                                            <div className="space-y-3">
                                                                                <div className="flex justify-between items-center px-1">
                                                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Ось Y</span>
                                                                                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{thumbSettings.y}%</span>
                                                                                </div>
                                                                                <input type="range" min="-100" max="100" step="1" value={thumbSettings.y} onChange={e => setThumbSettings((prev) => ({ ...prev, y: parseInt(e.target.value) }))} className="w-full accent-indigo-600" />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex gap-3 pt-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setThumbSettings({ zoom: 1, x: 0, y: 0 })}
                                                                            className="flex-1 h-12 rounded-[14px] border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all"
                                                                        >
                                                                            Сброс
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => { e.stopPropagation(); setShowThumbAdjuster(false); }}
                                                                            className="flex-[2] h-12 bg-slate-950 text-white rounded-[14px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                                                        >
                                                                            Готово
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Package className="w-10 h-10 text-slate-200" />
                                                )}

                                                <input
                                                    type="file"
                                                    name="image"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageChange(e, 'main')}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium italic text-center">Основное фото (лицо)</p>
                                        </div>

                                        {/* Other Perspectives */}
                                        <div className="col-span-12 lg:col-span-5 space-y-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Другие ракурсы</span>
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Back */}
                                                <div className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
                                                    {imageBackPreview ? (
                                                        <>
                                                            <Image src={imageBackPreview} alt="Back" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleSwapImage('back'); }}
                                                                    className="w-full py-2 rounded-[14px] bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 border border-white/30 transition-all"
                                                                >
                                                                    Главное
                                                                </button>
                                                                <span className="text-white text-[8px] font-black uppercase tracking-widest pointer-events-none opacity-60">Сменить</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                                            <PlusSquare className="w-4 h-4" />
                                                            <span className="text-[8px] font-black uppercase tracking-tight">Сзади</span>
                                                        </div>
                                                    )}
                                                    <input type="file" name="imageBack" accept="image/*" onChange={(e) => handleImageChange(e, 'back')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                </div>

                                                {/* Side */}
                                                <div className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
                                                    {imageSidePreview ? (
                                                        <>
                                                            <Image src={imageSidePreview} alt="Side" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleSwapImage('side'); }}
                                                                    className="w-full py-2 rounded-[14px] bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 border border-white/30 transition-all"
                                                                >
                                                                    Главное
                                                                </button>
                                                                <span className="text-white text-[8px] font-black uppercase tracking-widest pointer-events-none opacity-60">Сменить</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                                            <PlusSquare className="w-4 h-4" />
                                                            <span className="text-[8px] font-black uppercase tracking-tight">Сбоку</span>
                                                        </div>
                                                    )}
                                                    <input type="file" name="imageSide" accept="image/*" onChange={(e) => handleImageChange(e, 'side')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                </div>

                                                {/* Details 1 */}
                                                <div className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
                                                    {imageDetailsPreviews[0] ? (
                                                        <>
                                                            <Image src={imageDetailsPreviews[0]} alt="Detail 1" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleSwapImage('detail', 0); }}
                                                                    className="w-full py-2 rounded-[14px] bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 border border-white/30 transition-all"
                                                                >
                                                                    Главное
                                                                </button>
                                                                <span className="text-white text-[8px] font-black uppercase tracking-widest pointer-events-none opacity-60">Сменить</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                                            <PlusSquare className="w-4 h-4" />
                                                            <span className="text-[8px] font-black uppercase tracking-tight">Детали</span>
                                                        </div>
                                                    )}
                                                    <input type="file" name="imageDetails" accept="image/*" onChange={(e) => handleImageChange(e, 'detail', 0)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                </div>

                                                {/* Details 2 */}
                                                <div className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer shadow-sm">
                                                    {imageDetailsPreviews[1] ? (
                                                        <>
                                                            <Image src={imageDetailsPreviews[1]} alt="Detail 2" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleSwapImage('detail', 1); }}
                                                                    className="w-full py-2 rounded-[14px] bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 border border-white/30 transition-all"
                                                                >
                                                                    Главное
                                                                </button>
                                                                <span className="text-white text-[8px] font-black uppercase tracking-widest pointer-events-none opacity-60">Сменить</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                                            <PlusSquare className="w-4 h-4" />
                                                            <span className="text-[8px] font-black uppercase tracking-tight">Детали</span>
                                                        </div>
                                                    )}
                                                    <input type="file" name="imageDetails" accept="image/*" onChange={(e) => handleImageChange(e, 'detail', 1)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <input type="hidden" name="currentImage" value={item.image || ""} />
                                    <input type="hidden" name="currentImageBack" value={item.imageBack || ""} />
                                    <input type="hidden" name="currentImageSide" value={item.imageSide || ""} />
                                    <input type="hidden" name="currentImageDetails" value={JSON.stringify(item.imageDetails || [])} />
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

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Всего</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                defaultValue={item.quantity}
                                                className="w-full h-12 px-4 rounded-[14px] bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 text-center text-lg disabled:opacity-50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Бронь</label>
                                            <input
                                                type="number"
                                                name="reservedQuantity"
                                                defaultValue={item.reservedQuantity || 0}
                                                className="w-full h-12 px-4 rounded-[14px] bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 text-center text-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>

                    {error && (
                        <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-[14px] flex items-center gap-3 animate-in shake duration-500">
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
                        className="h-14 px-10 rounded-[14px] text-slate-500 text-xs font-black tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                    >
                        ОТМЕНА
                    </button>
                    <SubmitButton
                        label="Сохранить изменения"
                        pendingLabel="Сохранение..."
                        form="edit-item-form"
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
                            className="w-full h-24 p-4 rounded-[14px] border border-slate-100 bg-slate-50 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all resize-none"
                            placeholder="Причина перемещения..."
                        />
                    </div>

                    <Button
                        onClick={handleMove}
                        disabled={!targetLocationId || isLoading}
                        className="w-full h-12 bg-slate-900 text-white rounded-[14px] font-bold transition-all active:scale-95 shadow-lg shadow-slate-200"
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
                        className="w-full h-12 bg-slate-900 text-white rounded-[14px] font-bold transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        {isLoading ? "Обновление..." : "Сменить категорию"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
