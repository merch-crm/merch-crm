import { getSession } from "@/lib/session";
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { StaffMonitoringClient, type DailyReportRow } from './staff-monitoring-client'
import { getDailyReport } from './reports/reports.actions'

export default async function StaffMonitoringPage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    const todayString = new Date().toISOString().split('T')[0]
    const reportResult = await getDailyReport(todayString)

    // Преобразуем данные в формат, ожидаемый клиентским компонентом, если нужно
    const initialReport = reportResult.success ? reportResult.data : []

    return (
        <div className="space-y-3">
            <Suspense fallback={<MonitoringSkeleton />}>
                <StaffMonitoringClient
                    initialReport={initialReport as unknown as DailyReportRow[]}
                />
            </Suspense>
        </div>
    )
}

function MonitoringSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
                ))}
            </div>
            <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
    )
}
