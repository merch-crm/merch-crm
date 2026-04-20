"use client";

import { useState, useMemo, useEffect } from "react";
import { useIsClient } from "@/hooks/use-is-client";
import {
 format,
 startOfMonth,
 endOfMonth,
 startOfWeek,
 endOfWeek,
 eachDayOfInterval,
 isSameMonth,
 isSameDay,
 addMonths,
 subMonths,
 isToday,
 isPast,
} from "date-fns";
import { ru } from "date-fns/locale";
import {
 ChevronLeft,
 ChevronRight,
 AlertCircle,
 Clock,
 CheckCircle2,
 Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/tasks";
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from "../constants";

interface CalendarViewProps {
 tasks: Task[];
 onTaskClick: (task: Task) => void;
}

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
 const isClient = useIsClient();
 const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date(2024, 0, 1)); // Static placeholder
 const [selectedDate, setSelectedDate] = useState<Date | null>(null);

 useEffect(() => {
  if (isClient) {
   setCurrentMonth(new Date()); // suppressHydrationWarning
   setSelectedDate(new Date()); // suppressHydrationWarning
  }
 }, [isClient]);

 const tasksByDate = useMemo(() => {
  const map = new Map<string, Task[]>();
  tasks.forEach((task) => {
   if (task.deadline) {
    const dateKey = format(new Date(task.deadline), "yyyy-MM-dd");
    const existing = map.get(dateKey) || [];
    map.set(dateKey, [...existing, task]);
   }
  });
  return map;
 }, [tasks]);

 const calendarDays = useMemo(() => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
 }, [currentMonth]);

 const selectedDayTasks = useMemo(() => {
  if (!selectedDate) return [];
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  return tasksByDate.get(dateKey) || [];
 }, [selectedDate, tasksByDate]);

 const getTasksForDay = (day: Date): Task[] => {
  const dateKey = format(day, "yyyy-MM-dd");
  return tasksByDate.get(dateKey) || [];
 };

 const getDayStatus = (day: Date, dayTasks: Task[]) => {
  if (dayTasks.length === 0) return null;
  const hasOverdue = dayTasks.some(
   (t) => t.status !== "done" && t.status !== "cancelled" && isPast(new Date(t.deadline!))
  );
  const hasUrgent = dayTasks.some((t) => t.priority === "urgent");
  const allDone = dayTasks.every((t) => t.status === "done" || t.status === "cancelled");
  if (hasOverdue) return "overdue";
  if (allDone) return "completed";
  if (hasUrgent) return "urgent";
  return "normal";
 };

 const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

 return (
  <div className="flex flex-col lg:flex-row gap-3">
   {/* Calendar Grid */}
   <div className="flex-1 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
     <h2 className="text-xl font-bold text-slate-900">
      {isClient ? format(currentMonth, "LLLL yyyy", { locale: ru }) : "..."}
     </h2>
     <div className="flex items-center gap-2">
      <Button variant="outline" color="gray" size="sm" onClick={() => {
        setCurrentMonth(new Date()); // suppressHydrationWarning
        setSelectedDate(new Date()); // suppressHydrationWarning
       }}
       className="rounded-xl"
      >
       Сегодня
      </Button>
      <Button variant="ghost" color="gray" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
       className="rounded-xl"
      >
       <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" color="gray" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
       className="rounded-xl"
      >
       <ChevronRight className="h-4 w-4" />
      </Button>
     </div>
    </div>

    {/* Week Days */}
    <div className="grid grid-cols-7 gap-1 mb-2">
     {weekDays.map((day) => (
      <div
       key={day}
       className="text-center text-xs font-semibold text-slate-500 py-3 "
      >
       {day}
      </div>
     ))}
    </div>

    {/* Days Grid */}
    <div className="grid grid-cols-7 gap-1">
     {calendarDays.map((day) => {
      const dayTasks = getTasksForDay(day);
      const dayStatus = getDayStatus(day, dayTasks);
      const isCurrentMonth = isSameMonth(day, currentMonth);
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isDayToday = isClient && isToday(day);

      return (
       <button type="button"
        key={day.toISOString()}
        onClick={() => setSelectedDate(day)}
        className={cn(
         "relative min-h-[90px] p-2 rounded-xl border text-left transition-all duration-200",
         "hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-md",
         !isCurrentMonth && "bg-slate-50/50 text-slate-400",
         isCurrentMonth && "bg-white",
         isDayToday && "ring-2 ring-violet-500 ring-offset-1",
         isSelected && "border-violet-500 bg-violet-50 shadow-lg",
         dayStatus === "overdue" && "border-red-200 bg-red-50/50",
         dayStatus === "urgent" && "border-amber-200 bg-amber-50/50",
         dayStatus === "completed" && "border-emerald-200 bg-emerald-50/50"
        )}
       >
        <span
         className={cn(
          "text-sm font-semibold",
          isDayToday && "text-violet-600"
         )}
        >
         {format(day, "d")}
        </span>

        {dayTasks.length > 0 && (
         <div className="mt-1.5 space-y-1">
          {dayTasks.slice(0, 2).map((task) => (
           <div
            key={task.id}
            className={cn(
             "text-xs truncate px-1.5 py-0.5 rounded-md font-medium",
             TASK_PRIORITY_CONFIG[task.priority]?.bgClass
            )}
           >
            {task.title}
           </div>
          ))}
          {dayTasks.length > 2 && (
           <div className="text-xs text-slate-500 px-1.5 font-medium">
            +{dayTasks.length - 2} ещё
           </div>
          )}
         </div>
        )}
       </button>
      );
     })}
    </div>
   </div>

   {/* Sidebar */}
   <div className="w-full lg:w-80 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
     <CalendarIcon className="h-5 w-5 text-violet-500" />
     {isClient && selectedDate
      ? format(selectedDate, "d MMMM yyyy", { locale: ru })
      : "Выберите день"}
    </h3>

    {!selectedDate && (
     <p className="text-sm text-slate-500">
      Нажмите на день в календаре, чтобы увидеть задачи
     </p>
    )}

    {selectedDate && selectedDayTasks.length === 0 && (
     <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
       <CheckCircle2 className="h-7 w-7 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500">Нет задач на этот день</p>
     </div>
    )}

    {selectedDayTasks.length > 0 && (
     <div className="space-y-3">
      {selectedDayTasks.map((task) => {
       const isOverdue =
        task.deadline &&
        isPast(new Date(task.deadline)) &&
        task.status !== "done";

       return (
        <button type="button"
         key={task.id}
         onClick={() => onTaskClick(task)}
         className={cn(
          "w-full text-left p-4 rounded-xl border transition-all duration-200",
          "hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5",
          task.status === "done" && "bg-emerald-50 border-emerald-200",
          isOverdue && "bg-red-50 border-red-200"
         )}
        >
         <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-medium text-sm text-slate-900 line-clamp-2">
           {task.title}
          </span>
          {task.status === "done" ? (
           <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          ) : isOverdue ? (
           <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          ) : (
           <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
          )}
         </div>

         <div className="flex items-center gap-2">
          <Badge className={cn( "text-xs border-0", TASK_STATUS_CONFIG[task.status]?.bgClass, TASK_STATUS_CONFIG[task.status]?.className )}>
           {TASK_STATUS_CONFIG[task.status]?.label}
          </Badge>
          <Badge className={cn( "text-xs border-0", TASK_PRIORITY_CONFIG[task.priority]?.bgClass, TASK_PRIORITY_CONFIG[task.priority]?.className )}>
           {TASK_PRIORITY_CONFIG[task.priority]?.label}
          </Badge>
         </div>
        </button>
       );
      })}
     </div>
    )}
   </div>
  </div>
 );
}
