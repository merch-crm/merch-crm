"use client";

import { 
    LayoutDashboard, 
    CheckSquare, 
    Trophy, 
    CircleDollarSign, 
    Clock, 
    ArrowUpRight,
    LifeBuoy,
    Plus,
    Flame
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { TicketModal } from "@/components/portal/ticket-modal";
import { useState, useMemo, useEffect } from "react";
import { useIsClient } from "@/hooks/use-is-client";
import { type PortalData } from "./types";
import dynamic from "next/dynamic";

const PortalChart = dynamic(() => import("./components/PortalChart"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100/50 animate-pulse rounded-2xl border border-dashed border-slate-200" />
});

// PortalData and PortalClientProps moved to types.ts or use import

interface PortalClientProps {
    data: PortalData | null;
}

export function PortalClient({ data }: PortalClientProps) {
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const isClient = useIsClient();
    
    const chartData = useMemo(() => {
        if (!data?.stats || !isClient) return [];
        return [...data.stats].reverse().map((s) => ({
            name: format(new Date(s.date as string | Date), "dd.MM", { locale: ru }),
            hours: Math.round(((s.workSeconds as number) || 0) / 3600 * 10) / 10,
            productivity: Number(s.productivity) || 0
        }));
    }, [data?.stats, isClient]);

    const avgProductivity = useMemo(() => {
        if (!data?.stats || data.stats.length === 0) return 0;
        const validStats = data.stats.filter(s => Number(s.productivity) > 0);
        if (validStats.length === 0) return 0;
        const sum = validStats.reduce((acc, s) => acc + (Number(s.productivity) || 0), 0);
        return Math.round(sum / validStats.length);
    }, [data?.stats]);

    const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
    const [shiftProgress, setShiftProgress] = useState(0);

    useEffect(() => {
        if (!data?.currentSession?.startTime) {
            setElapsedTime("00:00:00");
            setShiftProgress(0);
            return;
        }

        const startTime = new Date(data.currentSession.startTime).getTime();
        
        const updateTimer = () => {
            const now = new Date().getTime(); // suppressHydrationWarning
            const diffMs = Math.max(0, now - startTime);
            
            const h = Math.floor(diffMs / 3600000);
            const m = Math.floor((diffMs % 3600000) / 60000);
            const s = Math.floor((diffMs % 60000) / 1000);
            
            setElapsedTime(
                `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            );

            // Assuming 8h shift norm (28800 sec)
            const progress = Math.min(100, Math.round((diffMs / 1000) / 28800 * 100));
            setShiftProgress(progress);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [data?.currentSession]);

    if (!data) return <div>Загрузка...</div>;

    const { isStaff } = data;

    if (!isStaff || !data.staff) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white/50 backdrop-blur-xl rounded-[40px] border border-white/60 shadow-2xl">
                <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mb-6 border border-amber-200 shadow-inner">
                    <LifeBuoy className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4">Доступ ограничен</h1>
                <p className="text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                    Этот раздел предназначен только для производственного персонала. Если вы считаете, что это ошибка, обратитесь к администратору.
                </p>
                <Link href="/dashboard" className="mt-8 btn-dark px-8 py-3 rounded-2xl font-bold">
                    Вернуться на главную
                </Link>
            </div>
        );
    }

    const { activeTasks = [], achievements = [], pieceworkTotal = 0 } = data as Exclude<PortalData, null>;

    return (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                        <LayoutDashboard className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Мой Портал</h1>
                        <p className="text-slate-500 font-bold flex items-center gap-2">
                            {data?.staff?.position || "Сотрудник производства"} 
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            {isClient ? format(new Date(), "d MMMM, EEEE", { locale: ru }) : "..."} {/* // suppressHydrationWarning */}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={() => setIsTicketModalOpen(true)}
                        className="btn-dark px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-slate-900/10"
                    >
                        <Plus className="w-4 h-4" />
                        Создать тикет
                    </button>
                    <button 
                        type="button"
                        className="bg-white/60 backdrop-blur-md border border-white p-3 rounded-2xl text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        <LifeBuoy className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Top Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Piecework Card */}
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="crm-card bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-indigo-500/50 shadow-xl shadow-indigo-600/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-500" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                <CircleDollarSign className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-black bg-white/10 px-2 py-1 rounded-lg border border-white/10">Месяц</span>
                </div>
                <div>
                    <h3 className="text-indigo-100/70 text-sm font-bold mb-1 ">Сдельная оплата (План)</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">{(pieceworkTotal / 100).toLocaleString('ru-RU')}</span>
                        <span className="text-xl font-bold opacity-60">₽</span>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-100/60">Завершено задач: {activeTasks.length}</span>
                    <div className="flex items-center gap-1 text-xs font-black text-indigo-200">
                        История <ArrowUpRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Status/Presence Card */}
        <div className="crm-card bg-white/40 backdrop-blur-xl border-white group hover:bg-white/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Clock className="w-5 h-5" />
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-black border border-emerald-200 ">На смене</div>
            </div>
            <div>
                <div className="text-3xl font-black text-slate-900 tabular-nums">
                    {data?.currentSession ? elapsedTime : "00:00:00"}
                </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
                <div className="flex-1 h-3 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${shiftProgress}%` }}
                        className={cn(
                            "h-full transition-all duration-1000",
                            shiftProgress > 90 ? "bg-amber-500" : "bg-emerald-500"
                        )} 
                    />
                </div>
                <span className="text-xs font-black text-slate-400">{shiftProgress}% нормы</span>
            </div>
        </div>

        {/* Achievement Card */}
        <div className="crm-card bg-white border-slate-100 relative group overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Trophy className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-primary">
                    <Flame className="w-4 h-4 fill-primary" />
                    <span className="font-black text-sm">3 дня</span>
                </div>
            </div>
            <div>
                <h3 className="text-slate-400 text-xs font-black mb-1 ">Мои достижения</h3>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-slate-900">{achievements.length}</span>
                    <span className="text-slate-400 font-bold">разблокировано</span>
                </div>
            </div>
                <div className="mt-6">
                {achievements.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {achievements.map((ua, i: number) => (
                            <motion.div 
                                key={ua.id} 
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm flex items-center gap-3 group hover:bg-white/60 transition-colors"
                                title={ua.achievement.description}
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xl shadow-inner border border-white group-hover:scale-110 transition-transform">
                                    {ua.achievement.icon || "🏆"}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-slate-900  truncate">{ua.achievement.name}</p>
                                    <p className="text-xs text-slate-400 font-bold">Unlocked</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-center">
                        <p className="text-xs text-slate-400 font-black  leading-relaxed">
                            Начните выполнять задачи, чтобы разблокировать уникальные награды
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>

    {/* Middle Section: Tasks & Stats */}
    <div className="grid grid-cols-12 gap-3">
        {/* Active Tasks Table */}
        <div className="col-span-12 lg:col-span-8 space-$1-3">
            {/* Performance History Chart */}
            <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-white/60 shadow-xl shadow-slate-200/40">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 ">Рабочая активность</h3>
                        <p className="text-xs text-slate-500 font-bold">Часы работы за последние 7 дней</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50/50 rounded-full border border-indigo-100/50">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-xs font-black text-indigo-600 ">Live Stats</span>
                    </div>
                </div>
                
                <div className="h-[200px] w-full">
                    <PortalChart data={chartData} />
                </div>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                        <CheckSquare className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Мои задачи в работе</h2>
                </div>
                <Link href="/dashboard/tasks" className="text-xs font-black text-primary hover:underline flex items-center gap-1">
                    Все задачи <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="crm-card !p-0 overflow-hidden bg-white/70 backdrop-blur-md border-white/60">
                {activeTasks.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {activeTasks.map((task) => (
                            <div key={task.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center gap-3 group">
                                <div className={cn(
                                    "w-2 h-10 rounded-full",
                                    task.priority === 'urgent' ? "bg-rose-500" : 
                                    task.priority === 'high' ? "bg-amber-500" : "bg-slate-200"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-black text-slate-400  bg-slate-100 px-1.5 py-0.5 rounded leading-none">#{task.number}</span>
                                        <span className={cn(
                                            "text-xs font-black  px-1.5 py-0.5 rounded leading-none border",
                                            task.status === 'in_progress' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                        )}>
                                            {task.status === 'in_progress' ? "В работе" : "Ожидает"}
                                        </span>
                                    </div>
                                    <h4 className="font-black text-slate-900 text-sm truncate ">{task.title}</h4>
                                    <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                                        <span>Тираж: <b className="text-slate-900">{task.quantity}шт</b></span>
                                        <span className="text-slate-300">•</span>
                                        <span>Заказ: <Link href={`/dashboard/orders/${task.orderId}`} className="text-primary hover:underline">#{task.order?.orderNumber}</Link></span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-xs font-black text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        До {isClient && task.dueDate ? format(new Date(task.dueDate), "dd.MM", { locale: ru }) : '—'}
                                    </div>
                                    <button 
                                        type="button"
                                        className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md shadow-primary/20"
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-slate-400 font-bold">Активных задач нет. Отдыхайте!</p>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar Column: Productivity & Support */}
        <div className="col-span-12 lg:col-span-4 space-$1-3">
            <div className="flex items-center gap-3 px-2">
                <h2 className="text-lg font-black text-slate-900">Продуктивность</h2>
            </div>

            <div className="crm-card bg-slate-900 text-white border-slate-800 shadow-2xl relative overflow-hidden h-[240px]">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    {/* Simple SVG Chart Background */}
                    <svg viewBox="0 0 400 200" className="w-full h-full">
                        <path 
                            d="M 0 180 Q 50 160 100 120 T 200 130 T 300 80 T 400 40 L 400 200 L 0 200 Z" 
                            fill="url(#gradient)" 
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.8 }} />
                                <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                        <h4 className="text-white/50 text-xs font-black mb-1">Средняя выработка</h4>
                        <div className="text-4xl font-black">{avgProductivity}%</div>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${avgProductivity}%` }} />
                            </div>
                            <span className="text-xs font-black text-primary">
                                {avgProductivity > 90 ? "Отлично" : avgProductivity > 70 ? "Норма" : "Ниже нормы"}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 h-32 items-end">
                        {chartData.slice(-7).map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${day.productivity}%` }}
                                    className={cn(
                                        "w-full rounded-t-lg transition-all border-t border-x border-white/10",
                                        i === chartData.slice(-7).length - 1 ? "bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" : "bg-white/5"
                                    )} 
                                />
                                <span className="text-xs font-black text-white/30">{day.name.split('.')[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Support Block */}
            <div className="crm-card bg-amber-50 border-amber-100/50 p-6 flex items-start gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                    <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-black text-slate-900  text-sm mb-1">Нужна помощь?</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                        Если возникли сложности с заказом или оборудованием, создайте тикет.
                    </p>
                    <button 
                        type="button"
                        onClick={() => setIsTicketModalOpen(true)}
                        className="text-xs font-black text-amber-600 flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        Связаться с мастером <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    </div>

    <TicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
    />
</div>
    );
}
