"use client";

import { type ElementType } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit3,
  RefreshCw,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  Link2,
  Unlink,
  CheckCircle2,
  MessageSquare,
  Share2,
  User,
  Clock,
  Flag,
  Calendar,
  Sparkles,
} from "lucide-react";
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "../../constants";
import type { Task } from "@/lib/types/tasks";
import { cn } from "@/lib/utils";

interface TaskHistorySectionProps {
  task: Task;
}

const ACTION_CONFIG: Record<
  string,
  { icon: ElementType; label: string; color: string; bgClass: string }
> = {
  created: {
    icon: Plus,
    label: "Создание",
    color: "#10b981",
    bgClass: "bg-emerald-500/10",
  },
  updated: {
    icon: Edit3,
    label: "Обновление",
    color: "#6366f1",
    bgClass: "bg-indigo-500/10",
  },
  status_changed: {
    icon: RefreshCw,
    label: "Статус изменён",
    color: "#f59e0b",
    bgClass: "bg-amber-500/10",
  },
  priority_changed: {
    icon: Flag,
    label: "Приоритет изменён",
    color: "#8b5cf6",
    bgClass: "bg-violet-500/10",
  },
  deadline_changed: {
    icon: Calendar,
    label: "Дедлайн изменён",
    color: "#ec4899",
    bgClass: "bg-pink-500/10",
  },
  assignee_added: {
    icon: UserPlus,
    label: "Исполнитель добавлен",
    color: "#06b6d4",
    bgClass: "bg-cyan-500/10",
  },
  assignee_removed: {
    icon: UserMinus,
    label: "Исполнитель удалён",
    color: "#ef4444",
    bgClass: "bg-red-500/10",
  },
  watcher_added: {
    icon: Eye,
    label: "Наблюдатель добавлен",
    color: "#06b6d4",
    bgClass: "bg-cyan-500/10",
  },
  watcher_removed: {
    icon: EyeOff,
    label: "Наблюдатель удалён",
    color: "#ef4444",
    bgClass: "bg-red-500/10",
  },
  dependency_added: {
    icon: Link2,
    label: "Зависимость добавлена",
    color: "#8b5cf6",
    bgClass: "bg-violet-500/10",
  },
  dependency_removed: {
    icon: Unlink,
    label: "Зависимость удалена",
    color: "#ef4444",
    bgClass: "bg-red-500/10",
  },
  checklist_updated: {
    icon: CheckCircle2,
    label: "Чек-лист обновлён",
    color: "#10b981",
    bgClass: "bg-emerald-500/10",
  },
  comment_added: {
    icon: MessageSquare,
    label: "Комментарий добавлен",
    color: "#3b82f6",
    bgClass: "bg-blue-500/10",
  },
  delegated: {
    icon: Share2,
    label: "Делегирование",
    color: "#f59e0b",
    bgClass: "bg-amber-500/10",
  },
  auto_created: {
    icon: Sparkles,
    label: "Создано системой",
    color: "#a855f7",
    bgClass: "bg-purple-500/10",
  },
};

export function TaskHistorySection({ task }: TaskHistorySectionProps) {
  const history = task.history || [];

  const formatRelativeDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderValue = (type: string, value: string | undefined) => {
    if (!value) return null;

    if (type === "status_changed") {
      const config = TASK_STATUS_CONFIG[value as keyof typeof TASK_STATUS_CONFIG];
      if (config) {
        return (
          <Badge
            variant="outline"
            className="h-5 px-1.5 text-xs tracking-wider"
            style={{
              borderColor: config.color,
              color: config.color,
              backgroundColor: `${config.color}10`,
            }}
          >
            {config.label}
          </Badge>
        );
      }
    }

    if (type === "priority_changed") {
      const config = TASK_PRIORITY_CONFIG[value as keyof typeof TASK_PRIORITY_CONFIG];
      if (config) {
        return (
          <Badge
            variant="outline"
            className="h-5 px-1.5 text-xs tracking-wider"
            style={{
              borderColor: config.color,
              color: config.color,
              backgroundColor: `${config.color}10`,
            }}
          >
            {config.label}
          </Badge>
        );
      }
    }

    return <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded italic">{value}</span>;
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">История пуста</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 relative before:absolute before:inset-0 before:left-[15px] before:w-px before:bg-border/60">
      {history.map((entry, index) => {
        const entryType = entry.type || "updated";
        const config = ACTION_CONFIG[entryType] || ACTION_CONFIG.updated;
        const ActionIcon = config.icon;

        return (
          <div key={entry.id || index} className="relative pl-10 pb-8 group">
            {/* Icon */}
            <div
              className={cn(
                "absolute left-0 top-0.5 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-transform group-hover:scale-110 shadow-sm",
                config.bgClass
              )}
            >
              <ActionIcon
                className="h-4 w-4"
                style={{ color: config.color }}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap justify-between">
                <span className="font-semibold text-sm tracking-tight">{config.label}</span>
                <span className="text-xs text-muted-foreground tracking-wide font-medium">
                  {formatRelativeDate(entry.createdAt)}
                </span>
              </div>

              {/* Values */}
              {(entry.oldValue || entry.newValue) && (
                <div className="flex items-center gap-2 flex-wrap p-2 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
                  {entry.oldValue && (
                    <>
                      {renderValue(entryType, entry.oldValue)}
                      <span className="text-muted-foreground text-xs">→</span>
                    </>
                  )}
                  {entry.newValue && renderValue(entryType, entry.newValue)}
                </div>
              )}

              {/* User */}
              {entry.user && (
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6 ring-2 ring-background">
                    <AvatarImage src={entry.user.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {entry.user.name?.[0] || <User className="h-3 w-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground font-medium">
                    {entry.user.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
