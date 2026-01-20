"use client";

import { useState, ComponentType } from "react";
import {
    User,
    Settings,
    BarChart3,
    Calendar,
    Clock,
    Edit3,
    CheckCircle2,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { PlusCircle, Send, Loader2 } from "lucide-react";
import { getUserStatistics, getUserSchedule } from "./actions";
import { StatisticsView } from "./statistics-view";
import { ScheduleView } from "./schedule-view";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

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

interface Activity {
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
    activities: Activity[];
    tasks: Task[];
}

const IconMap: Record<string, ComponentType<{ className?: string }>> = {
    PlusCircle: PlusCircle,
    User: User,
    Send: Send,
    CheckCircle2: CheckCircle2
};

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

    // Initialize tab from URL
    const tabParam = searchParams.get("p");
    const [activeTab, setActiveTab] = useState<"profile" | "settings" | "statistics" | "schedule" | "notifications">(
        (tabParam && ["profile", "settings", "statistics", "schedule", "notifications"].includes(tabParam))
            ? tabParam as "profile" | "settings" | "statistics" | "schedule" | "notifications"
            : "profile"
    );

    const [statsData, setStatsData] = useState<StatisticsData | null>(null);
    const [scheduleData, setScheduleData] = useState<ScheduleTask[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        // Defer to avoid synchronous setState warning
        await new Promise(resolve => setTimeout(resolve, 0));
        setLoading(true);
        const res = await getUserStatistics();
        if (res.data) setStatsData(res.data);
        setLoading(false);
    };

    const fetchSchedule = async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
        setLoading(true);
        const res = await getUserSchedule();
        if (res.data) setScheduleData(res.data);
        setLoading(false);
    };

    // Auto-fetch data when tab changes or initially
    useEffect(() => {
        if (activeTab === "statistics" && !statsData) {
            setTimeout(() => fetchStats(), 0);
        }
        if (activeTab === "schedule" && scheduleData.length === 0) {
            setTimeout(() => fetchSchedule(), 0);
        }
    }, [activeTab, statsData, scheduleData.length]);

    const onTabChange = (tab: "profile" | "settings" | "statistics" | "schedule" | "notifications") => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set("p", tab);
        router.replace(`?${params.toString()}`, { scroll: false });
        if (tab === "statistics" && !statsData) fetchStats();
        if (tab === "schedule" && scheduleData.length === 0) fetchSchedule();
    };



    const tabs = [
        { id: "profile", name: "Профиль", icon: User },
        { id: "settings", name: "Настройки", icon: Settings },
        { id: "notifications", name: "Уведомления", icon: Bell },
        { id: "statistics", name: "Статистика", icon: BarChart3 },
        { id: "schedule", name: "Заработная плата", icon: Calendar },
    ];

    return (
        <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg p-1.5 shadow-sm border border-slate-100 flex gap-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id as "profile" | "settings" | "statistics" | "schedule" | "notifications")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {activeTab === "profile" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Main Info Block */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-slate-900">Личная информация</h2>
                                <button
                                    onClick={() => setActiveTab("settings")}
                                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Редактировать
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">ФИО</div>
                                    <div className="text-base font-bold text-slate-900">{user.name}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Дата рождения</div>
                                    <div className="text-base font-bold text-slate-900">
                                        {user.birthday ? new Date(user.birthday).toLocaleDateString("ru-RU", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        }) : "—"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</div>
                                    <a
                                        href={`mailto:${user.email}`}
                                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                                    >
                                        {user.email}
                                    </a>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Телефон</div>
                                    {user.phone ? (
                                        <a
                                            href={`tel:${user.phone.replace(/\D/g, '')}`}
                                            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                                        >
                                            {user.phone}
                                        </a>
                                    ) : (
                                        <div className="text-base font-bold text-slate-900">—</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Telegram</div>
                                    {user.telegram ? (
                                        <a
                                            href={`https://t.me/${user.telegram.startsWith('@') ? user.telegram.slice(1) : user.telegram}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-base font-bold text-slate-900 hover:text-blue-500 transition-colors block"
                                        >
                                            {user.telegram}
                                        </a>
                                    ) : (
                                        <div className="text-base font-bold text-slate-900">—</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instagram</div>
                                    {user.instagram ? (
                                        <a
                                            href={`https://instagram.com/${user.instagram.startsWith('@') ? user.instagram.slice(1) : user.instagram}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-base font-bold text-slate-900 hover:text-pink-500 transition-colors block"
                                        >
                                            {user.instagram}
                                        </a>
                                    ) : (
                                        <div className="text-base font-bold text-slate-900">—</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max</div>
                                    <div className="text-base font-bold text-slate-900">{user.socialMax || "—"}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Дата начала работы</div>
                                    <div className="text-base font-bold text-slate-900">
                                        {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tasks Block */}
                        <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Задачи на сегодня</h2>
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                                        <div className={cn(
                                            "mt-1 h-5 w-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors",
                                            task.completed ? "bg-indigo-600 border-indigo-600" : "border-slate-300 bg-white"
                                        )}>
                                            {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className={cn("text-[15px] font-bold", task.completed ? "text-slate-400 line-through" : "text-slate-700")}>
                                                    {task.text}
                                                </span>
                                                <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded", task.priorityColor)}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-400 text-xs mt-1 font-medium">
                                                <Clock className="w-3 h-3" />
                                                {task.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity Stream */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-100 min-h-[500px]">
                            <h2 className="text-xl font-bold text-slate-900 mb-8">Последняя активность</h2>
                            <div className="space-y-8 relative before:absolute before:left-[1.75rem] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                                {activities.map((activity) => {
                                    const Icon = IconMap[activity.iconName] || User;
                                    return (
                                        <div key={activity.id} className="relative flex gap-6 group">
                                            <div className={cn(
                                                "relative z-10 h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform",
                                                activity.color
                                            )}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <div className="text-[15px] font-bold text-slate-900">{activity.text}</div>
                                                <div className="text-sm text-slate-400 font-medium mt-0.5">{activity.time}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "settings" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                Настройки профиля
                            </h2>
                            <ProfileForm user={user} />
                        </div>
                        <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-600" />
                                Безопасность
                            </h2>
                            <PasswordForm />
                        </div>
                    </div>

                </div>
            )}

            {activeTab === "statistics" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {loading && !statsData ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : (
                        <StatisticsView data={statsData} />
                    )}
                </div>
            )}

            {activeTab === "notifications" && (
                <div className="bg-white rounded-[24px] p-8 shadow-crm-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Центр уведомлений</h2>
                            <p className="text-slate-400 text-sm font-bold mt-1">История всех ваших оповещений</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Всего: {activities.length}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {activities.length > 0 ? (
                            activities.map((activity) => {
                                const Icon = IconMap[activity.iconName] || User;
                                return (
                                    <div key={activity.id} className="group flex items-center gap-6 p-6 rounded-[18px] bg-slate-50/50 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-xl transition-all duration-500">
                                        <div className={cn(
                                            "h-12 w-12 rounded-[14px] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
                                            activity.color
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-base font-bold text-slate-900 truncate">{activity.text}</div>
                                            <div className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-wider">{activity.time}</div>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-20 bg-slate-50/50 rounded-[18px] border-2 border-dashed border-slate-200">
                                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-300">Уведомлений пока нет</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "schedule" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {loading && scheduleData.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : (
                        <ScheduleView tasks={scheduleData} />
                    )}
                </div>
            )}
        </div>
    );
}
