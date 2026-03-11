import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { SettingsClient } from './settings-client'
import { getPresenceSettings } from './settings.actions'
import { checkIsAdmin } from '@/lib/admin'

export default async function SettingsPage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    const isAdmin = await checkIsAdmin(session)
    if (!isAdmin) {
        redirect('/staff')
    }

    const settingsResult = await getPresenceSettings()

    return (
        <Suspense fallback={<SettingsSkeleton />}>
            <SettingsClient
                initialSettings={(settingsResult.success ? settingsResult.data : {}) as Record<string, string | number | boolean>}
            />
        </Suspense>
    )
}

function SettingsSkeleton() {
    return (
        <div className="space-y-3 animate-pulse p-6">
            <div className="h-8 w-48 bg-slate-200 rounded-lg mb-8" />
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
                ))}
            </div>
        </div>
    )
}
