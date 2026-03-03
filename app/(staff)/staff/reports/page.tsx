import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ReportsClient } from './reports-client'
import { getMonthlyReport, getWeeklyReport, getDailyReport } from './reports.actions'
import type { DailyReport, WeeklyReport, MonthlyReport } from './reports.types'

export default async function ReportsPage() {
    const session = await getSession()

    if (!session) {
        redirect('/logout')
    }

    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]

    const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
        getDailyReport(dateStr),
        getWeeklyReport(dateStr),
        getMonthlyReport(today.getFullYear(), today.getMonth() + 1)
    ])

    return (
        <Suspense fallback={<ReportsSkeleton />}>
            <ReportsClient
                initialDaily={dailyResult.success ? (dailyResult.data as DailyReport) : null}
                initialWeekly={weeklyResult.success ? (weeklyResult.data as WeeklyReport) : null}
                initialMonthly={monthlyResult.success ? (monthlyResult.data as MonthlyReport) : null}
            />
        </Suspense>
    )
}

function ReportsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse p-6">
            <div className="h-8 w-48 bg-slate-200 rounded-lg mb-8" />
            <div className="h-12 w-64 bg-slate-200 rounded-xl mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
                ))}
            </div>
            <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
    )
}
