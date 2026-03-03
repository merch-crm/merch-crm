"use client";

import { MapPin, User, Trash2, Pencil, Lock, GripVertical, Star } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { deleteStorageLocation, updateStorageLocationsOrder } from "./storage-actions";
import { useState, useEffect, memo, useRef } from "react";
import { EditStorageLocationDialog } from "./edit-storage-location-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/components/ui/toast";


export interface StorageLocation {
    id: string;
    name: string;
    address?: string | null;
    responsibleUserId?: string | null;
    description?: string | null;
    isSystem?: boolean;
    isDefault?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    responsibleUser?: {
        name: string;
    } | null;
    type: "warehouse" | "production" | "office";
    items?: StorageLocationItem[];
}

export interface StorageLocationItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    sku?: string | null;
    categoryId?: string | null;
    categoryName?: string | null;
}

interface StorageLocationsTabProps {
    locations: StorageLocation[];
    users: { id: string; name: string }[];
}

export function StorageLocationsTab({ locations, users }: StorageLocationsTabProps) {
    const [uiState, setUiState] = useState({
        editingLocation: null as StorageLocation | null,
        deleteId: null as string | null,
        deleteName: null as string | null,
        deleteIsSystem: false,
        deletePassword: "",
        isDeleting: false,
        activeId: null as string | null,
        dragLayout: { isWide: false, isExtraWide: false }
    });

    const [stableLayouts, setStableLayouts] = useState<Record<string, { isWide: boolean; isExtraWide: boolean }>>({});
    const cardLayoutsRef = useRef<Map<string, { isWide: boolean; isExtraWide: boolean }>>(new Map());

    const [dataState, setDataState] = useState({
        localLocations: locations,
        prevPropsLocations: locations
    });
    const { toast } = useToast();

    if (locations !== dataState.prevPropsLocations) {
        setDataState(prev => ({
            ...prev,
            prevPropsLocations: locations,
            localLocations: locations
        }));

        if (uiState.editingLocation) {
            const updated = locations.find(l => l.id === uiState.editingLocation?.id);
            if (updated && JSON.stringify(updated) !== JSON.stringify(uiState.editingLocation)) {
                setUiState(prev => ({ ...prev, editingLocation: updated }));
            }
        }
    }

    const handleDeleteClick = (e: React.MouseEvent, id: string, name: string, isSystem: boolean) => {
        e.stopPropagation();
        setUiState(prev => ({
            ...prev,
            deleteId: id,
            deleteName: name,
            deleteIsSystem: isSystem,
            deletePassword: ""
        }));
    };

    const handleConfirmDelete = async () => {
        if (!uiState.deleteId) return;
        setUiState(prev => ({ ...prev, isDeleting: true }));
        const res = await deleteStorageLocation(uiState.deleteId, uiState.deletePassword);
        setUiState(prev => ({ ...prev, isDeleting: false }));
        if (res.success) {
            toast("Локация удалена", "success");
        } else {
            toast(res.error || "Ошибка при удалении", "error");
        }
        setUiState(prev => ({
            ...prev,
            deleteId: null,
            deleteName: null,
            deleteIsSystem: false,
            deletePassword: ""
        }));
    };

    const handleEdit = (loc: StorageLocation) => {
        setUiState(prev => ({ ...prev, editingLocation: loc }));
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const id = event.active.id as string;
        const layout = cardLayoutsRef.current.get(id) || { isWide: false, isExtraWide: false };
        setUiState(prev => ({
            ...prev,
            activeId: id,
            dragLayout: layout
        }));
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setUiState(prev => ({ ...prev, activeId: null }));
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = dataState.localLocations.findIndex((l) => l.id === active.id);
            const newIndex = dataState.localLocations.findIndex((l) => l.id === over.id);

            const newOrder = arrayMove(dataState.localLocations, oldIndex, newIndex);
            setDataState(prev => ({ ...prev, localLocations: newOrder }));

            const itemsToUpdate = newOrder.map((loc, index) => ({
                id: loc.id,
                sortOrder: index + 1,
            }));

            const result = await updateStorageLocationsOrder(itemsToUpdate);
            if (!result.success) {
                setDataState(prev => ({ ...prev, localLocations: dataState.localLocations }));
                toast(result.error || "Не удалось обновить порядок", "error");
            }
        }
    };

    if (!dataState.localLocations.length) return (
        <EmptyState
            icon={MapPin}
            title="Места хранения не найдены"
            description="Добавьте первое место хранения для систематизации учета."
            className="py-20"
        />
    );

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={dataState.localLocations.map(l => l.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="flex flex-wrap items-stretch justify-center w-full gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000" data-testid="storage-list">
                        {dataState.localLocations.map((loc) => (
                            <div
                                key={loc.id}
                                className={cn(
                                    "transition-all duration-300 flex-grow",
                                    (stableLayouts[loc.id]?.isWide || (uiState.activeId && cardLayoutsRef.current.get(loc.id)?.isWide))
                                        ? "min-w-[500px] flex-[1_1_600px]"
                                        : "min-w-[300px] flex-[1_1_21%]"
                                )}
                            >
                                <SortableLocationCard
                                    loc={loc}
                                    isAnyDragging={!!uiState.activeId}
                                    isWide={stableLayouts[loc.id]?.isWide}
                                    isExtraWide={stableLayouts[loc.id]?.isExtraWide}
                                    onLayoutChange={(id, wide, extraWide) => {
                                        cardLayoutsRef.current.set(id, { isWide: wide, isExtraWide: extraWide });
                                        if (stableLayouts[id]?.isWide !== wide || stableLayouts[id]?.isExtraWide !== extraWide) {
                                            setStableLayouts(prev => ({ ...prev, [id]: { isWide: wide, isExtraWide: extraWide } }));
                                        }
                                    }}
                                    onDeleteClick={(e: React.MouseEvent) => handleDeleteClick(e, loc.id, loc.name, loc.isSystem || false)}
                                    onClick={() => handleEdit(loc)}
                                />
                            </div>
                        ))}
                    </div>
                </SortableContext>
                <DragOverlay adjustScale={false} dropAnimation={{
                    duration: 250,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {uiState.activeId ? (
                        <div className="w-full h-full pointer-events-none z-[100]">
                            <div className="bg-white border border-primary/40 rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-primary/20 overflow-hidden">
                                <LocationCardContent
                                    loc={dataState.localLocations.find(l => l.id === uiState.activeId)!}
                                    isOverlay
                                />
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <ConfirmDialog
                isOpen={!!uiState.deleteId}
                onClose={() => setUiState(prev => ({ ...prev, deleteId: null }))}
                onConfirm={handleConfirmDelete}
                isLoading={uiState.isDeleting}
                title="Удалить локацию?"
                description={`Локация «${uiState.deleteName}» будет удалена. Данное действие необратимо.`}
                confirmText="Удалить"
                variant="destructive"
            >
                {uiState.deleteIsSystem && (
                    <div className="p-4 bg-rose-50 rounded-[var(--radius-inner)] border border-rose-100 text-left">
                        <div className="flex items-center gap-2 text-rose-600 mb-3">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm font-semibold">Системная защита</span>
                        </div>
                        <Input
                            type="password"
                            value={uiState.deletePassword}
                            onChange={(e) => setUiState(prev => ({ ...prev, deletePassword: e.target.value }))}
                            placeholder="Пароль администратора"
                            className="h-11 rounded-[var(--radius-inner)] border-2 border-rose-100 focus:border-rose-300 font-medium text-slate-900 placeholder:text-rose-200 text-sm"
                            autoFocus
                        />
                    </div>
                )}
            </ConfirmDialog>

            <EditStorageLocationDialog
                users={users}
                locations={locations}
                location={uiState.editingLocation || locations[0]}
                isOpen={!!uiState.editingLocation}
                onClose={() => setUiState(prev => ({ ...prev, editingLocation: null }))}
            />
        </>
    );
}

interface SortableLocationCardProps {
    loc: StorageLocation;
    isAnyDragging?: boolean;
    isWide?: boolean;
    isExtraWide?: boolean;
    onLayoutChange?: (id: string, isWide: boolean, isExtraWide: boolean) => void;
    onEdit?: (e: React.MouseEvent) => void;
    onDeleteClick?: (e: React.MouseEvent) => void;
    onClick: () => void;
}

const LocationCardContent = memo(({
    loc,
    onEdit,
    onDeleteClick,
    dragHandleProps,
    isOverlay
}: {
    loc: StorageLocation;
    onEdit?: (e: React.MouseEvent) => void;
    onDeleteClick?: (e: React.MouseEvent) => void;
    dragHandleProps?: Record<string, unknown>;
    isOverlay?: boolean;
}) => {
    const totalItemsInLoc = loc.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
    const isBrak = loc.name.toLowerCase().includes("брак");
    const isDefault = loc.isDefault || false;

    const grouped = loc.items?.reduce((acc: Record<string, { count: number, name: string }>, item) => {
        if (item.quantity > 0) {
            const catId = item.categoryId || "other";
            const catName = item.categoryName || "Прочее";
            if (!acc[catId]) acc[catId] = { count: 0, name: catName };
            acc[catId].count += item.quantity;
        }
        return acc;
    }, {}) || {};

    const categoriesList = Object.values(grouped).sort((a, b) => b.count - a.count).slice(0, 4);
    const total = Object.values(grouped).reduce((sum, i) => sum + i.count, 0) || 1;

    return (
        <div className={cn(
            "group relative flex flex-col transition-all duration-300 overflow-hidden h-full min-h-[380px] crm-card shadow-sm p-5",
            !loc.isActive && loc.isActive !== undefined && "opacity-60 grayscale-[0.5]",
            isOverlay ? "!border-primary !shadow-crm-xl z-[100]" :
                isDefault
                    ? "!border-primary/20 ring-4 ring-primary/5 shadow-crm-lg"
                    : isBrak
                        ? "!bg-rose-50/30 !border-rose-100"
                        : ""
        )}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1 sm:gap-3 min-w-0">
                    <div role="button" tabIndex={0}
                        {...dragHandleProps}
                        className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-primary cursor-grab active:cursor-grabbing transition-colors rounded-[var(--radius-inner)] hover:bg-slate-50 mr-[-4px] sm:mr-[-8px] z-30"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                    <span className={cn(
                        "text-xs sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-[4px] sm:rounded-[6px] border truncate shrink-0",
                        loc.type === "warehouse" ? "bg-purple-50 text-purple-600 border-purple-100" :
                            loc.type === "production" ? "bg-orange-50 text-orange-600 border-orange-100" :
                                loc.type === "office" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    "bg-slate-50 text-slate-500 border-slate-200"
                    )}>
                        {loc.type === "warehouse" ? "Склад" :
                            loc.type === "production" ? "Производство" :
                                loc.type === "office" ? "Офис" : "Склад"}
                    </span>
                </div>
                <div className={cn(
                    "w-7 h-7 sm:w-12 sm:h-12 rounded-[var(--radius-inner)] flex items-center justify-center transition-all duration-500 shrink-0",
                    isDefault ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-400"
                )}>
                    <MapPin className="w-3.5 h-3.5 sm:w-6 sm:h-6" />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center py-1 sm:py-4">
                <div className="text-3xl sm:text-6xl font-bold text-slate-900 tabular-nums">
                    {totalItemsInLoc}
                </div>
                <div className="text-xs sm:text-xs font-bold text-slate-400 flex items-center gap-2">
                    <span className="truncate">единиц</span>
                    <div className="h-px flex-1 bg-slate-50" />
                </div>
            </div>

            <div className="space-y-3 sm:space-y-3 mt-auto">
                <div className="space-y-0.5 sm:space-y-2">
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-base sm:text-2xl font-bold text-slate-900 leading-tight truncate">
                            {loc.name} {(!loc.isActive && loc.isActive !== undefined) && <span className="text-slate-400 text-xs sm:text-sm font-medium">(Арх)</span>}
                        </h3>

                        {loc.isDefault && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary shrink-0" />}
                        {loc.isSystem && <Lock className="w-2 h-2 sm:w-3 sm:h-3 text-slate-300 shrink-0" />}
                    </div>
                    <p className="text-xs sm:text-xs font-bold text-slate-400 truncate">
                        {loc.address || "Адрес не указан"}
                    </p>
                </div>

                {categoriesList.length > 0 && (
                    <div className="space-y-1.5 pt-2 sm:pt-4 border-t border-slate-200">
                        <div className="flex h-1 rounded-full overflow-hidden bg-slate-50/50 w-full mb-0.5 sm:mb-1">
                            {categoriesList.map((cat, idx) => {
                                const percent = (cat.count / total) * 100;
                                const colors = ["bg-primary", "bg-slate-700", "bg-slate-400", "bg-slate-200"];
                                if (isBrak) colors[0] = "bg-rose-500";
                                return (
                                    <div
                                        key={idx}
                                        style={{ width: `${percent}%` }}
                                        className={cn("h-full", colors[idx % colors.length])}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {categoriesList.slice(0, 1).map((cat, idx) => (
                                <span key={idx} className="text-xs sm:text-xs font-bold text-slate-400 truncate">
                                    {cat.name}: <span className="text-slate-900 tabular-nums">{cat.count}</span>
                                </span>
                            ))}
                            {categoriesList.length > 1 && (
                                <span className="text-xs sm:text-xs font-bold text-slate-300 hidden sm:inline">
                                    +{categoriesList.length - 1} еще
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 sm:pt-4 transition-all">
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                            <User className="w-2 sm:w-3 sm:h-3 text-slate-400" />
                        </div>
                        <span className="text-xs sm:text-xs font-bold text-slate-500 truncate">
                            {loc.responsibleUser?.name || "Нет отв."}
                        </span>
                    </div>

                    {!isOverlay && (
                        <div className="flex gap-1.5 sm:gap-2 shrink-0 z-30">
                            <button type="button"
                                onClick={(e) => { e.stopPropagation(); onEdit?.(e); }}
                                className="p-1.5 sm:p-2.5 rounded-[var(--radius-inner)] bg-slate-50 text-slate-400 hover:bg-primary/5 hover:text-primary transition-all border border-slate-200"
                            >
                                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            {!loc.isSystem && (
                                <button type="button"
                                    onClick={(e) => { e.stopPropagation(); onDeleteClick?.(e); }}
                                    className="p-1.5 sm:p-2.5 rounded-[var(--radius-inner)] bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all border border-rose-100"
                                >
                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

LocationCardContent.displayName = "LocationCardContent";

const SortableLocationCard = memo(({
    loc,
    isAnyDragging,
    isWide: isWideProp,
    isExtraWide: isExtraWideProp,
    onLayoutChange,
    onEdit,
    onDeleteClick,
    onClick
}: SortableLocationCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isWideRef = useRef(isWideProp ?? false);
    const isExtraWideRef = useRef(isExtraWideProp ?? false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: loc.id });

    useEffect(() => {
        if (!cardRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                const wide = width > 380;
                const extraWide = width > 930;

                if (isDragging || isAnyDragging) {
                    isWideRef.current = wide;
                    isExtraWideRef.current = extraWide;
                    return;
                }

                if (isWideRef.current !== wide || isExtraWideRef.current !== extraWide) {
                    isWideRef.current = wide;
                    isExtraWideRef.current = extraWide;
                    onLayoutChange?.(loc.id, wide, extraWide);
                }
            }
        });

        observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [isDragging, isAnyDragging, loc.id, onLayoutChange]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    // { ... } (removed unused variables)

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onClick}
            className={cn(
                "group relative bg-white border border-slate-200/60 rounded-[28px] sm:rounded-[32px] overflow-hidden transition-all duration-300 h-full",
                "hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:border-slate-300/80 cursor-pointer",
                isDragging ? "shadow-2xl ring-2 ring-primary/20 scale-[1.02] z-50 border-primary/30" : "shadow-sm"
            )}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
        >
            <LocationCardContent
                loc={loc}
                onEdit={onEdit}
                onDeleteClick={onDeleteClick}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
});

SortableLocationCard.displayName = "SortableLocationCard";
