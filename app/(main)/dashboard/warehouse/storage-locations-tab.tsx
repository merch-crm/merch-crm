"use client";

import { MapPin, User, Trash2, Pencil, Lock, GripVertical, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteStorageLocation, updateStorageLocationsOrder } from "./actions";
import { useState, useEffect, memo } from "react";
import { EditStorageLocationDialog } from "./edit-storage-location-dialog";
import { BottomSheet } from "@/components/ui/bottom-sheet";
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
    items?: Array<{
        id: string;
        name: string;
        quantity: number;
        unit: string;
        sku?: string | null;
        categoryId?: string | null;
        categoryName?: string | null;
    }>;
}

interface StorageLocationsTabProps {
    locations: StorageLocation[];
    users: { id: string; name: string }[];
}

export function StorageLocationsTab({ locations, users }: StorageLocationsTabProps) {
    const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteName, setDeleteName] = useState<string | null>(null);
    const [deleteIsSystem, setDeleteIsSystem] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [localLocations, setLocalLocations] = useState(locations);
    const [prevPropsLocations, setPrevPropsLocations] = useState(locations);

    // State during render pattern for synchronizing props with local state
    if (locations !== prevPropsLocations) {
        setPrevPropsLocations(locations);
        setLocalLocations(locations);

        // Sync editing location if it changed in props
        if (editingLocation) {
            const updated = locations.find(l => l.id === editingLocation.id);
            if (updated && JSON.stringify(updated) !== JSON.stringify(editingLocation)) {
                setEditingLocation(updated);
            }
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const handleDeleteClick = (e: React.MouseEvent, id: string, name: string, isSystem: boolean) => {
        e.stopPropagation();
        setDeleteId(id);
        setDeleteName(name);
        setDeleteIsSystem(isSystem);
        setDeletePassword("");
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        await deleteStorageLocation(deleteId, deletePassword);
        setIsDeleting(false);
        setDeleteId(null);
        setDeleteName(null);
        setDeleteIsSystem(false);
        setDeletePassword("");
    };

    const handleEdit = (e: React.MouseEvent, loc: StorageLocation) => {
        e.stopPropagation();
        setEditingLocation(loc);
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
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = localLocations.findIndex((l) => l.id === active.id);
            const newIndex = localLocations.findIndex((l) => l.id === over.id);

            const newOrder = arrayMove(localLocations, oldIndex, newIndex);
            setLocalLocations(newOrder);

            const itemsToUpdate = newOrder.map((loc, index) => ({
                id: loc.id,
                sortOrder: index + 1,
            }));

            const result = await updateStorageLocationsOrder(itemsToUpdate);
            if (!result.success) {
                setLocalLocations(localLocations);
                alert(result.error || "Failed to update order");
            }
        }
    };

    if (localLocations.length === 0) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-center px-4 crm-card shadow-sm">
                <div className="w-20 h-20 bg-white rounded-[var(--radius-inner)] flex items-center justify-center mb-6 text-slate-300 shadow-sm ring-1 ring-slate-200">
                    <MapPin className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 leading-none">Места хранения не найдены</h2>
                <p className="text-slate-400 text-xs font-medium max-w-[280px] leading-relaxed">
                    Добавьте первое место хранения для систематизации учета.
                </p>
            </div>
        );
    }

    if (!mounted) return null;

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={localLocations.map(l => l.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-[var(--crm-grid-gap)] animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        {localLocations.map((loc) => (
                            <SortableLocationCard
                                key={loc.id}
                                loc={loc}
                                onEdit={(e: React.MouseEvent) => handleEdit(e, loc)}
                                onDeleteClick={(e: React.MouseEvent) => handleDeleteClick(e, loc.id, loc.name, loc.isSystem || false)}
                                onClick={() => setEditingLocation(loc)}
                            />
                        ))}
                    </div>
                </SortableContext>
                <DragOverlay adjustScale={true}>
                    {activeId ? (
                        <div className="w-full h-full pointer-events-none">
                            <LocationCardContent
                                loc={localLocations.find(l => l.id === activeId)!}
                                isOverlay
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Mobile/Tablet Delete BottomSheet */}
            <div className="lg:hidden">
                <BottomSheet
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    title="Удалить локацию?"
                >
                    <div className="px-6 space-y-6 pt-2 pb-6">
                        <div className="w-16 h-16 bg-rose-50 rounded-[var(--radius-inner)] flex items-center justify-center mx-auto mb-2 text-rose-500 border border-rose-100">
                            <Trash2 className="w-8 h-8" />
                        </div>

                        <p className="text-slate-500 text-sm font-medium leading-relaxed text-center">
                            Локация &quot;{deleteName}&quot; будет удалена. Данное действие необратимо.
                        </p>

                        {deleteIsSystem && (
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                <div className="flex items-center gap-2 text-rose-600 mb-3">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Системная защита</span>
                                </div>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Пароль администратора"
                                    className="w-full h-12 px-5 rounded-xl border-2 border-rose-100 focus:outline-none focus:border-rose-300 transition-all font-medium text-slate-900 placeholder:text-rose-200 text-sm"
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="px-5 pb-6">
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="h-12 w-full btn-destructive rounded-[var(--radius-inner)] font-bold text-sm transition-all shadow-lg active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
                            >
                                {isDeleting ? "Удаление..." : "Удалить локацию"}
                            </button>
                        </div>
                    </div>
                </BottomSheet>
            </div>

            {/* Desktop Delete Dialog */}
            {deleteId && (
                <div className="hidden lg:flex fixed inset-0 z-[100] items-center justify-center p-4" role="dialog" aria-modal="true" data-dialog-open="true">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setDeleteId(null)}
                    />
                    <div className="relative w-full max-w-md bg-white rounded-[var(--radius-outer)] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8 text-center">
                        <div className="w-16 h-16 bg-rose-50 rounded-[var(--radius-inner)] flex items-center justify-center mx-auto mb-6 text-rose-500">
                            <Trash2 className="w-8 h-8" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Удалить локацию?
                        </h2>

                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                            Локация &quot;{deleteName}&quot; будет удалена. Данное действие необратимо.
                        </p>

                        {deleteIsSystem && (
                            <div className="mb-6 p-4 bg-rose-50 rounded-[var(--radius-inner)] border border-rose-100">
                                <div className="flex items-center gap-2 text-rose-600 mb-3">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Системная защита</span>
                                </div>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Пароль от своей учетной записи"
                                    className="w-full h-11 px-5 rounded-[var(--radius-inner)] border-2 border-rose-100 focus:outline-none focus:border-rose-300 transition-all font-medium text-slate-900 placeholder:text-rose-200 text-sm"
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="h-11 px-6 rounded-[var(--radius-inner)] font-bold text-sm text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="h-11 px-8 bg-rose-600 hover:bg-rose-700 text-white rounded-[var(--radius-inner)] font-bold text-sm transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
                            >
                                {isDeleting ? "Удаление..." : "Удалить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <EditStorageLocationDialog
                users={users}
                locations={locations}
                location={editingLocation || locations[0]}
                isOpen={!!editingLocation}
                onClose={() => setEditingLocation(null)}
            />
        </>
    );
}

interface SortableLocationCardProps {
    loc: StorageLocation;
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
            "group relative flex flex-col transition-all duration-300 overflow-hidden h-full min-h-[300px] sm:min-h-[380px] crm-card shadow-sm p-4 sm:p-6",
            !loc.isActive && loc.isActive !== undefined && "opacity-60 grayscale-[0.5]",
            isOverlay ? "!border-primary !shadow-crm-xl z-[100]" :
                isDefault
                    ? "!border-primary/20 ring-4 ring-primary/5 shadow-crm-lg"
                    : isBrak
                        ? "!bg-rose-50/30 !border-rose-100"
                        : ""
        )}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div
                        {...dragHandleProps}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing transition-colors rounded-[var(--radius-inner)] hover:bg-slate-50 mr-[-4px] sm:mr-[-8px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                        {loc.type === "warehouse" ? "Склад" :
                            loc.type === "production" ? "Производство" :
                                loc.type === "office" ? "Офис" : "Склад"}
                    </span>
                </div>
                <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-inner)] flex items-center justify-center transition-all duration-500",
                    isDefault ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-400"
                )}>
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center py-2 sm:py-4">
                <div className="text-5xl sm:text-6xl font-bold text-slate-900 tabular-nums">
                    {totalItemsInLoc}
                </div>
                <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    единиц товара
                    <div className="h-px flex-1 bg-slate-50" />
                </div>
            </div>

            <div className="space-y-4 sm:space-y-6 mt-auto">
                <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight text-balance">
                            {loc.name} {(!loc.isActive && loc.isActive !== undefined) && <span className="text-slate-400 text-xs sm:text-sm font-medium">(Архив)</span>}
                        </h3>

                        {loc.isDefault && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary shrink-0" />}
                        {loc.isSystem && <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-300 shrink-0" />}
                    </div>
                    <p className="text-[11px] sm:text-[10px] font-bold text-slate-400 truncate">
                        {loc.address || "Адрес не указан"}
                    </p>
                </div>

                {categoriesList.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-50/50 w-full mb-1">
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
                        <div className="flex flex-wrap gap-2">
                            {categoriesList.slice(0, 2).map((cat, idx) => (
                                <span key={idx} className="text-xs font-bold text-slate-400">
                                    {cat.name}: <span className="text-slate-900 tabular-nums">{cat.count}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-3 sm:pt-4 transition-all">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                            <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 truncate">
                            {loc.responsibleUser?.name || "Нет ответственного"}
                        </span>
                    </div>

                    {!isOverlay && (
                        <div className="flex gap-1.5 sm:gap-2 shrink-0">
                            <button
                                onClick={onEdit}
                                className="p-1.5 sm:p-2.5 rounded-[var(--radius-inner)] bg-slate-50 text-slate-400 hover:bg-primary/5 hover:text-primary transition-all border border-slate-200"
                            >
                                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            {!loc.isSystem && (
                                <button
                                    onClick={onDeleteClick}
                                    className="p-1.5 sm:p-2.5 rounded-[var(--radius-inner)] bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all border border-rose-100"
                                >
                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
});

LocationCardContent.displayName = "LocationCardContent";

const SortableLocationCard = memo(({ loc, onEdit, onDeleteClick, onClick }: SortableLocationCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: loc.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onClick}
            className="h-full cursor-pointer"
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
