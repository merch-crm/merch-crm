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
    GripVertical,
    Printer,
    Scissors,
    Zap,
    Thermometer,
    Layers,
    Package
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";

import { ApplicationTypeCard } from "./components/application-type-card";
import { ApplicationTypeFormDialog } from "./components/application-type-form-dialog";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { ProductionNav } from "../components/production-nav";
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

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    iconBg?: string;
    iconColor?: string;
    pulse?: boolean;
}

function StatCard({ label, value, icon, iconBg = "bg-slate-50", iconColor = "text-slate-600", pulse }: StatCardProps) {
    return (
        <div className="crm-card flex flex-col justify-between">
            <div className={cn("flex items-center gap-3 mb-4", iconColor)}>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconBg)}>
                    {pulse ? <div className={cn("w-2 h-2 rounded-full animate-pulse", iconBg.replace('bg-', 'bg-').split('-')[0] + '-500')} /> : icon}
                </div>
                <span className="text-xs font-bold ">{label}</span>
            </div>
            <div>
                <span className="text-3xl font-bold text-slate-900">{value}</span>
            </div>
        </div>
    );
}

function ActiveStatCard({ label, value }: { label: string, value: number }) {
    return (
        <div className="crm-card flex flex-col justify-between">
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-xs font-bold ">{label}</span>
            </div>
            <div>
                <span className="text-3xl font-bold text-slate-900">{value}</span>
            </div>
        </div>
    );
}

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
        <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Типы нанесения</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Справочник методов нанесения для производства
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить тип
                </Button>
            </div>

            <ProductionNav />

            {/* Stats Overview (Bento Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard 
                    label="Всего типов" 
                    value={stats.total} 
                    icon={<Layers className="w-4 h-4" />} 
                    iconBg="bg-blue-50" 
                    iconColor="text-slate-500"
                />
                
                <ActiveStatCard label="Активных" value={stats.active} />

                {Object.entries(stats.byCategory).slice(0, 2).map(([category, count]) => (
                    <StatCard 
                        key={category}
                        label={categoryLabels[category]}
                        value={count}
                        icon={categoryIcons[category]}
                    />
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию..." />

                <Button
                    variant={isSorting ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsSorting(!isSorting)}
                    className={cn(
                        "h-11 px-5 rounded-xl border-slate-100 gap-2 font-bold text-xs  transition-all duration-300",
                        isSorting 
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                            : "bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                    )}
                >
                    <GripVertical className="h-4 w-4" />
                    {isSorting ? "Завершить сортировку" : "Изменить порядок"}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                <div className="crm-card p-12 py-20 text-center flex flex-col items-center border-dashed border-2 bg-slate-50/50">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                        <Layers className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Типы нанесения не найдены</h3>
                    <p className="mt-2 text-slate-500 max-w-xs mx-auto text-sm">
                        {search ? "По вашему поисковому запросу ничего не найдено. Попробуйте изменить параметры поиска." : "Вы еще не создали ни одного типа нанесения."}
                    </p>
                    {!search && (
                        <Button 
                            className="mt-8 rounded-xl px-8 h-12 shadow-lg shadow-primary/20" 
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить тип
                        </Button>
                    )}
                </div>
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
