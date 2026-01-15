"use client";

import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    Users,
    Target,
    Activity,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
    id: string;
    status: string;
    priority: string;
    assignedToUserId?: string | null;
    assignedToRoleId?: string | null;
    dueDate?: Date | string | null;
    createdAt: Date | string;
}

interface User {
    id: string;
    name: string;
}

interface TaskAnalyticsProps {
    tasks: Task[];
    users: User[];
}

export function TaskAnalytics({ tasks, users }: TaskAnalyticsProps) {
    // Статистика по статусам
    const statusStats = {
        new: tasks.filter(t => t.status === "new").length,
        in_progress: tasks.filter(t => t.status === "in_progress").length,
        review: tasks.filter(t => t.status === "review").length,
        done: tasks.filter(t => t.status === "done").length,
    };

    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((statusStats.done / totalTasks) * 100) : 0;

    // Просроченные задачи
    const overdueTasks = tasks.filter(t => {
        if (!t.dueDate || t.status === "done") return false;
        return new Date(t.dueDate) < new Date();
    }).length;

    // Задачи по приоритетам
    const priorityStats = {
        high: tasks.filter(t => t.priority === "high" && t.status !== "done").length,
        normal: tasks.filter(t => t.priority === "normal" && t.status !== "done").length,
        low: tasks.filter(t => t.priority === "low" && t.status !== "done").length,
    };

    // Топ исполнителей
    const userTaskCounts = users.map(user => ({
        ...user,
        total: tasks.filter(t => t.assignedToUserId === user.id).length,
        completed: tasks.filter(t => t.assignedToUserId === user.id && t.status === "done").length,
    })).filter(u => u.total > 0).sort((a, b) => b.completed - a.completed).slice(0, 5);

    // Задачи на этой неделе
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const thisWeekTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= weekStart && dueDate <= weekEnd;
    }).length;

    return (
        <div className="space-y-6">
            {/* Основные метрики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl">
                            <Target className="w-6 h-6 text-indigo-600" />
                        </div>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black">
                            ВСЕГО
                        </span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-1">{totalTasks}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Задач в системе</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-lg shadow-emerald-200/50 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black">
                            {completionRate}%
                        </span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-1">{statusStats.done}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Выполнено</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-lg shadow-amber-200/50 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-2xl">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-xs font-black">
                            НЕДЕЛЯ
                        </span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-1">{thisWeekTasks}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">На этой неделе</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-lg shadow-rose-200/50 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-rose-50 rounded-2xl">
                            <AlertTriangle className="w-6 h-6 text-rose-600" />
                        </div>
                        {overdueTasks > 0 && (
                            <span className="px-3 py-1 bg-rose-500 text-white rounded-xl text-xs font-black animate-pulse">
                                !
                            </span>
                        )}
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-1">{overdueTasks}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Просрочено</p>
                </div>
            </div>

            {/* Детальная статистика */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Статусы */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                            <Activity className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Распределение по статусам</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Текущее состояние</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "Новые", count: statusStats.new, color: "bg-slate-400", textColor: "text-slate-600" },
                            { label: "В работе", count: statusStats.in_progress, color: "bg-indigo-500", textColor: "text-indigo-600" },
                            { label: "На проверке", count: statusStats.review, color: "bg-amber-400", textColor: "text-amber-600" },
                            { label: "Завершено", count: statusStats.done, color: "bg-emerald-500", textColor: "text-emerald-600" },
                        ].map((stat) => {
                            const percentage = totalTasks > 0 ? (stat.count / totalTasks) * 100 : 0;
                            return (
                                <div key={stat.label}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-black text-slate-700">{stat.label}</span>
                                        <span className={cn("text-sm font-black", stat.textColor)}>{stat.count}</span>
                                    </div>
                                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500", stat.color)}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Приоритеты */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                            <BarChart3 className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Активные по приоритетам</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Требуют внимания</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "Высокий приоритет", count: priorityStats.high, color: "bg-rose-500", bgColor: "bg-rose-50", textColor: "text-rose-600" },
                            { label: "Обычный приоритет", count: priorityStats.normal, color: "bg-amber-400", bgColor: "bg-amber-50", textColor: "text-amber-600" },
                            { label: "Низкий приоритет", count: priorityStats.low, color: "bg-slate-300", bgColor: "bg-slate-50", textColor: "text-slate-600" },
                        ].map((stat) => (
                            <div key={stat.label} className={cn("p-4 rounded-2xl border-2 border-transparent hover:border-slate-100 transition-all", stat.bgColor)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-3 w-3 rounded-full", stat.color)} />
                                        <span className="text-sm font-black text-slate-700">{stat.label}</span>
                                    </div>
                                    <span className={cn("text-2xl font-black", stat.textColor)}>{stat.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Топ исполнителей */}
            {userTaskCounts.length > 0 && (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                            <Users className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Топ исполнителей</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">По количеству выполненных задач</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {userTaskCounts.map((user, index) => {
                            const completionRate = user.total > 0 ? Math.round((user.completed / user.total) * 100) : 0;
                            return (
                                <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm shadow-lg">
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-slate-900">{user.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${completionRate}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-slate-400">{completionRate}%</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-slate-900">{user.completed}</p>
                                        <p className="text-xs font-bold text-slate-400">из {user.total}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
