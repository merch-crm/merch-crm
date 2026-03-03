'use client'

import { useState, useTransition } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/card-bento'
import { Button } from '@/components/ui/button'
import {
    BarChart3,
    Calendar,
    Download,
    Clock,
    Users,
    AlertTriangle,
    TrendingUp,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getDailyReport, getWeeklyReport, getMonthlyReport, exportReport } from './reports.actions'
import type { DailyReport, WeeklyReport, MonthlyReport } from './reports.types'

type ReportType = 'daily' | 'weekly' | 'monthly'

interface Props {
    initialDaily: DailyReport | null
    initialWeekly: WeeklyReport | null
    initialMonthly: MonthlyReport | null
}

export function ReportsClient({ initialDaily, initialWeekly, initialMonthly }: Props) {
    const [reportType, setReportType] = useState<ReportType>('daily')
    const [dailyReport, setDailyReport] = useState<DailyReport | null>(initialDaily)
    const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(initialWeekly)
    const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(initialMonthly)
    const [isPending, startTransition] = useTransition()

    // Текущие даты для навигации
    const [currentDate, setCurrentDate] = useState(new Date())

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)

        switch (reportType) {
            case 'daily':
                newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
                break
            case 'weekly':
                newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
                break
            case 'monthly':
                newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
                break
        }

        setCurrentDate(newDate)
        fetchReport(newDate)
    }

    const fetchReport = (date: Date) => {
        startTransition(async () => {
            const dateStr = date.toISOString().split('T')[0]

            switch (reportType) {
                case 'daily':
                    const daily = await getDailyReport(dateStr)
                    if (daily.success) setDailyReport(daily.data ?? null)
                    break
                case 'weekly':
                    const weekly = await getWeeklyReport(dateStr)
                    if (weekly.success) setWeeklyReport(weekly.data ?? null)
                    break
                case 'monthly':
                    const monthly = await getMonthlyReport(date.getFullYear(), date.getMonth() + 1)
                    if (monthly.success) setMonthlyReport(monthly.data ?? null)
                    break
            }
        })
    }

    const handleExport = async () => {
        startTransition(async () => {
            const dateStr = currentDate.toISOString().split('T')[0]

            const result = await exportReport(reportType, {
                date: dateStr,
                year: currentDate.getFullYear(),
                month: currentDate.getMonth() + 1
            })

            if (result.success && result.data) {
                // Скачиваем CSV
                const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = result.data.filename
                link.click()
                URL.revokeObjectURL(url)
                toast.success('Отчёт экспортирован')
            } else {
                toast.error('Ошибка экспорта')
            }
        })
    }

    const formatDateRange = () => {
        switch (reportType) {
            case 'daily':
                return currentDate.toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                })
            case 'weekly':
                return weeklyReport ? `${weeklyReport.startDate} — ${weeklyReport.endDate}` : ''
            case 'monthly':
                return monthlyReport ? `${monthlyReport.monthName} ${monthlyReport.year}` : ''
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Отчёты</h1>
                    <p className="text-slate-500 mt-1">
                        Анализ рабочего времени и присутствия персонала
                    </p>
                </div>
                <Button
                    onClick={handleExport}
                    disabled={isPending}
                    className="rounded-2xl h-12 px-6 bg-slate-900 text-white hover:bg-slate-800 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Экспорт CSV
                </Button>
            </div>

            {/* Переключатель типа отчёта */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/50 backdrop-blur-sm rounded-2xl w-fit border border-slate-200/50">
                {[
                    { type: 'daily' as const, label: 'День' },
                    { type: 'weekly' as const, label: 'Неделя' },
                    { type: 'monthly' as const, label: 'Месяц' }
                ].map((item) => (
                    <button
                        key={item.type}
                        onClick={() => {
                            setReportType(item.type)
                            fetchReport(currentDate)
                        }}
                        className={cn(
                            'px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all',
                            reportType === item.type
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                        )}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Навигация по датам */}
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateDate('prev')}
                    disabled={isPending}
                    className="rounded-xl hover:bg-slate-50 text-slate-500"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm md:text-base capitalize">
                        {formatDateRange()}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateDate('next')}
                    disabled={isPending}
                    className="rounded-xl hover:bg-slate-50 text-slate-500"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            {/* Контент отчёта */}
            <div className={cn("transition-opacity duration-300", isPending ? "opacity-30" : "opacity-100")}>
                {reportType === 'daily' && dailyReport && (
                    <DailyReportView data={dailyReport} />
                )}

                {reportType === 'weekly' && weeklyReport && (
                    <WeeklyReportView data={weeklyReport} />
                )}

                {reportType === 'monthly' && monthlyReport && (
                    <MonthlyReportView data={monthlyReport} />
                )}
            </div>
        </div>
    )
}

function DailyReportView({ data }: { data: DailyReport }) {
    return (
        <div className="space-y-6">
            {/* Сводка */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <h2 className="font-bold uppercase tracking-wider text-xs text-slate-900">Детализация по сотрудникам</h2>
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
                                        <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Сотрудник</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Приход</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Уход</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Время работы</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Статус</th>
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
                                                        <p className="text-[10px] text-slate-400 font-medium truncate">{emp.email}</p>
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
                                                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                                                        Опоздание
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
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

function WeeklyReportView({ data }: { data: WeeklyReport }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* График по дням */}
                <Card className="crm-card border-none shadow-sm bg-white lg:col-span-2">
                    <CardHeader className="p-6">
                        <h2 className="font-bold uppercase tracking-widest text-xs text-slate-900">Средняя нагрузка по дням</h2>
                    </CardHeader>
                    <CardBody className="p-8">
                        <div className="flex items-end justify-between gap-4 h-64 overflow-x-auto pb-4">
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
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                {day.avgHours.toFixed(1)}ч
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">{day.date}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </CardBody>
                </Card>

                {/* Сводка за неделю */}
                <div className="space-y-4">
                    <StatSummaryCard title="Опозданий за неделю" count={data.summary.totalLateArrivals} icon={AlertTriangle} color="rose" />
                    <StatSummaryCard title="Среднее часов/день" count={Number(data.summary.avgDailyHours.toFixed(1))} icon={Clock} color="indigo" />
                    <StatSummaryCard title="Присутствие (ср)" count={Number(data.summary.avgDailyPresence.toFixed(1))} icon={Users} color="emerald" />
                </div>
            </div>

            {/* Рейтинг сотрудников */}
            <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 p-6">
                    <h2 className="font-bold uppercase tracking-widest text-xs text-slate-900">Рейтинг за период (Топ-10)</h2>
                </CardHeader>
                <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.employees.slice(0, 10).map((emp, index: number) => (
                            <div key={emp.userId} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                                <span className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black",
                                    index === 0 ? "bg-amber-100 text-amber-600 shadow-sm" :
                                        index === 1 ? "bg-slate-200 text-slate-600 shadow-sm" :
                                            index === 2 ? "bg-orange-100 text-orange-600 shadow-sm" :
                                                "bg-white text-slate-400 border border-slate-100"
                                )}>
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 truncate text-sm">{emp.userName}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                        {emp.daysPresent} дн. • {emp.lateCount} опозд.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900">{emp.totalHours.toFixed(1)}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">часов</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

function MonthlyReportView({ data }: { data: MonthlyReport }) {
    return (
        <div className="space-y-6">
            {/* Сводка за месяц */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <h2 className="font-bold uppercase tracking-widest text-xs text-slate-900">Итоги за {data.monthName}</h2>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/20">
                                    <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Сотрудник</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Дней</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Всего часов</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ср. в день</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Опозд.</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ранний уход</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.employees.map((emp) => (
                                    <tr key={emp.userId} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-slate-900 text-sm">{emp.userName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{emp.email}</p>
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

function StatCard({
    title,
    value,
    icon: Icon,
    color
}: {
    title: string
    value: string | number
    icon: React.ElementType
    color: 'blue' | 'emerald' | 'orange' | 'indigo'
}) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 ring-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
        orange: 'bg-orange-50 text-orange-600 ring-orange-100',
        indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100'
    }

    return (
        <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
            <CardBody className="p-6 flex items-center gap-5">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center ring-4', colors[color])}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-none">{title}</p>
                </div>
            </CardBody>
        </Card>
    )
}

function StatSummaryCard({ title, count, icon: Icon, color }: { title: string, count: number, icon: React.ElementType, color: 'emerald' | 'rose' | 'indigo' }) {
    const configs = {
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' }
    }
    const config = configs[color]

    return (
        <Card className="crm-card border-none shadow-sm bg-white overflow-hidden h-full">
            <CardBody className="p-5 flex items-center gap-5">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center ring-4", config.bg, config.text, config.ring)}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-3xl font-black text-slate-900 leading-none">{count}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{title}</p>
                </div>
            </CardBody>
        </Card>
    )
}
