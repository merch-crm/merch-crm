"use client";

import { Card, CardBody, CardHeader } from '@/components/ui/card-bento'
import { Calendar, Users, Clock, AlertTriangle } from 'lucide-react'
import { StatCard } from './report-stats'
import type { MonthlyReport } from '../reports.types'

export function MonthlyReportView({ data }: { data: MonthlyReport }) {
    return (
        <div className="space-y-3">
            {/* Сводка за месяц */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    title="Рабочих дней"
                    value={data.workDays}
                    icon={Calendar}
                    color="blue"
                />
                <StatCard
                    title="Ср. присутствие"
                    value={`${data.summary.avgAttendance.toFixed(0)}%`}
                    icon={Users}
                    color="emerald"
                />
                <StatCard
                    title="Ср. часов/месяц"
                    value={`${data.summary.avgMonthlyHours.toFixed(0)} ч`}
                    icon={Clock}
                    color="indigo"
                />
                <StatCard
                    title="Всего опозданий"
                    value={data.summary.totalLateArrivals}
                    icon={AlertTriangle}
                    color="orange"
                />
            </div>

            {/* Таблица за месяц */}
            <Card className="crm-card border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <h2 className="font-bold text-xs text-slate-900">Итоги за {data.monthName}</h2>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/20">
                                    <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400">Сотрудник</th>
                                    <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400">Дней</th>
                                    <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400">Всего часов</th>
                                    <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400">Ср. в день</th>
                                    <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400">Опозд.</th>
                                    <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400 text-right">Ранний уход</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.employees.map((emp) => (
                                    <tr key={emp.userId} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-slate-900 text-sm">{emp.userName}</p>
                                            <p className="text-xs leading-tight text-neutral-500 text-slate-400 font-medium">{emp.email}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-bold text-slate-600">
                                                {emp.daysPresent}<span className="text-slate-300 mx-1">/</span>{data.workDays}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-black text-slate-900 text-sm">{emp.totalHours.toFixed(1)} ч</span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 text-sm font-medium">
                                            {emp.dailyAvgHours.toFixed(1)} ч
                                        </td>
                                        <td className="py-4 px-6">
                                            {emp.lateCount > 0 ? (
                                                <span className="text-rose-600 font-black">{emp.lateCount}</span>
                                            ) : (
                                                <span className="text-emerald-500 font-black">0</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {emp.earlyDepartures > 0 ? (
                                                <span className="text-orange-500 font-bold">{emp.earlyDepartures}</span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
