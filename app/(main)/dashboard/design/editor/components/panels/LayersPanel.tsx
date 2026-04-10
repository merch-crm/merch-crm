"use client";

import { useCallback } from "react";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditor, useEditorLayers } from "../EditorProvider";
import { LayerItem } from "@/lib/editor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  GripVertical,
  Image as ImageIcon,
  Type,
  Shapes,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
} from "lucide-react";

// Иконка типа слоя
function LayerTypeIcon({ type }: { type: LayerItem["type"] }) {
  switch (type) {
    case "image":
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    case "text":
      return <Type className="h-4 w-4 text-green-500" />;
    case "shape":
      return <Shapes className="h-4 w-4 text-orange-500" />;
    default:
      return <Shapes className="h-4 w-4" />;
  }
}

// Отдельный слой (sortable)
function SortableLayerItem({
  layer,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  layer: LayerItem;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg border transition-colors",
        isSelected
          ? "bg-primary/10 border-primary"
          : "bg-background border-transparent hover:bg-muted",
        isDragging && "opacity-50",
        !layer.visible && "opacity-50"
      )}
    >
      {/* Drag Handle */}
      <div
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Layer Icon & Name */}
      <button
        type="button"
        className="flex-1 flex items-center gap-2 text-left min-w-0"
        onClick={onSelect}
      >
        <LayerTypeIcon type={layer.type} />
        <span className="text-sm truncate">{layer.name}</span>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Move Up */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveUp}>
          <ChevronUp className="h-3 w-3" />
        </Button>

        {/* Move Down */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveDown}>
          <ChevronDown className="h-3 w-3" />
        </Button>

        {/* Visibility */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleVisibility}>
          {layer.visible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>

        {/* Lock */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleLock}>
          {layer.locked ? (
            <Lock className="h-3 w-3 text-orange-500" />
          ) : (
            <Unlock className="h-3 w-3" />
          )}
        </Button>

        {/* Delete */}
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function LayersPanel() {
  const { selectedObjects, selectLayer, editor } = useEditor();
  const {
    layers,
    moveLayerUp,
    moveLayerDown,
    toggleLayerVisibility,
    toggleLayerLock,
  } = useEditorLayers();

  const selectedIds = new Set(selectedObjects.map((o) => o.id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !editor) return;

      const oldIndex = layers.findIndex((l) => l.id === active.id);
      const newIndex = layers.findIndex((l) => l.id === over.id);

      // Перемещаем слой
      if (newIndex < oldIndex) {
        // Двигаем вверх (к началу списка = на передний план)
        for (let i = oldIndex; i > newIndex; i--) {
          editor.bringForward(active.id as string);
        }
      } else {
        // Двигаем вниз (к концу списка = на задний план)
        for (let i = oldIndex; i < newIndex; i++) {
          editor.sendBackward(active.id as string);
        }
      }
    },
    [editor, layers]
  );

  const handleDelete = useCallback(
    (id: string) => {
      editor?.removeObject(id);
    },
    [editor]
  );

  if (layers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Нет слоёв</p>
        <p className="text-xs mt-1">
          Добавьте изображение или текст
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">
          Слои ({layers.length}/10)
        </h3>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layers.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {layers.map((layer) => (
              <SortableLayerItem key={layer.id} layer={layer} isSelected={selectedIds.has(layer.id)} onSelect={() => selectLayer(layer.id)}
                onToggleVisibility={() => toggleLayerVisibility(layer.id)}
                onToggleLock={() => toggleLayerLock(layer.id)}
                onDelete={() => handleDelete(layer.id)}
                onMoveUp={() => moveLayerUp(layer.id)}
                onMoveDown={() => moveLayerDown(layer.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
