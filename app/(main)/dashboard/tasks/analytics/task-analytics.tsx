"use client";

import { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types/tasks";
import type { User } from "@/lib/types";
import { useIsClient } from "@/hooks/use-is-client";
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "../constants";

interface TaskAnalyticsProps {
  tasks: Task[];
  users: Array<Partial<User> & { id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
}

export function TaskAnalytics({ tasks, users: _users, departments: _departments }: TaskAnalyticsProps) {
  const isClient = useIsClient();
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    
    // Calculate overdue only on the client to avoid hydration mismatch
    const overdueCount = isClient ? tasks.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline) < new Date() && // suppressHydrationWarning
        t.status !== "done" &&
        t.status !== "cancelled"
    ).length : 0;
    
    const urgent = tasks.filter((t) => t.priority === "urgent").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, overdueCount, urgent, completionRate };
  }, [tasks, isClient]);

  const statusStats = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      new: 0,
      in_progress: 0,
      review: 0,
      done: 0,
      cancelled: 0,
      archived: 0,
    };

    tasks.forEach((task) => {
      counts[task.status]++;
    });

    return Object.entries(counts)
      .filter(([status]) => status !== "archived" && status !== "cancelled")
      .map(([status, count]) => ({
        status: status as TaskStatus,
        count,
        percentage: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0,
        config: TASK_STATUS_CONFIG[status as TaskStatus],
      }));
  }, [tasks]);

  const priorityStats = useMemo(() => {
    const counts: Record<TaskPriority, number> = {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0,
    };

    tasks.forEach((task) => {
      counts[task.priority]++;
    });

    return Object.entries(counts).map(([priority, count]) => ({
      priority: priority as TaskPriority,
      count,
      percentage: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0,
      config: TASK_PRIORITY_CONFIG[priority as TaskPriority],
    }));
  }, [tasks]);

  const departmentStats = useMemo(() => {
    const deptMap = new Map<string, { total: number; completed: number; name: string }>();

    tasks.forEach((task) => {
      if (task.departmentId && task.department) {
        const existing = deptMap.get(task.departmentId) || {
          total: 0,
          completed: 0,
          name: task.department.name,
        };
        existing.total++;
        if (task.status === "done") existing.completed++;
        deptMap.set(task.departmentId, existing);
      }
    });

    return Array.from(deptMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        total: data.total,
        completed: data.completed,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [tasks]);

  const topAssignees = useMemo(() => {
    const userMap = new Map<string, { total: number; completed: number; user: Partial<User> & { id: string; name: string } }>();

    tasks.forEach((task) => {
      task.assignees?.forEach((assignee) => {
        if (assignee.user) {
          const existing = userMap.get(assignee.userId) || {
            total: 0,
            completed: 0,
            user: assignee.user as (Partial<User> & { id: string; name: string }),
          };
          existing.total++;
          if (task.status === "done") existing.completed++;
          userMap.set(assignee.userId, existing);
        }
      });
    });

    return Array.from(userMap.values())
      .map((data) => ({
        user: data.user,
        total: data.total,
        completed: data.completed,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [tasks]);

  const statCards = [
    {
      title: "Всего задач",
      value: stats.total,
      icon: BarChart3,
      color: "from-slate-500 to-slate-600",
      bgColor: "bg-slate-50",
    },
    {
      title: "Выполнено",
      value: stats.completed,
      subtitle: `${stats.completionRate}%`,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "В работе",
      value: stats.inProgress,
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Просрочено",
      value: stats.overdueCount,
      icon: AlertTriangle,
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      highlight: stats.overdueCount > 0,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={cn(
                "relative overflow-hidden bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
                card.highlight && "ring-2 ring-red-400 ring-offset-2"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                    {card.subtitle && (
                      <span className="text-sm font-semibold text-slate-400">
                        {card.subtitle}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "p-3 rounded-xl",
                    card.bgColor
                  )}
                >
                  <Icon className={cn("h-6 w-6 text-slate-600")} />
                </div>
              </div>
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
                  card.color
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* By Status */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-violet-100 rounded-xl">
              <Clock className="h-5 w-5 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">По статусам</h3>
          </div>
          <div className="space-y-3">
            {statusStats.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2.5 font-medium text-slate-700">
                    <span
                      className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: item.config?.color }}
                    />
                    {item.config?.label}
                  </span>
                  <span className="font-bold text-slate-900">
                    {item.count} <span className="font-normal text-slate-400">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.config?.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Priority */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">По приоритетам</h3>
          </div>
          <div className="space-y-3">
            {priorityStats.map((item) => (
              <div key={item.priority} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2.5 font-medium text-slate-700">
                    <span
                      className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: item.config?.color }}
                    />
                    {item.config?.label}
                  </span>
                  <span className="font-bold text-slate-900">
                    {item.count} <span className="font-normal text-slate-400">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.config?.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Department */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">По отделам</h3>
          </div>
          {departmentStats.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Нет данных по отделам</p>
          ) : (
            <div className="space-y-3">
              {departmentStats.map((dept) => (
                <div key={dept.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{dept.name}</span>
                    <span className="font-bold text-slate-900">
                      {dept.completed}/{dept.total}{" "}
                      <span className="font-normal text-slate-400">({dept.completionRate}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${dept.completionRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Assignees */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Топ исполнителей</h3>
          </div>
          {topAssignees.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {topAssignees.map((item, index) => (
                <div key={item.user.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {item.user.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.completed}/{item.total} выполнено
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                        style={{ width: `${item.completionRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-10 text-right">
                      {item.completionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
