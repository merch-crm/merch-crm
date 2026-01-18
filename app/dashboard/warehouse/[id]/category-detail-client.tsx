"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Package, ArrowLeft, Check, Plus, Trash2, Edit, X, PlusSquare, Search, SearchX, MapPin, ChevronRight, Download, ChevronDown, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { deleteInventoryItems, bulkMoveInventoryItems, bulkUpdateInventoryCategory, getInventoryCategories, deleteInventoryCategory } from "@/app/dashboard/warehouse/actions";
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
import { getCategoryIcon, getColorStyles } from "../category-utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Session } from "@/lib/auth";

import type { InventoryItem, Category, ThumbnailSettings, InventoryAttribute } from "../types";
export type { InventoryItem, Category, ThumbnailSettings, InventoryAttribute };

interface CategoryDetailClientProps {
    category: Category;
    parentCategory?: Category;
    subCategories?: Category[];
    items: InventoryItem[];
    storageLocations?: StorageLocation[];
    user: Session | null;
}

export function CategoryDetailClient({
    category,
    parentCategory,
    subCategories = [],
    items,
    storageLocations = [],
    user
}: CategoryDetailClientProps) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false);
    const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const init = async () => {
            const res = await getInventoryCategories();
            if (res.data) setAllCategories(res.data as Category[]);
        };
        init();
    }, []);



    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "in" | "low" | "out">("all");
    const [filterStorage, setFilterStorage] = useState<string>("all"); // New warehouse filter
    const [isStorageOpen, setIsStorageOpen] = useState(false); // State for custom dropdown
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

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
                    <div className="space-y-4">
                        {/* Items Table View */}
                        <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="w-16 px-6 py-4">
                                                <div
                                                    onClick={toggleSelectAll}
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
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Товар</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Артикул</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Склад</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Остаток</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-50">
                                        {currentItems.map((item) => {
                                            const isSelected = selectedIds.includes(item.id);
                                            const available = item.quantity - (item.reservedQuantity || 0);
                                            const isCritical = available <= (item.criticalStockThreshold || 0);
                                            const isLowStock = !isCritical && available <= (item.lowStockThreshold || 10);

                                            return (
                                                <tr
                                                    key={item.id}
                                                    onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                                    className={cn(
                                                        "group hover:bg-slate-50/80 transition-all cursor-pointer",
                                                        isSelected && "bg-indigo-50/30"
                                                    )}
                                                >
                                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                        <div
                                                            onClick={() => toggleSelectItem(item.id)}
                                                            className={cn(
                                                                "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer mx-auto",
                                                                isSelected
                                                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                                                    : "bg-white border-slate-200 hover:border-indigo-300"
                                                            )}
                                                        >
                                                            {isSelected && <Check className="w-3 h-3 stroke-[4]" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-[14px] bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative">
                                                                {item.image ? (
                                                                    <Image
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        fill
                                                                        className="object-cover"
                                                                        unoptimized
                                                                        style={(() => {
                                                                            const settings = item.thumbnailSettings;
                                                                            if (!settings) return {};
                                                                            return {
                                                                                transform: `scale(${settings.zoom || 1}) translate(${settings.x ?? 0}%, ${settings.y ?? 0}%)`
                                                                            };
                                                                        })()}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                        <Package className="w-5 h-5 opacity-20" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{item.name}</div>
                                                                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.category?.name || "Основная категория"}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[11px] font-mono font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                                            {item.sku || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            <span className="text-xs font-bold">
                                                                {storageLocations.find(l => l.id === item.storageLocationId)?.name || "—"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className={cn(
                                                            "inline-flex items-center px-3 py-1.5 rounded-[12px] text-[11px] font-black tracking-widest uppercase",
                                                            isCritical ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                                isLowStock ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                                    "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        )}>
                                                            {available} {item.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button
                                                                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-[12px] text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm"
                                                                onClick={() => { setAdjustingItem(item); setIsAdjustOpen(true); }}
                                                                title="Корректировка"
                                                            >
                                                                <PlusSquare className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-[12px] text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                                                                onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                                                title="Редактировать"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-[12px] text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                                                                onClick={() => setIdsToDelete([item.id])}
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
                        </div>

                        {/* Pagination */}
                        {filteredItems.length > itemsPerPage && (
                            <div className="pt-8 pb-4 flex justify-center">
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
                )}
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

            {
                editingCategory && (
                    <EditCategoryDialog
                        category={editingCategory}
                        categories={allCategories}
                        user={user}
                        isOpen={!!editingCategory}
                        onClose={() => setEditingCategory(null)}
                    />
                )
            }
        </div >
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
