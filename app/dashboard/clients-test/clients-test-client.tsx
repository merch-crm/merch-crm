"use client";

import { useState } from "react";
import {
    Users,
    UserPlus,
    CreditCard,
    BarChart3,
    Plus,
    ArrowUpRight,
    LayoutGrid,
    LayoutList,
    Sparkles,
    MoreHorizontal,
    ChevronRight,
    Home,
    ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ClientsTable } from "./clients-list";

interface ClientStats {
    totalClients: number;
    newThisMonth: number;
    avgCheck: number;
    totalRevenue: number;
}

interface ClientsTestClientProps {
    stats: ClientStats;
    userRoleName?: string | null;
    showFinancials: boolean;
}

export function ClientsTestClient({ stats, userRoleName, showFinancials }: ClientsTestClientProps) {
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    const statCards = [
        {
            name: "Всего клиентов",
            value: stats.totalClients.toLocaleString(),
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            glow: "shadow-blue-500/20",
            trend: "+12%",
            isPositive: true,
            visible: true
        },
        {
            name: "Активных за месяц",
            value: stats.newThisMonth.toLocaleString(),
            icon: UserPlus,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            glow: "shadow-emerald-500/20",
            trend: "+8%",
            isPositive: true,
            visible: true
        },
        {
            name: "Средний чек",
            value: `${stats.avgCheck.toLocaleString()} ₽`,
            icon: CreditCard,
            color: "text-[#5d00ff]",
            bg: "bg-[#5d00ff]/10",
            glow: "shadow-[#5d00ff]/20",
            trend: "-2%",
            isPositive: false,
            visible: showFinancials
        },
        {
            name: "Общая выручка",
            value: `${stats.totalRevenue.toLocaleString()} ₽`,
            icon: BarChart3,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            glow: "shadow-indigo-500/20",
            trend: "+18%",
            isPositive: true,
            visible: showFinancials
        },
    ].filter(card => card.visible);

    return (
        <div className="space-y-16 animate-in fade-in duration-1000 pb-20 relative px-2">
            {/* --- BACKGROUND GLOW DECO --- */}
            <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header Area */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2 relative z-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            v2.0 Beta
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Real-time active
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none flex items-center gap-4">
                        База клиентов
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </h1>
                    <p className="text-slate-400 font-bold text-sm tracking-tight border-l-2 border-slate-100 pl-4 py-1 mt-2">
                        Управление контрагентами и аналитика лояльности в едином интерфейсе.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="glass-panel p-1.5 flex items-center gap-1 border-white/40 shadow-sm">
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95",
                                viewMode === "list" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <LayoutList className="w-4 h-4" />
                            Список
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95",
                                viewMode === "grid" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Сетка
                        </button>
                    </div>

                    <button className="btn-primary h-14 px-8 rounded-[var(--radius-inner)] flex items-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                        <Plus className="w-5 h-5" />
                        Новый контрагент
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {statCards.map((card, idx) => (
                    <motion.div
                        key={card.name}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.6, ease: "easeOut" }}
                        className="crm-card group h-[220px] flex flex-col justify-between p-8 border-none shadow-crm-lg hover:shadow-primary/10 transition-all cursor-pointer overflow-hidden relative"
                    >
                        {/* Interactive Background Gradient */}
                        <div className={cn("absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700", card.bg.replace('/10', '/30'))} />

                        <div className="flex justify-between items-start relative z-10">
                            <div className={cn("p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6", card.bg)}>
                                <card.icon className={cn("h-6 w-6", card.color)} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black border backdrop-blur-md transition-all",
                                card.isPositive
                                    ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10 group-hover:bg-emerald-500/10"
                                    : "text-rose-500 bg-rose-500/5 border-rose-500/10 group-hover:bg-rose-500/10"
                            )}>
                                {card.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                {card.trend}
                            </div>
                        </div>

                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform duration-300">
                                {card.name}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black text-slate-900 tracking-tighter group-hover:tracking-normal transition-all duration-500">
                                    {card.value}
                                </h3>
                                {(card.name.includes("чек") || card.name.includes("выручка")) && <span className="text-lg font-black text-primary">₽</span>}
                            </div>
                        </div>

                        {/* Sparkline Visual (Decorative) */}
                        <div className="absolute bottom-4 right-8 left-8 h-8 opacity-20 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                            <svg viewBox="0 0 100 20" className="w-full h-full">
                                <motion.path
                                    d="M 0 15 Q 15 5, 30 12 T 60 8 T 100 12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className={cn(card.color)}
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                />
                            </svg>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="relative z-10">
                <AnimatePresence mode="wait">
                    {viewMode === "list" ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6">
                            <ClientsTable userRoleName={userRoleName} showFinancials={showFinancials} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* NEW: Grid View Preview */}
                            <div className="col-span-full py-32 text-center glass-panel border-dashed bg-white/30">
                                <div className="mb-6 flex justify-center">
                                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
                                        <LayoutGrid className="w-10 h-10 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Режим сетки в разработке</h3>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto mt-3 font-medium">
                                    Мы проектируем идеальные интерактивные карточки для вашей базы.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- BOTTOM WIDGETS (INSPIRED BY SHOWCASE) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 pt-10">
                <div className="lg:col-span-7 glass-panel p-12 bg-slate-900 text-white border-none shadow-crm-xl relative overflow-hidden group min-h-[380px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#5d00ff]/20 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-[#5d00ff]/30 transition-all duration-1000" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-[80px]" />

                    {/* Wave Graph Background */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none">
                        <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d">
                            <motion.path
                                d="M 0 80 Q 50 20, 100 80 T 200 80 T 300 80 T 400 80 L 400 100 L 0 100 Z"
                                fill="url(#marketingGradient)"
                                initial={{ y: 20 }}
                                animate={{ y: [20, 10, 20] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <defs>
                                <linearGradient id="marketingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#5d00ff" />
                                    <stop offset="100%" stopColor="#5d00ff" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8 backdrop-blur-md border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl overflow-hidden relative">
                            <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                            <ArrowUpRight className="w-8 h-8 text-white relative z-10" />
                        </div>
                        <h3 className="text-5xl font-black tracking-tighter uppercase mb-6 leading-[0.85]">
                            Автоматизация <br /> <span className="text-primary italic">маркетинга 2.0</span>
                        </h3>
                        <p className="text-white/50 text-base font-medium leading-relaxed max-w-sm">
                            Интеллектуальные триггеры для удержания клиентов и персонализированные предложения на основе LTV.
                        </p>
                    </div>

                    <button className="relative z-10 w-fit h-14 px-10 bg-white text-slate-900 rounded-[var(--radius-inner)] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5">
                        Настроить триггеры
                    </button>

                    <div className="absolute bottom-12 right-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-48 h-48" />
                    </div>
                </div>

                <div className="lg:col-span-5 glass-panel p-10 bg-white/80 border-white/60 shadow-crm-lg flex flex-col min-h-[340px]">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Рабочие задачи</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Клиентский сервис</p>
                        </div>
                        <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-5 flex-1">
                        {[
                            { name: 'ООО "Вектор"', action: "Перезвонить по КП", date: "Сегодня, 14:30", type: "call" },
                            { name: "Иван Петров", action: "Уточнить макет", date: "Завтра, 10:00", type: "design" },
                        ].map((task, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-white rounded-[22px] border border-slate-100 hover:border-primary/30 hover:shadow-crm-md transition-all cursor-pointer group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 shadow-inner font-black group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                                        {task.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900 leading-none mb-1.5">{task.name}</div>
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {task.action}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">{task.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-all flex items-center gap-3 self-center group">
                        Развернуть все задачи
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary group-hover:translate-x-1 transition-all">
                            <ArrowUpRight className="w-3 h-3" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
