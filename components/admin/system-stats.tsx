"use client";

import { useEffect, useState } from "react";
import { getSystemStats } from "@/app/dashboard/admin/actions";
import {
    Activity,
    Database,
    HardDrive,
    Clock,
    Server,
    ShieldCheck,
    Cpu,
    MemoryStick,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatsData {
    server: {
        cpuLoad: number[];
        totalMem: number;
        freeMem: number;
        uptime: number;
        platform: string;
        arch: string;
    };
    database: {
        size: number;
        tableCounts: Record<string, string | number>;
    };
    storage: {
        size: number;
        fileCount: number;
    };
}

export function SystemStats() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchStats = async () => {
        setLoading(true);
        const res = await getSystemStats();
        if (res.data) {
            setStats(res.data as StatsData);
            setLastUpdated(new Date());
        } else if (res.error) {
            setError(res.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, []);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${days}д ${hours}ч ${mins}м`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Технический мониторинг</h3>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-0.5">Состояние ресурсов и инфраструктуры</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right mr-2 hidden sm:block">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Обновлено</p>
                        <p className="text-xs text-slate-600 font-medium">{lastUpdated.toLocaleTimeString()}</p>
                    </div>
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Server size={80} strokeWidth={1} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white/80 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} /> Сервер
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Online</div>
                        <div className="text-indigo-100 text-xs mt-1 flex items-center gap-1.5 font-medium">
                            <Clock size={12} /> {stats ? formatUptime(stats.server.uptime) : '...'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <Cpu size={14} /> Нагрузка CPU
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {stats ? ((stats.server.cpuLoad[0] * 10).toFixed(1) + '%') : '...'}
                        </div>
                        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full transition-all duration-1000"
                                style={{ width: stats ? `${Math.min(stats.server.cpuLoad[0] * 10, 100)}%` : '0%' }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <MemoryStick size={14} /> Память (RAM)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {stats ? Math.round(((stats.server.totalMem - stats.server.freeMem) / stats.server.totalMem) * 100) + '%' : '...'}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">
                            {stats ? `${formatSize(stats.server.totalMem - stats.server.freeMem)} из ${formatSize(stats.server.totalMem)}` : '...'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <Database size={14} /> База данных
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {stats ? formatSize(stats.database.size) : '...'}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                            <ShieldCheck size={10} className="text-emerald-500" /> PostgreSQL
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-slate-800">Наполнение таблиц</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            {[
                                { label: 'Заказы', key: 'orders' },
                                { label: 'Клиенты', key: 'clients' },
                                { label: 'Сов-ки', key: 'users' },
                                { label: 'Логи', key: 'auditLogs' },
                            ].map(item => (
                                <div key={item.key} className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                    <p className="text-lg font-bold text-slate-900">{stats ? stats.database.tableCounts[item.key] : '0'}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-slate-800">Хранилище</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HardDrive size={16} className="text-indigo-500" />
                                <span className="text-sm font-medium text-slate-600">uploads/</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{stats ? formatSize(stats.storage.size) : '0 MB'}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                                className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: stats ? `${(stats.storage.size / (10 * 1024 * 1024 * 1024)) * 100}%` : '0%' }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 text-right font-bold uppercase">{stats ? stats.storage.fileCount : 0} файлов</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
