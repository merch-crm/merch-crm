"use client";

import Link from "next/link";
import Image from "next/image";
import { Printer } from "lucide-react";
import { UserNav } from "./user-nav";

interface BrandingSettings {
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    faviconUrl: string | null;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date | string;
}

export function MobileHeader({ user, branding }: {
    user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null };
    notifications: Notification[];
    branding: BrandingSettings;
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

            <UserNav user={user} />
        </header>
    );
}
