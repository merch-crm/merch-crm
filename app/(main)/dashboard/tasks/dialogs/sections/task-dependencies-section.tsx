"use client";

import { useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Link2,
  Plus,
  Trash2,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  addTaskDependency,
  removeTaskDependency,
} from "../../actions/dependency-actions";
import { TASK_STATUS_CONFIG } from "../../constants";
import type { Task, TaskDependency } from "@/lib/types/tasks";

type ExtendedTaskDependency = TaskDependency & { type?: string };

interface TaskDependenciesSectionProps {
  task: Task;
  allTasks: Task[];
  canEdit: boolean;
  onTaskUpdated?: () => void;
}

type DependencyType = "blocked_by" | "blocks" | "related";

const DEPENDENCY_TYPE_CONFIG: Record<
  DependencyType,
  { label: string; icon: ElementType; description: string }
> = {
  blocked_by: {
    label: "Заблокирована",
    icon: Ban,
    description: "Эта задача заблокирована до выполнения",
  },
  blocks: {
    label: "Блокирует",
    icon: ArrowRight,
    description: "Эта задача блокирует выполнение",
  },
  related: {
    label: "Связана",
    icon: Link2,
    description: "Связанная задача",
  },
};

export function TaskDependenciesSection({
  task,
  allTasks,
  canEdit,
  onTaskUpdated,
}: TaskDependenciesSectionProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("blocked_by");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDepId, setLoadingDepId] = useState<string | null>(null);

  const dependencies = task.dependencies || [];

  // Filter available tasks (exclude current task and already linked)
  const linkedTaskIds = dependencies.map((d) => d.dependsOnTaskId);
  const availableTasks = allTasks.filter(
    (t) => t.id !== task.id && !linkedTaskIds.includes(t.id)
  );

  const handleAddDependency = async () => {
    if (!selectedTaskId) return;

    setIsSubmitting(true);
    try {
      // AssumingaddTaskDependency accepts type as 3rd arg based on user code
      const result = await addTaskDependency(task.id, selectedTaskId);
      if (result.success) {
        toast.success("Зависимость добавлена");
        setIsAdding(false);
        setSelectedTaskId("");
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось добавить зависимость");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDependency = async (dependencyId: string) => {
    setLoadingDepId(dependencyId);
    try {
      const result = await removeTaskDependency(task.id, dependencyId);
      if (result.success) {
        toast.success("Зависимость удалена");
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось удалить зависимость");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoadingDepId(null);
    }
  };

  const getLinkedTask = (dependsOnTaskId: string) => {
    return allTasks.find((t) => t.id === dependsOnTaskId);
  };

  const isBlockingResolved = (dep: TaskDependency) => {
    if ((dep as ExtendedTaskDependency).type !== "blocked_by") return true;
    const linkedTask = getLinkedTask(dep.dependsOnTaskId);
    return linkedTask?.status === "done";
  };

  const blockingDeps = dependencies.filter((d) => (d as ExtendedTaskDependency).type === "blocked_by");
  const blocksDeps = dependencies.filter((d) => (d as ExtendedTaskDependency).type === "blocks");
  const relatedDeps = dependencies.filter((d) => (d as ExtendedTaskDependency).type === "related" || !(d as ExtendedTaskDependency).type);

  const hasUnresolvedBlocking = blockingDeps.some((d) => !isBlockingResolved(d));

  const typeOptions = Object.entries(DEPENDENCY_TYPE_CONFIG).map(([key, config]) => ({
    id: key,
    title: config.label,
  }));

  const taskOptions = availableTasks.map((t) => ({
    id: t.id,
    title: t.title,
    color: TASK_STATUS_CONFIG[t.status]?.color,
  }));

  return (
    <div className="space-y-3">
      {/* Warning banner */}
      {hasUnresolvedBlocking && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="font-medium text-orange-700">
                Задача заблокирована
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Завершите блокирующие задачи для продолжения работы
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add dependency */}
      {canEdit && (
        <div>
          {isAdding ? (
            <div className="p-4 rounded-xl bg-muted/50 space-y-3 animate-in fade-in slide-in-from-top-2 border border-primary/10">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ">Тип связи</label>
                  <Select
                    value={selectedType}
                    onChange={setSelectedType}
                    options={typeOptions}
                    compact
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ">Задача</label>
                  <Select
                    value={selectedTaskId}
                    onChange={setSelectedTaskId}
                    options={taskOptions}
                    placeholder="Выберите задачу"
                    compact
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic">
                {DEPENDENCY_TYPE_CONFIG[selectedType as DependencyType]?.description}
              </p>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setSelectedTaskId("");
                  }}
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddDependency}
                  disabled={!selectedTaskId || isSubmitting}
                  className="bg-primary text-primary-foreground"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Добавить
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="w-full gap-2 border-dashed h-11 hover:border-primary hover:text-primary transition-all"
              disabled={availableTasks.length === 0}
            >
              <Plus className="h-4 w-4" />
              Добавить зависимость
            </Button>
          )}
        </div>
      )}

      {/* Dependencies list */}
      {dependencies.length === 0 && !isAdding ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Link2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Нет зависимостей</p>
          <p className="text-sm text-muted-foreground mt-1">
            Свяжите задачу с другими для лучшей организации
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Blocked by */}
          {blockingDeps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ban className="h-4 w-4 text-orange-500" />
                Заблокирована ({blockingDeps.length})
              </h4>
              <div className="space-y-2">
                {blockingDeps.map((dep) => {
                  const linkedTask = getLinkedTask(dep.dependsOnTaskId);
                  if (!linkedTask) return null;
                  const isResolved = linkedTask.status === "done";
                  return (
                    <div
                      key={dep.id}
                      className={`flex items-center gap-3 p-3 rounded-xl group transition-all ${
                        isResolved
                          ? "bg-emerald-500/10 border border-emerald-500/20"
                          : "bg-orange-500/10 border border-orange-500/20"
                      }`}
                    >
                      {isResolved ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate text-sm ${
                            isResolved ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {linkedTask.title}
                        </p>
                        <p className="text-xs text-muted-foreground ">
                          {TASK_STATUS_CONFIG[linkedTask.status]?.label}
                        </p>
                      </div>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveDependency(dep.id)}
                          disabled={loadingDepId === dep.id}
                        >
                          {loadingDepId === dep.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Blocks */}
          {blocksDeps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Блокирует ({blocksDeps.length})
              </h4>
              <div className="space-y-2">
                {blocksDeps.map((dep) => {
                  const linkedTask = getLinkedTask(dep.dependsOnTaskId);
                  if (!linkedTask) return null;
                  return (
                    <div
                      key={dep.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 group transition-all"
                    >
                      <ArrowRight className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{linkedTask.title}</p>
                        <p className="text-xs text-muted-foreground ">
                          {TASK_STATUS_CONFIG[linkedTask.status]?.label}
                        </p>
                      </div>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveDependency(dep.id)}
                          disabled={loadingDepId === dep.id}
                        >
                          {loadingDepId === dep.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related */}
          {relatedDeps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Link2 className="h-4 w-4 text-violet-500" />
                Связанные ({relatedDeps.length})
              </h4>
              <div className="space-y-2">
                {relatedDeps.map((dep) => {
                  const linkedTask = getLinkedTask(dep.dependsOnTaskId);
                  if (!linkedTask) return null;
                  return (
                    <div
                      key={dep.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 group transition-all"
                    >
                      <Link2 className="h-5 w-5 text-violet-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{linkedTask.title}</p>
                        <p className="text-xs text-muted-foreground ">
                          {TASK_STATUS_CONFIG[linkedTask.status]?.label}
                        </p>
                      </div>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveDependency(dep.id)}
                          disabled={loadingDepId === dep.id}
                        >
                          {loadingDepId === dep.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
