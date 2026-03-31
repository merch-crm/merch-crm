'use client'

import { Button } from '@/components/ui/button'
import {
    Calendar,
    Download,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DailyReport, WeeklyReport, MonthlyReport } from './reports.types'
import { useReports } from './hooks/use-reports'
import { DailyReportView } from './components/daily-report-view'
import { WeeklyReportView } from './components/weekly-report-view'
import { MonthlyReportView } from './components/monthly-report-view'

interface Props {
    initialDaily: DailyReport | null
    initialWeekly: WeeklyReport | null
    initialMonthly: MonthlyReport | null
}

export function ReportsClient({ initialDaily, initialWeekly, initialMonthly }: Props) {
    const {
        reportType,
        changeReportType,
        dailyReport,
        weeklyReport,
        monthlyReport,
        isPending,
        navigateDate,
        handleExport,
        formatDateRange
    } = useReports({ initialDaily, initialWeekly, initialMonthly })

    return (
        <div className="space-y-3 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Отчёты</h1>
                    <p className="text-slate-500 mt-1">
                        Анализ рабочего времени и присутствия персонала
                    </p>
                </div>
                <Button
                    onClick={handleExport}
                    disabled={isPending}
                    className="rounded-2xl h-12 px-6 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs"
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
                        type="button"
                        onClick={() => changeReportType(item.type)}
                        className={cn(
                            'px-6 py-2.5 text-xs font-bold rounded-xl transition-all',
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
