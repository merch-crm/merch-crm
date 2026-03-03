'use client'

import { Menu, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Image from 'next/image'

interface StaffHeaderProps {
    session: {
        id: string
        name: string
        email: string
    }
    branding?: {
        logoUrl?: string | null
        companyName?: string | null
    }
}

export function StaffHeader({ session, branding }: StaffHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
                {branding?.logoUrl ? (
                    <Image
                        src={branding.logoUrl}
                        alt={branding.companyName || 'Logo'}
                        width={100}
                        height={32}
                        className="h-8 w-auto"
                        unoptimized
                    />
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">M</span>
                    </div>
                )}
                <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold text-slate-900">
                        Учёт рабочего времени
                    </h1>
                </div>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5 text-slate-500" />
                </Button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                        <User className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="hidden md:flex flex-col">
                        <span className="text-sm font-medium text-slate-700 leading-none">
                            {session.name}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                            Администратор
                        </span>
                    </div>
                </div>
            </div>
        </header>
    )
}
