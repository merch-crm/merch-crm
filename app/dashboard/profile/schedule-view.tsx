"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Calendar as CalendarIcon,
    Clock,
    ArrowRightCircle,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { ru } from "date-fns/locale";

interface ScheduleViewProps {
    tasks: any[];
}

export function ScheduleView({ tasks }: ScheduleViewProps) {
    const sortedTasks = [...tasks].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: "bg-blue-100 text-blue-700",
            normal: "bg-indigo-100 text-indigo-700",
            high: "bg-rose-100 text-rose-700"
        };
        return colors[priority] || "bg-slate-100 text-slate-700";
    };

    const getStatusIcon = (status: string, dueDate: string | null) => {
        if (status === 'done') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        if (dueDate && isPast(new Date(dueDate)) && status !== 'done') {
            return <AlertCircle className="w-5 h-5 text-rose-500" />;
        }
        return <Clock className="w-5 h-5 text-amber-500" />;
    };

    const formatDateLabel = (dateStr: string | null) => {
        if (!dateStr) return "Без даты";
        const date = new Date(dateStr);
        if (isToday(date)) return "Сегодня";
        if (isTomorrow(date)) return "Завтра";
        return format(date, "d MMMM", { locale: ru });
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return "";
        return format(new Date(dateStr), "HH:mm");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm h-full">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <CalendarIcon className="w-6 h-6 text-indigo-600" />
                            План работы
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {sortedTasks.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {sortedTasks.map((task) => (
                                    <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {getStatusIcon(task.status, task.dueDate)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={cn(
                                                        "text-lg font-bold transition-all",
                                                        task.status === 'done' ? "text-slate-400 line-through" : "text-slate-900"
                                                    )}>
                                                        {task.title}
                                                    </h3>
                                                    <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md", getPriorityColor(task.priority))}>
                                                        {task.priority === 'high' ? 'Срочно' : task.priority === 'normal' ? 'Норма' : 'Низкий'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm mb-4 font-medium line-clamp-2">
                                                    {task.description || "Нет описания для этой задачи."}
                                                </p>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                                        <CalendarIcon className="w-3.5 h-3.5" />
                                                        {formatDateLabel(task.dueDate)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatTime(task.dueDate) || "Весь день"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-indigo-600 hover:text-indigo-700">
                                                    <ArrowRightCircle className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <div className="bg-slate-50 p-6 rounded-full mb-4">
                                    <CalendarIcon className="w-12 h-12 text-slate-200" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Задач не найдено</h3>
                                <p className="text-slate-500 max-w-[250px] mt-2">
                                    На ближайшее время у вас нет запланированных задач или смен.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="border-none shadow-sm bg-indigo-600 text-white">
                    <CardHeader>
                        <CardTitle className="text-white">Полезная информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white/10 rounded-xl">
                            <h4 className="font-bold mb-1">Рабочее время</h4>
                            <p className="text-indigo-100 text-sm">Пн-Пт: 09:00 - 18:00</p>
                            <p className="text-indigo-100 text-sm">Обед: 13:00 - 14:00</p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-xl">
                            <h4 className="font-bold mb-1">Дедлайны</h4>
                            <p className="text-indigo-100 text-sm">
                                Напоминаем о необходимости закрывать задачи до конца текущего рабочего дня.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Ближайшие события</CardTitle>
                    </CardHeader>
                    <CardContent className="py-4">
                        <div className="text-center py-6">
                            <Clock className="w-10 h-10 text-slate-100 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm font-medium">Нет предстоящих событий</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
