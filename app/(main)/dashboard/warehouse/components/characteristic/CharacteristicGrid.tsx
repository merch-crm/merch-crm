"use client";
import { useState, useEffect, useCallback } from "react";
import { Book } from "lucide-react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { EmptyState } from "@/components/ui/empty-state";
import { InventoryAttribute as Attribute, AttributeType } from "../../types";
import { SortableCharacteristicCard } from "./SortableCharacteristicCard";
import { CharacteristicCard } from "./CharacteristicCard";
import { reorderInventoryAttributeTypes } from "../../attribute-actions";
import { useToast } from "@/components/ui/toast";

interface CharacteristicGridProps {
    filteredTypes: AttributeType[];
    attributes: Attribute[];
    activeCategoryId: string;
    activeCategoryName: string;
    openEditType: (type: AttributeType) => void;
    openEditValue: (attr: Attribute) => void;
}

export function CharacteristicGrid({
    filteredTypes,
    attributes,
    activeCategoryId,
    activeCategoryName,
    openEditType,
    openEditValue,
}: CharacteristicGridProps) {
    const { toast } = useToast();

    // Local optimistic state for ordering
    const [localTypes, setLocalTypes] = useState<AttributeType[]>(filteredTypes);
    const [activeType, setActiveType] = useState<AttributeType | null>(null);

    // Sync when server data or category changes
    useEffect(() => {
        setLocalTypes(filteredTypes);
    }, [filteredTypes, activeCategoryId]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                // Require a 5px movement before drag starts — allows clicks to work normally
                distance: 5,
            },
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const found = localTypes.find((t) => t.id === event.active.id);
        setActiveType(found ?? null);
    }, [localTypes]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveType(null);

        if (!over || active.id === over.id) return;

        const oldIndex = localTypes.findIndex((t) => t.id === active.id);
        const newIndex = localTypes.findIndex((t) => t.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(localTypes, oldIndex, newIndex);

        // Optimistic update
        setLocalTypes(reordered);

        // Persist to server
        const updates = reordered.map((t, i) => ({ id: t.id, sortOrder: i }));
        const res = await reorderInventoryAttributeTypes(updates);
        if (!res.success) {
            toast("Не удалось сохранить порядок", "error");
            setLocalTypes(filteredTypes); // rollback
        }
    }, [localTypes, filteredTypes, toast]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={localTypes.map((t) => t.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {localTypes.map((type) => (
                                <SortableCharacteristicCard
                                    key={type.id}
                                    type={type}
                                    attributes={attributes}
                                    openEditType={openEditType}
                                    openEditValue={openEditValue}
                                />
                            ))}
                            {localTypes.length === 0 && (
                                <div className="col-span-full">
                                    <EmptyState
                                        icon={Book}
                                        title="Нет характеристик"
                                        description={
                                            activeCategoryId === "uncategorized"
                                                ? "Все характеристики распределены по категориям."
                                                : `В категории «${activeCategoryName}» пока нет созданных типов характеристик.`
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </SortableContext>

                {/* Drag overlay — shows a floating copy of the dragged card */}
                <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
                    {activeType ? (
                        <div className="opacity-95 rotate-1 shadow-2xl shadow-indigo-500/20">
                            <CharacteristicCard
                                type={activeType}
                                attributes={attributes}
                                openEditType={() => { }}
                                openEditValue={() => { }}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
