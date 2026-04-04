"use client";

import { Card, CardBody, CardHeader } from '@/components/ui/card-bento'
import { Users, Clock, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react'
import { StatCard } from './report-stats'
import type { DailyReport } from '../reports.types'

export function DailyReportView({ data }: { data: DailyReport }) {
    return (
        <div className="space-y-3">
            {/* Сводка */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    title="Присутствовали"
                    value={`${data.presentToday}/${data.totalEmployees}`}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Среднее время"
                    value={`${data.averageWorkHours.toFixed(1)} ч`}
                    icon={Clock}
                    color="emerald"
                />
                <StatCard
                    title="Опоздания"
                    value={data.lateArrivals}
                    icon={AlertTriangle}
                    color="orange"
                />
                <StatCard
                    title="Посещаемость"
                    value={`${((data.presentToday / (data.totalEmployees || 1)) * 100).toFixed(0)}%`}
                    icon={TrendingUp}
                    color="indigo"
                />
            </div>

            {/* Таблица сотрудников */}
            <Card className="crm-card border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        <h2 className="font-bold  text-xs text-slate-900">Детализация по сотрудникам</h2>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    {data.employees.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Нет данных за выбранную дату</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/20">
                                        <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400">Сотрудник</th>
                                        <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400">Приход</th>
                                        <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400">Уход</th>
                                        <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400">Время работы</th>
                                        <th className="text-left py-4 px-6 text-xs leading-tight text-neutral-500 font-bold text-slate-400 text-right">Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.employees.map((emp) => (
                                        <tr key={emp.userId} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                                                        {emp.userName.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 truncate text-sm">{emp.userName}</p>
                                                        <p className="text-xs leading-tight text-neutral-500 text-slate-400 font-medium truncate">{emp.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                                    {emp.firstSeen ? new Date(emp.firstSeen).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                                    {emp.lastSeen ? new Date(emp.lastSeen).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-sm">{emp.workHours.toFixed(1)} ч</span>
                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((emp.workHours / 8) * 100, 100)}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {emp.isLate ? (
                                                    <span className="px-3 py-1 text-xs leading-tight text-neutral-500 font-bold bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                                                        Опоздание
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 text-xs leading-tight text-neutral-500 font-bold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                                        Вовремя
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}
