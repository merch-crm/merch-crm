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
import { Button } from "@/components/ui/button";
import {
  Plus,
  LayoutGrid,
  MoveHorizontal,
  Check,
  X,
  Loader2
} from "lucide-react";
import { PrintDesignMockup } from "@/lib/types";
import { updateMockupsOrder } from "@/app/(main)/dashboard/design/prints/actions/mockup-actions";
import { MockupCard } from "./mockup-card";
import { MockupFormDialog } from "./mockup-form-dialog";
import { toast } from "sonner";

interface DesignMockupsSectionProps {
  designId: string;
  initialMockups: PrintDesignMockup[];
}

export function DesignMockupsSection({
  designId,
  initialMockups,
}: DesignMockupsSectionProps) {
  const [mockups, setMockups] = useState<PrintDesignMockup[]>(initialMockups);
  const [isSorting, setIsSorting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    setMockups(initialMockups);
  }, [initialMockups]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMockups((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      const items = mockups.map((m, index) => ({
        id: m.id,
        sortOrder: index,
      }));

      const result = await updateMockupsOrder(designId, items);
      if (result.success) {
        toast.success("Порядок сохранён");
        setIsSorting(false);
      } else {
        toast.error(result.error || "Ошибка сохранения");
      }
    } catch {
      toast.error("Произошла ошибка");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSorting = () => {
    setMockups(initialMockups);
    setIsSorting(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Макеты изделия</h2>
        </div>

        <div className="flex items-center gap-2">
          {isSorting ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancelSorting} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Отмена
              </Button>
              <Button size="sm" onClick={handleSaveOrder} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Сохранить порядок
              </Button>
            </>
          ) : (
            <>
              {mockups.length > 1 && (
                <Button variant="outline" size="sm" onClick={() => setIsSorting(true)}
                >
                  <MoveHorizontal className="h-4 w-4 mr-2" />
                  Порядок
                </Button>
              )}
              <Button size="sm" onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить макет
              </Button>
            </>
          )}
        </div>
      </div>

      {mockups.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/30">
          <LayoutGrid className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">Нет макетов</p>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-[300px]">
            Добавьте визуализации принта на разных изделиях для каталога и заказов.
          </p>
          <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить макет
          </Button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={mockups} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {mockups.map((mockup) => (
                <MockupCard key={mockup.id} mockup={mockup} isSorting={isSorting} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <MockupFormDialog open={isAddOpen} onOpenChange={setIsAddOpen} designId={designId} onSuccess={() => {
          setIsAddOpen(false);
          // router.refresh handled in component or parent
        }}
      />
    </div>
  );
}
