import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { EmployeesClient, type Employee } from './employees-client'
import { getEmployeesWithFaces, getEmployeesWithoutFaces } from './employees.actions'
import { checkIsAdmin } from '@/lib/admin'

export default async function EmployeesPage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    const isAdmin = await checkIsAdmin(session)

    const [employeesResult, withoutFacesResult] = await Promise.all([
        getEmployeesWithFaces(),
        getEmployeesWithoutFaces()
    ])

    return (
        <Suspense fallback={<EmployeesSkeleton />}>
            <EmployeesClient
                initialEmployees={employeesResult.success ? (employeesResult.data as unknown as Employee[]) : []}
                employeesWithoutFaces={withoutFacesResult.success ? (withoutFacesResult.data as { id: string; name: string; email: string }[]) : []}
                isAdmin={isAdmin}
            />
        </Suspense>
    )
}

function EmployeesSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
                ))}
            </div>
        </div>
    )
}
