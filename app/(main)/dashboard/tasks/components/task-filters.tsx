"use client";

import { X, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { TaskFilters, TaskStatus, TaskPriority } from "@/lib/types/tasks";
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "../constants";

interface TaskFiltersProps {
 filters: TaskFilters;
 onFiltersChange: (filters: TaskFilters) => void;
 users: Array<{ id: string; name: string; firstName?: string | null; lastName?: string | null }>;
 departments: Array<{ id: string; name: string }>;
 onClose: () => void;
}

export function TaskFiltersPanel({
 filters,
 onFiltersChange,
 users,
 departments,
 onClose,
}: TaskFiltersProps) {
 const updateFilter = <K extends keyof TaskFilters>(
  key: K,
  value: TaskFilters[K]
 ) => {
  onFiltersChange({ ...filters, [key]: value });
 };

 const clearFilters = () => {
  onFiltersChange({});
 };

 const hasActiveFilters = Object.values(filters).some(
  (v) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
 );

 return (
  <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
   {/* Header */}
   <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
     <h3 className="text-lg font-semibold text-slate-900">Фильтры</h3>
     {hasActiveFilters && (
      <span className="px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full">
       Активны
      </span>
     )}
    </div>
    <div className="flex items-center gap-2">
     {hasActiveFilters && (
      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-slate-700 rounded-xl">
       <RotateCcw className="h-4 w-4 mr-2" />
       Сбросить
      </Button>
     )}
     <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 rounded-xl hover:bg-slate-100">
      <X className="h-4 w-4" />
     </Button>
    </div>
   </div>

   {/* Filters Grid */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    {/* Status */}
    <div className="space-y-2">
     <Label className="text-xs font-semibold text-slate-500 ">
      Статус
     </Label>
     <Select value={filters.status?.[0] || "all"} onChange={(v) =>
       updateFilter("status", v === "all" ? undefined : [v as TaskStatus])
      }
      options={[
       { id: "all", title: "Все статусы" },
       ...Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => ({
        id: key,
        title: config.label,
        color: config.color,
       })),
      ]}
     />
    </div>

    {/* Priority */}
    <div className="space-y-2">
     <Label className="text-xs font-semibold text-slate-500 ">
      Приоритет
     </Label>
     <Select value={filters.priority?.[0] || "all"} onChange={(v) =>
       updateFilter("priority", v === "all" ? undefined : [v as TaskPriority])
      }
      options={[
       { id: "all", title: "Все приоритеты" },
       ...Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => ({
        id: key,
        title: config.label,
        color: config.color,
       })),
      ]}
     />
    </div>

    {/* Department */}
    <div className="space-y-2">
     <Label className="text-xs font-semibold text-slate-500 ">
      Отдел
     </Label>
     <Select value={filters.departmentId || "all"} onChange={(v) =>
       updateFilter("departmentId", v === "all" ? undefined : v)
      }
      options={[
       { id: "all", title: "Все отделы" },
       ...departments.map((dept) => ({
        id: dept.id,
        title: dept.name,
       })),
      ]}
     />
    </div>

    {/* Assignee */}
    <div className="space-y-2">
     <Label className="text-xs font-semibold text-slate-500 ">
      Исполнитель
     </Label>
     <Select value={filters.assigneeId || "all"} onChange={(v) =>
       updateFilter("assigneeId", v === "all" ? undefined : v)
      }
      options={[
       { id: "all", title: "Все исполнители" },
       ...(users || []).map((user) => ({
        id: user.id,
        title: `${user.firstName || user.name} ${user.lastName || ''}`.trim(),
       })),
      ]}
     />
    </div>
   </div>

   {/* Overdue Checkbox */}
   <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
    <Checkbox id="overdue" checked={filters.isOverdue || false} onCheckedChange={(checked) =>
      updateFilter("isOverdue", checked ? true : undefined)
     }
     className="rounded-md border-slate-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
    />
    <Label htmlFor="overdue" className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-slate-700 hover:text-slate-900 transition-colors">
     <AlertTriangle className="h-4 w-4 text-red-500" />
     Только просроченные задачи
    </Label>
   </div>
  </div>
 );
}
