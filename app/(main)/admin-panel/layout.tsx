import {
    ShieldAlert,
    Search,
    Bell
} from "lucide-react";
import React from "react";
import { getCurrentUserAction } from "./actions";
import Image from "next/image";
import { AdminSidebar, AdminUserCard } from "./admin-tabs";
import Link from "next/link";
import { AdminSearch } from "./admin-search";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { UserNav } from "@/components/layout/user-nav";
import { getNotifications } from "@/components/notifications/actions";
import { getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const res = await getCurrentUserAction();
    const currentUser = res.data || null;

    // Fetch notifications and branding
    const notifications = await getNotifications();
    const branding = await getBrandingSettings();

    const user = currentUser ? {
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        roleName: (currentUser.role as any)?.name || "Администратор",
        departmentName: (currentUser as any).department?.name || "Руководство"
    } : null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-slate-50 font-sans">
            {/* Sidebar - Dark Style */}
            <aside className="w-full md:w-[260px] lg:w-[280px] bg-[#0F172A] text-white p-6 flex flex-col shrink-0 relative z-10 transition-all border-r border-slate-800 h-full overflow-y-auto">
                <Link href="/dashboard" className="flex items-center gap-3 mb-10 pl-2">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-normal leading-none block">Админ-панель</span>
                        <span className="text-xs text-slate-400 font-bold tracking-wide uppercase">Система</span>
                    </div>
                </Link>

                <AdminSidebar user={currentUser} />
                <AdminUserCard user={currentUser} />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full bg-slate-50/50 relative z-0 overflow-hidden">
                {/* Top Bar */}
                <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-12 flex items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-4 flex-1">
                        <AdminSearch />
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationCenter notifications={notifications} branding={branding} />
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        {user && <UserNav user={user} branding={branding} />}
                    </div>
                </header>

                {/* Sub-page Content */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {children}
                </div>
            </main>
        </div>
    );
}
