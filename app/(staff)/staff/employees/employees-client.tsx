'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardBody } from '@/components/ui/card-bento'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type IconType } from '@/components/ui/stat-card'

export interface Employee {
    id: string
    name: string
    email: string
    role: string
    avatarUrl: string | null
}

interface Props {
    initialEmployees: Employee[]
    isAdmin: boolean
}

export function EmployeesClient({ initialEmployees }: Props) {
    const [employees] = useState(initialEmployees)

    return (
        <div className="space-y-3 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Сотрудники</h1>
                    <p className="text-slate-500 mt-1">
                        Список сотрудников компании
                    </p>
                </div>
            </div>

            {/* Верхняя панель статистики */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatSummaryCard
                    title="Всего в штате"
                    count={employees.length}
                    icon={Users}
                    color="indigo"
                />
            </div>

            {/* Список всех сотрудников */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {employees.map((employee) => (
                    <Card
                        key={employee.id}
                        className="crm-card border-none shadow-sm transition-all hover:shadow-md overflow-hidden bg-white"
                    >
                        <CardBody className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    {employee.avatarUrl ? (
                                        <Image
                                            src={employee.avatarUrl}
                                            alt={employee.name}
                                            width={56}
                                            height={56}
                                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-slate-50 shadow-sm">
                                            <span className="text-xl font-bold text-slate-400">
                                                {employee.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-lg leading-tight truncate">{employee.name}</p>
                                    <p className="text-xs text-slate-400 font-medium truncate mt-1">{employee.email}</p>
                                    <p className="text-xs text-indigo-600 font-bold mt-1 uppercase tracking-wider">{employee.role}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function StatSummaryCard({ title, count, icon: Icon, color }: { title: string, count: number, icon: IconType, color: 'indigo' }) {
    const configs = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' }
    }
    const config = configs[color]

    return (
        <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
            <CardBody className="p-5 flex items-center gap-3">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center ring-4", config.bg, config.text, config.ring)}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-3xl font-bold text-slate-900 leading-none">{count}</p>
                    <p className="text-xs leading-tight text-neutral-500 font-bold text-slate-400   mt-2">{title}</p>
                </div>
            </CardBody>
        </Card>
    )
}
