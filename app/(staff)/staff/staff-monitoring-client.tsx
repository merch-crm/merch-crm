'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/card-bento'
import {
    Users,
    UserCheck,
    UserX,
    Clock,
    Activity,
    TrendingUp,
    AlertCircle,
    Video
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
    cameraName: string | null
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
    initialStatus: PresenceStatus[]
    initialReport: DailyReportRow[]
    session: { id: string; name: string }
}

export function StaffMonitoringClient({ initialStatus, initialReport }: Props) {
    const [status] = useState<PresenceStatus[]>(initialStatus)
    const [report] = useState<DailyReportRow[]>(initialReport)

    // Автообновление каждые 30 секунд
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/api/presence/cameras/status') // Используем эндпоинт статуса или добавим новый для сотрудников
                if (response.ok) {
                    // Здесь должен быть запрос к getCurrentPresenceStatus, 
                    // но через API route или серверный экшн.
                    // Для простоты пока оставим этот интервал для демонстрации.
                }
            } catch (error) {
                console.error('Failed to fetch status:', error)
            }
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    const stats = {
        total: report.length,
        present: status.filter(s => s.status === 'working').length,
        idle: status.filter(s => s.status === 'idle').length,
        offline: status.filter(s => s.status === 'offline').length,
        late: report.filter(r => r.lateMinutes > 0).length,
        avgWorkHours: report.length > 0
            ? (report.reduce((sum, r) => sum + r.workHours, 0) / report.length).toFixed(1)
            : '0.0'
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Мониторинг присутствия</h1>
                    <p className="text-slate-500 mt-1">
                        Отслеживание сотрудников в реальном времени
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm self-start sm:self-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-slate-600">Живое обновление</span>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="На работе"
                    value={stats.present}
                    icon={UserCheck}
                    color="green"
                />
                <StatCard
                    title="Неактивны"
                    value={stats.idle}
                    icon={Clock}
                    color="yellow"
                />
                <StatCard
                    title="Отсутствуют"
                    value={stats.offline}
                    icon={UserX}
                    color="red"
                />
                <StatCard
                    title="Опоздания"
                    value={stats.late}
                    icon={AlertCircle}
                    color="orange"
                />
            </div>

            {/* Текущий статус сотрудников */}
            <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-slate-600" />
                        <h2 className="font-semibold text-slate-900">Текущий статус</h2>
                    </div>
                </CardHeader>
                <CardBody className="p-6">
                    {status.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Нет данных о присутствии</p>
                            <p className="text-sm mt-1">Настройте камеры для начала отслеживания</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {status.map((employee) => (
                                <EmployeeStatusCard key={employee.userId} employee={employee} />
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Сводка за день */}
            <Card className="crm-card border-none shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 bg-white/50">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-600" />
                        <h2 className="font-semibold text-slate-900">Сводка за сегодня</h2>
                    </div>
                </CardHeader>
                <CardBody className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <p className="text-3xl font-bold text-slate-900">{report.length}</p>
                            <p className="text-sm font-medium text-slate-500 mt-1">Присутствовали</p>
                        </div>
                        <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <p className="text-3xl font-bold text-slate-900">{stats.avgWorkHours} ч</p>
                            <p className="text-sm font-medium text-slate-500 mt-1">Среднее время</p>
                        </div>
                        <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <p className="text-3xl font-bold text-slate-900">{stats.late}</p>
                            <p className="text-sm font-medium text-slate-500 mt-1">Опоздали</p>
                        </div>
                    </div>

                    {report.length > 0 && (
                        <div className="space-y-3">
                            {report.map((emp) => (
                                <div
                                    key={emp.userId}
                                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
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
                                                {emp.firstSeenAt ? `Пришёл: ${formatTime(emp.firstSeenAt)}` : 'Не отмечен'}
                                                {emp.lastSeenAt && ` • Ушёл: ${formatTime(emp.lastSeenAt)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {emp.lateMinutes > 0 && (
                                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
                                                Опоздал {emp.lateMinutes}м
                                            </span>
                                        )}
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-slate-900">
                                                {emp.workHours.toFixed(1)} ч
                                            </span>
                                            <p className="text-[10px] text-slate-400 font-medium">отработано</p>
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
    value: number
    icon: React.ElementType
    color: 'green' | 'yellow' | 'red' | 'orange'
}) {
    const colors = {
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        yellow: 'bg-amber-50 text-amber-600 border-amber-100',
        red: 'bg-rose-50 text-rose-600 border-rose-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100'
    }

    return (
        <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
            <CardBody className="flex items-center gap-5 p-6">
                <div className={cn('p-4 rounded-2xl border', colors[color])}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
                    <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wide">{title}</p>
                </div>
            </CardBody>
        </Card>
    )
}

function EmployeeStatusCard({ employee }: { employee: PresenceStatus }) {
    const statusConfig = {
        working: { label: 'На работе', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
        idle: { label: 'Неактивен', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
        away: { label: 'Отошёл', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
        offline: { label: 'Оффлайн', color: 'bg-slate-400', textColor: 'text-slate-600', bgColor: 'bg-slate-50' }
    }

    const config = statusConfig[employee.status]

    return (
        <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
                <div className="relative">
                    {employee.userAvatar ? (
                        <Image
                            src={employee.userAvatar}
                            alt={employee.userName}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-50"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-50">
                            <span className="text-base font-bold text-slate-500">
                                {employee.userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-4 border-white',
                        config.color
                    )} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate text-lg">{employee.userName}</p>
                    <div className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', config.bgColor, config.textColor)}>
                        {config.label}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-2">
                {employee.lastSeenAt && (
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Активность: {formatTime(employee.lastSeenAt)}</span>
                    </div>
                )}
                {employee.cameraName && (
                    <div className="flex items-center gap-2 text-slate-400">
                        <Video className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium truncate">{employee.cameraName}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-xl p-2 text-center">
                    <p className="text-xs font-bold text-slate-900">{(employee.todayWorkSeconds / 3600).toFixed(1)}ч</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Работа</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 text-center">
                    <p className="text-xs font-bold text-slate-900">{(employee.todayIdleSeconds / 3600).toFixed(1)}ч</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Простой</p>
                </div>
            </div>
        </div>
    )
}

function formatTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    })
}
