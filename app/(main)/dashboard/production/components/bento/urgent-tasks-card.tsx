// app/(main)/dashboard/production/components/bento/urgent-tasks-card.tsx
"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Pause,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconType } from "@/components/ui/stat-card";
import { pluralize } from "@/lib/pluralize";
import type { UrgentTask } from "../../types";

interface UrgentTasksCardProps {
  tasks: UrgentTask[];
  className?: string;
}

const statusConfig: Record<string, { label: string; icon: IconType; color: string }> = {
  pending: { label: "Ожидает", icon: Clock, color: "text-slate-500" },
  in_progress: { label: "В работе", icon: PlayCircle, color: "text-blue-500" },
  paused: { label: "Пауза", icon: Pause, color: "text-amber-500" },
  completed: { label: "Готово", icon: CheckCircle, color: "text-emerald-500" },
};

export function UrgentTasksCard({ tasks, className }: UrgentTasksCardProps) {
  const hasData = tasks && tasks.length > 0;

  return (
    <div className={cn(
      "crm-card flex flex-col",
      hasData && "!border-rose-100",
      className
    )}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border",
            hasData
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
          )}>
            {hasData ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {hasData ? "Срочные задачи" : "Всё по плану"}
            </h3>
            <p className="text-xs font-medium text-slate-400">
              {hasData
                ? `${tasks.length} ${pluralize(tasks.length, "задача требует", "задачи требуют", "задач требуют")} внимания`
                : "Нет просроченных задач"}
            </p>
          </div>
        </div>

        {hasData && (
          <Link
            href="/dashboard/production/tasks?filter=urgent"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
          >
            <span>Все</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Контент */}
      <div className="flex-1">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
            <div className="text-4xl mb-2">✨</div>
            <p className="text-sm font-bold text-emerald-600">Отличная работа!</p>
            <p className="text-xs text-slate-400 mt-1">Все задачи выполняются в срок</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(tasks || []).slice(0, 5).map((task) => (
              <UrgentTaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface UrgentTaskRowProps {
  task: UrgentTask;
}

function UrgentTaskRow({ task }: UrgentTaskRowProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const status = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Link
      href={`/dashboard/production/tasks/${task.id}`}
      className={cn(
        "flex items-center justify-between p-3 rounded-xl border transition-all",
        "hover:shadow-md hover:-translate-y-0.5 group",
        isOverdue
          ? "bg-rose-50/50 border-rose-200 hover:border-rose-300"
          : "bg-amber-50/50 border-amber-200 hover:border-amber-300"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Иконка статуса */}
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
          isOverdue
            ? "bg-rose-100 border-rose-200 text-rose-600"
            : "bg-amber-100 border-amber-200 text-amber-600"
        )}>
          {isOverdue ? <AlertCircle className="w-4 h-4" /> : <StatusIcon className="w-4 h-4" />}
        </div>

        {/* Информация */}
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate leading-tight">
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold text-slate-400">#{task.taskNumber}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs font-bold text-primary">
              {task.quantity} шт.
            </span>
          </div>
        </div>
      </div>

      {/* Правая часть */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Прогресс */}
        <div className="w-16 hidden sm:block">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isOverdue ? "bg-rose-500" : "bg-amber-500"
              )}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <div className="text-xs font-bold text-slate-400 text-right mt-0.5">
            {task.progress}%
          </div>
        </div>

        {/* Дедлайн */}
        {task.dueDate && (
          <div className={cn(
            "text-xs font-bold text-right",
            isOverdue ? "text-rose-600" : "text-amber-600"
          )}>
            {isOverdue ? (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                просрочено
              </span>
            ) : (
              formatDistanceToNow(new Date(task.dueDate), {
                addSuffix: true,
                locale: ru,
              })
            )}
          </div>
        )}

        {/* Стрелка */}
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </Link>
  );
}
