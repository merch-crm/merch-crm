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
    Bell,
    LogOut,
    ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
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

interface AdminSidebarProps {
    user: AdminUser | null;
}

export function AdminSidebar({ }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: "Обзор", href: "/admin-panel", icon: LayoutGrid },
        { name: "Пользователи", href: "/admin-panel/users", icon: Users },
        { name: "Отделы", href: "/admin-panel/departments", icon: Building },
        { name: "Роли и права", href: "/admin-panel/roles", icon: Shield },
        { name: "Уведомления", href: "/admin-panel/notifications", icon: Bell },
        { name: "Брендинг", href: "/admin-panel/branding", icon: Palette },
        { name: "Промокоды", href: "/admin-panel/promocodes", icon: Ticket },
        { name: "Хранилище", href: "/admin-panel/storage", icon: HardDrive },
        { name: "Мониторинг", href: "/admin-panel/monitoring", icon: Settings },
    ];

    return (
        <nav className="flex-1 space-y-2 mb-8 px-2">
            {navItems.map((item) => {
                const isActive = item.href === "/admin-panel"
                    ? pathname === "/admin-panel"
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
                        {isActive && (
                            <div className="absolute inset-0 bg-white/[0.05] border border-white/[0.08] rounded-2xl shadow-inner pointer-events-none" />
                        )}

                        <div
                            className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 rounded-r-full transition-all duration-500 ease-out z-20",
                                isActive
                                    ? "h-6 bg-[#5d00ff] opacity-100 shadow-[0_0_20px_rgba(93,0,255,0.6)]"
                                    : "h-0 bg-[#5d00ff]/50 opacity-0 group-hover:h-4 group-hover:opacity-80 group-hover:shadow-[0_0_15px_rgba(93,0,255,0.4)]"
                            )}
                            style={{ left: '-6px' }}
                        />

                        <div className={cn(
                            "absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-[#5d00ff]/10 to-transparent pointer-events-none transition-opacity duration-500",
                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )} />

                        <item.icon className={cn(
                            "w-6 h-6 relative z-10 transition-all duration-300",
                            isActive ? "text-[#5d00ff] scale-110" : "text-slate-500 group-hover:text-slate-300"
                        )} />

                        <span className="relative z-10 tracking-normal transition-transform duration-300 group-hover:translate-x-1">
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
    );
}

export function AdminUserCard({ user }: AdminSidebarProps) {
    const router = useRouter();
    return (
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
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{user?.name || "Администратор"}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role?.name || "Администратор"}</p>
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                </div>
            </div>
        </div>
    );
}
