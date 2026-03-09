"use client";

import { closestCenter, DndContext, DragOverlay, DragStartEvent, DragEndEvent, SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Pagination } from "@/components/ui/pagination";
import { SortableSubCategoryCard, SubCategoryCardContent } from "./SubCategoryCard";
import { Category } from "@/app/(main)/dashboard/warehouse/types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface SubCategoriesSectionProps {
    data: {
        subCategories: Category[];
        currentSubCategories: Category[];
        activeId: string | null;
        subsPerPage: number;
        subCurrentPage: number;
    };
    handlers: {
        setSubCurrentPage: (page: number) => void;
        handleDragStart: (event: DragStartEvent) => void;
        handleDragEnd: (event: DragEndEvent) => void;
        setActiveId: (id: string | null) => void;
        setEditingCategory: (cat: Category) => void;
        setDeletingCategory: (cat: Category) => void;
    };
    config: {
        sensors: SensorDescriptor<SensorOptions>[];
        router: AppRouterInstance;
    };
}

export function SubCategoriesSection({
    data,
    handlers,
    config,
}: SubCategoriesSectionProps) {
    const { subCategories, currentSubCategories, activeId, subsPerPage, subCurrentPage } = data;
    const { setSubCurrentPage, handleDragStart, handleDragEnd, setActiveId, setEditingCategory, setDeletingCategory } = handlers;
    const { sensors, router } = config;

    if (subCategories.length === 0) return null;

    return (
        <div className="space-y-3 mt-8">
            <div className="flex items-center gap-3 px-2">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
                        {currentSubCategories.map((subcat) => (
                            <div key={subcat.id} className="min-w-0">
                                <SortableSubCategoryCard
                                    subcat={subcat}
                                    router={router}
                                    setEditingCategory={setEditingCategory}
                                    setDeletingCategory={setDeletingCategory}
                                />
                            </div>
                        ))}
                    </div>
                </SortableContext>
                {subCategories.length > subsPerPage && (
                    <div className="pt-4">
                        <Pagination
                            currentPage={subCurrentPage}
                            totalItems={subCategories.length}
                            pageSize={subsPerPage}
                            onPageChange={setSubCurrentPage}
                            itemNames={['подкатегория', 'подкатегории', 'подкатегорий']}
                            variant="card"
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
    );
}
