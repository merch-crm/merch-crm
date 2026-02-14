"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { Package, ArrowLeft, Plus, Trash2, Edit, X, PlusSquare, Search, SearchX, MapPin, ChevronRight, Download, Tag, GripVertical, Archive, Layers, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatUnit } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

import { Button } from "@/components/ui/button";

import { deleteInventoryItems, bulkMoveInventoryItems, bulkUpdateInventoryCategory, getInventoryCategories, deleteInventoryCategory, updateInventoryCategoriesOrder, archiveInventoryItems, getItemStocks } from "../actions";
import { exportToCSV } from "@/lib/export-utils";
import { EditCategoryDialog } from "../edit-category-dialog";
import { CategorySelect } from "../category-select";
import { AdjustStockDialog } from "../adjust-stock-dialog";
import { PremiumPagination } from "@/components/ui/premium-pagination";
import { StorageLocation } from "../storage-locations-tab";
import { StorageLocationSelect } from "@/components/ui/storage-location-select";
import { PremiumSelect } from "@/components/ui/premium-select";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";

import { AddCategoryDialog } from "../add-category-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useBranding } from "@/components/branding-provider";
import { ArchiveReasonDialog } from "../components/archive-reason-dialog";
import { LabelPrinterDialog } from "../components/LabelPrinterDialog";
import { PremiumCheckbox } from "@/components/ui/premium-checkbox";
import { createElement } from "react";
import { createPortal } from "react-dom";
import { getCategoryIcon, getColorStyles } from "../category-utils";

import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { Session } from "@/lib/auth";
import { pluralize } from "@/lib/pluralize";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

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
    const { currencySymbol } = useBranding();
    const { toast } = useToast();
    const [subCategories, setSubCategories] = useState<Category[]>(initialSubCategories);
    const [activeId, setActiveId] = useState<string | null>(null);
    const isMobile = useMediaQuery("(max-width: 767px)");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
            if ('data' in res && res.data) setAllCategories(res.data as Category[]);
        };
        init();
    }, []);



    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [filterStatus, setFilterStatus] = useState<"all" | "in" | "low" | "out">("all");
    const [filterStorage, setFilterStorage] = useState<string>("all"); // New warehouse filter
    const [currentPage, setCurrentPage] = useState(1);
    const [subCurrentPage, setSubCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const subsPerPage = 12;

    const itemCountsByStorage = useMemo(() => {
        const counts: Record<string, number> = {};
        items.forEach(item => {
            if (item.stocks && item.stocks.length > 0) {
                item.stocks.forEach((s) => {
                    if (s.quantity > 0) {
                        counts[s.storageLocationId] = (counts[s.storageLocationId] || 0) + 1;
                    }
                });
            }
        });
        return counts;
    }, [items]);

    // Extract unique legacy locations for filter dropdown
    // legacyLocations calculation removed

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
                (item.stocks && item.stocks.some((s) => s.storageLocationId === filterStorage && s.quantity > 0));

        return matchesSearch && matchesFilter && matchesStorage;
    }).sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

    // Reset page on filter/search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, filterStorage]);


    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    const subStartIndex = (subCurrentPage - 1) * subsPerPage;
    const currentSubCategories = subCategories.slice(subStartIndex, subStartIndex + subsPerPage);

    const handleDeleteItems = async (ids: string[]) => {
        setIsDeleting(true);
        try {
            const res = await deleteInventoryItems(ids);
            if (res?.success) {
                toast(`Удалено: ${ids.length} ${pluralize(ids.length, 'позиция', 'позиции', 'позиций')}`, "success");
                playSound("client_deleted");
                setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
                router.refresh();
            } else {
                toast(res?.error || "Ошибка при удалении", "error");
                playSound("notification_error");
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
                playSound("notification_success");
                setSelectedIds(prev => prev.filter(id => !selectedIds.includes(id)));
                setShowArchiveReason(false);
                router.refresh();
            } else {
                toast(res?.error || "Ошибка при архивации", "error");
                playSound("notification_error");
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
                playSound("client_deleted");
                router.refresh();
            } else {
                toast(res?.error || "Ошибка при удалении", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Произошла ошибка", "error");
        } finally {
            setIsDeleting(false);
            setDeletingCategory(null);
        }
    };

    const isAnyModalOpen =
        isBulkMoveOpen ||
        isBulkCategoryOpen ||
        isAdjustOpen ||
        showLabelDialog ||
        idsToDelete.length > 0 ||
        !!deletingCategory ||
        !!editingCategory ||
        showArchiveReason;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Group */}
            <div className="flex flex-row items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 sm:gap-5 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center shrink-0 group mr-1 sm:mr-2"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none truncate">{category.name}</h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {category.id !== "orphaned" && !category.parentId && (
                        <AddCategoryDialog
                            parentId={category.id}
                            buttonText="Добавить подкатегорию"
                            className="h-10 w-10 sm:h-11 sm:w-auto"
                        />
                    )}
                    <Button
                        onClick={() => {
                            const url = category.parentId
                                ? `/dashboard/warehouse/items/new?categoryId=${category.parentId}&subcategoryId=${category.id}`
                                : `/dashboard/warehouse/items/new?categoryId=${category.id}`;
                            router.push(url);
                        }}
                        className={cn(
                            "h-10 w-10 sm:h-11 sm:w-auto rounded-full sm:rounded-2xl p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center text-xs sm:text-sm border-none shadow-lg shadow-primary/20 transition-all active:scale-95"
                        )}
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Добавить позицию</span>
                    </Button>
                </div>
            </div>

            {/* Sub-header with Search and Filters */}
            <div className={cn(
                "crm-filter-tray w-full overflow-hidden flex flex-col lg:flex-row items-stretch lg:items-center p-1.5 rounded-[22px] gap-1 lg:gap-3",
                (isSearchExpanded && isMobile) ? "gap-0" : ""
            )}>
                {/* Search & Storage Group */}
                <div className={cn(
                    "flex items-center gap-2",
                    "w-full lg:w-auto lg:flex-1",
                    (isSearchExpanded && isMobile) ? "gap-0" : ""
                )}>
                    {/* Search Field */}
                    <div className={cn(
                        "relative transition-all duration-300 ease-in-out h-11",
                        (isSearchExpanded && isMobile) ? "flex-1 w-full" : "flex-1"
                    )}>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isMobile) setIsSearchExpanded(true);
                            }}
                            className={cn(
                                "absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center z-10 cursor-pointer transition-colors duration-300",
                                isSearchExpanded && "text-primary"
                            )}
                        >
                            <Search className={cn("w-4 h-4 transition-colors duration-300", isSearchExpanded ? "text-primary" : "text-slate-400")} />
                        </div>
                        <input
                            type="text"
                            placeholder={isSearchExpanded ? "Поиск по названию или артикулу..." : "Поиск..."}
                            value={searchQuery}
                            onFocus={() => setIsSearchExpanded(true)}
                            onBlur={() => {
                                if (!searchQuery) {
                                    setTimeout(() => setIsSearchExpanded(false), 200);
                                }
                            }}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "crm-filter-tray-search w-full h-full focus:outline-none min-w-0 transition-all duration-300 rouded-[16px]",
                                (isSearchExpanded && isMobile)
                                    ? "pl-11 pr-4 bg-white/50 rounded-[16px]"
                                    : "pl-11 pr-10 bg-white rounded-[16px] shadow-sm"
                            )}
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchQuery("");
                                    setIsSearchExpanded(false);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-300 hover:text-slate-600 transition-colors duration-300"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    {/* Storage Select - Hides on search expand (Mobile) */}
                    <div className={cn(
                        "transition-all duration-300 ease-in-out bg-white rounded-[16px] shadow-sm",
                        (isSearchExpanded && isMobile)
                            ? "w-0 flex-none opacity-0 invisible overflow-hidden border-none"
                            : "w-auto opacity-100 visible flex-1 sm:flex-none min-w-[140px]"
                    )}>
                        <PremiumSelect
                            options={[
                                { id: "all", title: "Все склады" },
                                ...storageLocations.map(loc => ({
                                    id: loc.id,
                                    title: loc.name,
                                    badge: itemCountsByStorage[loc.id] ? `${itemCountsByStorage[loc.id]} поз.` : undefined
                                }))
                            ]}
                            value={filterStorage}
                            onChange={setFilterStorage}
                            variant="minimal"
                            triggerClassName="border-none shadow-none bg-transparent h-11 w-full"
                            align="end"
                            className="w-full h-full"
                        />
                    </div>
                </div>

                <div className="hidden lg:block w-px h-6 bg-slate-300 mx-1 shrink-0" />

                {/* Status Pills Section */}
                <div className={cn(
                    "flex items-center gap-1.5 p-1 lg:p-0 rounded-2xl w-full lg:w-auto shrink-0 transition-all duration-500 ease-in-out lg:mt-0 max-h-20"
                )}>
                    {[
                        { id: "all", label: "Все", icon: Layers },
                        { id: "in", label: "В наличии", icon: CheckCircle2, color: "emerald" },
                        { id: "low", label: "Скоро закончится", icon: AlertTriangle, color: "amber" },
                        { id: "out", label: "Нет", icon: XCircle, color: "rose" }
                    ].map((f) => {
                        const isActive = filterStatus === f.id;
                        const StatusIcon = f.icon;
                        return (
                            <Button
                                key={f.id}
                                variant="ghost"
                                onClick={() => setFilterStatus(f.id as "all" | "in" | "low" | "out")}
                                className={cn(
                                    "crm-filter-tray-tab flex-1 lg:flex-none transition-all duration-300 text-[11px] sm:text-xs py-2 sm:py-0 px-2 sm:px-6 rounded-[16px] h-9 min-h-0 border-none hover:bg-transparent relative",
                                    isActive && "active"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeItemStatusTab"
                                        className="absolute inset-0 bg-primary rounded-[16px] z-0"
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    />
                                )}
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <StatusIcon className={cn(
                                        "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                                        isActive ? "text-white" : (f.color ? `text-${f.color}-500` : "text-slate-400")
                                    )} />
                                    <span className="hidden sm:inline whitespace-nowrap">{f.label}</span>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Subcategories Grid - Show if this is a parent category */}
            {
                subCategories.length > 0 && (
                    <div className="space-y-4 mt-8">
                        <div className="flex items-center gap-4 px-2">
                            <h2 className="text-sm font-bold text-slate-500">Подкатегории</h2>
                            <div className="h-px flex-1 bg-[#e2e8f0]" />
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {currentSubCategories.map((subcat) => (
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
                            {subCategories.length > subsPerPage && (
                                <div className="pt-4">
                                    <PremiumPagination
                                        currentPage={subCurrentPage}
                                        totalItems={subCategories.length}
                                        pageSize={subsPerPage}
                                        onPageChange={setSubCurrentPage}
                                        itemNames={['подкатегория', 'подкатегории', 'подкатегорий']}
                                    />
                                </div>
                            )}
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

            {/* Items Table Section */}
            <div className="space-y-4 mt-8">
                <div className="flex items-center gap-4 px-2">
                    <h2 className="text-sm font-bold text-slate-500">Позиции</h2>
                    <div className="h-px flex-1 bg-[#e2e8f0]" />
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
                        <ResponsiveDataView
                            data={currentItems}
                            renderTable={() => (
                                <div className="table-container">
                                    <table className="crm-table">
                                        <thead className="crm-thead">
                                            <tr>
                                                <th className="crm-th crm-td-selection">
                                                    <PremiumCheckbox
                                                        checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                                                        onChange={toggleSelectAll}
                                                        className="mx-auto"
                                                    />
                                                </th>
                                                <th className="crm-th">Товар</th>
                                                <th className="crm-th">Склад</th>
                                                {canSeeCost && <th className="crm-th crm-td-number">Себест.</th>}
                                                {canSeeCost && <th className="crm-th crm-td-number">Цена</th>}
                                                <th className="crm-th w-32 crm-td-number text-center">Резерв</th>
                                                <th className="crm-th w-32 crm-td-number text-center">Остаток</th>
                                                <th className="crm-th crm-td-actions">Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody className="crm-tbody">
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
                                                            "crm-tr-clickable",
                                                            isSelected && "crm-tr-selected"
                                                        )}
                                                    >
                                                        <td className="crm-td crm-td-selection" onClick={(e) => e.stopPropagation()}>
                                                            <PremiumCheckbox
                                                                checked={isSelected}
                                                                onChange={() => toggleSelectItem(item.id)}
                                                                className="mx-auto"
                                                            />
                                                        </td>
                                                        <td className="crm-td">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative">
                                                                    <ItemThumbnail item={item} />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-slate-900 leading-tight transition-colors">
                                                                        {item.name}
                                                                    </div>
                                                                    <div className="text-[10px] font-mono font-bold text-slate-400 mt-1 bg-slate-50 inline-block px-1.5 py-0.5 rounded-[4px]">
                                                                        {item.sku || "N/A"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="crm-td">
                                                            <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
                                                                {item.stocks?.filter(s => s.quantity > 0).map((s) => {
                                                                    const locName = storageLocations.find(l => l.id === s.storageLocationId)?.name || "N/A";
                                                                    return (
                                                                        <div key={s.storageLocationId} className="flex items-center gap-2 whitespace-nowrap">
                                                                            <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                                                                            <span>{locName}</span>
                                                                            <span className="text-slate-400">({s.quantity})</span>
                                                                        </div>
                                                                    );
                                                                }) || (
                                                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                                                            <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                                                                            <span>—</span>
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </td>
                                                        {canSeeCost && (
                                                            <td className="crm-td crm-td-number">
                                                                <span className="text-[11px] font-medium text-slate-400">
                                                                    {item.costPrice ? `${Number(item.costPrice).toLocaleString()} ${currencySymbol}` : "—"}
                                                                </span>
                                                            </td>
                                                        )}
                                                        {canSeeCost && (
                                                            <td className="crm-td crm-td-number">
                                                                <span className="text-sm font-bold text-slate-900">
                                                                    {item.sellingPrice ? `${Number(item.sellingPrice).toLocaleString()} ${currencySymbol}` : "—"}
                                                                </span>
                                                            </td>
                                                        )}
                                                        <td className="crm-td crm-td-number text-center">
                                                            <span className={cn(
                                                                "text-sm font-bold tabular-nums",
                                                                (item.reservedQuantity || 0) > 0 ? "text-amber-500" : "text-slate-300"
                                                            )}>
                                                                {item.reservedQuantity || 0}
                                                            </span>
                                                        </td>
                                                        <td className="crm-td crm-td-number text-center">
                                                            <div className="flex flex-col items-center gap-1.5 translate-x-2">
                                                                <div className={cn(
                                                                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold transition-all border shadow-sm shrink-0 whitespace-nowrap",
                                                                    isCritical ? "bg-rose-50 border-rose-100 text-rose-600 ring-2 ring-rose-500/5" :
                                                                        isLowStock ? "bg-amber-50 border-amber-100 text-amber-600 ring-2 ring-amber-500/5" :
                                                                            "bg-emerald-50 border-emerald-100 text-emerald-600"
                                                                )}>
                                                                    <div className={cn(
                                                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                                                        isCritical ? "bg-rose-500 animate-pulse" :
                                                                            isLowStock ? "bg-amber-500" :
                                                                                "bg-emerald-500"
                                                                    )} />
                                                                    <span className="tabular-nums">{available} {formatUnit(item.unit)}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="crm-td crm-td-actions" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center justify-end gap-1 transition-all">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handlePrintLabel(item)}
                                                                    className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-primary border border-slate-200"
                                                                    title="Печать"
                                                                >
                                                                    <Tag className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleOpenAdjust(item)}
                                                                    className="w-8 h-8 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10"
                                                                    title="Запас"
                                                                >
                                                                    <PlusSquare className="w-5 h-5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setIdsToDelete([item.id]);
                                                                    }}
                                                                    className="w-8 h-8 rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 border border-rose-100"
                                                                    title="Удалить"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                                                    className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-200"
                                                                    title="Открыть карточку"
                                                                >
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            renderCard={(item) => {
                                const isSelected = selectedIds.includes(item.id);
                                const available = item.quantity - (item.reservedQuantity || 0);
                                const isCritical = available <= (item.criticalStockThreshold || 0);
                                const isLowStock = !isCritical && available <= (item.lowStockThreshold || 10);
                                const mainStock = item.stocks?.find(s => s.quantity > 0) || item.stocks?.[0];
                                const locationName = mainStock ? storageLocations.find(l => l.id === mainStock.storageLocationId)?.name : null;

                                return (
                                    <div key={item.id}>
                                        <div
                                            className={cn(
                                                "group relative flex flex-col gap-3 p-4 transition-all duration-300 cursor-pointer active:scale-[0.98] rounded-3xl border border-slate-200/60 shadow-sm",
                                                isSelected ? "bg-primary/[0.03] border-primary/20 ring-4 ring-primary/5" : "bg-white hover:shadow-md"
                                            )}
                                            onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                                    <PremiumCheckbox
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectItem(item.id)}
                                                    />
                                                </div>
                                                <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative">
                                                    <ItemThumbnail item={item} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-black text-slate-900 truncate leading-tight mb-0.5">
                                                        {item.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                        <span className="bg-slate-50 px-1.5 py-0.5 rounded-[4px] font-mono">{item.sku || "N/A"}</span>
                                                        <span className="text-slate-200">•</span>
                                                        <span className={cn(
                                                            "px-1.5 py-0.5 rounded-full uppercase tracking-tighter text-[9px] font-black",
                                                            isCritical ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                                isLowStock ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                                    "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        )}>
                                                            {available} {formatUnit(item.unit)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {canSeeCost && (
                                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                                    <div className="flex items-center gap-1.5 min-w-0 max-w-[60%]">
                                                        {locationName ? (
                                                            <>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                                <span className="text-xs font-bold text-slate-500 truncate">
                                                                    {locationName}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs font-medium text-slate-400">Цена</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-900 whitespace-nowrap ml-2">
                                                        {item.sellingPrice ? `${Number(item.sellingPrice).toLocaleString()} ${currencySymbol}` : "—"}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        <div className="pt-2">
                            <PremiumPagination
                                currentPage={currentPage}
                                totalItems={filteredItems.length}
                                pageSize={itemsPerPage}
                                onPageChange={setCurrentPage}
                                itemNames={['позиция', 'позиции', 'позиций']}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center px-4 bg-slate-50/30 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 text-slate-300 shadow-sm">
                            {searchQuery ? <SearchX className="w-10 h-10" /> : <Package className="w-10 h-10" />}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            {searchQuery ? "Ничего не найдено" : "Категория пуста"}
                        </h2>
                        <p className="text-slate-500 max-w-[280px] font-medium leading-relaxed">
                            {searchQuery
                                ? `По запросу «${searchQuery}» товаров не найдено. Попробуйте изменить параметры поиска.`
                                : "В этой категории пока нет товаров. Нажмите «Добавить позицию», чтобы начать."}
                        </p>
                    </div>
                )}
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
                description={`Вы уверены, что хотите удалить подкатегорию «${deletingCategory?.name}»? Все товары в ней останутся без категории.`}
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

            {
                itemToPrint && (
                    <LabelPrinterDialog
                        item={itemToPrint}
                        isOpen={showLabelDialog}
                        onClose={() => setShowLabelDialog(false)}
                        attributeTypes={attributeTypes}
                        allAttributes={allAttributes}
                    />
                )
            }

            {/* Mass Actions Bar */}
            {
                mounted && createPortal(
                    <AnimatePresence>
                        {selectedIds.length > 0 && !isAnyModalOpen && (
                            <>
                                {/* Bottom Progressive Gradient Blur Overlay */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="fixed inset-x-0 bottom-0 h-80 pointer-events-none z-[100]"
                                    style={{
                                        maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                        WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                        background: 'linear-gradient(to top, #ffffff 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%)'
                                    }}
                                />

                                <motion.div
                                    initial={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                                    exit={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
                                    className="fixed bottom-10 left-1/2 z-[110] flex items-center bg-white p-1.5 md:p-2 gap-1.5 md:gap-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 w-[calc(100%-2rem)] md:w-auto overflow-x-auto no-scrollbar"
                                >
                                    <div className="flex items-center gap-2 md:gap-3 pl-1 shrink-0">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-[11px] md:text-sm font-bold text-white shrink-0">
                                            {selectedIds.length}
                                        </div>
                                        <span className="hidden lg:inline text-xs font-bold text-slate-500 whitespace-nowrap pr-1">Позиций</span>
                                    </div>

                                    <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

                                    <div className="flex items-center gap-0.5 md:gap-1 flex-1 justify-around md:justify-start">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsBulkMoveOpen(true)}
                                            className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full hover:bg-slate-100 transition-all group shrink-0"
                                            title="Переместить"
                                        >
                                            <MapPin className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                            <span className="hidden md:inline text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Переместить</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleBulkPrint}
                                            className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full hover:bg-slate-100 transition-all group shrink-0"
                                            title="Этикетки"
                                        >
                                            <Tag className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                            <span className="hidden md:inline text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Этикетки</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
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
                                                            return "";
                                                        }
                                                    },
                                                    { header: "Себестоимость", key: (item) => item.costPrice || 0 },
                                                    { header: "Цена продажи", key: (item) => item.sellingPrice || 0 }
                                                ]);
                                            }}
                                            className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full hover:bg-slate-100 transition-all group shrink-0"
                                            title="Экспорт"
                                        >
                                            <Download className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                            <span className="hidden md:inline text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Экспорт</span>
                                        </Button>

                                        <div className="w-px h-8 bg-slate-200 mx-1" />

                                        <Button
                                            variant="ghost"
                                            size="icon"
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
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedIds([])}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }

            <BulkMoveDialog
                isOpen={isBulkMoveOpen}
                selectedIds={selectedIds}
                storageLocations={storageLocations}
                onClose={() => setIsBulkMoveOpen(false)}
                onSuccess={() => {
                    setIsBulkMoveOpen(false);
                    setSelectedIds([]);
                    router.refresh();
                }}
            />

            {
                isBulkCategoryOpen && (
                    <BulkCategoryDialog
                        selectedIds={selectedIds}
                        categories={allCategories}
                        onClose={() => setIsBulkCategoryOpen(false)}
                        onSuccess={() => {
                            setIsBulkCategoryOpen(false);
                            setSelectedIds([]);
                            router.refresh();
                        }}
                    />
                )
            }

            {
                (adjustingItem || items.length > 0) && (
                    <AdjustStockDialog
                        item={adjustingItem || items[0]}
                        locations={storageLocations}
                        itemStocks={adjustingItemStocks}
                        user={user}
                        isOpen={isAdjustOpen}
                        onClose={() => {
                            setIsAdjustOpen(false);
                        }}
                    />
                )
            }
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
                "group crm-card p-6 cursor-pointer flex items-center justify-between relative overflow-hidden transition-all duration-500 shadow-sm !rounded-2xl sm:!rounded-[var(--radius)]",
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
            <div className="flex items-center gap-4 flex-1 relative z-10">
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
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
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
                "flex items-center gap-0.5 transition-all relative z-10",
                isDragging && "opacity-0"
            )}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onEdit?.();
                    }}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all p-0"
                    title="Редактировать"
                >
                    <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onDelete?.();
                    }}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all p-0"
                    title="Удалить"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:border-primary ml-1">
                    <ChevronRight className="w-3.5 h-3.5" />
                </div>
            </div>
        </>
    );
}

function BulkMoveDialog({ isOpen, selectedIds, storageLocations, onClose, onSuccess }: { isOpen: boolean, selectedIds: string[], storageLocations: StorageLocation[], onClose: () => void, onSuccess: () => void }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [targetLocationId, setTargetLocationId] = useState("");
    const [comment, setComment] = useState("");

    // Reset state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setTargetLocationId("");
            setComment("");
        }
    }, [isOpen]);

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
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Массовое перемещение"
            className="sm:max-w-md"
        >
            <div className="p-6 space-y-6">
                <div>
                    <p className="text-sm text-slate-500 font-medium">Перемещение {selectedIds.length} {pluralize(selectedIds.length, 'позиции', 'позиций', 'позиций')}</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 ml-1">Целевой склад</label>
                        <StorageLocationSelect
                            value={targetLocationId}
                            onChange={setTargetLocationId}
                            options={storageLocations}
                            placeholder="Выберите склад…"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 ml-1">Комментарий</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-24 p-4 rounded-[var(--radius)] border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:bg-white focus:border-primary transition-all resize-none"
                            placeholder="Причина перемещения…"
                        />
                    </div>

                    <Button
                        onClick={handleMove}
                        disabled={!targetLocationId || isLoading}
                        className="w-full h-11 btn-dark rounded-[var(--radius)] font-bold transition-all"
                    >
                        {isLoading ? "Перемещение…" : "Подтвердить перемещение"}
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
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
        <ResponsiveModal
            isOpen={true}
            onClose={onClose}
            title="Смена категории"
            description={`${selectedIds.length} поз. выбрано`}
            className="sm:max-w-md"
        >
            <div className="p-6 space-y-4">
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
                    className="w-full h-11 btn-dark rounded-[var(--radius)] font-bold transition-all"
                >
                    {isLoading ? "Обновление..." : "Сменить категорию"}
                </Button>
            </div>
        </ResponsiveModal>
    );
}
