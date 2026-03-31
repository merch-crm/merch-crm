"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { sortCategories } from "./category-utils";
import type { Session } from "@/lib/session";
import { InventoryItem, Category } from "./types";
import { EditCategoryDialog } from "./edit-category-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { updateInventoryCategoriesOrder } from "./category-actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
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
import { SortableCategoryCard, DragPreview } from "./components/SortableCategoryCard";

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

    const preDragOrderRef = useRef<Category[]>(initialCategories);
    const lastOverIdRef = useRef<string | null>(null);
    const lastDragUpdateTimeRef = useRef<number>(0);

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
        const id = event.active.id as string;
        preDragOrderRef.current = categories;
        lastOverIdRef.current = null;
        lastDragUpdateTimeRef.current = 0;
        setActiveId(id);

        if (typeof window !== 'undefined' && window.navigator.vibrate) {
            window.navigator.vibrate(5);
        }
    };

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const overId = over.id as string;
        if (lastOverIdRef.current === overId) return;

        // Throttle updates during drag
        const now = typeof window !== 'undefined' ? Date.now() : 0;
        if (now - lastDragUpdateTimeRef.current < 50) return;
        lastDragUpdateTimeRef.current = now;
        lastOverIdRef.current = overId;

        setCategories((prev) => {
            const oldIndex = prev.findIndex((c) => c.id === active.id);
            const newIndex = prev.findIndex((c) => c.id === overId);
            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;
            return arrayMove(prev, oldIndex, newIndex);
        });
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null);
        lastOverIdRef.current = null;
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Need to get the exact final array from state hook because closure might be stale
            let finalCategories: Category[] = [];
            setCategories((latestCategories) => {
                finalCategories = latestCategories;
                return latestCategories;
            });

            try {
                const updateItems = finalCategories
                    .filter((c) => !c.isSystem)
                    .map((cat, index) => ({
                        id: cat.id,
                        sortOrder: index + 1,
                    }));

                const res = await updateInventoryCategoriesOrder(updateItems);
                if (!res.success) {
                    toast(res.error || "Ошибка", "error");
                    setCategories(preDragOrderRef.current);
                }
            } catch {
                toast("Ошибка при сохранении порядка", "error");
                setCategories(preDragOrderRef.current);
            }
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
        lastOverIdRef.current = null;
        setCategories(preDragOrderRef.current);
    };

    // Memoize helpers to prevent closure issues
    const recursiveStats = useMemo(() => {
        const getQty = (id: string, cats: Category[]): number => {
            const cat = cats.find(c => c.id === id);
            if (!cat) return 0;
            let total = cat.totalQuantity || 0;
            cats.filter(c => c.parentId === id).forEach(child => {
                total += getQty(child.id, cats);
            });
            return total;
        };

        const getCost = (id: string, cats: Category[]): number => {
            const cat = cats.find(c => c.id === id);
            if (!cat) return 0;
            let total = Number(cat.totalCost) || 0;
            cats.filter(c => c.parentId === id).forEach(child => {
                total += getCost(child.id, cats);
            });
            return total;
        };

        return { getQty, getCost };
    }, []);

    const itemsByCategory = useMemo(() => {
        const topLevelCategories = categories.filter((c) => !c.parentId || c.parentId === "");
        const subCategories = categories.filter((c) => c.parentId && c.parentId !== "");

        return topLevelCategories.map(category => {
            const children = sortCategories(
                subCategories.filter(sc => sc.parentId === category.id)
            );

            const totalItemsCount =
                (category.itemCount ?? 0) + children.reduce((sum, child) => sum + (child.itemCount ?? 0), 0);

            const totalQty = recursiveStats.getQty(category.id, categories);
            const totalCostVal = recursiveStats.getCost(category.id, categories);

            return {
                ...category,
                itemCount: totalItemsCount,
                totalQuantity: totalQty,
                totalCost: totalCostVal,
                children: children,
            };
        });
    }, [categories, recursiveStats]);

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
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <SortableContext items={itemsByCategory.map((c) => c.id)} strategy={rectSortingStrategy}>
                    <div className="flex flex-wrap gap-3" data-testid="categories-list">
                        {itemsByCategory.map((category) => (
                            <div
                                key={category.id}
                                className={cn(
                                    "basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(25%-12px)] min-w-[240px] flex-shrink-0 transition-all duration-300",
                                    !activeId && "flex-grow"
                                )}
                            >
                                <SortableCategoryCard
                                    category={category}
                                    router={router}
                                    setEditingCategory={setEditingCategory}
                                    isAnyDragging={!!activeId}
                                />
                            </div>
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay
                    adjustScale={false}
                    dropAnimation={{
                        duration: 200,
                        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                    }}
                >
                    {activeId && itemsByCategory.find((c) => c.id === activeId) ? (
                        <DragPreview category={itemsByCategory.find((c) => c.id === activeId)!} />
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
