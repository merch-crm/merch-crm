import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { CamerasClient } from './cameras-client'
import { getXiaomiAccounts, getCameras } from './cameras.actions'
import { checkIsAdmin } from '@/lib/admin'

export default async function CamerasPage() {
    const session = await getSession()

    if (!session) {
        redirect('/logout')
    }

    const isAdmin = await checkIsAdmin(session)

    const [accountsResult, camerasResult] = await Promise.all([
        getXiaomiAccounts(),
        getCameras()
    ])

    return (
        <Suspense fallback={<CamerasSkeleton />}>
            <CamerasClient
                initialAccounts={accountsResult.success ? (accountsResult.data ?? []) : []}
                initialCameras={camerasResult.success ? (camerasResult.data ?? []) : []}
                isAdmin={isAdmin}
            />
        </Suspense>
    )
}

function CamerasSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-slate-200 rounded-2xl" />
                ))}
            </div>
        </div>
    )
}
