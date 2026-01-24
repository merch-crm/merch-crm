"use client";

import { motion } from "framer-motion";
import {
    TrendingUp,
    CheckCircle2,
    BarChart,
    Activity as ActivityIcon,
    DollarSign,
    Package,
    Zap,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatisticsViewProps {
    data: {
        totalOrders: number;
        totalRevenue: number;
        monthlyOrders: number;
        tasksByStatus: Array<{ count: number; status: string }>;
        totalActivity: number;
        efficiency?: number;
    } | null;
}

export function StatisticsView({ data }: StatisticsViewProps) {
    if (!data) return null;

    const stats = [
        {
            title: "Всего заказов",
            value: data.totalOrders,
            description: "За все время",
            icon: Package,
            color: "text-blue-500",
            bg: "bg-blue-50",
            trend: "+12%"
        },
        {
            title: "Заказов за месяц",
            value: data.monthlyOrders,
            description: "В текущем месяце",
            icon: TrendingUp,
            color: "text-primary",
            bg: "bg-primary/5",
            trend: "+5%"
        },
        {
            title: "Активность",
            value: data.totalActivity,
            description: "Действий в системе",
            icon: ActivityIcon,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            trend: "High"
        },
        {
            title: "Выручка (создано)",
            value: `${data.totalRevenue.toLocaleString()} ₽`,
            description: "От ваших заказов",
            icon: DollarSign,
            color: "text-amber-500",
            bg: "bg-amber-50",
            trend: "+8%"
        }
    ];

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            new: "Новые",
            in_progress: "В работе",
            review: "Проверка",
            done: "Завершено",
            archived: "Архив"
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: "bg-blue-500",
            in_progress: "bg-primary",
            review: "bg-amber-500",
            done: "bg-emerald-500",
            archived: "bg-slate-400"
        };
        return colors[status] || "bg-slate-400";
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative crm-card p-8 hover:bg-slate-900 border-none transition-all duration-500 overflow-hidden"
                    >
                        {/* Decorative Showcase sphere on hover */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-0" />

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className={cn("p-4 rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-slate-900", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color, "group-hover:text-slate-900")} />
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 group-hover:bg-white/10 group-hover:text-primary group-hover:border-transparent transition-all">
                                {stat.trend}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1 group-hover:text-white transition-colors">{stat.value}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-slate-500 transition-colors">{stat.title}</div>
                            <div className="text-xs text-slate-400 font-bold group-hover:text-slate-500 transition-colors">{stat.description}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Detailed Charts/Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tasks Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="crm-card p-10 relative overflow-hidden group/tasks border-none"
                >
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10 group-hover/tasks:bg-primary/10 transition-all duration-700" />

                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Распределение задач</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">статистика текущей нагрузки</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                            <BarChart className="w-5 h-5 rotate-3" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {data.tasksByStatus.length > 0 ? (
                            data.tasksByStatus.map((item, i) => {
                                const total = data.tasksByStatus.reduce((acc, curr) => acc + curr.count, 0);
                                const percentage = (item.count / total) * 100;
                                return (
                                    <div key={i} className="group/item">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", getStatusColor(item.status))} />
                                                <span className="text-[14px] font-black text-slate-700">{getStatusLabel(item.status)}</span>
                                            </div>
                                            <div className="text-[14px] font-black text-slate-900">
                                                {item.count} <span className="text-[10px] text-slate-400 uppercase ml-1">Задач</span>
                                            </div>
                                        </div>
                                        <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, delay: 0.6 + i * 0.1, ease: "circOut" }}
                                                className={cn("h-full rounded-full shadow-sm", getStatusColor(item.status))}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-100">
                                <CheckCircle2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Активных задач нет</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Efficiency Index */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="crm-card p-10 relative overflow-hidden group/eff border-none"
                >
                    <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -z-10 group-hover/eff:bg-emerald-500/10 transition-all duration-700" />

                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Индекс КПД</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">персональная продуктивность</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-10 relative">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Decorative background circle */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-slate-50"
                                />
                                <motion.circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={552.9}
                                    initial={{ strokeDashoffset: 552.9 }}
                                    animate={{ strokeDashoffset: 552.9 * (1 - (data.efficiency || 0) / 100) }}
                                    transition={{ duration: 1.5, delay: 0.8, ease: "circOut" }}
                                    className="text-primary shadow-lg"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1.5 }}
                                    className="text-5xl font-black text-slate-900 tracking-tighter"
                                >
                                    {data.efficiency || 0}<span className="text-2xl font-black opacity-30">%</span>
                                </motion.div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Оценка КПД</div>
                            </div>
                        </div>

                        <div className="mt-12 w-full p-6 rounded-[24px] bg-slate-50 group-hover/eff:bg-white border border-transparent group-hover/eff:border-slate-100 transition-all duration-500 flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-emerald-500">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-black text-slate-900 leading-tight">Отличный результат!</h3>
                                <p className="text-[13px] text-slate-400 font-bold mt-1">
                                    Продуктивность выше на <span className="text-emerald-500">12%</span> чем в прошлом месяце.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
