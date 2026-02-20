import React from "react";
import {
    Activity,
    Cpu,
    Database,
    HardDrive,
    MemoryStick,
    Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatSize, formatUptime } from "../utils";
import { StatsData, MonitoringData } from "../types";

interface MonitoringStatsProps {
    stats: StatsData | null;
    monitoringData: MonitoringData | null;
}

export function MonitoringStats({ stats, monitoringData }: MonitoringStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-[#5d00ff] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Server size={80} strokeWidth={1} />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-white/80 text-xs font-bold flex items-center gap-2">
                        <Activity size={14} /> Сервер
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Online</div>
                    <div className="text-indigo-100 text-xs mt-1 flex items-center gap-1.5 font-medium">
                        <ClockIcon size={12} />{" "}
                        {stats ? formatUptime(stats.server.uptime) : "..."}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-400 text-xs font-bold flex items-center gap-2">
                        <Cpu size={14} /> Нагрузка CPU
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                        {stats ? stats.server.cpuLoad[0].toFixed(1) + "%" : "..."}
                    </div>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-indigo-500 h-full transition-all duration-1000"
                            style={{
                                width: stats
                                    ? `${Math.min(stats.server.cpuLoad[0], 100)}%`
                                    : "0%",
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-400 text-xs font-bold flex items-center gap-2">
                        <MemoryStick size={14} /> Память (RAM)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                        {stats
                            ? Math.round(
                                ((stats.server.totalMem - stats.server.freeMem) /
                                    stats.server.totalMem) *
                                100
                            ) + "%"
                            : "..."}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        {stats
                            ? `${formatSize(
                                stats.server.totalMem - stats.server.freeMem
                            )} из ${formatSize(stats.server.totalMem)}`
                            : "..."}
                    </p>
                </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-400 text-xs font-bold flex items-center gap-2">
                        <Database size={14} /> База данных
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                        {stats ? formatSize(stats.database.size) : "..."}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" /> PostgreSQL
                    </p>
                </CardContent>
            </Card>

            {/* Disk Space */}
            <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-400 text-xs font-bold flex items-center gap-2">
                        <HardDrive size={14} /> Место на диске
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                        {stats?.server.disk
                            ? (
                                (1 - stats.server.disk.free / stats.server.disk.total) *
                                100
                            ).toFixed(1) + "%"
                            : "..."}
                    </div>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-1000",
                                stats?.server.disk &&
                                    stats.server.disk.free / stats.server.disk.total < 0.1
                                    ? "bg-rose-500"
                                    : "bg-indigo-500"
                            )}
                            style={{
                                width: stats?.server.disk
                                    ? `${(
                                        (1 - stats.server.disk.free / stats.server.disk.total) *
                                        100
                                    ).toFixed(1)}%`
                                    : "0%",
                            }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        {stats?.server.disk
                            ? `${formatSize(
                                stats.server.disk.total - stats.server.disk.free
                            )} из ${formatSize(stats.server.disk.total)}`
                            : "..."}
                    </p>
                </CardContent>
            </Card>

            {/* API Performance */}
            <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-400 text-xs font-bold flex items-center gap-2">
                        <Activity size={14} /> Производительность API
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className={cn(
                            "text-2xl font-bold transition-all duration-300",
                            !monitoringData
                                ? "text-slate-300"
                                : monitoringData.performance < 200
                                    ? "text-emerald-500"
                                    : monitoringData.performance < 500
                                        ? "text-amber-500"
                                        : "text-rose-500"
                        )}
                    >
                        {monitoringData ? `${monitoringData.performance} ms` : "..."}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        Время ответа сервера
                    </p>
                </CardContent>
            </Card>

            <div className="lg:col-span-2">
                <Card className="border-slate-200/60 shadow-sm h-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-400 text-xs font-bold flex items-center gap-2">
                            <Database size={14} /> Файловое хранилище
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between mb-2">
                            <div className="text-2xl font-bold text-slate-900">
                                {stats
                                    ? (stats.storage.size / (1024 * 1024 * 1024)).toFixed(1) +
                                    " GB"
                                    : "..."}
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                                {stats ? formatSize(stats.storage.size) : "0 MB"}
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                                className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                style={{
                                    width: stats
                                        ? `${Math.min(
                                            (stats.storage.size / (1024 * 1024 * 1024)) * 100,
                                            100
                                        )}%`
                                        : "0%",
                                }}
                            />
                        </div>
                        <p className="text-xs text-slate-400 text-right font-bold mt-1">
                            {stats ? stats.storage.fileCount : 0} файлов
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ClockIcon({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
