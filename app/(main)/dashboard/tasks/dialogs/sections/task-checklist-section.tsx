"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  Circle,
  Loader2,
  ListChecks,
} from "lucide-react";
import {
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
} from "../../actions/checklist-actions";
import type { Task, ChecklistItem } from "@/lib/types/tasks";

interface TaskChecklistSectionProps {
  task: Task;
  canEdit: boolean;
  onTaskUpdated?: () => void;
}

export function TaskChecklistSection({
  task,
  canEdit,
  onTaskUpdated,
}: TaskChecklistSectionProps) {
  const router = useRouter();
  const [newItemText, setNewItemText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Use the correct field name from the Task type (either checklists or checklist)
  const extTask = task as Task & { checklist?: ChecklistItem[] };
  const checklist = extTask.checklists || extTask.checklist || [];
  const completedCount = checklist.filter((item: ChecklistItem) => item.isCompleted).length;
  const progress = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    setIsAdding(true);
    try {
      const result = await addChecklistItem(task.id, newItemText.trim());
      if (result.success) {
        setNewItemText("");
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось добавить пункт");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    setLoadingItemId(itemId);
    try {
      const result = await toggleChecklistItem(itemId, !isCompleted);
      if (result.success) {
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось обновить пункт");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setLoadingItemId(itemId);
    try {
      const result = await deleteChecklistItem(itemId);
      if (result.success) {
        toast.success("Пункт удалён");
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось удалить пункт");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!editText.trim()) {
      setEditingItemId(null);
      return;
    }

    setLoadingItemId(itemId);
    try {
      const result = await updateChecklistItem(itemId, editText.trim());
      if (result.success) {
        setEditingItemId(null);
        setEditText("");
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось обновить пункт");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoadingItemId(null);
    }
  };

  const startEditing = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditText(item.text);
  };

  return (
    <div className="space-y-3">
      {/* Progress header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <span className="font-medium">Прогресс</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount} из {checklist.length}
          </span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3" />
          {progress === 100 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          )}
        </div>
        {progress === 100 && checklist.length > 0 && (
          <p className="text-sm text-emerald-600 font-medium text-center">
            Все пункты выполнены!
          </p>
        )}
      </div>

      {/* Add new item */}
      {canEdit && (
        <div className="flex gap-2">
          <Input
            placeholder="Добавить пункт..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem();
              }
            }}
            disabled={isAdding}
            className="flex-1"
          />
          <Button
            onClick={handleAddItem}
            disabled={!newItemText.trim() || isAdding}
            className="shrink-0"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Checklist items */}
      {checklist.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <ListChecks className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Чек-лист пуст</p>
          {canEdit && (
            <p className="text-sm text-muted-foreground mt-1">
              Добавьте пункты для отслеживания прогресса
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {checklist.map((item: ChecklistItem, index: number) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                item.isCompleted
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              {canEdit && (
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
              )}

              <button type="button"
                onClick={() => handleToggleItem(item.id, item.isCompleted)}
                disabled={loadingItemId === item.id || !canEdit}
                className="shrink-0"
              >
                {loadingItemId === item.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : item.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>

              {editingItemId === item.id ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateItem(item.id);
                      if (e.key === "Escape") setEditingItemId(null);
                    }}
                    autoFocus
                    className="flex-1 h-8"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingItemId(null)}
                  >
                    Отмена
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateItem(item.id)}
                    disabled={loadingItemId === item.id}
                  >
                    Сохранить
                  </Button>
                </div>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${
                      item.isCompleted
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                    onDoubleClick={() => canEdit && startEditing(item)}
                  >
                    <span className="text-muted-foreground mr-2">
                      {index + 1}.
                    </span>
                    {item.text}
                  </span>

                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={loadingItemId === item.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
