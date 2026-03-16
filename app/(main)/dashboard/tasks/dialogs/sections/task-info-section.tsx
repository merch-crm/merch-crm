"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Edit3,
  Save,
  X,
  Flag,
  Calendar,
  Building2,
  Zap,
  FileText,
  Loader2,
  Share2,
  Clock,
} from "lucide-react";
import { updateTask } from "../../actions/task-actions";
import {
  TASK_PRIORITY_CONFIG,
  TASK_TYPE_CONFIG,
} from "../../constants";
import type { Task, TaskPriority, TaskType } from "@/lib/types/tasks";

interface TaskInfoSectionProps {
  task: Task;
  departments: Array<{ id: string; name: string }>;
  canEdit: boolean;
  onTaskUpdated?: () => void;
}

export function TaskInfoSection({
  task,
  departments,
  canEdit,
  onTaskUpdated,
}: TaskInfoSectionProps) {
  const router = useRouter();
  const [state, setState] = useState({
    isEditing: false,
    isSaving: false,
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    type: task.type,
    deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "",
    departmentId: task.departmentId || "",
  });

  const {
    isEditing,
    isSaving,
    title,
    description,
    priority,
    type,
    deadline,
    departmentId,
  } = state;

  const setIsEditing = (val: boolean) => setState(s => ({ ...s, isEditing: val }));
  const setIsSaving = (val: boolean) => setState(s => ({ ...s, isSaving: val }));
  const setTitle = (val: string) => setState(s => ({ ...s, title: val }));
  const setDescription = (val: string) => setState(s => ({ ...s, description: val }));
  const setPriority = (val: string) => setState(s => ({ ...s, priority: val as TaskPriority }));
  const setType = (val: string) => setState(s => ({ ...s, type: val as TaskType }));
  const setDeadline = (val: string) => setState(s => ({ ...s, deadline: val }));
  const setDepartmentId = (val: string) => setState(s => ({ ...s, departmentId: val }));

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Название не может быть пустым");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority as TaskPriority,
        type: type as TaskType,
        deadline: deadline ? new Date(deadline) : undefined,
        departmentId: departmentId || undefined,
      });

      if (result.success) {
        toast.success("Задача обновлена");
        setIsEditing(false);
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось обновить задачу");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setState({
      ...state,
      title: task.title,
      description: task.description || "",
      priority: task.priority as TaskPriority,
      type: task.type as TaskType,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "",
      departmentId: task.departmentId || "",
      isEditing: false,
    });
  };

  const priorityOptions = Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => ({
    id: key,
    title: config.label,
    color: config.color,
  }));

  const typeOptions = Object.entries(TASK_TYPE_CONFIG).map(([key, config]) => ({
    id: key,
    title: config.label,
  }));

  const departmentOptions = [
    { id: "", title: "Без отдела" },
    ...departments.map((dept) => ({ id: dept.id, title: dept.name })),
  ];

  if (isEditing) {
    return (
      <div className="space-y-3 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Редактирование
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Отмена
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-emerald-500 to-green-600"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Сохранить
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Название</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Описание</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Приоритет</Label>
              <Select
                options={priorityOptions}
                value={priority}
                onChange={setPriority}
              />
            </div>

            <div className="space-y-2">
              <Label>Тип</Label>
              <Select
                options={typeOptions}
                value={type}
                onChange={setType}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Дедлайн</Label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Отдел</Label>
              <Select
                options={departmentOptions}
                value={departmentId}
                onChange={setDepartmentId}
                placeholder="Выберите отдел"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Edit button */}
      {canEdit && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-1.5"
          >
            <Edit3 className="h-4 w-4" />
            Редактировать
          </Button>
        </div>
      )}

      {/* Auto-created badge */}
      {task.isAutoCreated && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Zap className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="font-medium text-violet-700 dark:text-violet-300">
                Автоматически созданная задача
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {task.autoCreatedReason || "Создано системой автоматически"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          Описание
        </Label>
        <div className="p-4 rounded-xl bg-muted/50 min-h-[80px]">
          {task.description ? (
            <p className="text-sm whitespace-pre-wrap">{task.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Описание не указано
            </p>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-muted/50 space-y-1">
          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Flag className="h-3.5 w-3.5" />
            Приоритет
          </Label>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: TASK_PRIORITY_CONFIG[task.priority]?.color }}
            />
            <span className="font-medium">
              {TASK_PRIORITY_CONFIG[task.priority]?.label}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 space-y-1">
          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Тип задачи
          </Label>
          <div className="flex items-center gap-2">
            {TASK_TYPE_CONFIG[task.type]?.icon && (
              <span className="text-base">{TASK_TYPE_CONFIG[task.type].icon}</span>
            )}
            <span className="font-medium">
              {TASK_TYPE_CONFIG[task.type]?.label}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 space-y-1">
          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Дедлайн
          </Label>
          <span className="font-medium">
            {task.deadline
              ? new Date(task.deadline).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Не указан"}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 space-y-1">
          <Label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            Отдел
          </Label>
          <span className="font-medium">
            {task.department?.name || "Не указан"}
          </span>
        </div>
      </div>

      {/* Delegation info */}
      {task.delegatedBy && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Share2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-300">
                Задача делегирована
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {task.delegatedAt &&
                  `${new Date(task.delegatedAt).toLocaleDateString("ru-RU")}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Создано: {new Date(task.createdAt).toLocaleDateString("ru-RU")}
        </span>
        {task.updatedAt && task.updatedAt !== task.createdAt && (
          <span>
            Обновлено: {new Date(task.updatedAt).toLocaleDateString("ru-RU")}
          </span>
        )}
      </div>
    </div>
  );
}
