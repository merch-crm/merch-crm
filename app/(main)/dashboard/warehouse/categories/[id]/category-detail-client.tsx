"use client";

import { useMemo } from "react";
import { SearchX, Package } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

import { updateInventoryCategoriesOrder } from "../../category-actions";
import { Pagination } from "@/components/ui/pagination";
import { StorageLocation } from "../../storage-locations-tab";

import { useBranding } from "@/components/branding-provider";
import type { Session } from "@/lib/session";
import { pluralize } from "@/lib/pluralize";

import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    TouchSensor,
    DragStartEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import type {
    InventoryItem, Category, InventoryAttribute, AttributeType,
    MeasurementUnit, ItemStock, ItemHistoryTransaction, ActiveOrderItem,
    InventoryFilters, ThumbnailSettings, ProductLineWithStats
} from "../../types";

import { CategoryFilters } from "./components/CategoryFilters";
import { CategoryItemsList } from "./components/CategoryItemsList";
import { CategoryHeader } from "./components/CategoryHeader";
import { SubCategoriesSection } from "./components/SubCategoriesSection";
import { MassActionsBar } from "./components/MassActionsBar";

import { useCategoryDetail } from "./hooks/use-category-detail";
import dynamic from "next/dynamic";

const AdjustStockDialog = dynamic(() => import("../../adjust-stock-dialog").then(m => m.AdjustStockDialog), { ssr: false });
const EditCategoryDialog = dynamic(() => import("../../edit-category-dialog").then(m => m.EditCategoryDialog), { ssr: false });
const ConfirmDialog = dynamic(() => import("@/components/ui/confirm-dialog").then(m => m.ConfirmDialog), { ssr: false });
const ArchiveReasonDialog = dynamic(() => import("../../components/archive-reason-dialog").then(m => m.ArchiveReasonDialog), { ssr: false });
const LabelPrinterDialog = dynamic(() => import("../../components/LabelPrinterDialog").then(m => m.LabelPrinterDialog), { ssr: false });
const BulkMoveDialog = dynamic(() => import("./components/CategoryBulkDialogs").then(m => m.BulkMoveDialog), { ssr: false });
const BulkCategoryDialog = dynamic(() => import("./components/CategoryBulkDialogs").then(m => m.BulkCategoryDialog), { ssr: false });

export type { InventoryItem, Category, ThumbnailSettings, InventoryAttribute, AttributeType, MeasurementUnit, ItemStock, ItemHistoryTransaction, ActiveOrderItem, InventoryFilters };

interface CategoryDetailClientProps {
    category: Category;
    parentCategory?: Category;
    subCategories?: Category[];
    items: InventoryItem[];
    totalItems: number;
    currentPage: number;
    storageLocations?: StorageLocation[];
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    lines?: ProductLineWithStats[];
    user: Session | null;
}

export function CategoryDetailClient({
    category,
    parentCategory,
    subCategories: initialSubCategories = [],
    items = [],
    totalItems,
    storageLocations = [],
    attributeTypes = [],
    allAttributes = [],
    lines = [],
    user
}: CategoryDetailClientProps) {
    const {
        subCategories, setSubCategories,
        allCategories,
        ui, setUi,
        filters, setFilters,
        dialogs, setDialogs,
        updateUrl,
        toggleSelectItem,
        toggleSelectAll,
        handlePrintLabel,
        handleBulkPrint,
        handleOpenAdjust,
        handleDeleteItems,
        handleArchiveItems,
        handleDeleteCategory,
        searchParams,
        router,
        toast
    } = useCategoryDetail(category, parentCategory, initialSubCategories, items);

    const { currencySymbol } = useBranding();
    const isMobile = useMediaQuery("(max-width: 767px)");

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
        setUi(prev => ({ ...prev, activeId: event.active.id as string }));
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setUi(prev => ({ ...prev, activeId: null }));
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
                if (!res.success) {
                    toast(res.error || "Ошибка", "error");
                    setSubCategories(initialSubCategories);
                }
            } catch {
                toast("Ошибка при сохранении порядка", "error");
                setSubCategories(initialSubCategories);
            }
        }
    };

    const itemsPerPage = 20;
    const subsPerPage = 12;

    const itemCountsByStorage = useMemo(() => {
        const counts: Record<string, number> = {};
        (items || []).forEach(item => {
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

    const canSeeCost = user?.roleName === 'Администратор' || user?.roleName === 'Руководство' || user?.departmentName === 'Отдел продаж';

    const subStartIndex = (ui.subCurrentPage - 1) * subsPerPage;
    const currentSubCategories = subCategories.slice(subStartIndex, subStartIndex + subsPerPage);

    const groupedData = useMemo(() => {
        const linesMap = new Map(lines.map(l => [l.id, l]));
        const lineGroups: Record<string, InventoryItem[]> = {};
        const standalone: InventoryItem[] = [];

        (items || []).forEach(item => {
            const lineId = item.productLineId;
            if (lineId) {
                if (!lineGroups[lineId]) lineGroups[lineId] = [];
                lineGroups[lineId].push(item);
            } else {
                standalone.push(item);
            }
        });

        const groups: { id: string | null; name: string; items: InventoryItem[]; type?: string; isCollection?: boolean }[] = [];

        // Add groups for lines
        Object.entries(lineGroups).forEach(([lineId, lineItems]) => {
            const line = linesMap.get(lineId);
            const isCollection = line?.type === 'finished' && !!line.printCollectionId;

            groups.push({
                id: lineId,
                name: line?.name || "Линейка",
                items: lineItems,
                type: line?.type,
                isCollection
            });
        });

        // Standalone group
        if (standalone.length > 0) {
            groups.push({
                id: null,
                name: "Позиции",
                items: standalone
            });
        }

        return groups;
    }, [items, lines]);

    const isAnyModalOpen =
        dialogs.massActions.isBulkMoveOpen ||
        dialogs.massActions.isBulkCategoryOpen ||
        dialogs.adjust.isOpen ||
        dialogs.label.isOpen ||
        dialogs.delete.ids.length > 0 ||
        !!dialogs.delete.category ||
        !!dialogs.edit.category ||
        dialogs.massActions.showArchiveReason;

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Group */}
            <CategoryHeader
                category={category}
                mounted={ui.mounted}
            />

            {/* Sub-header with Search and Filters */}
            <CategoryFilters
                searchQuery={filters.search}
                setSearchQuery={(val) => setFilters(prev => ({ ...prev, search: val }))}
                isSearchExpanded={ui.isSearchExpanded}
                setIsSearchExpanded={(val) => setUi(prev => ({ ...prev, isSearchExpanded: val }))}
                filterStorage={filters.storage}
                setFilterStorage={(val) => setFilters(prev => ({ ...prev, storage: val }))}
                filterStatus={filters.status}
                setFilterStatus={(val) => setFilters(prev => ({ ...prev, status: val as (typeof filters)["status"] }))}
                storageLocations={storageLocations}
                itemCountsByStorage={itemCountsByStorage}
                isMobile={!!isMobile}
            />

            {/* Subcategories Grid - Show if this is a parent category */}
            <SubCategoriesSection
                data={{
                    subCategories,
                    currentSubCategories,
                    subsPerPage,
                    subCurrentPage: ui.subCurrentPage,
                    activeId: ui.activeId,
                }}
                handlers={{
                    setSubCurrentPage: (page) => setUi(prev => ({ ...prev, subCurrentPage: page })),
                    handleDragStart,
                    handleDragEnd,
                    setActiveId: (id) => setUi(prev => ({ ...prev, activeId: id })),
                    setEditingCategory: (cat) => setDialogs(prev => ({ ...prev, edit: { ...prev.edit, category: cat } })),
                    setDeletingCategory: (cat) => setDialogs(prev => ({ ...prev, delete: { ...prev.delete, category: cat } })),
                }}
                config={{
                    sensors,
                    router,
                }}
            />


            {/* Items Table Section */}
            <div className="space-y-3 mt-8">
                {dialogs.massActions.showArchiveReason && (
                    <ArchiveReasonDialog
                        isOpen={dialogs.massActions.showArchiveReason}
                        onClose={() => setDialogs(prev => ({ ...prev, massActions: { ...prev.massActions, showArchiveReason: false } }))}
                        onConfirm={handleArchiveItems}
                        itemCount={ui.selectedIds.length}
                        isLoading={ui.isDeleting}
                    />
                )}

                {totalItems > 0 ? (
                    <div className="space-y-3">
                        {groupedData.map((group) => (
                            <div key={group.id || 'standalone'} className="space-y-3">
                                <div className="flex items-center gap-3 px-2">
                                    <h2 className="text-sm font-bold text-slate-500">
                                        {group.isCollection ? `Коллекция «${group.name}»` :
                                            group.id ? (group.name === 'Линейка' || !group.name ? 'Линейка' : `Линейка «${group.name}»`) :
                                                group.name}
                                    </h2>
                                    <div className="h-px flex-1 bg-[#e2e8f0]" />
                                </div>

                                <CategoryItemsList
                                    items={group.items}
                                    selectedIds={ui.selectedIds}
                                    toggleSelectAll={toggleSelectAll}
                                    toggleSelectItem={(id) => toggleSelectItem(id)}
                                    canSeeCost={!!canSeeCost}
                                    currencySymbol={currencySymbol || ""}
                                    storageLocations={storageLocations}
                                    handlePrintLabel={handlePrintLabel}
                                    handleOpenAdjust={handleOpenAdjust}
                                    setIdsToDelete={(ids) => setDialogs(prev => ({ ...prev, delete: { ...prev.delete, ids } }))}
                                />
                            </div>
                        ))}

                        <div className="pt-2">
                            <Pagination
                                currentPage={Number(searchParams.get("page")) || 1}
                                totalItems={totalItems}
                                pageSize={itemsPerPage}
                                onPageChange={(page) => updateUrl({ page: page.toString() })}
                                itemNames={['позиция', 'позиции', 'позиций']}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center px-4 bg-slate-50/30 rounded-[var(--radius-outer)] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 text-slate-300 shadow-sm">
                            {filters.search ? <SearchX className="w-10 h-10" /> : <Package className="w-10 h-10" />}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            {filters.search ? "Ничего не найдено" : "Категория пуста"}
                        </h2>
                        <p className="text-slate-500 max-w-[280px] font-medium leading-relaxed">
                            {filters.search
                                ? `По запросу «${filters.search}» товаров не найдено. Попробуйте изменить параметры поиска.`
                                : "В этой категории пока нет товаров. Нажмите «Добавить позицию», чтобы начать."}
                        </p>
                    </div>
                )}
            </div>

            {ui.mounted && (
                <>
                    <ConfirmDialog
                        isOpen={dialogs.delete.ids.length > 0}
                        onClose={() => setDialogs(prev => ({ ...prev, delete: { ...prev.delete, ids: [] } }))}
                        onConfirm={() => handleDeleteItems(dialogs.delete.ids)}
                        title={"Удаление" + pluralize(dialogs.delete.ids.length, 'позиции', 'позиций', 'позиций')}
                        description={"Вы уверены, что хотите удалить" + pluralize(dialogs.delete.ids.length, 'выбранную позицию', 'выбранные позиции', 'выбранные позиции') + " (" + dialogs.delete.ids.length + ")? Это действие нельзя отменить."}
                        confirmText="Удалить"
                        variant="destructive"
                        isLoading={ui.isDeleting}
                    />

                    <ConfirmDialog
                        isOpen={!!dialogs.delete.category}
                        onClose={() => setDialogs(prev => ({ ...prev, delete: { ...prev.delete, category: null } }))}
                        onConfirm={() => dialogs.delete.category && handleDeleteCategory(dialogs.delete.category.id)}
                        title="Удаление подкатегории"
                        description={`Вы уверены, что хотите удалить подкатегорию «${dialogs.delete.category?.name}»? Все товары в ней останутся без категории.`}
                        confirmText="Удалить"
                        variant="destructive"
                        isLoading={ui.isDeleting}
                    />

                    {dialogs.edit.category && (
                        <EditCategoryDialog
                            category={dialogs.edit.category}
                            categories={allCategories}
                            user={user}
                            isOpen={!!dialogs.edit.category}
                            onClose={() => setDialogs(prev => ({ ...prev, edit: { ...prev.edit, category: null } }))}
                        />
                    )}

                    {dialogs.label.item && (
                        <LabelPrinterDialog
                            item={dialogs.label.item}
                            isOpen={dialogs.label.isOpen}
                            onClose={() => setDialogs(prev => ({ ...prev, label: { ...prev.label, isOpen: false } }))}
                            attributeTypes={attributeTypes}
                            allAttributes={allAttributes}
                        />
                    )}

                    <MassActionsBar
                        selectedIds={ui.selectedIds}
                        setSelectedIds={(val: string[] | ((prev: string[]) => string[])) => {
                            if (typeof val === 'function') {
                                setUi(prev => ({ ...prev, selectedIds: val(prev.selectedIds) }));
                            } else {
                                setUi(prev => ({ ...prev, selectedIds: val }));
                            }
                        }}
                        items={items || []}
                        storageLocations={storageLocations}
                        isAnyModalOpen={isAnyModalOpen}
                        onBulkMove={() => setDialogs(prev => ({ ...prev, massActions: { ...prev.massActions, isBulkMoveOpen: true } }))}
                        onBulkPrint={handleBulkPrint}
                        onArchive={() => setDialogs(prev => ({ ...prev, massActions: { ...prev.massActions, showArchiveReason: true } }))}
                        toast={toast}
                    />

                    <BulkMoveDialog
                        isOpen={dialogs.massActions.isBulkMoveOpen}
                        selectedIds={ui.selectedIds}
                        storageLocations={storageLocations}
                        onClose={() => setDialogs(prev => ({ ...prev, massActions: { ...prev.massActions, isBulkMoveOpen: false } }))}
                        onSuccess={() => {
                            setDialogs(prev => ({ ...prev, massActions: { ...prev.massActions, isBulkMoveOpen: false } }));
                            setUi(prev => ({ ...prev, selectedIds: [] }));
                            router.refresh();
                        }}
                    />

                    {dialogs.massActions.isBulkCategoryOpen && (
                        <BulkCategoryDialog
                            isOpen={dialogs.massActions.isBulkCategoryOpen}
                            selectedIds={ui.selectedIds}
                            categories={allCategories}
                            onClose={() => setDialogs(prev => ({ ...prev, massActions: { ...prev.massActions, isBulkCategoryOpen: false } }))}
                            onSuccess={() => {
                                setDialogs(prev => ({ ...prev, massActions: { ...prev.massActions, isBulkCategoryOpen: false } }));
                                setUi(prev => ({ ...prev, selectedIds: [] }));
                                router.refresh();
                            }}
                        />
                    )}

                    {(dialogs.adjust.item || (items?.length || 0) > 0) && (
                        <AdjustStockDialog
                            item={dialogs.adjust.item || (items || [])[0]}
                            locations={storageLocations}
                            itemStocks={dialogs.adjust.stocks}
                            user={user}
                            isOpen={dialogs.adjust.isOpen}
                            onClose={() => {
                                setDialogs(prev => ({ ...prev, adjust: { ...prev.adjust, isOpen: false } }));
                            }}
                        />
                    )}

                </>
            )}
        </div >
    );
}
