"use client";

import React from "react";
import {
    ShieldAlert,
    Menu,
    Search
} from "lucide-react";
import Link from "next/link";
import { AdminSidebar, AdminUserCard } from "./admin-tabs";
import { AdminSearch } from "./admin-search";
import { NotificationCenter } from "@/components/notifications/notification-center";
import type { Notification, BrandingSettings } from "@/lib/types";
import { UserNav } from "@/components/layout/user-nav";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role?: {
        name: string;
    } | null;
}

interface UserNavUser {
    name: string;
    email: string;
    roleName: string;
    departmentName: string;
    avatar?: string | null;
}

// BrandingSettings is now imported from @/lib/types above

export function AdminLayoutClient({
    children,
    currentUser,
    user,
    notifications,
    branding
}: {
    children: React.ReactNode;
    currentUser: AdminUser;
    user: UserNavUser;
    notifications: Notification[];
    branding: BrandingSettings;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-[260px] lg:w-[280px] bg-[#0F172A] text-white p-6 flex-col shrink-0 relative z-10 border-r border-slate-800 h-full overflow-y-auto">
                <Link href="/dashboard" className="flex items-center gap-3 mb-10 pl-2">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg leading-none block">Админ-панель</span>
                        <span className="text-xs text-slate-400 font-bold tracking-wide">Система</span>
                    </div>
                </Link>

                <AdminSidebar user={currentUser} />
                <AdminUserCard user={currentUser} />
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden h-16 bg-[#0F172A] text-white px-4 flex items-center justify-between shrink-0 z-30 shadow-lg">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white active:scale-95 transition-all hover:bg-white/20 border-none"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    <div>
                        <span className="font-bold text-sm block">Админ-панель</span>
                        <span className="text-xs text-slate-400 font-bold">Система</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-slate-100 h-10 w-10 shrink-0"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-command-menu"))}
                    >
                        <Search className="w-5 h-5 text-slate-600" />
                    </Button>
                    <NotificationCenter notifications={notifications} branding={branding} />
                    {user && <UserNav user={user} branding={branding} />}
                </div>
            </header>

            {/* Mobile Sidebar (BottomSheet) */}
            <BottomSheet
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                title="Навигация"
            >
                <div className="bg-[#0F172A] -mx-4 -mb-4 p-6 rounded-t-[2.5rem] min-h-[60vh]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShieldAlert className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <span className="font-black text-xl text-white block">MerchCRM</span>
                            <span className="text-xs text-slate-400 font-bold">Администрирование</span>
                        </div>
                    </div>

                    <div
                        role="button"
                        tabIndex={0}
                        className="space-y-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
                        onClick={() => setIsMobileMenuOpen(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsMobileMenuOpen(false);
                            }
                        }}
                    >
                        <AdminSidebar user={currentUser} />
                    </div>

                    <div
                        role="button"
                        tabIndex={0}
                        className="mt-8 pt-8 border-t border-slate-800 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        onClick={() => setIsMobileMenuOpen(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsMobileMenuOpen(false);
                            }
                        }}
                    >
                        <AdminUserCard user={currentUser} />
                    </div>
                </div>
            </BottomSheet>

            {/* Main Content Area */}
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative z-0 overflow-hidden">
                {/* Desktop Top Bar */}
                <header className="hidden md:flex h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-12 items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-3 flex-1">
                        <AdminSearch />
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationCenter notifications={notifications} branding={branding} />
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        {user && <UserNav user={user} branding={branding} />}
                    </div>
                </header>

                {/* Sub-page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[--radius-padding] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {children}
                </div>
            </div>
        </div>
    );
}
