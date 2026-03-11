"use client";

import { useState, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Search, GripVertical, Factory } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import { ProductionNav } from "../components/production-nav";
import { LineCard } from "./components/line-card";
import { LineFormDialog } from "./components/line-form-dialog";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { updateLinesOrder, ProductionLineWithStats } from "../actions/line-actions";
import { ProductionLine, ApplicationType } from "@/lib/schema/production";

interface LinesPageClientProps {
    initialLines: ProductionLineWithStats[];
    applicationTypes: ApplicationType[];
}

export function LinesPageClient({
    initialLines,
    applicationTypes,
}: LinesPageClientProps) {
    const { setCustomTrail } = useBreadcrumbs();

    useEffect(() => {
        setCustomTrail([
            { label: "Производство", href: "/dashboard/production" },
            { label: "Линии", href: "" },
        ]);
        return () => setCustomTrail(null);
    }, [setCustomTrail]);

    const [lines, setLines] = useState<ProductionLineWithStats[]>(initialLines);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSorting, setIsSorting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const filteredLines = lines.filter((line) =>
        line.name.toLowerCase().includes(search.toLowerCase()) ||
        line.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = lines.findIndex((l) => l.id === active.id);
            const newIndex = lines.findIndex((l) => l.id === over.id);

            const newLines = arrayMove(lines, oldIndex, newIndex);
            setLines(newLines);

            const items = newLines.map((l, index) => ({
                id: l.id,
                sortOrder: index,
            }));

            const result = await updateLinesOrder(items);

            if (!result.success) {
                setLines(lines);
                toast.error(result.error || "Ошибка обновления порядка");
            }
        }
    };

    const handleCreateSuccess = (newLine: ProductionLine) => {
        const lineWithStats: ProductionLineWithStats = {
            ...newLine,
            stats: { pending: 0, inProgress: 0, completed: 0, total: 0 }
        };
        setLines([...lines, lineWithStats]);
        setIsCreateOpen(false);
        toast.success("Линия создана");
    };

    const handleUpdate = (updated: ProductionLine) => {
        setLines(lines.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    };

    const handleDelete = (id: string) => {
        setLines(lines.filter((l) => l.id !== id));
    };

    // Статистика
    const totalCapacity = lines.reduce((sum, l) => sum + (l.capacity || 0), 0);
    const activeLinesCount = lines.filter((l) => l.isActive).length;
    const totalInProgress = lines.reduce((sum, l) => sum + l.stats.inProgress, 0);

    return (
        <div className="p-6 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Производственные линии</h1>
                    <p className="text-muted-foreground">
                        Управление линиями и распределение задач
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить линию
                </Button>
            </div>

            <ProductionNav />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Всего линий</p>
                    <p className="text-2xl font-bold">{lines.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Активных</p>
                    <p className="text-2xl font-bold text-green-600">{activeLinesCount}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Общая мощность</p>
                    <p className="text-2xl font-bold">{totalCapacity} ед/день</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Задач в работе</p>
                    <p className="text-2xl font-bold">{totalInProgress}</p>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по названию или коду..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Button
                    variant={isSorting ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsSorting(!isSorting)}
                >
                    <GripVertical className="mr-2 h-4 w-4" />
                    {isSorting ? "Готово" : "Сортировка"}
                </Button>
            </div>

            {/* Grid */}
            {filteredLines.length > 0 ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredLines.map((l) => l.id)}
                        strategy={rectSortingStrategy}
                        disabled={!isSorting}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredLines.map((line) => (
                                <LineCard
                                    key={line.id}
                                    line={line}
                                    applicationTypes={applicationTypes}
                                    isSorting={isSorting}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <Card className="p-12 text-center">
                    <Factory className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Нет линий</h3>
                    <p className="mt-2 text-muted-foreground">
                        {search ? "Попробуйте изменить поисковый запрос" : "Создайте первую производственную линию"}
                    </p>
                    {!search && (
                        <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить линию
                        </Button>
                    )}
                </Card>
            )}

            {/* Create Dialog */}
            <LineFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                applicationTypes={applicationTypes}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
