"use client";

import { useState, useEffect } from "react";
import { LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { sortCategories } from "./category-utils";
import { Session } from "@/lib/auth";
import { InventoryItem, Category } from "./types";
import { EditCategoryDialog } from "./edit-category-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { updateInventoryCategoriesOrder } from "./category-actions";
import { useToast } from "@/components/ui/toast";

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
import { SortableCategoryCard, CategoryCardContent } from "./components/SortableCategoryCard";

interface InventoryClientProps {
    items?: InventoryItem[];
    categories: Category[];
    user: Session | null;
}

export function InventoryClient({ categories: initialCategories = [], user }: InventoryClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

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
            const oldIndex = categories.findIndex((item) => item.id === active.id);
            const newIndex = categories.findIndex((item) => item.id === over.id);

            const newOrder = arrayMove(categories, oldIndex, newIndex);
            setCategories(newOrder);

            try {
                const updateItems = newOrder
                    .filter(c => !c.isSystem)
                    .map((cat, index) => ({
                        id: cat.id,
                        sortOrder: index + 1,
                    }));

                const res = await updateInventoryCategoriesOrder(updateItems);
                if (!res.success) {
                    toast(res.error || "Ошибка", "error");
                    setCategories(initialCategories);
                }
            } catch {
                toast("Ошибка при сохранении порядка", "error");
                setCategories(initialCategories);
            }
        }
    };

    // Helper function to recursively count total quantity for a category and all its descendants
    const countRecursiveTotalQuantity = (categoryId: string): number => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return 0;

        let total = category.totalQuantity || 0;
        const children = categories.filter(c => c.parentId === categoryId);

        for (const child of children) {
            total += countRecursiveTotalQuantity(child.id);
        }

        return total;
    };

    const countRecursiveTotalCost = (categoryId: string): number => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return 0;

        let total = Number(category.totalCost) || 0;
        const children = categories.filter(c => c.parentId === categoryId);

        for (const child of children) {
            total += countRecursiveTotalCost(child.id);
        }

        return total;
    };

    const topLevelCategories = categories.filter(c => !c.parentId || c.parentId === "");
    const subCategories = categories.filter(c => c.parentId && c.parentId !== "");

    const itemsByCategory = topLevelCategories.map(category => {
        const children = sortCategories(
            subCategories.filter(sc => sc.parentId === category.id)
        );

        const totalItemsCount = (category.itemCount ?? 0) +
            children.reduce((sum, child) => sum + (child.itemCount ?? 0), 0);

        const totalQty = countRecursiveTotalQuantity(category.id);
        const totalCostVal = countRecursiveTotalCost(category.id);

        return {
            ...category,
            itemCount: totalItemsCount,
            totalQuantity: totalQty,
            totalCost: totalCostVal,
            children: children
        };
    });

    if (itemsByCategory.length === 0) {
        return (
            <EmptyState
                icon={LayoutGrid}
                title="Категории не созданы"
                description="Создайте первую категорию через кнопку «Добавить категорию»."
                className="py-24"
            />
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveId(null)}
            >
                <SortableContext
                    items={itemsByCategory.map(c => c.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="flex flex-wrap gap-3" data-testid="categories-list">
                        {itemsByCategory.map((category) => (
                            <div key={category.id} className="flex-grow flex-shrink basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-12px)] xl:basis-[calc(25%-12px)] min-w-[280px]">
                                <SortableCategoryCard
                                    category={category}
                                    router={router}
                                    setEditingCategory={setEditingCategory}
                                />
                            </div>
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay adjustScale={true} dropAnimation={{
                    duration: 250,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {activeId ? (
                        <div className="w-full h-full pointer-events-none z-[100]">
                            <div className="bg-white border border-primary/30 rounded-[24px] sm:rounded-3xl shadow-2xl shadow-primary/15 flex flex-col items-center">
                                <CategoryCardContent
                                    category={itemsByCategory.find(c => c.id === activeId)!}
                                    isDragging={true}
                                />
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {editingCategory && (
                <EditCategoryDialog
                    category={editingCategory}
                    categories={categories}
                    isOpen={!!editingCategory}
                    onClose={() => setEditingCategory(null)}
                    user={user}
                />
            )}
        </div>
    );
}
