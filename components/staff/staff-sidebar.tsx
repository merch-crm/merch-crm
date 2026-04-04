'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Users,
    BarChart3,
    Activity,
    Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Журнал времени', href: '/staff', icon: Activity },
    { name: 'Отчёты', href: '/staff/reports', icon: BarChart3 },
    { name: 'Сотрудники', href: '/staff/employees', icon: Users },
]

export function StaffSidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 lg:border-r lg:border-slate-200 lg:bg-white z-30">
            <nav className="flex-1 px-4 py-6 space-y-1">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <Home className="w-5 h-5" />
                    Назад в CRM
                </Link>

                <div className="pt-4 border-t border-slate-200 mt-4">
                    <p className="px-3 text-xs font-semibold text-slate-400   mb-2">
                        Учёт времени
                    </p>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/staff' && pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                                    isActive
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </aside>
    )
}
