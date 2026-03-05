"use client";

import { Card, CardBody, CardHeader } from '@/components/ui/card-bento'
import { AlertTriangle, Clock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatSummaryCard } from './report-stats'
import type { WeeklyReport } from '../reports.types'

export function WeeklyReportView({ data }: { data: WeeklyReport }) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* График по дням */}
                <Card className="crm-card border-none shadow-sm bg-white lg:col-span-2">
                    <CardHeader className="p-6">
                        <h2 className="font-bold text-xs text-slate-900">Средняя нагрузка по дням</h2>
                    </CardHeader>
                    <CardBody className="p-8">
                        <div className="flex items-end justify-between gap-3 h-64 overflow-x-auto pb-4">
                            {data.dailyBreakdown.map((day, index: number) => {
                                const maxHours = 12
                                const height = (day.avgHours / maxHours) * 100

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center min-w-[50px] group">
                                        <div className="w-full relative h-[200px] flex items-end">
                                            <div
                                                className="w-full bg-indigo-500 rounded-xl transition-all duration-700 group-hover:bg-indigo-600 relative overflow-hidden"
                                                style={{ height: `${Math.min(height, 100)}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] leading-tight text-neutral-500 font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                {day.avgHours.toFixed(1)}ч
                                            </div>
                                        </div>
                                        <p className="text-[11px] leading-tight text-neutral-500 font-bold text-slate-400 mt-4">{day.date}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </CardBody>
                </Card>

                {/* Сводка за неделю */}
                <div className="space-y-3">
                    <StatSummaryCard title="Опозданий за неделю" count={data.summary.totalLateArrivals} icon={AlertTriangle} color="rose" />
                    <StatSummaryCard title="Среднее часов/день" count={Number(data.summary.avgDailyHours.toFixed(1))} icon={Clock} color="indigo" />
                    <StatSummaryCard title="Присутствие (ср)" count={Number(data.summary.avgDailyPresence.toFixed(1))} icon={Users} color="emerald" />
                </div>
            </div>

            {/* Рейтинг сотрудников */}
            <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 p-6">
                    <h2 className="font-bold text-xs text-slate-900">Рейтинг за период (Топ-10)</h2>
                </CardHeader>
                <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.employees.slice(0, 10).map((emp, index: number) => (
                            <div key={emp.userId} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                                <span className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black",
                                    index === 0 ? "bg-amber-100 text-amber-600 shadow-sm" :
                                        index === 1 ? "bg-slate-200 text-slate-600 shadow-sm" :
                                            index === 2 ? "bg-orange-100 text-orange-600 shadow-sm" : "bg-white text-slate-400 border border-slate-100"
                                )}>
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 truncate text-sm">{emp.userName}</p>
                                    <p className="text-[11px] leading-tight text-neutral-500 text-slate-400 font-bold mt-0.5">
                                        {emp.daysPresent} дн. • {emp.lateCount} опозд.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900">{emp.totalHours.toFixed(1)}</p>
                                    <p className="text-[8px] font-bold text-slate-400 leading-none">часов</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
