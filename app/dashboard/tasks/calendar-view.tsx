"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Task } from "./types";

interface CalendarViewProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getTasksForDay = (day: Date) => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            return isSameDay(new Date(task.dueDate), day);
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "bg-rose-500";
            case "normal": return "bg-amber-400";
            default: return "bg-slate-300";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "done": return "border-emerald-500";
            case "in_progress": return "border-indigo-500";
            case "review": return "border-amber-400";
            default: return "border-slate-300";
        }
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                        <CalendarIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {format(currentMonth, "LLLL yyyy", { locale: ru })}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Календарь задач
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-3 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all"
                    >
                        СЕГОДНЯ
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-3 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                    <div key={day} className="text-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {day}
                        </span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 flex-1">
                {days.map((day) => {
                    const dayTasks = getTasksForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[120px] p-3 rounded-2xl border-2 transition-all",
                                isCurrentMonth ? "bg-white" : "bg-slate-50/50",
                                isCurrentDay ? "border-indigo-500 shadow-lg shadow-indigo-500/10" : "border-slate-100 hover:border-slate-200"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={cn(
                                    "text-sm font-black",
                                    isCurrentDay ? "text-indigo-600" : isCurrentMonth ? "text-slate-900" : "text-slate-300"
                                )}>
                                    {format(day, "d")}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black">
                                        {dayTasks.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                {dayTasks.slice(0, 3).map((task) => (
                                    <button
                                        key={task.id}
                                        onClick={() => onTaskClick(task)}
                                        className={cn(
                                            "w-full text-left p-2 rounded-xl border-l-4 transition-all hover:shadow-md group",
                                            getStatusColor(task.status),
                                            task.status === "done" ? "bg-slate-50" : "bg-white hover:bg-indigo-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className={cn("h-1.5 w-1.5 rounded-full", getPriorityColor(task.priority))} />
                                            <span className={cn(
                                                "text-[10px] font-black truncate",
                                                task.status === "done" ? "line-through text-slate-400" : "text-slate-700 group-hover:text-indigo-600"
                                            )}>
                                                {task.title}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-[9px] font-black text-slate-400 text-center uppercase tracking-widest">
                                        +{dayTasks.length - 3} ещё
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-slate-600">Высокий</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-slate-600">Обычный</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="text-xs font-bold text-slate-600">Низкий</span>
                </div>
            </div>
        </div>
    );
}
