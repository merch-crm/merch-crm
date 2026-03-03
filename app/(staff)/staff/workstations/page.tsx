import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { WorkstationsClient } from './workstations-client'
import { getWorkstations, getCameras, getUsers } from './workstations.actions'

export const metadata = {
    title: 'Управление рабочими местами | CRM',
    description: 'Настройка рабочих мест и зон детекции'
}

export default async function WorkstationsPage() {
    const session = await getSession()
    if (!session) redirect('/logout')

    const [workstationsResult, camerasResult, usersResult] = await Promise.all([
        getWorkstations(),
        getCameras(),
        getUsers()
    ])

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <WorkstationsClient
                initialWorkstations={workstationsResult.success ? workstationsResult.data : []}
                cameras={camerasResult.success ? camerasResult.data : []}
                users={usersResult.success ? usersResult.data : []}
            />
        </div>
    )
}
