"use client";

import { usePathname, useRouter } from "next/navigation";
import {
    Users,
    Shield,
    Settings,
    Building,
    HardDrive,
    Palette,
    Ticket,
    ChevronRight,
    LayoutGrid,
    Search,
    Bell,
    LogOut,
    ShieldAlert,

    ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { getCurrentUserAction } from "./actions";
import Image from "next/image";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role?: {
        name: string;
    } | null;
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await getCurrentUserAction();
            if (res.data) setUser(res.data);
        };
        fetchUser();
    }, []);

    const navItems = [
        { name: "Обзор", href: "/dashboard/admin", icon: LayoutGrid },
        { name: "Пользователи", href: "/dashboard/admin/users", icon: Users },
        { name: "Отделы", href: "/dashboard/admin/departments", icon: Building },
        { name: "Роли и права", href: "/dashboard/admin/roles", icon: Shield },
        { name: "Уведомления", href: "/dashboard/admin/notifications", icon: Bell },
        { name: "Брендинг", href: "/dashboard/admin/branding", icon: Palette },
        { name: "Промокоды", href: "/dashboard/admin/promocodes", icon: Ticket },
        { name: "Хранилище", href: "/dashboard/admin/storage", icon: HardDrive },
        { name: "Мониторинг", href: "/dashboard/admin/monitoring", icon: Settings },
    ];

    return (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-slate-50 font-sans">
            {/* Sidebar - Dark Style (Eduplex Reference) */}
            <aside className="w-full md:w-[260px] lg:w-[280px] bg-[#0F172A] text-white p-6 flex flex-col shrink-0 relative z-10 transition-all border-r border-slate-800 h-full overflow-y-auto">
                <div className="flex items-center gap-3 mb-10 pl-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight leading-none block">Админ-панель</span>
                        <span className="text-xs text-slate-400 font-bold tracking-wide uppercase">Система</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 mb-8 px-2">
                    {navItems.map((item) => {
                        const isActive = item.href === "/dashboard/admin"
                            ? pathname === "/dashboard/admin"
                            : pathname.startsWith(item.href);

                        return (
                            <button
                                key={item.name}
                                onClick={() => router.push(item.href)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-black transition-all group relative outline-none",
                                    isActive ? "text-white" : "text-slate-400 hover:text-slate-100"
                                )}
                            >
                                {/* THE SLIDING GLOW BACKGROUND */}
                                {isActive && (
                                    <div
                                        className="absolute inset-0 bg-white/[0.05] border border-white/[0.08] rounded-2xl shadow-inner pointer-events-none"
                                    />
                                )}

                                {/* PURPLE GLOW INDICATOR (Standard Color) */}
                                <div
                                    className={cn(
                                        "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 rounded-r-full transition-all duration-500 ease-out z-20",
                                        isActive
                                            ? "h-6 bg-[#5d00ff] opacity-100 shadow-[0_0_20px_rgba(93,0,255,0.6)]"
                                            : "h-0 bg-[#5d00ff]/50 opacity-0 group-hover:h-4 group-hover:opacity-80 group-hover:shadow-[0_0_15px_rgba(93,0,255,0.4)]"
                                    )}
                                    style={{ left: '-6px' }}
                                />

                                {/* Subtle Radial Glow from Indicator */}
                                <div className={cn(
                                    "absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-[#5d00ff]/10 to-transparent pointer-events-none transition-opacity duration-500",
                                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )} />

                                <item.icon className={cn(
                                    "w-6 h-6 relative z-10 transition-all duration-300",
                                    isActive ? "text-[#5d00ff] scale-110" : "text-slate-500 group-hover:text-slate-300"
                                )} />

                                <span className="relative z-10 tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                                    {item.name}
                                </span>

                                <ChevronRight className={cn(
                                    "ml-auto w-5 h-5 relative z-10 transition-all duration-500",
                                    isActive
                                        ? "opacity-100 text-[#5d00ff] translate-x-0"
                                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-slate-600"
                                )} />
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto space-y-4">
                    <div className="pt-4 border-t border-slate-800">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Вернуться в CRM</span>
                        </button>
                    </div>

                    {/* Dynamic User Profile Mini Card */}
                    <div
                        onClick={() => router.push('/dashboard/profile')}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 overflow-hidden shrink-0 relative">
                                {user?.avatar ? (
                                    <Image src={user.avatar} alt={user.name || "User"} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-500 bg-slate-900">
                                        {user?.name?.charAt(0) || "A"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{user?.name || "Загрузка..."}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role?.name || "Администратор"}</p>
                            </div>
                            <ChevronUp className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
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
                        <div
                            className="flex items-center gap-3 pl-2 cursor-pointer group"
                            onClick={() => router.push('/dashboard/profile')}
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 leading-none mb-1 group-hover:text-primary transition-colors">{user?.name || "Администратор"}</p>
                                <p className="text-[10px] font-medium text-slate-400">{user?.role?.name || "Root Access"}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-slate-200 overflow-hidden relative border-2 border-transparent group-hover:border-primary transition-all">
                                {user?.avatar ? (
                                    <Image src={user.avatar} alt={user.name || "User"} fill className="object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || "A"
                                )}
                            </div>
                        </div>
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
