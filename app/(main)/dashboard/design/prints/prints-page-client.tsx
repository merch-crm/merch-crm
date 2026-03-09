"use client";

import { useState, useMemo } from"react";
import { useRouter } from"next/navigation";
import {
 DndContext,
 closestCenter,
 KeyboardSensor,
 PointerSensor,
 useSensor,
 useSensors,
 DragEndEvent,
} from"@dnd-kit/core";
import {
 arrayMove,
 SortableContext,
 sortableKeyboardCoordinates,
 rectSortingStrategy,
} from"@dnd-kit/sortable";
import { PageHeader } from"@/components/layout/page-header";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Plus, Search, GripVertical } from"lucide-react";
import { toast } from"sonner";
import { PrintsWidgets } from"./components/prints-widgets";
import { CollectionCard } from"./components/collection-card";
import { CollectionFormDialog } from"./components/collection-form-dialog";
import { PrintsEmptyState } from"./components/prints-empty-state";
import { updateCollectionsOrder } from"./actions/index";

import { CollectionWithStats } from"@/lib/types";

interface PrintsStats {
 collections: number;
 designs: number;
 versions: number;
 files: number;
 linkedLines: number;
}

interface PrintsPageClientProps {
 stats: PrintsStats;
 collections: CollectionWithStats[];
}

export function PrintsPageClient({ stats, collections: initialCollections }: PrintsPageClientProps) {
 const router = useRouter();
 const [collections, setCollections] = useState(initialCollections);
 const [search, setSearch] = useState("");
 const [isCreateOpen, setIsCreateOpen] = useState(false);
 const [isSorting, setIsSorting] = useState(false);

 // Фильтрация по поиску
 const filteredCollections = useMemo(() => {
 if (!search.trim()) return collections;
 const query = search.toLowerCase();
 return collections.filter((c) =>
 c.name.toLowerCase().includes(query)
);
 }, [collections, search]);

 // Drag & Drop сенсоры
 const sensors = useSensors(
 useSensor(PointerSensor, {
 activationConstraint: { distance: 8 },
 }),
 useSensor(KeyboardSensor, {
 coordinateGetter: sortableKeyboardCoordinates,
 })
);

 // Обработка завершения перетаскивания
 const handleDragEnd = async (event: DragEndEvent) => {
 const { active, over } = event;

 if (!over || active.id === over.id) return;

 const oldIndex = collections.findIndex((c) => c.id === active.id);
 const newIndex = collections.findIndex((c) => c.id === over.id);

 const newCollections = arrayMove(collections, oldIndex, newIndex);
 setCollections(newCollections);

 // Сохраняем новый порядок
 const orderData = newCollections.map((c, index) => ({
 id: c.id,
 sortOrder: index,
 }));

 const result = await updateCollectionsOrder(orderData);
 if (!result.success) {
 // Откатываем изменения
 setCollections(collections);
 toast.error("Ошибка сохранения порядка");
 }
 };

 const handleCreateSuccess = (id: string) => {
 setIsCreateOpen(false);
 router.push(`/dashboard/design/prints/${id}`);
 router.refresh();
 };

 return (
 <div className="space-y-3">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <PageHeader
 title="Принты"
 description="Коллекции дизайнов для готовой продукции"
 />
 <Button onClick={() => setIsCreateOpen(true)}>
 <Plus className="h-4 w-4 mr-2"/>
 Создать коллекцию
 </Button>
 </div>

 {/* Widgets */}
 <PrintsWidgets stats={stats} />

 {/* Search & Sort Toggle */}
 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
 <Input
 placeholder="Поиск коллекций..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-10"
 />
 </div>

 {collections.length > 1 && (
 <Button
 variant={isSorting ?"default":"outline"}
 onClick={() => setIsSorting(!isSorting)}
 className="shrink-0"
 >
 <GripVertical className="h-4 w-4 mr-2"/>
 {isSorting ?"Готово":"Сортировка"}
 </Button>
)}
 </div>

 {/* Collections Grid */}
 {filteredCollections.length === 0 ? (
 search ? (
 <div className="text-center py-12">
 <p className="text-muted-foreground">
 По запросу «{search}» ничего не найдено
 </p>
 <Button
 variant="link"
 onClick={() => setSearch("")}
 className="mt-2"
 >
 Сбросить поиск
 </Button>
 </div>
) : (
 <PrintsEmptyState onCreateClick={() => setIsCreateOpen(true)} />
)
) : isSorting ? (
 <DndContext
 sensors={sensors}
 collisionDetection={closestCenter}
 onDragEnd={handleDragEnd}
 >
 <SortableContext
 items={filteredCollections.map((c) => c.id)}
 strategy={rectSortingStrategy}
 >
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
 {filteredCollections.map((collection) => (
 <CollectionCard
 key={collection.id}
 collection={collection}
 isSorting={true}
 />
))}
 </div>
 </SortableContext>
 </DndContext>
) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
 {filteredCollections.map((collection) => (
 <CollectionCard
 key={collection.id}
 collection={collection}
 isSorting={false}
 />
))}
 </div>
)}

 {/* Create Dialog */}
 <CollectionFormDialog
 open={isCreateOpen}
 onOpenChange={setIsCreateOpen}
 onSuccess={handleCreateSuccess}
 />
 </div>
);
}
