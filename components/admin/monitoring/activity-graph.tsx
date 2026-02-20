import React from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { MonitoringData } from "../types";

interface ActivityGraphProps {
    monitoringData: MonitoringData | null;
}

export function ActivityGraph({ monitoringData }: ActivityGraphProps) {
    return (
        <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-6 pt-7 px-8 bg-white border-b border-slate-200">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-[18px]">
                            <BarChart3 size={18} />
                        </div>
                        <CardTitle className="text-base font-bold text-slate-800">
                            Активность системы
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs font-bold text-slate-400">
                        Действия за последние 24 часа
                    </CardDescription>
                </div>
                <div className="text-2xl font-bold text-[#5d00ff]">
                    {monitoringData
                        ? monitoringData.activityStats.reduce(
                            (acc, curr) => acc + curr.count,
                            0
                        )
                        : "0"}{" "}
                    <span className="text-xs font-bold text-slate-400 ml-1">
                        действий
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-8 px-8">
                <div className="space-y-2">
                    <div className="h-[120px] w-full flex items-end gap-1 px-1">
                        {!monitoringData
                            ? [...Array(24)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-slate-50 animate-pulse rounded-t-sm h-1/4"
                                />
                            ))
                            : [...Array(24)].map((_, i) => {
                                const hourStats = monitoringData.activityStats.filter(
                                    (s) => Number(s.hour) === i
                                );
                                const totalCount = hourStats.reduce(
                                    (acc, s) => acc + s.count,
                                    0
                                );
                                const maxVal = Math.max(
                                    ...[...Array(24)].map((_, h) =>
                                        monitoringData.activityStats
                                            .filter((s) => Number(s.hour) === h)
                                            .reduce((acc, s) => acc + s.count, 0)
                                    ),
                                    0
                                );
                                const max = maxVal < 5 ? 10 : maxVal;
                                const totalHeight = Math.max(
                                    (totalCount / max) * 100,
                                    5
                                );

                                return (
                                    <div
                                        key={i}
                                        className="flex-1 group relative h-full flex flex-col justify-end"
                                    >
                                        <div
                                            className="w-full flex flex-col-reverse justify-end overflow-hidden rounded-t-[4px] bg-slate-50/50"
                                            style={{ height: `${totalHeight}%` }}
                                        >
                                            {hourStats.length > 0 ? (
                                                hourStats.map((stat, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "w-full transition-all duration-300",
                                                            stat.type === "orders"
                                                                ? "bg-blue-500"
                                                                : stat.type === "inventory"
                                                                    ? "bg-amber-500"
                                                                    : stat.type === "users"
                                                                        ? "bg-emerald-500"
                                                                        : stat.type === "auth"
                                                                            ? "bg-indigo-500"
                                                                            : "bg-slate-400"
                                                        )}
                                                        style={{
                                                            height: `${(stat.count / totalCount) * 100
                                                                }%`,
                                                        }}
                                                    />
                                                ))
                                            ) : (
                                                <div className="w-full h-full bg-slate-100/50" />
                                            )}
                                        </div>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                            <div className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-[18px] shadow-xl whitespace-nowrap space-y-1">
                                                <div className="pb-1 border-b border-white/10">
                                                    {totalCount}{" "}
                                                    {Math.abs(totalCount % 10) === 1 &&
                                                        totalCount % 100 !== 11
                                                        ? "действие"
                                                        : [2, 3, 4].includes(totalCount % 10) &&
                                                            ![12, 13, 14].includes(totalCount % 100)
                                                            ? "действия"
                                                            : "действий"}
                                                </div>
                                                {hourStats.map((s) => (
                                                    <div
                                                        key={s.type}
                                                        className="flex items-center justify-between gap-4 font-normal text-xs opacity-80"
                                                    >
                                                        <span className="capitalize">
                                                            {s.type === "orders"
                                                                ? "Заказы"
                                                                : s.type === "inventory"
                                                                    ? "Склад"
                                                                    : s.type}
                                                            :
                                                        </span>
                                                        <span>{s.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 shadow-xl" />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    <div className="w-full flex gap-1 px-1 border-t border-slate-200 pt-2">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="flex-1 text-center">
                                {i % 4 === 0 && (
                                    <span className="text-xs text-slate-400 font-bold">
                                        {i.toString().padStart(2, "0")}:00
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {monitoringData && monitoringData.entityStats.length > 0 && (
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200">
                        {monitoringData.entityStats.map((stat) => (
                            <div key={stat.type} className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "w-2 h-2 rounded-full",
                                        stat.type === "orders"
                                            ? "bg-blue-500"
                                            : stat.type === "inventory"
                                                ? "bg-amber-500"
                                                : stat.type === "users"
                                                    ? "bg-emerald-500"
                                                    : stat.type === "auth"
                                                        ? "bg-indigo-500"
                                                        : "bg-slate-400"
                                    )}
                                />
                                <span className="text-xs font-bold text-slate-600 tracking-tight">
                                    {stat.type === "orders"
                                        ? "Заказы"
                                        : stat.type === "inventory"
                                            ? "Склад"
                                            : stat.type === "users"
                                                ? "Пользователи"
                                                : stat.type === "auth"
                                                    ? "Авторизация"
                                                    : stat.type === "system"
                                                        ? "Система"
                                                        : stat.type}
                                    :
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                    {stat.count}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
