"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
import { Plus, GripVertical, Factory } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";

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
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Производственные линии</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Управление линиями и распределение задач
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Добавить линию
        </Button>
      </div>

      <ProductionNav />

      {/* Stats Overview (Bento) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="crm-card flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Factory className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold ">Всего линий</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-slate-900">{lines.length}</span>
          </div>
        </div>

        <div className="crm-card flex flex-col justify-between">
          <div className="flex items-center gap-3 text-emerald-500 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-xs font-bold ">Активных сейчас</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-slate-900">{activeLinesCount}</span>
          </div>
        </div>

        <div className="crm-card flex flex-col justify-between">
          <div className="flex items-center gap-3 text-amber-500 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <GripVertical className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold ">Общая мощность</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{totalCapacity}</span>
            <span className="text-slate-400 text-xs font-bold">ЕД/ДЕНЬ</span>
          </div>
        </div>

        <div className="crm-card flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
              <Plus className="w-4 h-4 rotate-45" />
            </div>
            <span className="text-xs font-bold ">В работе</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-slate-900">{totalInProgress}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <SearchInput placeholder="Поиск по названию или коду..." value={search} onChange={(e) => setSearch(e.target.value)}
        />

        <Button variant={isSorting ? "solid" : "outline"} size="sm" onClick={() => setIsSorting(!isSorting)}
          className={cn(
            "h-11 px-5 rounded-xl border-slate-100 gap-2 font-bold text-xs transition-all duration-300",
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
      {filteredLines.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredLines.map((l) => l.id)}
            strategy={rectSortingStrategy}
            disabled={!isSorting}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredLines.map((line) => (
                <LineCard key={line.id} line={line} applicationTypes={applicationTypes} isSorting={isSorting} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="crm-card p-12 py-20 text-center flex flex-col items-center border-dashed border-2 bg-slate-50/50">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Factory className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Производственные линии не найдены</h3>
          <p className="mt-2 text-slate-500 max-w-xs mx-auto text-sm">
            {search ? "По вашему поисковому запросу ничего не найдено. Попробуйте изменить параметры поиска." : "Вы еще не создали ни одной производственной линии."}
          </p>
          {!search && (
            <Button className="mt-8 rounded-xl px-8 h-12 shadow-lg shadow-primary/20" onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать линию
            </Button>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <LineFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} applicationTypes={applicationTypes} onSuccess={handleCreateSuccess} />
    </div>
  );
}
