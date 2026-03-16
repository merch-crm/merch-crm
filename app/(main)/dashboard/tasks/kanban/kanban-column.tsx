"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/types/tasks";
import { TASK_STATUS_CONFIG } from "../constants";
import { TaskCard } from "./task-card";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = TASK_STATUS_CONFIG[status];

  return (
    <div
      ref={setNodeRef}
      data-testid={`column-${status}`}
      className={cn(
        "flex flex-col rounded-2xl transition-all duration-300",
        "bg-gradient-to-b from-white/80 to-slate-50/80 backdrop-blur-sm",
        "border border-slate-200/60 shadow-sm",
        isOver && "ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-50 bg-violet-50/50 scale-[1.02]"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shadow-sm ring-4 ring-white"
              style={{ backgroundColor: config?.color }}
            />
            <h3 className="font-semibold text-slate-800">{config?.label}</h3>
          </div>
          <span className="min-w-[28px] h-7 flex items-center justify-center px-2.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 p-3 space-y-3 min-h-[450px] max-h-[calc(100vh-380px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Нет задач</p>
              <p className="text-xs mt-1 text-slate-400">Перетащите задачу сюда</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
