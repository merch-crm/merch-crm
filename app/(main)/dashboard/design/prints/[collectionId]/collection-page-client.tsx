"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { toast } from "sonner";
import {
    Plus,
    Search,
    ArrowLeft,
    GripVertical,
} from "lucide-react";
import { CollectionHeader } from "./components/collection-header";
import { DesignCard } from "./components/design-card";
import { DesignFormDialog } from "./components/design-form-dialog";
import { DesignsEmptyState } from "./components/designs-empty-state";
import { CollectionFormDialog } from "../components/collection-form-dialog";
import {
    deleteCollection,
    updateDesignsOrder
} from "../actions/index";
import { formatCount } from "@/lib/pluralize";

import { CollectionWithFullStats, DesignWithVersionsCount } from "@/lib/types";

interface CollectionPageClientProps {
    collection: CollectionWithFullStats;
    initialDesigns: DesignWithVersionsCount[];
}

export function CollectionPageClient({
    collection,
    initialDesigns
}: CollectionPageClientProps) {
    const router = useRouter();

    // Breadcrumbs
    const { setCustomTrail } = useBreadcrumbs();

    useEffect(() => {
        setCustomTrail([
            { label: "Дизайн", href: "/dashboard/design" },
            { label: "Коллекции принтов", href: "/dashboard/design/prints" },
            { label: collection.name, href: "" },
        ]);

        return () => setCustomTrail(null);
    }, [collection.name, setCustomTrail]);

    // State
    const [designs, setDesigns] = useState(initialDesigns);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSortMode, setIsSortMode] = useState(false);

    // Grouped dialog states to reduce useState hook count
    const [dialogs, setDialogs] = useState({ create: false, edit: false, delete: false });
    const isCreateDialogOpen = dialogs.create;
    const isEditDialogOpen = dialogs.edit;
    const isDeleteDialogOpen = dialogs.delete;
    const setIsCreateDialogOpen = (val: boolean) => setDialogs(d => ({ ...d, create: val }));
    const setIsEditDialogOpen = (val: boolean) => setDialogs(d => ({ ...d, edit: val }));
    const setIsDeleteDialogOpen = (val: boolean) => setDialogs(d => ({ ...d, delete: val }));

    const [isDeleting, setIsDeleting] = useState(false);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Filtered designs
    const filteredDesigns = designs.filter((design) =>
        design.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle drag end
    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = designs.findIndex((d) => d.id === active.id);
            const newIndex = designs.findIndex((d) => d.id === over.id);

            const newDesigns = arrayMove(designs, oldIndex, newIndex);
            setDesigns(newDesigns);

            // Save new order
            const orderItems = newDesigns.map((design, index) => ({
                id: design.id,
                sortOrder: index,
            }));

            const result = await updateDesignsOrder(collection.id, orderItems);

            if (!result.success) {
                // Revert on error
                setDesigns(designs);
                toast.error("Не удалось сохранить порядок");
            }
        }
    }, [designs, collection.id]);

    // Handle design created
    const handleDesignCreated = (_designId: string) => {
        setIsCreateDialogOpen(false);
        router.refresh();
        toast.success("Принт создан");
    };

    // Handle collection updated
    const handleCollectionUpdated = () => {
        setIsEditDialogOpen(false);
        router.refresh();
        toast.success("Коллекция обновлена");
    };

    // Handle delete collection
    const handleDeleteCollection = async () => {
        if (collection.linkedLines.length > 0) {
            toast.error(
                `Невозможно удалить: коллекция используется в ${collection.linkedLines.length} линейках`
            );
            return;
        }

        if (designs.length > 0) {
            toast.error(
                `Невозможно удалить: в коллекции ${formatCount(designs.length, "принт", "принта", "принтов")}`
            );
            return;
        }

        setIsDeleting(true);

        try {
            const result = await deleteCollection(collection.id);

            if (result.success) {
                toast.success("Коллекция удалена");
                router.push("/dashboard/design/prints");
            } else {
                toast.error(result.error || "Не удалось удалить коллекцию");
            }
        } catch (_error) {
            toast.error("Произошла ошибка при удалении");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    // Navigate to design
    const handleDesignClick = (designId: string) => {
        router.push(`/dashboard/design/prints/${collection.id}/${designId}`);
    };

    // Check if can delete
    const canDelete = collection.linkedLines.length === 0 && designs.length === 0;

    return (
        <div className="space-y-3">
            {/* Back button */}
            <Button
                variant="ghost"
                size="sm"
                className="mb-4"
                onClick={() => router.push("/dashboard/design/prints")}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Все коллекции
            </Button>

            {/* Header */}
            <CollectionHeader
                collection={collection}
                onEdit={() => setIsEditDialogOpen(true)}
                onDelete={() => setIsDeleteDialogOpen(true)}
                canDelete={canDelete}
            />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mt-8 mb-6">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск принтов..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="sort-mode"
                            checked={isSortMode}
                            onCheckedChange={setIsSortMode}
                        />
                        <Label htmlFor="sort-mode" className="text-sm cursor-pointer">
                            <GripVertical className="h-4 w-4 inline mr-1" />
                            Сортировка
                        </Label>
                    </div>

                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить принт
                    </Button>
                </div>
            </div>

            {/* Designs grid */}
            {filteredDesigns.length === 0 ? (
                searchQuery ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Принты не найдены по запросу &quot;{searchQuery}&quot;
                    </div>
                ) : (
                    <DesignsEmptyState
                        onCreateClick={() => setIsCreateDialogOpen(true)}
                    />
                )
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredDesigns.map((d) => d.id)}
                        strategy={rectSortingStrategy}
                        disabled={!isSortMode}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredDesigns.map((design) => (
                                <DesignCard
                                    key={design.id}
                                    design={design}
                                    isSortMode={isSortMode}
                                    onClick={() => handleDesignClick(design.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Create design dialog */}
            <DesignFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                collectionId={collection.id}
                onSuccess={handleDesignCreated}
            />

            <CollectionFormDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                collection={collection as never}
                onSuccess={handleCollectionUpdated}
            />

            {/* Delete confirmation dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить коллекцию?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {canDelete ? (
                                <>
                                    Вы уверены, что хотите удалить коллекцию &quot;{collection.name}&quot;?
                                    Это действие нельзя отменить.
                                </>
                            ) : (
                                <>
                                    Невозможно удалить коллекцию &quot;{collection.name}&quot;.
                                    {collection.linkedLines.length > 0 && (
                                        <span className="block mt-2">
                                            Коллекция используется в {collection.linkedLines.length} линейках.
                                        </span>
                                    )}
                                    {designs.length > 0 && (
                                        <span className="block mt-2">
                                            В коллекции {designs.length} принтов. Сначала удалите все принты.
                                        </span>
                                    )}
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        {canDelete && (
                            <AlertDialogAction
                                onClick={handleDeleteCollection}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isDeleting ? "Удаление..." : "Удалить"}
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
