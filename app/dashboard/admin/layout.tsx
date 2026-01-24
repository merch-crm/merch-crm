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

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const res = await getCurrentUserAction();
    const user = res.data || null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-slate-50 font-sans">
            {/* Sidebar - Dark Style */}
            <aside className="w-full md:w-[260px] lg:w-[280px] bg-[#0F172A] text-white p-6 flex flex-col shrink-0 relative z-10 transition-all border-r border-slate-800 h-full overflow-y-auto">
                <Link href="/dashboard" className="flex items-center gap-3 mb-10 pl-2">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight leading-none block">Админ-панель</span>
                        <span className="text-xs text-slate-400 font-bold tracking-wide uppercase">Система</span>
                    </div>
                </Link>

                <AdminSidebar user={user} />
                <AdminUserCard user={user} />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full bg-slate-50/50 relative z-0 overflow-hidden">
                {/* Top Bar */}
                <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md hidden md:block group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Быстрый поиск по админке..."
                                className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        <Link
                            href="/dashboard/profile"
                            className="flex items-center gap-3 pl-2 cursor-pointer group"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 leading-none mb-1 group-hover:text-primary transition-colors">{user?.name || "Администратор"}</p>
                                <p className="text-[10px] font-medium text-slate-400">{user?.role?.name || "Root Access"}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-slate-200 overflow-hidden relative border-2 border-transparent group-hover:border-primary transition-all">
                                {user?.avatar ? (
                                    <Image src={user.avatar} alt={user.name || "User"} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm font-black text-slate-400">
                                        {(user?.name || "A")[0]}
                                    </div>
                                )}
                            </div>
                        </Link>
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
