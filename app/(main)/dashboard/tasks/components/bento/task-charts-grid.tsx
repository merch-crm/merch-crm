"use client";

import { useMemo } from "react";
import { Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/tasks";
import type { User } from "@/lib/types";

interface TaskChartsGridProps {
  tasks: Task[];
  users: Array<Partial<User> & { id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  className?: string;
}

export function TaskChartsGrid({ tasks, users: _users, departments: _departments, className }: TaskChartsGridProps) {
  
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

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-3", className)}>
      {/* Top Assignees */}
      <div className="crm-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-100/50 rounded-xl border border-emerald-200">
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
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
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

      {/* By Department */}
      <div className="crm-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-100/50 rounded-xl border border-blue-200">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Выполнение по отделам</h3>
        </div>
        
        {departmentStats.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">Нет данных по отделам</p>
        ) : (
          <div className="space-y-3">
            {departmentStats.slice(0, 5).map((dept) => (
              <div key={dept.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{dept.name}</span>
                  <span className="font-bold text-slate-900">
                    {dept.completed}/{dept.total}{" "}
                    <span className="font-normal text-slate-400 ml-1">({dept.completionRate}%)</span>
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
    </div>
  );
}
