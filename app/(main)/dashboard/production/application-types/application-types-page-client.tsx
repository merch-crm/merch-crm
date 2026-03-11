"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
    Plus,
    Search,
    GripVertical,
    Printer,
    Scissors,
    Zap,
    Thermometer,
    Layers,
    Package
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { ApplicationTypeCard } from "./components/application-type-card";
import { ApplicationTypeFormDialog } from "./components/application-type-form-dialog";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { updateApplicationTypesOrder } from "../actions/application-type-actions";

type ApplicationType = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: "print" | "embroidery" | "engraving" | "transfer" | "other";
    icon: string | null;
    color: string | null;
    minQuantity: number | null;
    maxColors: number | null;
    maxPrintArea: string | null;
    baseCost: number | null;
    costPerUnit: number | null;
    setupCost: number | null;
    estimatedTime: number | null;
    setupTime: number | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
};

interface ApplicationTypesPageClientProps {
    initialTypes: ApplicationType[];
    stats: {
        total: number;
        active: number;
        byCategory: Record<string, number>;
    };
}

const categoryLabels: Record<string, string> = {
    print: "Печать",
    embroidery: "Вышивка",
    engraving: "Гравировка",
    transfer: "Термоперенос",
    other: "Прочее",
};

const categoryIcons: Record<string, React.ReactNode> = {
    print: <Printer className="h-4 w-4" />,
    embroidery: <Scissors className="h-4 w-4" />,
    engraving: <Zap className="h-4 w-4" />,
    transfer: <Thermometer className="h-4 w-4" />,
    other: <Package className="h-4 w-4" />,
};

export function ApplicationTypesPageClient({
    initialTypes,
    stats
}: ApplicationTypesPageClientProps) {
    const { setCustomTrail } = useBreadcrumbs();

    useEffect(() => {
        setCustomTrail([
            { label: "Производство", href: "/dashboard/production" },
            { label: "Типы нанесения", href: "" },
        ]);
        return () => setCustomTrail(null);
    }, [setCustomTrail]);

    const _router = useRouter();
    const [types, setTypes] = useState(initialTypes);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSorting, setIsSorting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const filteredTypes = types.filter((type) =>
        type.name.toLowerCase().includes(search.toLowerCase()) ||
        type.slug.toLowerCase().includes(search.toLowerCase())
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = types.findIndex((t) => t.id === active.id);
            const newIndex = types.findIndex((t) => t.id === over.id);

            const newTypes = arrayMove(types, oldIndex, newIndex);
            setTypes(newTypes);

            const items = newTypes.map((t, index) => ({
                id: t.id,
                sortOrder: index,
            }));

            const result = await updateApplicationTypesOrder(items);

            if (!result.success) {
                setTypes(types); // откат
                toast.error(result.error);
            }
        }
    };

    const handleCreateSuccess = (newType: ApplicationType) => {
        setTypes([...types, newType]);
        setIsCreateOpen(false);
        toast.success("Тип нанесения создан");
    };

    return (
        <div className="space-y-3 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Типы нанесения</h1>
                    <p className="text-muted-foreground">
                        Справочник методов нанесения для производства
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить тип
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Всего типов
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Активных
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    </CardContent>
                </Card>

                {Object.entries(stats.byCategory).slice(0, 2).map(([category, count]) => (
                    <Card key={category}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                {categoryIcons[category]}
                                {categoryLabels[category]}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{count}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по названию..."
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
            {filteredTypes.length > 0 ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredTypes.map((t) => t.id)}
                        strategy={rectSortingStrategy}
                        disabled={!isSorting}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredTypes.map((type) => (
                                <ApplicationTypeCard
                                    key={type.id}
                                    type={type}
                                    isSorting={isSorting}
                                    onUpdate={(updated) => {
                                        setTypes(types.map((t) => (t.id === updated.id ? updated : t)));
                                    }}
                                    onDelete={(id) => {
                                        setTypes(types.filter((t) => t.id !== id));
                                    }}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <Card className="p-12 text-center">
                    <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Нет типов нанесения</h3>
                    <p className="mt-2 text-muted-foreground">
                        {search ? "Попробуйте изменить поисковый запрос" : "Создайте первый тип нанесения"}
                    </p>
                    {!search && (
                        <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить тип
                        </Button>
                    )}
                </Card>
            )}

            {/* Create Dialog */}
            <ApplicationTypeFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
