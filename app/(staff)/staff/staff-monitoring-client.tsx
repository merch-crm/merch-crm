'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/card-bento'
import {
    Users,
    Clock,
    TrendingUp,
    AlertCircle
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface PresenceStatus {
    userId: string
    userName: string
    userAvatar: string | null
    departmentName: string | null
    status: 'working' | 'idle' | 'away' | 'offline'
    lastSeenAt: string | Date | null
    todayWorkSeconds: number
    todayIdleSeconds: number
}

export interface DailyReportRow {
    userId: string
    userName: string
    userAvatar: string | null
    departmentName: string | null
    firstSeenAt: string | Date | null
    lastSeenAt: string | Date | null
    workHours: number
    idleHours: number
    productivity: number
    lateMinutes: number
    earlyLeaveMinutes: number
}

interface Props {
    initialReport: DailyReportRow[]
}

export function StaffMonitoringClient({ initialReport }: Props) {
    const [report] = useState<DailyReportRow[]>(initialReport)

    const stats = {
        total: report.length,
        late: report.filter(r => r.lateMinutes > 0).length,
        avgWorkHours: report.length > 0
            ? (report.reduce((sum, r) => sum + r.workHours, 0) / report.length).toFixed(1)
            : '0.0'
    }

    return (
        <div className="space-y-3 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Учет рабочего времени</h1>
                    <p className="text-slate-500 mt-1">
                        Статистика посещаемости и отработанного времени
                    </p>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard
                    title="Всего сотрудников"
                    value={stats.total}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Среднее время (ч)"
                    value={stats.avgWorkHours}
                    icon={Clock}
                    color="green"
                />
                <StatCard
                    title="Опоздания"
                    value={stats.late}
                    icon={AlertCircle}
                    color="orange"
                />
            </div>

            {/* Сводка за день */}
            <Card className="crm-card border-none shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 bg-white/50">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-600" />
                        <h2 className="font-semibold text-slate-900">Сводка за сегодня</h2>
                    </div>
                </CardHeader>
                <CardBody className="p-6">
                    {report.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Нет данных за сегодня</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {report.map((emp) => (
                                <div
                                    key={emp.userId}
                                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            {emp.userAvatar ? (
                                                <Image
                                                    src={emp.userAvatar}
                                                    alt={emp.userName}
                                                    width={40}
                                                    height={40}
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-100">
                                                    <span className="text-sm font-semibold text-slate-500">
                                                        {emp.userName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{emp.userName}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                {emp.firstSeenAt ? `Начало: ${formatTime(emp.firstSeenAt)}` : 'Нет отметок'}
                                                {emp.lastSeenAt && ` • Конец: ${formatTime(emp.lastSeenAt)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {emp.lateMinutes > 0 && (
                                            <span className="px-2.5 py-1 text-xs leading-tight text-orange-600 font-bold tracking-wider bg-orange-50 rounded-lg border border-orange-100">
                                                Опоздание {emp.lateMinutes}м
                                            </span>
                                        )}
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-slate-900">
                                                {emp.workHours.toFixed(1)} ч
                                            </span>
                                            <p className="text-xs leading-tight text-slate-400 font-medium">отработано</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}

function StatCard({
    title,
    value,
    icon: Icon,
    color
}: {
    title: string
    value: number | string
    icon: React.ElementType
    color: 'green' | 'blue' | 'orange'
}) {
    const colors: Record<'green' | 'blue' | 'orange', string> = {
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100'
    }

    return (
        <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
            <CardBody className="flex items-center gap-3 p-6">
                <div className={cn('p-4 rounded-2xl border', colors[color])}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
                    <p className="text-sm font-semibold text-slate-500 mt-1 tracking-wide">{title}</p>
                </div>
            </CardBody>
        </Card>
    )
}

function formatTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    })
}
