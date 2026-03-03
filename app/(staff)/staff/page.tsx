import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { StaffMonitoringClient, type PresenceStatus, type DailyReportRow } from './staff-monitoring-client'
import { getCurrentPresenceStatus, getDailyReport } from '@/app/(main)/staff/actions'

export default async function StaffMonitoringPage() {
    const session = await getSession()

    if (!session) {
        redirect('/logout')
    }

    const today = new Date()

    const [statusResult, reportResult] = await Promise.all([
        getCurrentPresenceStatus(),
        getDailyReport(today)
    ])

    // Преобразуем данные в формат, ожидаемый клиентским компонентом, если нужно
    const initialStatus = statusResult.success ? statusResult.data : []
    const initialReport = reportResult.success ? reportResult.data : []

    return (
        <div className="space-y-6">
            <Suspense fallback={<MonitoringSkeleton />}>
                <StaffMonitoringClient
                    initialStatus={initialStatus as unknown as PresenceStatus[]}
                    initialReport={initialReport as unknown as DailyReportRow[]}
                    session={session as { id: string; name: string }}
                />
            </Suspense>
        </div>
    )
}

function MonitoringSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
                ))}
            </div>
            <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
    )
}
