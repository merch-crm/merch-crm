"use client";

import { useState } from "react";
import {
  Palette,
  Clock,
  Play,
  Eye,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

import { DesignNav } from "../components/design-nav";
import { DesignTaskCard } from "./components/design-task-card";
import { DesignTaskFull, DesignQueueStats } from "../actions/order-design-actions";

interface DesignQueuePageClientProps {
  initialTasks: DesignTaskFull[];
  stats: DesignQueueStats | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Ожидает", color: "bg-slate-500", icon: <Clock className="h-4 w-4" /> },
  in_progress: { label: "В работе", color: "bg-blue-500", icon: <Play className="h-4 w-4" /> },
  review: { label: "На проверке", color: "bg-purple-500", icon: <Eye className="h-4 w-4" /> },
  revision: { label: "Доработка", color: "bg-orange-500", icon: <AlertTriangle className="h-4 w-4" /> },
  approved: { label: "Утверждён", color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4" /> },
};

export function DesignQueuePageClient({ initialTasks, stats }: DesignQueuePageClientProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filterAssignee, setFilterAssignee] = useState<string>("all");

  // Фильтрация
  const filteredTasks = tasks.filter((task) => {
    // В реальном приложении здесь нужно будет сравнивать с ID текущего пользователя
    if (filterAssignee === "unassigned" && task.assigneeId) return false;
    return true;
  });

  // Группировка по статусам для Kanban-вида
  const tasksByStatus = {
    pending: filteredTasks.filter((t) => t.status === "pending"),
    in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
    review: filteredTasks.filter((t) => t.status === "review"),
    revision: filteredTasks.filter((t) => t.status === "revision"),
  };

  const handleTaskUpdate = (updated: DesignTaskFull) => {
    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Очередь дизайна
          </h1>
          <p className="text-muted-foreground">
            Управление дизайн-задачами из заказов
          </p>
        </div>
      </div>

      <DesignNav />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Ожидает
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Play className="h-4 w-4" />
                В работе
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" />
                На проверке
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.review}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Просрочено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.overdue > 0 ? "text-red-600" : ""}`}>
                {stats.overdue}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Мои задачи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myTasks}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={filterAssignee} onChange={setFilterAssignee} options={[ { id: "all", title: "Все задачи" }, { id: "me", title: "Мои задачи" }, { id: "unassigned", title: "Без исполнителя" }, ]} className="w-48" />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusConfig[status]?.color}`} />
                <h3 className="font-medium">{statusConfig[status]?.label}</h3>
                <Badge color="neutral">{statusTasks.length}</Badge>
              </div>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {statusTasks.length > 0 ? (
                statusTasks.map((task) => (
                  <DesignTaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} />
                ))
              ) : (
                <Card className="p-4 text-center text-muted-foreground border-dashed">
                  <p className="text-sm">Нет задач</p>
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
