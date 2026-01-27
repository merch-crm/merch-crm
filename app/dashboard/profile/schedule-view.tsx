"use client";

import { motion } from "framer-motion";
import {
    Calendar as CalendarIcon,
    Clock,
    ArrowRightCircle,
    CheckCircle2,
    AlertCircle,
    Info,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { ru } from "date-fns/locale";

interface ScheduleTask {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
    assignedToUserId: string | null;
    createdAt: Date;
    updatedAt?: Date;
}

interface ScheduleViewProps {
    tasks: ScheduleTask[];
}

export function ScheduleView({ tasks }: ScheduleViewProps) {
    const sortedTasks = [...tasks].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const getPriorityStyle = (priority: string) => {
        const styles: Record<string, { bg: string, text: string, label: string }> = {
            high: { bg: "bg-rose-50", text: "text-rose-600", label: "СРОЧНО" },
            normal: { bg: "bg-primary/5", text: "text-primary", label: "НОРМА" },
            low: { bg: "bg-slate-50", text: "text-slate-500", label: "НИЗКИЙ" }
        };
        return styles[priority] || styles.normal;
    };

    const getStatusIcon = (status: string, dueDate: Date | null) => {
        if (status === 'done') return (
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
            </div>
        );
        if (dueDate && isPast(new Date(dueDate)) && status !== 'done') {
            return (
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-100 animate-pulse">
                    <AlertCircle className="w-6 h-6" />
                </div>
            );
        }
        return (
            <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shadow-lg shadow-primary/10">
                <Clock className="w-6 h-6" />
            </div>
        );
    };

    const formatDateLabel = (dateInput: Date | null) => {
        if (!dateInput) return "Без даты";
        const date = new Date(dateInput);
        if (isToday(date)) return "Сегодня";
        if (isTomorrow(date)) return "Завтра";
        return format(date, "d MMMM", { locale: ru });
    };

    const formatTime = (dateInput: Date | null) => {
        if (!dateInput) return "";
        return format(new Date(dateInput), "HH:mm");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
            {/* Left Column: Tasks List */}
            <div className="lg:col-span-2 space-y-6">
                <div className="crm-card p-10 relative overflow-hidden group/tasks border-none">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover/tasks:bg-primary/10 transition-all duration-1000" />

                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-normaler">Рабочий план</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">управление временем и задачами</p>
                        </div>
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-xl">
                                    {i}+
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {sortedTasks.length > 0 ? (
                            sortedTasks.map((task, idx) => {
                                const pStyle = getPriorityStyle(task.priority);
                                return (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group/item relative flex items-start gap-6 p-6 rounded-[24px] bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
                                    >
                                        <div className="mt-1 transition-transform duration-500 group-hover/item:scale-110">
                                            {getStatusIcon(task.status, task.dueDate)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                                <h3 className={cn(
                                                    "text-lg font-black tracking-normal truncate",
                                                    task.status === 'done' ? "text-slate-300 line-through" : "text-slate-900 group-hover/item:text-primary transition-colors"
                                                )}>
                                                    {task.title}
                                                </h3>
                                                <div className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm", pStyle.bg, pStyle.text)}>
                                                    {pStyle.label}
                                                </div>
                                            </div>
                                            <p className="text-slate-400 text-[14px] font-bold mb-4 line-clamp-2 leading-relaxed">
                                                {task.description || "Описание задачи отсутствует."}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2 text-slate-400 font-black text-[11px] uppercase tracking-wider bg-white/50 px-3 py-1.5 rounded-xl group-hover/item:bg-primary/5 transition-colors">
                                                    <CalendarIcon className="w-3.5 h-3.5" />
                                                    {formatDateLabel(task.dueDate)}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 font-black text-[11px] uppercase tracking-wider bg-white/50 px-3 py-1.5 rounded-xl group-hover/item:bg-primary/5 transition-colors">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatTime(task.dueDate) || "Весь день"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-6 right-6 opacity-0 group-hover/item:opacity-100 transition-all duration-300 transform translate-x-4 group-hover/item:translate-x-0">
                                            <button className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-colors shadow-lg shadow-slate-200">
                                                <ArrowRightCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="text-center py-24 bg-slate-50/50 rounded-[32px] border-4 border-dashed border-slate-100 flex flex-col items-center">
                                <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-6 shadow-xl shadow-slate-200 ring-1 ring-slate-100">
                                    <CalendarIcon className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">План пуст</h3>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Задач на ближайшее время нет</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Info Cards */}
            <div className="space-y-8">
                {/* Modern Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-900 rounded-[var(--radius-outer)] p-10 text-white relative overflow-hidden group/info shadow-2xl shadow-slate-900/40 border-none"
                >
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-[100px] -z-0 group-hover/info:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-10 border border-white/10 group-hover/info:scale-110 group-hover/info:rotate-3 transition-all duration-500">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black mb-8 tracking-normaler">Сводная информация</h2>

                        <div className="space-y-6">
                            <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Рабочий график</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-bold">Пн - Пт</span>
                                    <span className="text-[14px] font-black text-white/80">09:00 - 18:00</span>
                                </div>
                            </div>

                            <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Перерыв</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-bold">Обед</span>
                                    <span className="text-[14px] font-black text-white/80">13:00 - 14:00</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-3 text-white/40 text-[12px] font-black uppercase tracking-widest opacity-60">
                            <Info className="w-4 h-4" />
                            Обновлено сегодня
                        </div>
                    </div>
                </motion.div>

                {/* Deadlines Reminder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-[32px] p-8 shadow-crm-sm border border-slate-100 relative overflow-hidden group/events"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-10 group-hover/events:bg-rose-100/50 transition-colors duration-700" />

                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        Дедлайны
                    </h3>

                    <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-100 group-hover/events:bg-white transition-all duration-500">
                        <p className="text-slate-500 text-[14px] font-black leading-relaxed">
                            Не забывайте закрывать задачи <span className="text-rose-500">вовремя</span> для поддержания высокого рейтинга КПД.
                        </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Просрочено:</div>
                        <div className="h-8 w-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-black shadow-xl shadow-rose-200">
                            0
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
