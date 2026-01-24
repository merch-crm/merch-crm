"use client";

import React, { useState, useEffect } from "react";
import {
    Settings,
    LayoutGrid,
    BookOpen,
    Calendar,
    Bell,
    ChevronRight,
    Search,
    CheckCircle2,
    CreditCard,
    Plus,
    UserCircle,
    LogOut,
    Clock,
    Shield,
    GraduationCap
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { getUserStatistics, getUserSchedule } from "./actions";
import { StatisticsView } from "./statistics-view";
import { ScheduleView } from "./schedule-view";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RoleBadge } from "@/components/ui/role-badge";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    socialMax?: string | null;
    department?: { name: string } | string | null;
    role?: { name: string } | null;
    birthday?: string | null;
    createdAt: string | Date;
}

interface ActivityItem {
    id: number;
    type: string;
    text: string;
    time: string;
    iconName: string;
    color: string;
}

interface Task {
    id: number;
    text: string;
    time: string;
    priority: string;
    priorityColor: string;
    completed: boolean;
}

interface ProfileClientProps {
    user: UserProfile;
    activities: ActivityItem[];
    tasks: Task[];
}

interface StatisticsData {
    totalOrders: number;
    totalRevenue: number;
    monthlyOrders: number;
    tasksByStatus: Array<{ count: number; status: string }>;
    totalActivity: number;
    efficiency: number;
}

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

export function ProfileClient({ user, activities, tasks }: ProfileClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Map URL param to internal view state
    // Map URL param to internal view state
    const tabParam = searchParams.get("p");
    const initialView = (tabParam && ["settings", "statistics", "schedule", "notifications"].includes(tabParam))
        ? tabParam as "profile" | "settings" | "statistics" | "schedule" | "notifications"
        : "profile";

    const [view, setView] = useState<"profile" | "settings" | "statistics" | "schedule" | "notifications">(initialView);

    const [statsData, setStatsData] = useState<StatisticsData | null>(null);
    const [scheduleData, setScheduleData] = useState<ScheduleTask[]>([]);
    const [loading, setLoading] = useState(false);

    // Sync state with URL params changes
    useEffect(() => {
        const target = (tabParam && ["settings", "statistics", "schedule", "notifications"].includes(tabParam))
            ? tabParam as typeof view
            : "profile";

        if (view !== target) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- URL sync pattern
            setView(target);
        }
    }, [tabParam]); // Remove 'view' from dependency to avoid cycle if setView triggers update

    // Data fetching
    const fetchStats = React.useCallback(async () => {
        setLoading(true);
        const res = await getUserStatistics();
        if (res.data) setStatsData(res.data);
        setLoading(false);
    }, []);

    const fetchSchedule = React.useCallback(async () => {
        setLoading(true);
        const res = await getUserSchedule();
        if (res.data) setScheduleData(res.data);
        setLoading(false);
    }, []);

    useEffect(() => {
        if ((view === "statistics" || view === "profile") && !statsData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching pattern
            fetchStats();
        }
        if (view === "schedule" && scheduleData.length === 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching pattern
            fetchSchedule();
        }
    }, [view, statsData, scheduleData.length, fetchStats, fetchSchedule]);

    const handleNavClick = (newView: typeof view) => {
        setView(newView);
        const params = new URLSearchParams(searchParams.toString());
        params.set("p", newView);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    // Helper for safe strings
    const getDepartmentName = () => {
        if (!user.department) return "Общий отдел";
        if (typeof user.department === 'string') return user.department;
        return user.department.name;
    };

    const getRoleName = () => {
        if (!user.role) return "Сотрудник";
        return user.role.name; // user.role is typed as { name: string } | null
    };

    const navItems: Array<{ id: typeof view; label: string; icon: React.ReactNode }> = [
        { id: "profile", label: "Главная", icon: <LayoutGrid /> },
        { id: "statistics", label: "Статистика", icon: <BookOpen /> },
        { id: "schedule", label: "Расписание", icon: <Calendar /> },
        { id: "notifications", label: "Уведомления", icon: <Bell /> },
        { id: "settings", label: "Настройки", icon: <Settings /> },
    ];

    return (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-slate-50 font-sans">
            {/* Sidebar - Dark Style */}
            <aside className="w-full md:w-[260px] lg:w-[280px] bg-[#0F172A] text-white p-6 flex flex-col shrink-0 relative z-10 transition-all border-r border-slate-800 h-full overflow-y-auto">
                <div className="flex items-center gap-3 mb-10 pl-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight leading-none block">MerchCRM</span>
                        <span className="text-xs text-slate-400 font-bold tracking-wide uppercase">Profile</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 mb-8">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative overflow-hidden",
                                view === item.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {/* Hover Effect */}
                            {view !== item.id && (
                                <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 rounded-xl" />
                            )}

                            {item.icon && <span className="w-5 h-5 relative z-10">{item.icon}</span>}
                            <span className="relative z-10">{item.label}</span>
                            {view === item.id && <ChevronRight className="ml-auto w-4 h-4 relative z-10" />}
                        </button>
                    ))}
                </nav>

                <div className="mb-4 pt-4 border-t border-slate-800">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Вернуться в CRM</span>
                    </button>
                </div>

                {/* User Info Mini Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-primary/40 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden shrink-0">
                                {user.avatar ? (
                                    <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-sm truncate text-white">{user.name}</h4>
                                <p className="text-[10px] text-slate-400 font-medium truncate">{getRoleName()}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleNavClick("settings")}
                            className="w-full py-2 bg-primary hover:bg-primary-hover rounded-xl text-[10px] font-bold tracking-wide uppercase shadow-lg shadow-primary/10 transition-all"
                        >
                            Редактировать
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-8 lg:p-12 relative z-0 overflow-y-auto bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {/* Top Bar */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {view === "profile" && "Обзор профиля"}
                            {view === "settings" && "Настройки аккаунта"}
                            {view === "statistics" && "Аналитика и KPI"}
                            {view === "schedule" && "Рабочее расписание"}
                            {view === "notifications" && "Центр уведомлений"}
                        </h1>
                        <p className="text-sm font-medium text-slate-400 mt-2">
                            Добро пожаловать, <span className="text-slate-900 font-bold">{user.name}</span>! Продуктивного дня.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Поиск..."
                                className="w-64 h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                        <button className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {view === "profile" && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-12">
                                {/* Left Column - Stats & Activity */}
                                <div className="lg:col-span-8 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-slate-900">Ключевые показатели</h3>
                                        <button
                                            onClick={() => handleNavClick("statistics")}
                                            className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all px-3 py-1.5 rounded-lg hover:bg-primary/5"
                                        >
                                            Вся статистика <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                value: `${(statsData?.totalRevenue || 0).toLocaleString()} ₽`,
                                                subtitle: "Принесено компании",
                                                progress: 45,
                                                color: "bg-slate-900",
                                                textColor: "text-slate-900",
                                                icon: <CreditCard />
                                            },
                                        ].map((stat, i) => (
                                            <div key={i} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all cursor-default">
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
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">{stat.title}</p>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between text-[11px] font-bold">
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
                                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">Активность за неделю</h3>
                                                <p className="text-xs font-bold text-slate-400 mt-1">Количество действий в системе</p>
                                            </div>
                                            <div className="flex items-center gap-4">
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

                                        <div className="h-48 flex items-end justify-between gap-2 md:gap-6 relative z-10 pl-2">
                                            {[45, 70, 30, 85, 60, 40, 95].map((h, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                                                    <div className="w-full relative h-full flex items-end rounded-t-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                        <div
                                                            className="w-full bg-primary rounded-t-lg transition-all duration-700 group-hover:bg-primary-hover relative"
                                                            style={{ height: `${h}%` }}
                                                        >
                                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                {h} действий
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Info & Tasks */}
                                <div className="lg:col-span-4 space-y-4">
                                    <div className="bg-primary rounded-3xl p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                                        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                                        <div className="absolute -left-10 bottom-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

                                        <div className="relative z-10">
                                            <h3 className="text-xl font-bold mb-3">{getDepartmentName()}</h3>
                                            <p className="text-white/70 text-sm font-medium leading-relaxed mb-8">
                                                Вы являетесь ключевым сотрудником отдела. Продолжайте в том же духе, ваш вклад важен для команды!
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <RoleBadge roleName={getRoleName()} className="bg-white/20 text-white border-none shadow-none text-xs py-1 px-3" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-lg font-bold text-slate-900">Последние задачи</h3>
                                            <button className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {tasks.length > 0 ? tasks.slice(0, 3).map((task, i) => (
                                                <div key={i} className="flex gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                                                    <div className="flex flex-col items-center justify-center shrink-0 border-r border-slate-100 pr-5 gap-1">
                                                        <Clock className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600">{task.time}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={cn("text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2", task.completed && "line-through text-slate-400")}>
                                                            {task.text}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md",
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

                                        <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all group font-bold text-xs uppercase tracking-wider">
                                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                            Добавить новую задачу
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {view === "settings" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <UserCircle className="w-6 h-6 text-primary" /> Личные данные
                                    </h2>
                                    <ProfileForm user={user} />
                                </div>
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Shield className="w-6 h-6 text-primary" /> Безопасность
                                    </h2>
                                    <PasswordForm />
                                </div>
                            </div>
                        )}

                        {view === "statistics" && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
                                {loading && !statsData ? (
                                    <div className="flex items-center justify-center h-40 font-bold text-slate-300">Загрузка данных...</div>
                                ) : (
                                    <StatisticsView data={statsData} />
                                )}
                            </div>
                        )}

                        {view === "notifications" && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
                                <h2 className="text-xl font-bold mb-6">История уведомлений</h2>
                                <div className="space-y-4">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 group">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-white border border-slate-100 flex items-center justify-center text-primary font-bold shadow-sm group-hover:shadow-md transition-all">
                                                {/* Simple Icon placeholder */}
                                                <CheckCircle2 className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{activity.text}</p>
                                                <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {activities.length === 0 && (
                                        <p className="text-center text-slate-400 py-10">Уведомлений пока нет</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {view === "schedule" && (
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
                                {loading && scheduleData.length === 0 ? (
                                    <div className="flex items-center justify-center h-40 font-bold text-slate-300">Загрузка расписания...</div>
                                ) : (
                                    <ScheduleView tasks={scheduleData} />
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
