"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { HeroTaskCard } from "./hero-task-card";
import { TaskStatsGrid } from "./task-stats-grid";
import { TaskChartsGrid } from "./task-charts-grid";
import { KanbanBoard } from "../../kanban";
import { TaskListView } from "../../list";
import { CalendarView } from "../../calendar";

import type { Task, TaskStatus } from "@/lib/types/tasks";
import type { User } from "@/lib/types";

interface TasksBentoDashboardProps {
  tasks: Task[];
  users: Array<Partial<User> & { id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  currentUserId: string;
  viewTab: string;
  onTaskClick: (task: Task) => void;
  onTasksChange: (tasks: Task[]) => void;
  onDeleteTask: () => void;
  onCreateOpen: () => void;
}

export function TasksBentoDashboard({
  tasks,
  users,
  departments,
  currentUserId: _currentUserId,
  viewTab,
  onTaskClick,
  onTasksChange,
  onDeleteTask,
  onCreateOpen,
}: TasksBentoDashboardProps) {
  
  const stats = useMemo(() => {
    const total = tasks.length;
    const completedToday = tasks.filter(t => t.status === "done" && new Date(t.updatedAt || t.createdAt).toDateString() === new Date().toDateString()).length; // suppressHydrationWarning
    
    const countByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status).length;
    
    return {
      total,
      completedToday,
      new: countByStatus("new"),
      inProgress: countByStatus("in_progress"),
      review: countByStatus("review"),
      done: countByStatus("done"),
    };
  }, [tasks]);

  return (
    <div className="flex flex-col gap-3">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 1: Герой + Сводная статистика */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-12 gap-3">
        <HeroTaskCard 
          totalTasks={stats.total} 
          completedToday={stats.completedToday} 
          className="col-span-12 lg:col-span-8" 
        />
        <div className="col-span-12 lg:col-span-4 h-full">
          <TaskStatsGrid 
            stats={stats} 
            className="h-full grid grid-cols-2 grid-rows-2 sm:grid-cols-2 sm:grid-rows-2 lg:grid-cols-2 lg:grid-rows-2" 
          />
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 2: Чарты и аналитика */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <TaskChartsGrid tasks={tasks} users={users} departments={departments} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 3: Доска / Список */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="crm-card !bg-white p-4 sm:p-6 overflow-x-auto min-h-[600px] mt-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Реестр задач</h3>
          <Button 
            onClick={onCreateOpen}
            className="sm:hidden h-9 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/30"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Создать
          </Button>
        </div>
        
        {viewTab === "kanban" && (
          <KanbanBoard tasks={tasks} onTaskClick={onTaskClick} onTasksChange={onTasksChange} />
        )}
        {viewTab === "list" && (
          <TaskListView tasks={tasks} onTaskClick={onTaskClick} onDeleteTask={onDeleteTask} />
        )}
        {viewTab === "calendar" && (
          <CalendarView tasks={tasks} onTaskClick={onTaskClick} />
        )}
      </div>
    </div>
  );
}
