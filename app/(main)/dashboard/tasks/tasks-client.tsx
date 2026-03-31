"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Layers,
  User,
  Users,
  LayoutGrid,
  List,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task, TaskFilters, TaskFilterPreset } from "@/lib/types/tasks";
import type { User as UserType } from "@/lib/types";

import { CreateTaskDialog } from "./dialogs/create-task-dialog";
import { TaskDetailsDialog } from "./dialogs/task-details-dialog";
import { TaskFiltersPanel, FilterPresets } from "./components";
import { TasksBentoDashboard } from "./components/bento/tasks-bento-dashboard";

interface TasksClientProps {
  initialTasks: Task[];
  users: Array<Partial<UserType> & { id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  userPresets: TaskFilterPreset[];
  currentUserId: string;
  currentUserDepartmentId?: string;
}

const VIEW_TABS = [
  { id: "kanban", label: "Канбан", icon: LayoutGrid },
  { id: "list", label: "Список", icon: List },
  { id: "calendar", label: "Календарь", icon: Calendar },
] as const;

const FILTER_TABS = [
  { id: "all", label: "Все задачи", icon: Layers },
  { id: "my", label: "Мои задачи", icon: User },
  { id: "department", label: "Мой отдел", icon: Users },
] as const;

export function TasksClient({
  initialTasks,
  users,
  departments,
  userPresets,
  currentUserId,
  currentUserDepartmentId,
}: TasksClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlView = searchParams.get("view") || "kanban";
  const urlFilter = searchParams.get("filter") || "all";
  const urlTaskId = searchParams.get("task");
  const urlCreate = searchParams.get("create") === "true";
  const urlDepartmentId = searchParams.get("departmentId");

  const [state, setState] = useState({
    tasks: initialTasks,
    viewTab: urlView,
    filterTab: urlFilter,
    searchQuery: "",
    selectedTaskId: urlTaskId,
    isCreateOpen: urlCreate,
    isFilterOpen: false,
    additionalFilters: {
      departmentId: urlDepartmentId || undefined,
    } as TaskFilters,
  });

  const {
    tasks,
    viewTab,
    filterTab,
    searchQuery,
    selectedTaskId,
    isCreateOpen,
    isFilterOpen,
    additionalFilters,
  } = state;

  const setViewTab = (viewTab: string) => setState(prev => ({ ...prev, viewTab }));
  const setFilterTab = (filterTab: string) => setState(prev => ({ ...prev, filterTab }));
  const setSearchQuery = (searchQuery: string) => setState(prev => ({ ...prev, searchQuery }));
  const setSelectedTaskId = (selectedTaskId: string | null) => setState(prev => ({ ...prev, selectedTaskId }));
  const setIsCreateOpen = (isCreateOpen: boolean) => setState(prev => ({ ...prev, isCreateOpen }));
  const setIsFilterOpen = (isFilterOpen: boolean) => setState(prev => ({ ...prev, isFilterOpen }));
  const setAdditionalFilters = (additionalFilters: TaskFilters | ((prev: TaskFilters) => TaskFilters)) => {
    setState(prev => ({
      ...prev,
      additionalFilters: typeof additionalFilters === 'function' ? additionalFilters(prev.additionalFilters) : additionalFilters
    }));
  };
  const setTasks = (tasks: Task[]) => setState(prev => ({ ...prev, tasks }));

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) params.delete(key);
        else params.set(key, value);
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filterTab === "my") {
      result = result.filter((t) =>
        t.assignees?.some((a) => a.userId === currentUserId)
      );
    } else if (filterTab === "department") {
      const deptId = additionalFilters.departmentId || currentUserDepartmentId;
      if (deptId) {
        result = result.filter((t) => t.departmentId === deptId);
      }
    }

    if (additionalFilters.status?.length) {
      result = result.filter((t) => additionalFilters.status!.includes(t.status));
    }
    if (additionalFilters.priority?.length) {
      result = result.filter((t) => additionalFilters.priority!.includes(t.priority));
    }
    if (additionalFilters.assigneeId) {
      result = result.filter((t) =>
        t.assignees?.some((a) => a.userId === additionalFilters.assigneeId)
      );
    }
    if (additionalFilters.isOverdue) {
      result = result.filter(
        (t) =>
          t.deadline &&
          new Date(t.deadline) < new Date() &&
          t.status !== "done" &&
          t.status !== "cancelled"
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [tasks, filterTab, currentUserId, currentUserDepartmentId, additionalFilters, searchQuery]);

  const tabCounts = useMemo(() => ({
    all: tasks.filter((t) => t.status !== "done" && t.status !== "cancelled").length,
    my: tasks.filter(
      (t) =>
        t.assignees?.some((a) => a.userId === currentUserId) &&
        t.status !== "done" &&
        t.status !== "cancelled"
    ).length,
    department: tasks.filter(
      (t) =>
        t.departmentId === currentUserDepartmentId &&
        t.status !== "done" &&
        t.status !== "cancelled"
    ).length,
  }), [tasks, currentUserId, currentUserDepartmentId]);

  const handleViewChange = (view: string) => {
    setViewTab(view);
    updateUrl({ view });
  };

  const handleFilterTabChange = (tab: string) => {
    setFilterTab(tab);
    updateUrl({ filter: tab });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
    updateUrl({ task: task.id });
  };

  const handleTaskClose = () => {
    setSelectedTaskId(null);
    updateUrl({ task: null });
  };

  const handleCreateOpen = () => {
    setIsCreateOpen(true);
    updateUrl({ create: "true" });
  };

  const handleCreateClose = () => {
    setIsCreateOpen(false);
    updateUrl({ create: null });
  };

  const handleTaskCreated = () => {
    router.refresh();
  };

  const handleTaskUpdated = () => {
    router.refresh();
  };

  const handleTaskDeleted = () => {
    router.refresh();
  };

  const hasActiveFilters = Object.values(additionalFilters).some(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 max-w-[1600px] mx-auto pb-8 w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Задачи
            </h1>
            <p className="text-slate-500 mt-1">
              Управление задачами и проектами команды
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-1.5 shadow-sm">
              {VIEW_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = viewTab === tab.id;
                return (
                  <button type="button"
                    key={tab.id}
                    onClick={() => handleViewChange(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateOpen}
              className="h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30 rounded-xl px-6 font-medium transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Новая задача
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col xl:flex-row gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = filterTab === tab.id;
              const count = tabCounts[tab.id as keyof typeof tabCounts];
              return (
                <button type="button"
                  key={tab.id}
                  onClick={() => handleFilterTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-slate-900 text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "min-w-[24px] h-6 flex items-center justify-center px-2 rounded-lg text-xs font-bold transition-colors",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Поиск по задачам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
              />
            </div>

            <FilterPresets
              currentFilters={additionalFilters}
              userPresets={userPresets}
              onApplyPreset={setAdditionalFilters}
              onPresetsChange={() => {}}
            />

            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "h-11 px-4 rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-sm transition-all duration-200",
                isFilterOpen && "bg-violet-50 border-violet-300 text-violet-700",
                hasActiveFilters && !isFilterOpen && "border-violet-300 bg-violet-50/50"
              )}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Фильтры
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
              )}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300">
            <TaskFiltersPanel
              filters={additionalFilters}
              onFiltersChange={setAdditionalFilters}
              users={users}
              departments={departments}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        )}

        {/* Content */}
        <div className="min-h-[600px] mt-2">
          <TasksBentoDashboard
            tasks={filteredTasks}
            users={users}
            departments={departments}
            currentUserId={currentUserId}
            viewTab={viewTab}
            onTaskClick={handleTaskClick}
            onTasksChange={setTasks}
            onDeleteTask={handleTaskDeleted}
            onCreateOpen={handleCreateOpen}
          />
        </div>

        {/* Dialogs */}
        <CreateTaskDialog
          open={isCreateOpen}
          onOpenChange={(v) => !v && handleCreateClose()}
          onTaskCreated={handleTaskCreated}
          users={users}
          departments={departments}
          currentUserId={currentUserId}
          defaultDepartmentId={urlDepartmentId || undefined}
        />

        <TaskDetailsDialog
          task={tasks.find(t => t.id === selectedTaskId) || null}
          open={!!selectedTaskId}
          onOpenChange={(v) => !v && handleTaskClose()}
          onTaskUpdated={handleTaskUpdated}
          users={users}
          departments={departments}
          allTasks={tasks}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
