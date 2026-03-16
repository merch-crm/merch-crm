"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useToast } from "@/components/ui/toast";
import type { Task, TaskStatus } from "@/lib/types/tasks";
import { TASK_STATUS_CONFIG } from "../constants";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { changeTaskStatus } from "../actions/task-actions";

const KANBAN_COLUMNS: TaskStatus[] = ["new", "in_progress", "review", "done"];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTasksChange: (tasks: Task[]) => void;
}

export function KanbanBoard({ tasks, onTaskClick, onTasksChange }: KanbanBoardProps) {
  const { toast } = useToast();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByStatus = KANBAN_COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  }, [tasks]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const taskId = active.id as string;
      const newStatus = over.id as TaskStatus;
      const task = tasks.find((t) => t.id === taskId);

      if (!task || task.status === newStatus) return;

      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      onTasksChange(updatedTasks);

      const result = await changeTaskStatus(taskId, newStatus);

      if (!result.success) {
        onTasksChange(tasks);
        toast(result.error || "Не удалось изменить статус", "destructive");
      } else {
        toast(`Задача перемещена в "${TASK_STATUS_CONFIG[newStatus]?.label}"`, "success");
      }
    },
    [tasks, onTasksChange, toast]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 scale-105">
            <TaskCard task={activeTask} onClick={() => {}} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
