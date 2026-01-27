"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { Package, ArrowLeft, Check, Plus, Trash2, Edit, X, PlusSquare, Search, SearchX, MapPin, ChevronRight, Download, Tag, GripVertical, Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { deleteInventoryItems, bulkMoveInventoryItems, bulkUpdateInventoryCategory, getInventoryCategories, deleteInventoryCategory, updateInventoryCategoriesOrder, archiveInventoryItems, getItemStocks } from "@/app/dashboard/warehouse/actions";
import { exportToCSV } from "@/lib/export-utils";
import { EditCategoryDialog } from "../edit-category-dialog";
import { CategorySelect } from "../category-select";
import { AdjustStockDialog } from "../adjust-stock-dialog";
import { Pagination } from "@/components/ui/pagination";
import { StorageLocation } from "../storage-locations-tab";
import { StorageLocationSelect } from "@/components/ui/storage-location-select";
import { PremiumSelect } from "@/components/ui/premium-select";
import { useToast } from "@/components/ui/toast";

import { AddCategoryDialog } from "../add-category-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArchiveReasonDialog } from "../components/archive-reason-dialog";
import { LabelPrinterDialog } from "../components/LabelPrinterDialog";
import { createElement } from "react";
import { getCategoryIcon, getColorStyles } from "../category-utils";

import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { Session } from "@/lib/auth";
import { pluralize } from "@/lib/pluralize";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    TouchSensor,
    DragOverlay,
    DragStartEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";



import type { InventoryItem, Category, ThumbnailSettings, InventoryAttribute, AttributeType } from "../types";
export type { InventoryItem, Category, ThumbnailSettings, InventoryAttribute, AttributeType };

interface CategoryDetailClientProps {
    category: Category;
    parentCategory?: Category;
    subCategories?: Category[];
    items: InventoryItem[];
    storageLocations?: StorageLocation[];
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    user: Session | null;
}

function ItemThumbnail({ item }: { item: InventoryItem }) {
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const settings = (item.thumbnailSettings as ThumbnailSettings) || { zoom: 1, x: 0, y: 0 };

    const baseScale = useMemo(() => {
        if (!aspectRatio) return 1;
        return Math.max(aspectRatio, 1 / aspectRatio);
    }, [aspectRatio]);

    if (!item.image) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Package className="w-5 h-5 opacity-20" />
            </div>
        );
    }

    return (
        <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain"
            unoptimized
            onLoadingComplete={(img) => setAspectRatio(img.naturalWidth / img.naturalHeight)}
            style={{
                transform: `scale(${(settings.zoom || 1) * baseScale}) translate(${settings.x ?? 0}%, ${settings.y ?? 0}%)`,
                transformOrigin: 'center center'
            }}
        />
    );
}

export function CategoryDetailClient({
    category,
    parentCategory,
    subCategories: initialSubCategories = [],
    items,
    storageLocations = [],
    attributeTypes = [],
    allAttributes = [],
    user
}: CategoryDetailClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [subCategories, setSubCategories] = useState<Category[]>(initialSubCategories);
    const [activeId, setActiveId] = useState<string | null>(null);
    const canSeeCost = user?.roleName === 'Администратор' || user?.roleName === 'Руководство' || user?.departmentName === 'Отдел продаж';

    // Label Dialog States
    const [showLabelDialog, setShowLabelDialog] = useState(false);
    const [itemToPrint, setItemToPrint] = useState<InventoryItem | null>(null);

    const handlePrintLabel = (item: InventoryItem) => {
        setItemToPrint(item);
        setShowLabelDialog(true);
    };

    const handleBulkPrint = () => {
        if (selectedIds.length === 0) return;
        const selectedItems = items.filter(i => selectedIds.includes(i.id));
        if (selectedItems.length > 0) {
            setItemToPrint(selectedItems[0]); // Dialog currently handles one at a time
            setShowLabelDialog(true);
        }
    };

    useEffect(() => {
        setSubCategories(initialSubCategories);
    }, [initialSubCategories]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = subCategories.findIndex((item) => item.id === active.id);
            const newIndex = subCategories.findIndex((item) => item.id === over.id);

            const newOrder = arrayMove(subCategories, oldIndex, newIndex);
            setSubCategories(newOrder);

            try {
                const updateItems = newOrder.map((cat, index) => ({
                    id: cat.id,
                    sortOrder: index + 1,
                }));

                const res = await updateInventoryCategoriesOrder(updateItems);
                if (res.error) {
                    toast(res.error, "error");
                    setSubCategories(initialSubCategories);
                } else {
                    // toast("Порядок сохранен", "success");
                }
            } catch {
                toast("Ошибка при сохранении порядка", "error");
                setSubCategories(initialSubCategories);
            }
        }
    };

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
    const [showArchiveReason, setShowArchiveReason] = useState(false);
    const [adjustingItemStocks, setAdjustingItemStocks] = useState<{ storageLocationId: string; quantity: number }[]>([]);

    // Set custom trail for breadcrumbs
    const { setCustomTrail } = useBreadcrumbs();
    useEffect(() => {
        const trail = [
            { label: "Склад", href: "/dashboard/warehouse" }
        ];

        if (parentCategory) {
            trail.push({
                label: parentCategory.name,
                href: `/dashboard/warehouse/${parentCategory.id}`
            });
        }

        trail.push({
            label: category.name,
            href: `/dashboard/warehouse/${category.id}` // Current page
        });

        setCustomTrail(trail);

        return () => setCustomTrail(null);
    }, [category, parentCategory, setCustomTrail]);

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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

    const itemCountsByStorage = useMemo(() => {
        const counts: Record<string, number> = {};
        items.forEach(item => {
            let placed = false;
            // Check stocks separately
            if (item.stocks && item.stocks.length > 0) {
                item.stocks.forEach((s) => {
                    if (s.quantity > 0) {
                        counts[s.storageLocationId] = (counts[s.storageLocationId] || 0) + 1;
                        placed = true;
                    }
                });
            }

            // Fallback to main location if not placed by stocks (or if needed for legacy)
            if (!placed) {
                if (item.storageLocationId) {
                    counts[item.storageLocationId] = (counts[item.storageLocationId] || 0) + 1;
                } else if (item.location) {
                    const key = `legacy:${item.location}`;
                    counts[key] = (counts[key] || 0) + 1;
                }
            }
        });
        return counts;
    }, [items]);

    // Extract unique legacy locations for filter dropdown
    const legacyLocations = useMemo(() => {
        const locs = new Set<string>();
        items.forEach(item => {
            if (!item.storageLocationId && item.location) {
                locs.add(item.location);
            }
        });
        return Array.from(locs).sort();
    }, [items]);

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

    const handleOpenAdjust = async (item: InventoryItem) => {
        setAdjustingItem(item);
        setIsAdjustOpen(true);
        // Fetch current stocks for this item to show in dialog
        try {
            const res = await getItemStocks(item.id);
            if (res.data) setAdjustingItemStocks(res.data);
        } catch (err) {
            console.error("Failed to fetch item stocks", err);
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
                filterStorage.startsWith("legacy:")
                    ? item.location === filterStorage.replace("legacy:", "") && !item.storageLocationId
                    : (
                        item.storageLocationId === filterStorage ||
                        // Check stocks
                        (item.stocks && item.stocks.some((s) => s.storageLocationId === filterStorage && s.quantity > 0))
                    );

        return matchesSearch && matchesFilter && matchesStorage;
    }).sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

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
                toast(`Удалено: ${ids.length} ${pluralize(ids.length, 'позиция', 'позиции', 'позиций')}`, "success");
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

    const handleArchiveItems = async (reason: string) => {
        setIsDeleting(true);
        try {
            const res = await archiveInventoryItems(selectedIds, reason || "Массовая архивация");
            if (res?.success) {
                toast(`Архивировано: ${selectedIds.length} ${pluralize(selectedIds.length, 'позиция', 'позиции', 'позиций')}`, "success");
                setSelectedIds(prev => prev.filter(id => !selectedIds.includes(id)));
                setShowArchiveReason(false);
                router.refresh();
            } else {
                toast(res?.error || "Ошибка при архивации", "error");
            }
        } catch {
            toast("Произошла ошибка", "error");
        } finally {
            setIsDeleting(false);
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

                {/* Main Title Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="w-10 h-10 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center mr-2 shrink-0 group"
                        >
                            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                        </Button>

                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-slate-900 leading-none">{category.name}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <AnimatePresence>
                            {selectedIds.length > 0 && (
                                <>
                                    {/* Bottom Progressive Gradient Blur Overlay */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                                        exit={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                                        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
                                        className="fixed bottom-10 left-1/2 z-[110] flex items-center bg-white/95 backdrop-blur-3xl p-2 gap-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/60"
                                    >
                                        <div className="flex items-center gap-3 pl-1">
                                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20 text-white">
                                                {selectedIds.length}
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 whitespace-nowrap pr-2">Позиций выбрано</span>
                                        </div>

                                        <div className="w-px h-8 bg-slate-200" />

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setIsBulkMoveOpen(true)}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-slate-100 transition-all group"
                                            >
                                                <MapPin className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Переместить</span>
                                            </button>

                                            <button
                                                onClick={handleBulkPrint}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-slate-100 transition-all group"
                                            >
                                                <Tag className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Этикетки</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const itemsToExport = items.filter(i => selectedIds.includes(i.id));
                                                    exportToCSV(itemsToExport, "inventory_export", [
                                                        { header: "ID", key: "id" },
                                                        { header: "Название", key: "name" },
                                                        { header: "Артикул", key: (item) => item.sku || "" },
                                                        { header: "Количество", key: "quantity" },
                                                        { header: "Ед.изм", key: "unit" },
                                                        { header: "Категория", key: (item) => item.category?.name || "" },
                                                        {
                                                            header: "Склад", key: (item) => {
                                                                if (item.stocks && item.stocks.length > 0) {
                                                                    const stocksStr = item.stocks
                                                                        .filter((s) => s.quantity > 0)
                                                                        .map((s) => {
                                                                            const locName = storageLocations.find(l => l.id === s.storageLocationId)?.name || "Неизвестно";
                                                                            return `${locName} (${s.quantity})`;
                                                                        })
                                                                        .join("; ");
                                                                    if (stocksStr) return stocksStr;
                                                                }
                                                                // Fallback
                                                                return storageLocations.find(l => l.id === item.storageLocationId)?.name || item.location || "";
                                                            }
                                                        },
                                                        { header: "Себестоимость", key: (item) => item.costPrice || 0 },
                                                        { header: "Цена продажи", key: (item) => item.sellingPrice || 0 }
                                                    ]);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-slate-100 transition-all group"
                                            >
                                                <Download className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Экспорт</span>
                                            </button>

                                            <div className="w-px h-8 bg-slate-200 mx-1" />

                                            <button
                                                onClick={() => {
                                                    const itemsToArchive = items.filter(i => selectedIds.includes(i.id));
                                                    const hasStock = itemsToArchive.some(i => i.quantity > 0);

                                                    if (hasStock) {
                                                        toast("Нельзя архивировать товары с остатком > 0", "error");
                                                        return;
                                                    }
                                                    setShowArchiveReason(true);
                                                }}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                                            >
                                                <Archive className="w-4 h-4" />
                                            </button>

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
                        </AnimatePresence>
                        {category.id !== "orphaned" && !category.parentId && (
                            <AddCategoryDialog
                                categories={allCategories}
                                parentId={category.id}
                                buttonText="Добавить подкатегорию"
                            />
                        )}
                        <Button
                            onClick={() => router.push(`/dashboard/warehouse/items/new?categoryId=${category.id}`)}
                            className="h-12 btn-primary rounded-full px-6 gap-2 font-bold"
                        >
                            <Plus className="w-5 h-5" />
                            Добавить позицию
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mass Actions Bar */}

            {/* Modals */}


            {
                isBulkMoveOpen && (
                    <BulkMoveDialog
                        selectedIds={selectedIds}
                        storageLocations={storageLocations}
                        onClose={() => setIsBulkMoveOpen(false)}
                        onSuccess={() => {
                            setIsBulkMoveOpen(false);
                            setSelectedIds([]);
                        }}
                    />
                )
            }

            {
                isBulkCategoryOpen && (
                    <BulkCategoryDialog
                        selectedIds={selectedIds}
                        categories={allCategories}
                        onClose={() => setIsBulkCategoryOpen(false)}
                        onSuccess={() => {
                            setIsBulkCategoryOpen(false);
                            setSelectedIds([]);
                        }}
                    />
                )
            }

            {
                isAdjustOpen && adjustingItem && (
                    <AdjustStockDialog
                        item={adjustingItem}
                        locations={storageLocations}
                        itemStocks={adjustingItemStocks}
                        user={user}
                        onClose={() => {
                            setIsAdjustOpen(false);
                            setAdjustingItem(null);
                            setAdjustingItemStocks([]);
                            router.refresh();
                        }}
                    />
                )
            }

            {/* Remove drawer as we navigate to full page now */}

            {/* Sub-header with Search and Filters - Redesigned in Pill Style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-200/40 backdrop-blur-md p-1.5 rounded-[28px] border border-white/40 shadow-inner">
                {/* Search Input */}
                <div className="relative flex-1 md:min-w-[400px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по названию или артикулу..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 bg-white/80 border border-slate-200/50 rounded-[22px] pl-14 pr-10 text-[12px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters Group */}
                <div className="flex items-center gap-1.5 px-1.5 h-12 bg-slate-900/5 rounded-[22px]">
                    {/* Storage Select Premium */}
                    <PremiumSelect
                        options={[
                            { id: "all", title: "Все склады" },
                            ...storageLocations.map(loc => ({
                                id: loc.id,
                                title: loc.name,
                                badge: itemCountsByStorage[loc.id] ? `${itemCountsByStorage[loc.id]} поз.` : undefined
                            })),
                            ...legacyLocations.map(locName => ({
                                id: `legacy:${locName}`,
                                title: locName, // Show just the name for legacy locations
                                badge: itemCountsByStorage[`legacy:${locName}`] ? `${itemCountsByStorage[`legacy:${locName}`]} поз.` : undefined,
                                className: "opacity-80 Italic" // Optional styling to differentiate
                            }))
                        ]}
                        value={filterStorage}
                        onChange={setFilterStorage}
                        variant="minimal"
                        className="min-w-[160px]"
                    />

                    <div className="w-px h-6 bg-slate-900/10" />

                    {/* Status Pills */}
                    <div className="flex items-center gap-1">
                        {[
                            { id: "all", label: "Все" },
                            { id: "in", label: "В наличии", color: "emerald" },
                            { id: "low", label: "Мало", color: "amber" },
                            { id: "out", label: "Нет", color: "rose" }
                        ].map((f) => {
                            const isActive = filterStatus === f.id;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setFilterStatus(f.id as "all" | "in" | "low" | "out")}
                                    className={cn(
                                        "h-9 px-4 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                        isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
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
            {
                subCategories.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 px-2">
                            <h2 className="text-sm font-bold text-slate-400">Подкатегории</h2>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={() => setActiveId(null)}
                        >
                            <SortableContext
                                items={subCategories.map(s => s.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
                                    {subCategories.map((subcat) => (
                                        <SortableSubCategoryCard
                                            key={subcat.id}
                                            subcat={subcat}
                                            router={router}
                                            setEditingCategory={setEditingCategory}
                                            setDeletingCategory={setDeletingCategory}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                            <DragOverlay adjustScale={true} dropAnimation={{
                                duration: 250,
                                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                            }}>
                                {activeId ? (
                                    <div className="w-full h-full pointer-events-none z-[100]">
                                        <div className="bg-white border border-primary/30 rounded-[var(--radius)] p-5 shadow-2xl shadow-primary/15 flex items-center justify-between">
                                            <SubCategoryCardContent
                                                subcat={subCategories.find(s => s.id === activeId)!}
                                                isDragging={true}
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                )
            }

            {/* Items Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-bold text-slate-400">Позиции</h2>
                        <div className="h-px w-12 bg-slate-200" />
                    </div>
                </div>

                {showArchiveReason && (
                    <ArchiveReasonDialog
                        isOpen={showArchiveReason}
                        onClose={() => setShowArchiveReason(false)}
                        onConfirm={handleArchiveItems}
                        itemCount={selectedIds.length}
                        isLoading={isDeleting}
                    />
                )}

                {filteredItems.length > 0 ? (
                    <div className="space-y-4">
                        {/* Items Table View */}
                        <div className="glass-panel p-0 overflow-hidden">
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
                                                            ? "bg-primary border-primary text-white"
                                                            : "bg-white border-slate-200 hover:border-primary/40"
                                                    )}
                                                >
                                                    {selectedIds.length === filteredItems.length && filteredItems.length > 0 && <Check className="w-3 h-3 stroke-[4]" />}
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">Товар</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">Склад</th>
                                            {canSeeCost && <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400">Себест.</th>}
                                            {canSeeCost && <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400">Цена</th>}
                                            <th className="w-32 px-6 py-4 text-center text-xs font-semibold text-slate-400">Резерв</th>
                                            <th className="w-32 px-6 py-4 text-center text-xs font-semibold text-slate-400">Остаток</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400">Действия</th>
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
                                                        "group hover:bg-slate-50 transition-all cursor-pointer",
                                                        isSelected && "bg-slate-50"
                                                    )}
                                                >
                                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                        <div
                                                            onClick={() => toggleSelectItem(item.id)}
                                                            className={cn(
                                                                "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer mx-auto",
                                                                isSelected
                                                                    ? "bg-primary border-primary text-white"
                                                                    : "bg-white border-slate-200 hover:border-primary/40"
                                                            )}
                                                        >
                                                            {isSelected && <Check className="w-3 h-3 stroke-[4]" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative">
                                                                <ItemThumbnail item={item} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-900 leading-tight transition-colors">
                                                                    {(() => {
                                                                        const cat = item.category as { singularName?: string; name?: string } | null;
                                                                        if (cat?.singularName && cat?.name && item.name.startsWith(cat.name)) {
                                                                            return item.name.replace(cat.name, cat.singularName);
                                                                        }
                                                                        return item.name;
                                                                    })()}
                                                                </div>
                                                                <div className="text-xs font-mono font-bold text-slate-400 mt-1 bg-slate-50 inline-block px-1.5 py-0.5 rounded-[4px]">
                                                                    {item.sku || "N/A"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1 text-xs text-slate-500 font-medium">
                                                            {(() => {
                                                                if (item.stocks && item.stocks.length > 0) {
                                                                    const activeStocks = item.stocks.filter((s) => s.quantity > 0);
                                                                    if (activeStocks.length > 0) {
                                                                        return activeStocks.map((s) => {
                                                                            const locName = storageLocations.find(l => l.id === s.storageLocationId)?.name || "N/A";
                                                                            return (
                                                                                <div key={s.storageLocationId} className="flex items-center gap-2 whitespace-nowrap">
                                                                                    <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                                                                                    <span>{locName}</span>
                                                                                    <span className="text-slate-400">({s.quantity})</span>
                                                                                </div>
                                                                            );
                                                                        });
                                                                    }
                                                                }
                                                                // Fallback
                                                                return (
                                                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                                                        <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                                                                        <span>{storageLocations.find(l => l.id === item.storageLocationId)?.name || item.location || "—"}</span>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </td>
                                                    {canSeeCost && (
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-xs font-medium text-slate-400">
                                                                {item.costPrice ? `${Number(item.costPrice).toLocaleString('ru-RU')} ₽` : "—"}
                                                            </span>
                                                        </td>
                                                    )}
                                                    {canSeeCost && (
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm font-black text-slate-900">
                                                                {item.sellingPrice ? `${Number(item.sellingPrice).toLocaleString('ru-RU')} ₽` : "—"}
                                                            </span>
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={cn(
                                                            "text-sm font-bold tabular-nums",
                                                            (item.reservedQuantity || 0) > 0 ? "text-amber-500" : "text-slate-300"
                                                        )}>
                                                            {item.reservedQuantity || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <div className={cn(
                                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all border shadow-sm shrink-0 whitespace-nowrap",
                                                                isCritical ? "bg-rose-50 border-rose-100 text-rose-600 ring-2 ring-rose-500/5" :
                                                                    isLowStock ? "bg-amber-50 border-amber-100 text-amber-600 ring-2 ring-amber-500/5" :
                                                                        "bg-emerald-50 border-emerald-100 text-emerald-600"
                                                            )}>
                                                                <div className={cn(
                                                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                                                    isCritical ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" :
                                                                        isLowStock ? "bg-amber-500" :
                                                                            "bg-emerald-500"
                                                                )} />
                                                                <span className="tabular-nums whitespace-nowrap">{available} {(item.unit.toLowerCase() === 'pcs' || item.unit === 'шт.') ? 'шт' : item.unit}</span>
                                                            </div>

                                                            {(item.reservedQuantity || 0) > 0 && (
                                                                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 tabular-nums">
                                                                    <span title="Всего на складе">Всего: {item.quantity}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1 transition-all">
                                                            <button
                                                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePrintLabel(item);
                                                                }}
                                                                title="Печать этикетки"
                                                            >
                                                                <Tag className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenAdjust(item);
                                                                }}
                                                                title="Корректировка"
                                                            >
                                                                <PlusSquare className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/dashboard/warehouse/items/${item.id}`);
                                                                }}
                                                                title="Редактировать"
                                                            >
                                                                <Edit className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (item.quantity > 0) {
                                                                        toast("Нельзя архивировать товар с остатком > 0", "error");
                                                                        return;
                                                                    }
                                                                    setSelectedIds([item.id]);
                                                                    setShowArchiveReason(true);
                                                                }}
                                                                title="В архив"
                                                            >
                                                                <Archive className="w-5 h-5" />
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
                        {filteredItems.length > 0 && (
                            <div className="pt-2">
                                <Pagination
                                    totalItems={filteredItems.length}
                                    pageSize={itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                    itemNames={['позиции', 'позиций', 'позиций']}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center px-4 bg-slate-50/30 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 text-slate-300 shadow-sm">
                            {searchQuery ? <SearchX className="w-10 h-10" /> : <Package className="w-10 h-10" />}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
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
            </div >

            <ConfirmDialog
                isOpen={idsToDelete.length > 0}
                onClose={() => setIdsToDelete([])}
                onConfirm={() => handleDeleteItems(idsToDelete)}
                title={`Удаление ${pluralize(idsToDelete.length, 'позиции', 'позиций', 'позиций')}`}
                description={`Вы уверены, что хотите удалить ${pluralize(idsToDelete.length, 'выбранную позицию', 'выбранные позиции', 'выбранные позиции')} (${idsToDelete.length})? Это действие нельзя отменить.`}
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

            {itemToPrint && (
                <LabelPrinterDialog
                    item={itemToPrint}
                    isOpen={showLabelDialog}
                    onClose={() => setShowLabelDialog(false)}
                    attributeTypes={attributeTypes}
                    allAttributes={allAttributes}
                />
            )}
        </div >
    );
}

interface NavigationRouter {
    push: (href: string) => void;
    replace?: (href: string) => void;
    back?: () => void;
    forward?: () => void;
    refresh?: () => void;
    prefetch?: (href: string) => void;
}

function SortableSubCategoryCard({
    subcat,
    router,
    setEditingCategory,
    setDeletingCategory
}: {
    subcat: Category;
    router: NavigationRouter;
    setEditingCategory: (cat: Category) => void;
    setDeletingCategory: (cat: Category) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: subcat.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => router.push(`/dashboard/warehouse/${subcat.id}`)}
            className={cn(
                "group bg-white border border-slate-200/60 rounded-[var(--radius)] p-5 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:border-primary/20 cursor-pointer flex items-center justify-between relative overflow-hidden",
                isDragging && "opacity-0 scale-95" // Hide the original one while dragging
            )}
        >
            <SubCategoryCardContent
                subcat={subcat}
                isDragging={isDragging}
                dragHandleProps={{ ...attributes, ...listeners }}
                onEdit={() => setEditingCategory(subcat)}
                onDelete={() => setDeletingCategory(subcat)}
            />
        </div>
    );
}

function SubCategoryCardContent({
    subcat,
    isDragging,
    dragHandleProps,
    onEdit,
    onDelete,
}: {
    subcat: Category;
    isDragging?: boolean;
    dragHandleProps?: Record<string, unknown>;
    onEdit?: () => void;
    onDelete?: () => void;
}) {
    const IconComponent = getCategoryIcon(subcat);
    const colorStyle = getColorStyles(subcat.color);

    return (
        <>
            <div className="flex items-center gap-4 flex-1">
                <div
                    {...dragHandleProps}
                    className={cn(
                        "w-8 h-10 -ml-2 flex items-center justify-center text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing transition-colors rounded-lg hover:bg-slate-50",
                        isDragging && "cursor-grabbing text-primary"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className={cn(
                    "w-10 h-10 rounded-[var(--radius)] flex items-center justify-center transition-all",
                    colorStyle
                )}>
                    {createElement(IconComponent, { className: "w-5 h-5" })}
                </div>
                <div>
                    <h4 className="text-[14px] font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {subcat.name}
                    </h4>
                </div>
            </div>

            <div className={cn(
                "flex items-center gap-1 transition-all",
                isDragging && "opacity-0"
            )}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.();
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                    title="Редактировать"
                >
                    <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-[var(--radius)] text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    title="Удалить"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all ml-1" />
            </div>
        </>
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
                toast(`Успешно перемещено: ${selectedIds.length} ${pluralize(selectedIds.length, 'позиция', 'позиции', 'позиций')}`, "success");
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
                        <h2 className="text-xl font-bold text-slate-900">Массовое перемещение</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Перемещение {selectedIds.length} {pluralize(selectedIds.length, 'позиции', 'позиций', 'позиций')}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 ml-1">Целевой склад</label>
                        <StorageLocationSelect
                            value={targetLocationId}
                            onChange={setTargetLocationId}
                            options={storageLocations}
                            placeholder="Выберите склад..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 ml-1">Комментарий</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-24 p-4 rounded-[var(--radius)] border border-slate-100 bg-slate-50 text-sm font-medium outline-none focus:bg-white focus:border-primary transition-all resize-none"
                            placeholder="Причина перемещения..."
                        />
                    </div>

                    <Button
                        onClick={handleMove}
                        disabled={!targetLocationId || isLoading}
                        className="w-full h-12 bg-slate-900 text-white rounded-[var(--radius)] font-bold transition-all active:scale-95 shadow-lg shadow-slate-200"
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
                toast(`Категория изменена для ${selectedIds.length} ${pluralize(selectedIds.length, 'позиции', 'позиций', 'позиций')}`, "success");
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
                        <h2 className="text-xl font-bold text-slate-900">Смена категории</h2>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">{selectedIds.length} поз. выбрано</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 ml-1">Новая категория</label>
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
                        className="w-full h-12 bg-slate-900 text-white rounded-[var(--radius)] font-bold transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        {isLoading ? "Обновление..." : "Сменить категорию"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

