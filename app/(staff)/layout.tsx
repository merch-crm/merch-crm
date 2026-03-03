import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { StaffSidebar } from '@/components/staff/staff-sidebar'
import { StaffHeader } from '@/components/staff/staff-header'
import { getBrandingSettings } from '@/app/(main)/dashboard/dashboard.actions'

export default async function StaffLayout({
    children
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session) {
        redirect('/logout')
    }

    const branding = await getBrandingSettings()

    return (
        <div className="min-h-screen bg-slate-50">
            <StaffHeader session={session} branding={branding} />
            <div className="flex">
                <StaffSidebar />
                <main className="flex-1 p-6 lg:p-8 lg:pl-72">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
