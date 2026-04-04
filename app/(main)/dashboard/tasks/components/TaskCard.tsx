"use client";

import React from "react";
import { 
  Clock, 
  CheckSquare, 
  MessageSquare, 
  Paperclip, 
  AlertCircle,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useIsClient } from "@/hooks/use-is-client";
import type { Task } from "../types";
import Image from "next/image";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

type ExtendedTask = Task & {
  checklistProgress?: { completed: number; total: number };
  isBlocked?: boolean;
  attachments?: unknown[];
  department?: Task["department"] & { color?: string | null };
};

export function TaskCard({ task, onClick, onDragStart, onDragEnd }: TaskCardProps) {
  const isDone = task.status === "done";
  const isClient = useIsClient();
  
  // Вычисляем просрочку только на клиенте
  const [isOverdue, setIsOverdue] = React.useState(false);

  React.useEffect(() => {
    if (isClient) {
      const now = new Date(); // suppressHydrationWarning
      setIsOverdue(new Date(task.deadline) < now && !isDone && ["new", "in_progress", "review"].includes(task.status));
    }
  }, [isClient, task.deadline, isDone, task.status]);

  // Конфигурация приоритета
  const priorityConfig = {
    urgent: { label: "Срочно", color: "text-rose-600 bg-rose-50", line: "bg-rose-500", icon: AlertCircle },
    high: { label: "Высокий", color: "text-orange-600 bg-orange-50", line: "bg-orange-500", icon: AlertCircle },
    normal: { label: "Обычный", color: "text-blue-600 bg-blue-50", line: "bg-blue-400", icon: null },
    low: { label: "Низкий", color: "text-slate-500 bg-slate-50", line: "bg-slate-300", icon: null },
  }[task.priority];

  // Прогресс чек-листа
  const extTask = task as ExtendedTask;
  const checklistProgress = extTask.checklistProgress || { completed: 0, total: 0 };
  const hasChecklist = checklistProgress.total > 0;
  const progressPercent = hasChecklist 
    ? Math.round((checklistProgress.completed / checklistProgress.total) * 100) 
    : 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick?.(task)}
      className={cn(
        "group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-grab active:cursor-grabbing border-l-4",
        priorityConfig.line,
        isDone && "bg-slate-50 opacity-80"
      )}
    >
      {/* Header: Meta & Badges */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Отдел */}
          {task.department && (
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-bold text-white "
              style={{ backgroundColor: extTask.department?.color || "#94a3b8" }}
            >
              {task.department.name}
            </span>
          )}
          
          {/* Тип задачи */}
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold ">
            {task.type}
          </span>

          {/* Индикатор блокировки */}
          {extTask.isBlocked && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">
              <Clock className="w-2.5 h-2.5" />
              BLOCK
            </span>
          )}
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4 text-slate-400 hover:text-slate-900 cursor-pointer" />
        </div>
      </div>

      {/* Title */}
      <h4 className={cn(
        "text-sm font-bold text-slate-900 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2",
        isDone && "line-through text-slate-400"
      )}>
        {task.title}
      </h4>

      {/* Checklist Progress */}
      {hasChecklist && (
        <div className="mb-4 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              {checklistProgress.completed}/{checklistProgress.total}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                progressPercent === 100 ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: Date & Assignees */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          {/* Дедлайн */}
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-lg",
            isOverdue ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400"
          )}>
            <Clock className="w-3 h-3" />
            <span className="text-xs font-bold">
              {format(new Date(task.deadline), "d MMM", { locale: ru })}
            </span>
          </div>

          {/* Статистика */}
          <div className="flex items-center gap-2 text-slate-400">
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold">
                <MessageSquare className="w-3 h-3" />
                {task.comments.length}
              </div>
            )}
            {extTask.attachments && extTask.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold">
                <Paperclip className="w-3 h-3" />
                {extTask.attachments.length}
              </div>
            )}
          </div>
        </div>

        {/* Аватары исполнителей */}
        <div className="flex -space-x-2">
          {(task.assignees || []).slice(0, 3).map((assignee, _idx) => (
            <div 
              key={assignee.id} 
              className="relative w-7 h-7 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm"
              title={assignee.user?.name}
            >
              {assignee.user?.image ? (
                <Image 
                  src={assignee.user.image} 
                  alt={assignee.user.name || "User"} 
                  width={28} 
                  height={28} 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                  {assignee.user?.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
          ))}
          {(task.assignees || []).length > 3 && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              +{(task.assignees || []).length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Done Checkmark Badge */}
      {isDone && (
        <div className="absolute top-2 right-2 h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white translate-x-1/4 -translate-y-1/4">
          <CheckSquare className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
