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
import { SortableCharacteristicCard, CharacteristicCardContent } from "./SortableCharacteristicCard";
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
                        <div className="flex flex-wrap items-stretch justify-center w-full gap-3">
                            {localTypes.map((type) => (
                                <div
                                    key={type.id}
                                    className="transition-all duration-300 flex-grow min-w-[280px] flex-[1_1_21%]"
                                >
                                    <SortableCharacteristicCard
                                        type={type}
                                        attributes={attributes}
                                        openEditType={openEditType}
                                        openEditValue={openEditValue}
                                    />
                                </div>
                            ))}
                            {localTypes.length === 0 && (
                                <div className="w-full">
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

                {/* Drag overlay — shows floating card with primary border, original slot goes invisible */}
                <DragOverlay adjustScale={true}>
                    {activeType ? (
                        <div className="w-full h-full pointer-events-none">
                            <CharacteristicCardContent
                                type={activeType}
                                attributes={attributes}
                                openEditType={() => { }}
                                openEditValue={() => { }}
                                isOverlay
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
