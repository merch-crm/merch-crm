import React from "react";
import { CheckCircle2, CreditCard, ChevronRight, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleBadge } from "@/components/ui/role-badge";
import { Button } from "@/components/ui/button";
import { StatisticsData, Task } from "../../types";
import { ProfileView } from "../../hooks/useProfile";

interface OverviewTabProps {
    statsData: StatisticsData | null;
    currencySymbol: string;
    departmentName: string;
    roleName: string;
    tasks: Task[];
    handleNavClick: (view: ProfileView) => void;
}

export function OverviewTab({
    statsData,
    currencySymbol,
    departmentName,
    roleName,
    tasks,
    handleNavClick
}: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pb-12">
            {/* Left Column - Stats & Activity */}
            <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">Ключевые показатели</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavClick("statistics")}
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all px-3 py-1.5 rounded-lg hover:bg-primary/5"
                    >
                        Вся статистика <ChevronRight className="w-3 h-3" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        {
                            title: "Выполнено заказов",
                            value: statsData?.totalOrders || 0,
                            subtitle: "За все время",
                            progress: 75,
                            color: "bg-primary",
                            textColor: "text-primary",
                            icon: <CheckCircle2 />
                        },
                        {
                            title: "Личная выручка",
                            value: `${(statsData?.totalRevenue || 0).toLocaleString()} ${currencySymbol}`,
                            subtitle: "Принесено компании",
                            progress: 45,
                            color: "bg-slate-900",
                            textColor: "text-slate-900",
                            icon: <CreditCard />
                        },
                    ].map((stat, i) => (
                        <div key={i} className="group crm-card  !rounded-3xl hover:shadow-xl hover:shadow-primary/5 transition-all cursor-default">
                            <div className="flex justify-between items-start mb-8">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
                                    stat.color === "bg-primary" ? "bg-primary shadow-primary/20" : "bg-slate-900 shadow-slate-900/10"
                                )}>
                                    {React.cloneElement(stat.icon as React.ReactElement<{ className?: string }>, { className: "w-7 h-7" })}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-extrabold text-slate-900 mb-1 text-2xl">{stat.value}</h4>
                                <p className="text-xs font-bold text-slate-400 mb-6">{stat.title}</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-400">{stat.subtitle}</span>
                                        <span className={stat.textColor}>{stat.progress}% KPI</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", stat.color)}
                                            style={{ width: `${stat.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Activity Chart Mock */}
                <div className="crm-card  !rounded-3xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Активность за неделю</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">Количество действий в системе</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                <span className="text-xs font-bold text-slate-500">Вы</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                <span className="text-xs font-bold text-slate-500">Отдел</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-48 flex items-end justify-between gap-2 md:gap-3 relative z-10 pl-2">
                        {[45, 70, 30, 85, 60, 40, 95].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                                <div className="w-full relative h-full flex items-end rounded-t-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                    <div
                                        className="w-full bg-primary rounded-t-lg transition-all duration-700 group-hover:bg-primary-hover relative"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {h} действий
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-400">
                                    {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Info & Tasks */}
            <div className="lg:col-span-4 space-y-3">
                <div className="crm-card !bg-primary !border-primary/50 text-white !rounded-3xl  shadow-2xl shadow-primary/30 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="absolute -left-10 bottom-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-3">{departmentName}</h3>
                        <p className="text-white/70 text-sm font-medium leading-relaxed mb-8">
                            Вы являетесь ключевым сотрудником отдела. Продолжайте в том же духе, ваш вклад важен для команды!
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <RoleBadge roleName={roleName} className="bg-white/20 text-white border-none shadow-none text-xs py-1 px-3" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-bold text-slate-900">Последние задачи</h3>
                        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {tasks.length > 0 ? tasks.slice(0, 3).map((task, i) => (
                            <div key={i} className="flex gap-3 p-5 crm-card !rounded-2xl hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                                <div className="flex flex-col items-center justify-center shrink-0 border-r border-slate-200 pr-5 gap-1">
                                    <Clock className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600">{task.time}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={cn("text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2", task.completed && "line-through text-slate-400")}>
                                        {task.text}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-md",
                                            task.priority === "Высокий" ? "bg-red-50 text-red-600" :
                                                task.priority === "Средний" ? "bg-amber-50 text-amber-600" :
                                                    "bg-blue-50 text-blue-600"
                                        )}>
                                            {task.priority || "Обычный"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-slate-400 text-sm font-medium bg-white rounded-2xl border border-dashed border-slate-200">
                                Нет активных задач
                            </div>
                        )}
                    </div>

                    <Button variant="outline" className="w-full h-16 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all group font-bold text-xs">
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Добавить новую задачу
                    </Button>
                </div>
            </div>
        </div>
    );
}
