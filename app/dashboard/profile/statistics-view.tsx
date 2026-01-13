"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    CheckCircle2,
    Clock,
    BarChart,
    Activity,
    DollarSign,
    Package
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatisticsViewProps {
    data: {
        totalOrders: number;
        totalRevenue: number;
        monthlyOrders: number;
        tasksByStatus: Array<{ count: number; status: string }>;
        totalActivity: number;
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
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Заказов за месяц",
            value: data.monthlyOrders,
            description: "В текущем месяце",
            icon: TrendingUp,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            title: "Активность",
            value: data.totalActivity,
            description: "Действий в системе",
            icon: Activity,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Выручка (создано)",
            value: `${data.totalRevenue.toLocaleString()} ₽`,
            description: "От ваших заказов",
            icon: DollarSign,
            color: "text-amber-600",
            bg: "bg-amber-50"
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
            new: "bg-blue-100 text-blue-700",
            in_progress: "bg-indigo-100 text-indigo-700",
            review: "bg-amber-100 text-amber-700",
            done: "bg-emerald-100 text-emerald-700",
            archived: "bg-slate-100 text-slate-700"
        };
        return colors[status] || "bg-slate-100 text-slate-700";
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {stat.title}
                            </CardTitle>
                            <div className={cn("p-2 rounded-lg", stat.bg)}>
                                <stat.icon className={cn("w-4 h-4", stat.color)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-indigo-600" />
                            Статус ваших задач
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.tasksByStatus.length > 0 ? (
                                data.tasksByStatus.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-2 w-2 rounded-full",
                                                item.status === 'done' ? 'bg-emerald-500' :
                                                    item.status === 'in_progress' ? 'bg-indigo-500' : 'bg-slate-300'
                                            )} />
                                            <span className="font-bold text-slate-700">{getStatusLabel(item.status)}</span>
                                        </div>
                                        <div className={cn("px-3 py-1 rounded-full text-xs font-bold", getStatusColor(item.status))}>
                                            {item.count} задач
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                                    <p className="text-slate-400 font-medium">Нет активных задач</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            Эффективность
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        {/* Placeholder for a chart or progress ring */}
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-slate-100"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={364.4}
                                    strokeDashoffset={364.4 * 0.2} // 80% progress
                                    className="text-indigo-600"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-slate-900">80%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">КПД</span>
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-slate-600 text-center font-medium">
                            Ваша продуктивность выросла на <span className="text-emerald-600 font-bold">12%</span> по сравнению с прошлым месяцем.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
