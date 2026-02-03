"use client";

import Link from "next/link";
import Image from "next/image";
import { Printer } from "lucide-react";
import { UserNav } from "./user-nav";
import { NotificationCenter, Notification } from "@/components/notifications/notification-center";

interface BrandingSettings {
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    faviconUrl: string | null;
    currencySymbol?: string;
    dateFormat?: string;
    timezone?: string;
    [key: string]: unknown;
}

export function MobileHeader({ user, branding, notifications }: {
    user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null };
    branding: BrandingSettings;
    notifications: Notification[];
}) {
    return (
        <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="bg-primary rounded-[10px] p-1.5 shadow-lg shadow-primary/20">
                    {branding.logoUrl ? (
                        <div className="relative h-4 w-4">
                            <Image
                                src={branding.logoUrl}
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <Printer className="h-4 w-4 text-white" />
                    )}
                </div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">{branding.companyName}</span>
            </Link>

            <div className="flex items-center gap-1">
                <NotificationCenter notifications={notifications} branding={branding} />
                <UserNav user={user} branding={branding} />
            </div>
        </header>
    );
}
